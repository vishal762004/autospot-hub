import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';

const root = process.cwd();
const manifest = JSON.parse(await fs.readFile(path.join(root, 'scripts', 'real-car-sources.json'), 'utf8'));
const outDir = path.join(root, 'public', 'images', 'cars');
await fs.mkdir(outDir, { recursive: true });

const USER_AGENT = 'AutoSpotHub/1.0 (portfolio asset preparation; contact=itsmevishal76@gmail.com)';
const WIDTH = 800;
const MAX_RETRIES = 5;
const REQUEST_DELAY_MS = 2200;
const force = process.argv.includes('--force');

const sleepMs = (ms) => sleep(ms);
const cleanTitle = (title) => String(title).replace(/^File:/i, '').replace(/ /g, '_');

function thumbUrl(title) {
  const filename = cleanTitle(title);
  const encoded = encodeURIComponent(filename);
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}?width=${WIDTH}`;
}

async function fetchWithRetry(url) {
  let lastError = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'image/avif,image/webp,image/apng,image/jpeg,image/*,*/*;q=0.8',
        },
        redirect: 'follow',
      });
      if (response.ok) return response;
      const retryAfter = Number(response.headers.get('retry-after'));
      if (response.status === 429 || response.status >= 500) {
        const wait = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : Math.min(30000, 5000 * (attempt + 1));
        lastError = new Error(`HTTP ${response.status}`);
        if (attempt < MAX_RETRIES) await sleepMs(wait);
        continue;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) await sleepMs(Math.min(30000, 4000 * (attempt + 1)));
    }
  }
  throw lastError ?? new Error('Download failed');
}

const existingHashes = new Set();
const sources = [];
const failures = [];
let first = true;

for (const entry of manifest.cars) {
  const destination = path.join(outDir, entry.file);
  try {
    if (!force) {
      try {
        const existing = await fs.readFile(destination);
        if (existing.length > 10000) {
          existingHashes.add(crypto.createHash('sha256').update(existing).digest('hex'));
          sources.push({ id: entry.id, model: entry.query, file: entry.file, status: 'existing-local' });
          console.log(`✓ ${entry.id} ${entry.query} (already local)`);
          await sleepMs(REQUEST_DELAY_MS);
          continue;
        }
      } catch {}
    }

    const title = entry.preferredTitles?.[0];
    const url = entry.officialUrl || (title ? thumbUrl(title) : '');
    if (!url) throw new Error('No real vehicle image source configured');

    if (!first) await sleepMs(REQUEST_DELAY_MS);
    first = false;
    const response = await fetchWithRetry(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 10000) throw new Error('Downloaded file is unexpectedly small');

    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    if (existingHashes.has(hash)) throw new Error('Duplicate image content detected');

    await fs.writeFile(destination, buffer);
    existingHashes.add(hash);
    sources.push({
      id: entry.id,
      model: entry.query,
      file: entry.file,
      sourceTitle: title || entry.query,
      sourceUrl: url,
      sourcePage: title ? `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(cleanTitle(title))}` : (entry.officialPage || entry.officialUrl),
      status: 'downloaded',
      sha256: hash,
    });
    console.log(`✓ ${entry.id} ${entry.query}`);
  } catch (error) {
    const message = `${entry.id} ${entry.query}: ${error.message}`;
    failures.push(message);
    console.error(`✗ ${message}`);
  }
}

await fs.writeFile(path.join(root, 'PHOTO-SOURCES.generated.json'), JSON.stringify({ generatedAt: new Date().toISOString(), sources }, null, 2));

const lines = [
  '# Auto Spot Hub — Real Vehicle Photo Sources',
  '',
  'Each vehicle listing is configured with one real-photo source and a local asset destination. Run `npm run prepare:car-assets` once to download the optimized 800px versions into `public/images/cars/`. Normal browsing then uses the local files.',
  '',
  'The application does not download vehicle photos during `npm run dev`, so development startup is not blocked by remote rate limits. Before public/commercial reuse, review the individual source page and its applicable license/terms.',
  '',
  '## Source manifest',
  '',
  ...sources.map((s) => `- **${s.id} — ${s.model}** — ${s.sourceTitle || 'local'} — ${s.sourcePage || s.sourceUrl || ''} — ${s.status}`),
  '',
];
await fs.writeFile(path.join(root, 'PHOTO-SOURCES.md'), lines.join('\n'), 'utf8');

if (failures.length) {
  console.error(`\n${failures.length} vehicle asset(s) could not be downloaded. You can run the command again; existing successful downloads are kept.`);
  process.exitCode = 1;
} else {
  console.log(`\nReal vehicle asset preparation complete: ${sources.length} entries ready locally.`);
}
