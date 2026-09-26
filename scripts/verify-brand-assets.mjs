import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const brands = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'brand-sources.json'), 'utf8')).brands;
const source = fs.readFileSync(path.join(root, 'src', 'data', 'brands.ts'), 'utf8');
const ids = [...source.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
const files = new Set(brands.map((b) => b.file));
const failures = [];
if (ids.length !== 17) failures.push(`Expected 17 brand cards, found ${ids.length}.`);
if (files.size !== 16) failures.push(`Expected 16 unique logo assets for 17 brand mappings (Maybach shares Mercedes-Benz), found ${files.size}.`);
for (const brand of brands) {
  if (!brand.slug) failures.push(`Missing real-logo slug for ${brand.id}.`);
}
const present = brands.filter((brand) => fs.existsSync(path.join(root, 'public', 'images', 'brands', brand.file))).length;
if (failures.length) { console.error('Brand logo verification failed:'); for (const f of failures) console.error(`- ${f}`); process.exit(1); }
console.log(`Brand logo verification passed: ${ids.length} brand cards mapped to ${files.size} real-logo sources. Local SVGs present: ${present}/${files.size}.`);
