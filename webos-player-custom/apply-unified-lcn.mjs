#!/usr/bin/env node
// Third guarded stage, after apply-patches.mjs and apply-hybrid.mjs.
// Deliberately changes UI presentation only; NEVER edits stored playlists.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';

const root = resolve(process.argv[2] || 'upstream-player');
const dry = process.argv.includes('--dry-run');
const manifest = JSON.parse(await readFile(new URL('./montecrestese-unified-manifest.json', import.meta.url), 'utf8'));
const changes = new Map();

for (const [path, patches] of Object.entries(manifest.operations)) {
  const absolute = join(root, path);
  let current = await readFile(absolute, 'utf8');
  for (const { find, replace, note } of patches) {
    if (current.includes(replace)) continue;
    const hits = current.split(find).length - 1;
    if (hits !== 1) throw Error('85-LCN anchor ' + note + ' at ' + path + ' found ' + hits + ' times');
    current = current.replace(find, replace);
  }
  changes.set(absolute, current);
}
for (const [source, destination] of Object.entries(manifest.create)) {
  const value = await readFile(new URL(source, import.meta.url), 'utf8');
  const absolute = join(root, destination);
  try {
    const existing = await readFile(absolute, 'utf8');
    if (existing !== value) throw Error('85-LCN generated file conflict: ' + destination);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    changes.set(absolute, value);
  }
}
if (!dry) {
  for (const [path, value] of changes) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, value, 'utf8');
  }
}
console.log(JSON.stringify({ stage: 'unified-85-lcn', status: dry ? 'validated' : 'applied', files: changes.size }));
