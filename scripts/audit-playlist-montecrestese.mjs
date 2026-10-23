#!/usr/bin/env node
// Static QA for Montecrestese LCN v7 (archive) and v9 (LG-friendly candidate).
// No network requests, no DRM/auth probing, no rewriting of working playlists.
import { readFileSync } from 'node:fs';
const sourceDir = new URL('../', import.meta.url);
const read = (name) => readFileSync(new URL(name, sourceDir), 'utf8');

function parseM3u(src, filename) {
  const lines = src.trimEnd().split(/\r?\n/);
  if (!lines[0]?.startsWith('#EXTM3U')) throw Error(filename + ': missing #EXTM3U');
  const entries = [];
  for (let i = 1; i < lines.length; i++) {
    const meta = lines[i];
    if (!meta.startsWith('#EXTINF:')) throw Error(filename + ': invalid entry at line ' + (i + 1));
    const m = /tvg-chno="(\d+)"/.exec(meta);
    const url = lines[i + 1]?.trim() || '';
    if (!m || !/^https?:\/\//.test(url)) throw Error(filename + ': invalid LCN or URL at line ' + (i + 1));
    const lcn = Number(m[1]);
    if (!Number.isSafeInteger(lcn) || lcn < 1) throw Error(filename + ': invalid LCN');
    entries.push({ lcn, meta, url, tvgId: /tvg-id="([^"]*)"/.exec(meta)?.[1] || '' });
    i++;
  }
  if (new Set(entries.map((x) => x.lcn)).size !== entries.length) throw Error(filename + ': duplicate LCN');
  for (let i = 1; i < entries.length; i++) {
    if (entries[i - 1].lcn >= entries[i].lcn) throw Error(filename + ': LCN not increasing');
  }
  return { header: lines[0], entries };
}

const archiveNoEpg = parseM3u(read('TV_Montecrestese_LCN_v7_FLUSSI_TEST.m3u'), 'v7 plain');
const archiveEpg = parseM3u(read('TV_Montecrestese_LCN_v7_XMLTV_TEST.m3u'), 'v7 EPG');
const cleanNoEpg = parseM3u(read('TV_Montecrestese_LCN_v9_PULITA_FLUSSI_TEST.m3u'), 'v9 plain');
const cleanEpg = parseM3u(read('TV_Montecrestese_LCN_v9_PULITA_XMLTV_TEST.m3u'), 'v9 EPG');
const v7ByLcn = new Map(archiveEpg.entries.map(x => [x.lcn, x]));
const bad = new Set([14, 15, 41, 44, 75, 802]); // LG-negative 23 October 2026
const knownGood = new Set([6, 13, 18, 19, 37, 46, 53, 68, 70, 73, 96]);
const catalog = read('Catalogo_LCN_Montecrestese_v7_STATO.csv').trim()
  .split(/\r?\n/).slice(1).map(line => Number(line.split(';')[0]));
const classification = read('Catalogo_LCN_Montecrestese_v9_STATO.csv').trim()
  .split(/\r?\n/).slice(1).map(line => line.split(';'));

function assert(condition, description) { if (!condition) throw Error('QA: ' + description); }
assert(catalog.length === 85 && new Set(catalog).size === 85, 'catalog LCN should have 85 unique entries');
assert(archiveEpg.entries.length === 64 && archiveNoEpg.entries.length === 64, 'v7 must contain 64 entries');
assert(cleanEpg.entries.length === 58 && cleanNoEpg.entries.length === 58, 'v9 must contain 58 entries');
assert(cleanEpg.entries.filter(x => x.tvgId).length === 45, 'v9 must have 45 non-empty tvg-id');
assert(archiveEpg.entries.filter(x => x.tvgId).length === 49, 'v7 must have 49 non-empty tvg-id');
assert(classification.length === catalog.length, 'catalog classification row count');
assert(cleanEpg.header.includes('italy3.xml.gz'), 'v9 XMLTV header');
assert(cleanNoEpg.header === '#EXTM3U', 'v9 no EPG header');

for (const [epg, plain] of [[archiveEpg, archiveNoEpg], [cleanEpg, cleanNoEpg]]) {
  assert(epg.entries.length === plain.entries.length, 'pair lengths');
  for (let i = 0; i < epg.entries.length; i++) {
    assert(epg.entries[i].lcn === plain.entries[i].lcn, 'pair LCN match');
    assert(epg.entries[i].url === plain.entries[i].url, 'pair URL match');
  }
}
for (const e of cleanEpg.entries) {
  const original = v7ByLcn.get(e.lcn);
  assert(!!original, 'no invented LCN ' + e.lcn);
  assert(!bad.has(e.lcn), 'known failure still included ' + e.lcn);
  assert(e.url === original.url, 'source changed for LCN ' + e.lcn);
  assert(e.meta === original.meta, 'EPG/name metadata changed for LCN ' + e.lcn);
}
for (const lcn of knownGood) {
  assert(cleanEpg.entries.some(x => x.lcn === lcn), 'known working LCN removed: ' + lcn);
}
assert(archiveEpg.entries.filter(x => bad.has(x.lcn)).length === 6, 'six LG failures in archive');
assert(catalog.filter(x => !v7ByLcn.has(x)).length === 21, '21 missing sources remain in catalog');
for (let i = 0; i < catalog.length; i++) {
  const [c, , presence, , status] = classification[i];
  assert(Number(c) === catalog[i], 'catalog row order ' + i);
  const exists = v7ByLcn.has(catalog[i]);
  assert(presence === (exists ? 'SI' : 'NO'), 'catalog presence ' + c);
  assert(status === (!exists ? 'SENZA_URL' : bad.has(catalog[i]) ? 'ESCLUSO_NON_FUNZIONANTE' : 'INCLUSO'), 'catalog status ' + c);
}
console.log('OK: 85 LCN, v7 archive 64, v9 clean 58, 6 LG failures excluded, 21 URL missing, 45 EPG IDs, 11 known-good preserved, no LCN duplicates or stream changes.');

// v10: add only two documented candidates; no mutation of the 58 v9 streams.
const v10Epg = parseM3u(read('TV_Montecrestese_LCN_v10_CANDIDATI_XMLTV_TEST.m3u'), 'v10 EPG');
const v10NoEpg = parseM3u(read('TV_Montecrestese_LCN_v10_CANDIDATI_FLUSSI_TEST.m3u'), 'v10 plain');
const v10ByLcn = new Map(v10Epg.entries.map(x => [x.lcn, x]));
const v9ByLcn = new Map(cleanEpg.entries.map(x => [x.lcn, x]));
const latestStatus = read('Catalogo_LCN_Montecrestese_v10_STATO.csv').trim()
  .split(/\r?\n/).slice(1).map(x => x.split(';'));
assert(v10Epg.entries.length === 60 && v10NoEpg.entries.length === 60, 'v10 60 entries');
assert(v10Epg.entries.filter(x => x.tvgId).length === 45, 'v10 45 EPG IDs unchanged');
assert(v10Epg.header === cleanEpg.header && v10NoEpg.header === cleanNoEpg.header, 'v10 playlist header');
assert(latestStatus.length === 85, 'v10 catalog must preserve 85 positions');
// 85 approved positions: 60 in v10, 6 known-bad explicitly excluded,
// and 19 still missing a credible independent IPTV URL.
assert(catalog.filter(x => !v10ByLcn.has(x)).length === 25,
  'v10 must omit 25 positions: 6 known-bad and 19 without URL');
assert(latestStatus.filter(row => row[4] === 'SENZA_URL').length === 19,
  'v10 catalog must mark 19 never-sourced channels');
assert(latestStatus.filter(row => row[4] === 'ESCLUSO_NON_FUNZIONANTE').length === 6,
  'v10 catalog must mark exactly six rejected LG streams');
for (const original of cleanEpg.entries) {
  const updated = v10ByLcn.get(original.lcn);
  assert(!!updated && original.meta === updated.meta && original.url === updated.url,
    'v10 changed or removed working stream ' + original.lcn);
}
for (let i = 0; i < v10Epg.entries.length; i++) {
  const e = v10Epg.entries[i], p = v10NoEpg.entries[i];
  assert(e.lcn === p.lcn && e.url === p.url, 'v10 EPG/plain mismatch');
  assert(!bad.has(e.lcn), 'v10 resurrected LG-broken LCN ' + e.lcn);
}
const expectedAdds = [59, 83];
assert(v10Epg.entries.filter(x => !v9ByLcn.has(x.lcn)).map(x => x.lcn).join(',')
  === expectedAdds.join(','), 'v10 introduced wrong channels');
const discovery = v10ByLcn.get(59), piemonte = v10ByLcn.get(83);
assert(discovery && discovery.url.includes('/IT_SIMULCAST/TURBO/CMAF/index.m3u8'),
  'Discovery Turbo must match the externally checked master');
assert(piemonte?.url === v10ByLcn.get(13)?.url,
  'Piemonte+ alias must use known-working Rete 7 HLS');
for (const [lcn, state] of [[59, 'CANDIDATO_DA_COLLAUDARE'], [83, 'CANDIDATO_SIMULCAST']]) {
  assert(latestStatus.some(row => Number(row[0]) === lcn && row[4] === state),
    'v10 status missing candidate ' + lcn);
}
for (let i = 0; i < latestStatus.length; i++) {
  assert(Number(latestStatus[i][0]) === catalog[i], 'v10 catalog order mismatch');
}
console.log('OK v10: 60 candidates, +59 Discovery Turbo / +83 Piemonte+ simulcast, 19 without streams; all 58 v9 URLs preserved, LCN and EPG synchronized.');

