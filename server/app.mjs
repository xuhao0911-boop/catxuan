import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createFeedbackStore, validateReport } from './feedback-store.mjs';
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
export function createAppServer({ root, dataDirectory, catalog, allowedOrigin }) {
  const store = createFeedbackStore(dataDirectory);
  const json = (res, code, value) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); res.end(JSON.stringify(value)); };
  return http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (pathname.startsWith('/api/')) {
        if (pathname === '/api/health' && req.method === 'GET') { json(res, 200, { ok: true, version: '0.1.0' }); return; }
        if (pathname !== '/api/feedback') { json(res, 404, { error: 'not-found' }); return; }
        if (req.method !== 'POST') { json(res, 405, { error: 'method-not-allowed' }); return; }
        const origin = req.headers.origin;
        if (origin && origin !== 'http://' + req.headers.host && origin !== allowedOrigin) { json(res, 403, { error: 'origin-not-allowed' }); return; }
        if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) { json(res, 415, { error: 'json-required' }); return; }
        if (Number(req.headers['content-length'] || 0) > 8192) { json(res, 413, { error: 'too-large' }); return; }
        const chunks = []; let bytes = 0;
        for await (const chunk of req) { bytes += chunk.length; if (bytes > 8192) { json(res, 413, { error: 'too-large' }); return; } chunks.push(chunk); }
        let value; try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { json(res, 400, { error: 'invalid-json' }); return; }
        const report = validateReport(value, catalog); if (!report) { json(res, 400, { error: 'invalid-report' }); return; }
        const saved = await store.add(report); json(res, 201, { accepted: true, id: saved.id }); return;
      }
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
      let target = path.resolve(root, '.' + pathname);
      if ((target !== root && !target.startsWith(root + path.sep)) || pathname.split('/').some(part => part.startsWith('.') && part !== '')) { res.writeHead(403); res.end(); return; }
      if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) { if (path.extname(pathname)) { res.writeHead(404); res.end(); return; } target = path.join(root, 'index.html'); }
      res.setHeader('Content-Type', mime[path.extname(target)] || 'application/octet-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('X-Content-Type-Options', 'nosniff');
      if (req.method === 'HEAD') { res.end(); return; }
      const stream = fs.createReadStream(target); stream.on('error', () => { if (!res.headersSent) res.writeHead(500); res.end(); }); stream.pipe(res);
    } catch { if (!res.headersSent) json(res, 503, { error: 'temporarily-unavailable' }); else res.end(); }
  });
}
