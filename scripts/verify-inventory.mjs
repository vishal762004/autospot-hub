import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const source=fs.readFileSync(path.join(root,'src','data','cars.ts'),'utf8');
const ids=[...source.matchAll(/^\s*id:\s*(\d+)/gm)].map(m=>Number(m[1]));
const images=[...source.matchAll(/^\s*image:\s*'([^']+)'/gm)].map(m=>m[1]);
const remote=[...source.matchAll(/^\s*sourceImage:\s*'([^']+)'/gm)].map(m=>m[1]);
const failures=[];
if(ids.length!==28) failures.push(`Expected 28 cars, found ${ids.length}.`);
if(new Set(ids).size!==ids.length) failures.push('Duplicate car IDs found.');
if(images.length!==ids.length) failures.push('Every car must have one local asset path.');
if(remote.length!==ids.length) failures.push('Every car must have one real source image URL.');
if(new Set(remote).size!==remote.length) failures.push('Duplicate real source image URLs found.');
for(const u of remote){ if(!/^https:\/\//.test(u)) failures.push(`Non-HTTPS source image URL: ${u}`); }
if(failures.length){ console.error('Inventory verification failed:'); failures.forEach(f=>console.error(`- ${f}`)); process.exit(1); }
const existing=images.filter(i=>fs.existsSync(path.join(root,'public',i.replace(/^\//,'')))).length;
console.log(`Inventory verification passed: ${ids.length} cars with ${remote.length} unique real source image URLs. Local assets present: ${existing}/${images.length}.`);
