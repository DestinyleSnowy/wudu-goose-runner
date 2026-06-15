import { cp, mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const srcDir = path.join(root, 'src');
const publicDir = path.join(root, 'public');
const distDir = path.join(root, 'dist');

async function copyDir(from, to) {
  if (!existsSync(from)) return;
  await cp(from, to, { recursive: true, force: true });
}

async function dirSize(dir) {
  let total = 0;
  async function walk(current) {
    const entries = await import('node:fs/promises').then((fs) => fs.readdir(current, { withFileTypes: true }));
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else total += (await stat(full)).size;
    }
  }
  await walk(dir);
  return total;
}

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await copyDir(srcDir, distDir);
await copyDir(publicDir, distDir);

const stamp = new Date().toISOString();
await writeFile(path.join(distDir, 'BUILD.txt'), `雾都飞升：暴走鹅跑酷\nBuild time: ${stamp}\nSource: npm run build\n`, 'utf8');

const total = await dirSize(distDir);
const mb = (total / 1024 / 1024).toFixed(2);
console.log(`Built dist/ successfully. Size: ${mb} MB`);
console.log('Deploy path is relative-safe for GitHub Pages project URLs.');
