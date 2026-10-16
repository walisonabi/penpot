import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const rootArg = process.argv
  .find((arg) => arg.startsWith('--root='))
  ?.replace('--root=', '');
const portArg = process.argv
  .find((arg) => arg.startsWith('--port='))
  ?.replace('--port=', '');

const root = resolve(process.cwd(), rootArg ?? '.');
const port = Number(portArg ?? 4202);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.map': 'application/json; charset=utf-8',
};

async function alreadyServingHoneycomb(portToCheck) {
  try {
    const response = await fetch(
      `http://127.0.0.1:${portToCheck}/assets/manifest.json`,
    );
    if (!response.ok) {
      return false;
    }
    const manifest = await response.json();
    return (
      typeof manifest?.name === 'string' &&
      manifest.name.toLowerCase().includes('honeycomb')
    );
  } catch {
    return false;
  }
}

function parkProcess(message) {
  console.log(message);
  // Stay alive so `concurrently --kill-others` does not tear down the watch.
  setInterval(() => {}, 60_000);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) {
      pathname = `${pathname}index.html`;
    }
    const filePath = normalize(join(root, pathname));
    if (!filePath.startsWith(root) || !existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const body = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    });
    res.end(body);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(error instanceof Error ? error.message : String(error));
  }
});

server.on('error', async (error) => {
  if (error && error.code === 'EADDRINUSE') {
    if (await alreadyServingHoneycomb(port)) {
      parkProcess(
        `[serve-static] porta ${port} já serve o Honeycomb plugin — reusando.\n` +
          `[serve-static] manifest: http://localhost:${port}/assets/manifest.json`,
      );
      return;
    }
    console.error(
      `[serve-static] porta ${port} em uso por outro processo.\n` +
        `  Liberar:  lsof -nP -iTCP:${port} -sTCP:LISTEN\n` +
        `  Depois:   kill <PID>\n` +
        `  Ou:       kill $(lsof -t -iTCP:${port} -sTCP:LISTEN)`,
    );
    process.exit(1);
  }
  console.error('[serve-static]', error);
  process.exit(1);
});

server.listen(port, () => {
  console.log(`[serve-static] ${root} → http://localhost:${port}/`);
  console.log(
    `[serve-static] manifest: http://localhost:${port}/assets/manifest.json`,
  );
});
