import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8' };
let localEnv = {};
try {
  const envText = await readFile(join(root, '..', '.env'), 'utf8');
  localEnv = Object.fromEntries(envText.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#') && line.includes('='))
    .map(line => { const index = line.indexOf('='); return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')]; }));
} catch {}
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://localhost').pathname)).replace(/^[/\\]+/, '') || 'index.html';
  if (path.includes('..')) { res.writeHead(403).end('Forbidden'); return; }
  if (path === 'apps-script-config.js') {
    const url = process.env.JOURNALIT_APPS_SCRIPT_URL || localEnv.JOURNALIT_APPS_SCRIPT_URL || '';
    const body = `window.JOURNALIT_APPS_SCRIPT_CONFIG = { url: ${JSON.stringify(url)} };`;
    res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' }).end(body);
    return;
  }
  try {
    const body = await readFile(join(root, path));
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
});
server.listen(4173, '127.0.0.1', () => console.log('Journalit web workspace: http://localhost:4173'));
