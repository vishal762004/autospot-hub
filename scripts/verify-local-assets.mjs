import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = process.cwd();
const source = fs.readFileSync(path.join(root, 'src', 'data', 'cars.ts'), 'utf8');
const images = [...source.matchAll(/^\s*image:\s*'([^']+)'/gm)].map((m) => m[1]);
const failures=[]; const hashes=new Map();
for (const image of images) {
  const p=path.join(root,'public',image.replace(/^\//,''));
  if(!fs.existsSync(p)){failures.push(`Missing ${image}`);continue;}
  const h=crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  if(hashes.has(h)) failures.push(`Duplicate content: ${image} and ${hashes.get(h)}`); else hashes.set(h,image);
}
if(failures.length){console.error('Local asset verification failed:'); failures.forEach(f=>console.error(`- ${f}`)); process.exit(1);}
console.log(`Local asset verification passed: ${images.length} unique vehicle files are present.`);
