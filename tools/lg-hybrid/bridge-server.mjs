#!/usr/bin/env node
/** Optional LAN companion for LG Montecrestese. Explicit user pairing only.
 * Never retransmits DVB/video, bypasses DRM, opens arbitrary URLs or runs root.
 */
import http from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import LGTV from 'lgtv2';

const folder = dirname(fileURLToPath(import.meta.url));
const reg = JSON.parse(readFileSync(join(folder, 'official-fallbacks.json'), 'utf8'));
const known = new Map(reg.entries.map(e => [e.lcn, e]));
const SECRET_FILE = join(folder, '.local-bridge-secret');

function privateIP(value) {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) return false;
  const n = value.split('.').map(Number);
  if (n.some(v => v < 0 || v > 255)) return false;
  return n[0] === 10 || n[0] === 192 && n[1] === 168 ||
    n[0] === 172 && n[1] >= 16 && n[1] <= 31;
}
const args = process.argv.slice(2);
const opt = name => args[args.indexOf(name) + 1];
if (args.length !== 4 || !args.includes('--tv') || !args.includes('--bind')) {
  console.error('Usage: node bridge-server.mjs --tv 192.168.1.50 --bind 192.168.1.10');
  console.error('Bind must be an actual private IPv4 address of your own PC. Fixed port 8927.');
  process.exit(2);
}
const tvHost = opt('--tv'), bindIP = opt('--bind');
if (!privateIP(tvHost) || !privateIP(bindIP) || tvHost === bindIP) {
  console.error('Refusing public, invalid or identical PC/TV IPv4 address.');
  process.exit(2);
}
const token = existsSync(SECRET_FILE)
  ? readFileSync(SECRET_FILE, 'utf8').trim()
  : randomBytes(32).toString('hex');
if (!/^[a-f0-9]{64}$/.test(token)) throw Error('Invalid secret file. Refusing to start.');
if (!existsSync(SECRET_FILE)) writeFileSync(SECRET_FILE, token + '\n', { flag: 'wx', mode: 0o600 });

function authorized(request) {
  const supplied = request.headers['x-montecrestese-key'];
  if (typeof supplied !== 'string' || !/^[a-f0-9]{64}$/.test(supplied)) return false;
  return timingSafeEqual(Buffer.from(supplied, 'hex'), Buffer.from(token, 'hex'));
}
function allowedOrigin(request) {
  // Installed LG webOS apps can report Origin: null OR the unique
  // file://<app-id> security origin. Never allow generic Internet origins.
  const origin = request.headers.origin;
  return !origin || origin === 'null' || origin === 'file://com.archsgio.iptv';
}
function headers(response, req) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.headers.origin === 'null' || req.headers.origin === 'file://com.archsgio.iptv') {
    response.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Montecrestese-Key');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Private-Network', 'true');
    response.setHeader('Vary', 'Origin');
  }
}
function send(res, status, body) {
  res.statusCode = status;
  res.end(JSON.stringify(body));
}
async function pairAndRequest(task) {
  const tv = new LGTV({ host: tvHost, reconnect: false, timeout: 12000, verifyCert: 'tofu' });
  let handle;
  try {
    await new Promise((resolve, reject) => {
      handle = setTimeout(() => reject(Error('LG pairing or connection timed out')), 60000);
      tv.once('connect', resolve);
      tv.once('error', reject);
      tv.on('prompt', () => console.log('APPROVA la richiesta di controllo sul televisore LG.'));
    });
    return await task(tv);
  } finally {
    if (handle) clearTimeout(handle);
    await tv.disconnect();
  }
}
function normalizedChannels(res) {
  const list = res?.channelList || res?.channels;
  if (!Array.isArray(list)) throw Error('La LG non ha restituito la lista canali');
  return list.map(ch => ({
    lcn: Number(ch.channelNumber),
    name: String(ch.channelName ?? ch.channelLabel ?? ''),
    channelId: String(ch.channelId ?? ''),
    skipped: !!(ch.skipped || ch.invisible || ch.Invisible),
  })).filter(ch => Number.isSafeInteger(ch.lcn) && ch.lcn > 0 && ch.lcn <= 9999);
}
async function readBody(request) {
  let raw = '';
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 1024) throw Error('Payload too large');
  }
  return JSON.parse(raw);
}
// Mutex: avoid two overlapping SSAP pairing prompts and tuner actions.
let queue = Promise.resolve();
function sequential(callback) {
  const next = queue.then(callback);
  queue = next.catch(() => {});
  return next;
}
const server = http.createServer(async (request, response) => {
  headers(response, request);
  if (!allowedOrigin(request)) { send(response, 403, { error: 'Origin non autorizzata' }); return; }
  if (request.method === 'OPTIONS') { response.statusCode = 204; response.end(); return; }
  if (!authorized(request)) { send(response, 401, { error: 'Chiave di collegamento errata' }); return; }
  if (request.method === 'GET' && request.url === '/v1/channels') {
    try {
      const channels = await sequential(() => pairAndRequest(async tv =>
        normalizedChannels(await tv.request('ssap://tv/getChannelList'))));
      send(response, 200, { channels: channels.filter(ch => !ch.skipped).map(ch => ({
        lcn: ch.lcn, name: ch.name,
      })) });
    } catch (e) { send(response, 503, { error: String(e.message || e) }); }
    return;
  }
  if (request.method === 'POST' && request.url === '/v1/action') {
    try {
      const body = await readBody(request);
      if (!body || !Number.isSafeInteger(body.lcn) || body.lcn < 1 || body.lcn > 9999
          || !['tune', 'web'].includes(body.action)) {
        send(response, 400, { error: 'Comando non valido' }); return;
      }
      const chosen = body.lcn, selected = known.get(chosen);
      if (body.action === 'web' && (!selected || !selected.url.startsWith('https://'))) {
        send(response, 404, { error: 'Nessun sito ufficiale approvato per questa LCN' }); return;
      }
      const answer = await sequential(() => pairAndRequest(async tv => {
        if (body.action === 'web') {
          await tv.request('ssap://system.launcher/open', { target: selected.url });
          return 'Richiesta di apertura sito ufficiale inviata. Riproduzione web non garantita.';
        }
        const channels = normalizedChannels(await tv.request('ssap://tv/getChannelList'));
        const matches = channels.filter(ch => ch.lcn === chosen && !ch.skipped);
        if (matches.length !== 1) throw Error('Canale DVB ' + chosen +
          ' non identificato univocamente nel tuner LG (' + matches.length + ' corrispondenze)');
        const ch = matches[0];
        await tv.request('ssap://tv/openChannel', ch.channelId ?
          { channelId: ch.channelId } : { channelNumber: String(ch.lcn) });
        return 'Canale terrestre ' + chosen + ' richiesto alla LG.';
      }));
      send(response, 200, { message: answer });
    } catch (e) { send(response, 503, { error: String(e.message || e) }); }
    return;
  }
  send(response, 404, { error: 'Operazione non prevista' });
});
server.requestTimeout = 18000;
server.listen(8927, bindIP, () => {
  console.log('Montecrestese bridge pronto: http://' + bindIP + ':8927');
  console.log('LG: ' + tvHost + ' — pairing da confermare direttamente sul televisore.');
  console.log('Chiave locale (da digitare SOLO nella app IPTV): ' + token);
  console.log('File chiave privata: ' + SECRET_FILE);
  console.log('NON esporre la porta 8927 su Internet o verso reti pubbliche.');
});
