import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

// Deliberately serve only beneath a project subpath, never via the Vite dev server.
const root = resolve('dist');
const prefix = '/itzfizz-assignment';
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.js': 'text/javascript', '.css': 'text/css' };

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url || '/', 'http://127.0.0.1').pathname;
    if (pathname === '/' || pathname === prefix) {
      response.writeHead(302, { Location: `${prefix}/` }).end();
      return;
    }
    if (!pathname.startsWith(`${prefix}/`)) {
      response.writeHead(404).end('Not found outside the project subpath.');
      return;
    }
    let path = resolve(root, decodeURIComponent(pathname.slice(prefix.length + 1)));
    if (path !== root && !path.startsWith(root + sep)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    response.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(await readFile(path));
  } catch {
    response.writeHead(404).end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => console.log(`Static production build: http://127.0.0.1:${port}${prefix}/`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));