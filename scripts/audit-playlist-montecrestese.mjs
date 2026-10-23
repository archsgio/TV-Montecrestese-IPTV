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
