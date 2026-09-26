import fs from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const root = process.cwd();
const manifest = JSON.parse(await fs.readFile(path.join(root, 'scripts', 'brand-sources.json'), 'utf8'));
const outDir = path.join(root, 'public', 'images', 'brands');
await fs.mkdir(outDir, { recursive: true });
const USER_AGENT = 'AutoSpotHub/1.0 (portfolio brand asset preparation; contact=itsmevishal76@gmail.com)';
const force = process.argv.includes('--force');

async function getText(url) {
  let last = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'image/svg+xml,text/plain,*/*;q=0.8' }, redirect: 'follow' });
      if (res.ok) return res.text();
      last = new Error(`HTTP ${res.status}`);
      if (res.status === 429 || res.status >= 500) await sleep(Math.min(30000, 5000 * (attempt + 1)));
      else break;
    } catch (error) {
      last = error;
      await sleep(Math.min(30000, 4000 * (attempt + 1)));
    }
  }
  throw last ?? new Error('Download failed');
}

const seen = new Set();
const downloaded = [];
const failures = [];
for (const entry of manifest.brands) {
  if (seen.has(entry.file)) continue;
  seen.add(entry.file);
  const destination = path.join(outDir, entry.file);
  try {
    if (!force) {
      try {
        const content = await fs.readFile(destination, 'utf8');
        if (content.includes('<svg')) { downloaded.push({ ...entry, source: 'existing local asset' }); console.log(`✓ ${entry.id} already local`); continue; }
      } catch {}
    }
    const primary = entry.sourceUrl || `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${entry.slug}.svg`;
    const svg = await getText(primary);
    if (!svg.includes('<svg')) throw new Error('Brand source did not return SVG');
    await fs.writeFile(destination, svg, 'utf8');
    downloaded.push({ ...entry, source: primary });
    console.log(`✓ ${entry.id}`);
    await sleep(500);
  } catch (error) {
    failures.push(`${entry.id}: ${error.message}`);
    console.error(`✗ ${entry.id}: ${error.message}`);
  }
}

await fs.writeFile(path.join(root, 'BRAND-LOGO-SOURCES.md'), [
  '# Auto Spot Hub — Brand Logo Sources',
  '',
  'Real brand SVG marks are downloaded once into `public/images/brands/` and then served locally.',
  '',
  ...downloaded.map((b) => `- **${b.id}** — ${b.slug} — ${b.source}`),
  '',
].join('\n'), 'utf8');

if (failures.length) { console.error('\nBrand preparation completed with failures; run `npm run prepare:brand-assets` again.'); failures.forEach((f) => console.error(`- ${f}`)); process.exitCode = 1; }
else console.log(`\nBrand asset preparation complete: ${downloaded.length} unique local logo files ready.`);
