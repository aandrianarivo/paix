// Serveur de Paix : fichiers statiques + salles WebSocket (2 joueurs) + mot de passe de la campagne.
// Usage : CAMPAIGN_PASSWORD=secret PORT=8000 node server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const { WebSocketServer } = require('ws');

const PORT = +process.env.PORT || 8000;
const ROOT = __dirname;
let PASSWORD = process.env.CAMPAIGN_PASSWORD;
if (!PASSWORD) {
  PASSWORD = crypto.randomBytes(3).toString('hex');
  console.log(`CAMPAIGN_PASSWORD absent : mot de passe temporaire de la campagne = ${PASSWORD}`);
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css' };
const PUBLIC = p => p === '/index.html' || p.startsWith('/assets/');

const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
let failures = new Map(); // ip -> {n, until}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'POST' && url.pathname === '/api/campaign-auth') {
    const ip = req.socket.remoteAddress, f = failures.get(ip);
    if (f && f.until > Date.now()) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end('{"ok":false,"error":"Trop d\'essais, patiente un instant."}'); }
    let body = '';
    req.on('data', c => { body += c; if (body.length > 1024) req.destroy(); });
    req.on('end', () => {
      let pw = ''; try { pw = JSON.parse(body).password || ''; } catch (e) {}
      const ok = same(pw, PASSWORD);
      if (!ok) { const n = (f ? f.n : 0) + 1; failures.set(ip, { n, until: n >= 5 ? Date.now() + 30000 : 0 }); if (n >= 5) failures.get(ip).n = 0; }
      else failures.delete(ip);
      res.writeHead(ok ? 200 : 401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok }));
    });
    return;
  }
  let p = decodeURIComponent(url.pathname);
  if (p === '/') p = '/index.html';
  if (!PUBLIC(p)) { res.writeHead(404); return res.end('Not found'); }
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end(); }
  serveFile(req, res, file);
});

// Fichiers lus une fois, compressés en gzip (texte/JSON) et gardés en mémoire ; ETag + cache pour les rechargements.
const cache = new Map(); // file -> {mtime, etag, raw, gz}
function serveFile(req, res, file) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end('Not found'); }
    let c = cache.get(file);
    const send = () => {
      const type = TYPES[path.extname(file)] || 'application/octet-stream';
      const heavy = file.includes(path.sep + 'assets' + path.sep);
      const h = { 'Content-Type': type, ETag: c.etag, 'Cache-Control': heavy ? 'public, max-age=3600' : 'no-cache', Vary: 'Accept-Encoding' };
      if (req.headers['if-none-match'] === c.etag) { res.writeHead(304, h); return res.end(); }
      const gz = c.gz && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
      if (gz) h['Content-Encoding'] = 'gzip';
      const body = gz ? c.gz : c.raw;
      h['Content-Length'] = body.length;
      res.writeHead(200, h); res.end(body);
    };
    if (c && c.mtime === st.mtimeMs) return send();
    fs.readFile(file, (err2, raw) => {
      if (err2) { res.writeHead(404); return res.end('Not found'); }
      const compressible = /\.(html|js|json|css)$/.test(file);
      const finish = gz => { c = { mtime: st.mtimeMs, etag: '"' + st.mtimeMs.toString(36) + '-' + raw.length.toString(36) + '"', raw, gz }; cache.set(file, c); send(); };
      if (compressible) zlib.gzip(raw, { level: 6 }, (e, gz) => finish(e ? null : gz)); else finish(null);
    });
  });
}

// --- Salles : le créateur (host) exécute la simulation, l'invité (guest) envoie ses commandes.
const rooms = new Map(); // code -> {host, guest}
const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 16 * 1024 });
const send = (ws, o) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); };
const newCode = () => { let c; do { c = Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[crypto.randomInt(24)]).join(''); } while (rooms.has(c)); return c; };

wss.on('connection', ws => {
  ws.room = null; ws.role = null; ws.alive = true;
  ws.on('pong', () => { ws.alive = true; });
  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (m.t === 'create' && !ws.room) {
      const code = newCode(); rooms.set(code, { host: ws, guest: null }); ws.room = code; ws.role = 'host';
      return send(ws, { t: 'created', code });
    }
    if (m.t === 'join' && !ws.room) {
      const code = String(m.code || '').toUpperCase().trim(), r = rooms.get(code);
      if (!r) return send(ws, { t: 'error', msg: 'Salle introuvable.' });
      if (r.guest) return send(ws, { t: 'error', msg: 'Salle déjà pleine.' });
      r.guest = ws; ws.room = code; ws.role = 'guest';
      send(ws, { t: 'joined', code }); send(r.host, { t: 'peer-joined' });
      return;
    }
    const r = rooms.get(ws.room); if (!r) return;
    send(ws.role === 'host' ? r.guest : r.host, m); // tout le reste est relayé tel quel au pair
  });
  ws.on('close', () => {
    const r = rooms.get(ws.room); if (!r) return;
    const peer = ws.role === 'host' ? r.guest : r.host;
    send(peer, { t: 'peer-left' });
    if (ws.role === 'host') { rooms.delete(ws.room); if (peer) { peer.room = null; peer.role = null; } }
    else r.guest = null;
  });
});
setInterval(() => wss.clients.forEach(ws => { if (!ws.alive) return ws.terminate(); ws.alive = false; ws.ping(); }), 15000);

server.listen(PORT, () => console.log(`Paix : http://localhost:${PORT}/`));
