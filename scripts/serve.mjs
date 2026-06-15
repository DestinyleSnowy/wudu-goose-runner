import http from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const args = process.argv.slice(2);
const dirs = args.length ? args.map((dir) => path.resolve(root, dir)) : [path.join(root, 'dist')];
const port = Number(process.env.PORT || 4173);

const mime = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.txt', 'text/plain; charset=utf-8'],
]);

function safeJoin(base, requestPath) {
  const normalized = path.normalize(decodeURIComponent(requestPath.split('?')[0])).replace(/^([/\\])+/, '');
  const full = path.join(base, normalized);
  if (!full.startsWith(base)) return null;
  return full;
}

async function findFile(urlPath) {
  for (const dir of dirs) {
    let full = safeJoin(dir, urlPath === '/' ? '/index.html' : urlPath);
    if (!full) continue;
    if (existsSync(full)) {
      const info = await stat(full);
      if (info.isDirectory()) full = path.join(full, 'index.html');
      if (existsSync(full)) return full;
    }
    const fallback = path.join(dir, 'index.html');
    if (existsSync(fallback)) return fallback;
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  try {
    const file = await findFile(req.url || '/');
    if (!file) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      'content-type': mime.get(ext) || 'application/octet-stream',
      'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
    createReadStream(file).pipe(res);
  } catch (error) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(String(error?.stack || error));
  }
});

server.listen(port, () => {
  const shown = dirs.map((dir) => path.relative(root, dir) || '.').join(', ');
  console.log(`Preview server: http://localhost:${port}`);
  console.log(`Serving: ${shown}`);
});

process.on('SIGINT', () => server.close(() => process.exit(0)));
