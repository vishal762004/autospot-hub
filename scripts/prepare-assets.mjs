import { spawnSync } from 'node:child_process';
import path from 'node:path';

let failed = false;
for (const script of ['prepare-real-car-assets.mjs', 'prepare-brand-assets.mjs']) {
  const result = spawnSync(process.execPath, [path.join(process.cwd(), 'scripts', script), ...process.argv.slice(2)], { stdio: 'inherit' });
  if (result.status !== 0) failed = true;
}
if (failed) process.exit(1);
