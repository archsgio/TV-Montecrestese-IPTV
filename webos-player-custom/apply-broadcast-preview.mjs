#!/usr/bin/env node
// Fourth guarded stage: experimental local DTT video. This never modifies M3U,
// invokes browser, introduces a background server, or requests privileged APIs.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';

const root = resolve(process.argv[2] || 'upstream-player');
const dry = process.argv.includes('--dry-run');
const src = new URL('./', import.meta.url);
const changes = new Map();

const html = join(root, 'index.html');
const original = await readFile(html, 'utf8');
const anchor = '<link rel="stylesheet" href="css/hybrid-guide.css">';
const addition = anchor + '\n  <link rel="stylesheet" href="css/broadcast-preview.css">';
if (!original.includes(addition)) {
  if (original.split(anchor).length !== 2) throw Error('Broadcast CSS anchor not unique');
  changes.set(html, original.replace(anchor, addition));
}

const fileMap = [
  ['broadcast-preview-source.ts', 'src/components/broadcast-preview.ts'],
  ['broadcast-preview-source.test.ts', 'src/components/broadcast-preview.test.ts'],
  ['broadcast-preview.css', 'css/broadcast-preview.css'],
];
for (const [source, destination] of fileMap) {
  const content = await readFile(new URL(source, src), 'utf8');
  const dest = join(root, destination);
  let old;
  try { old = await readFile(dest, 'utf8'); }
  catch (err) { if (err.code !== 'ENOENT') throw err; old = null; }
  if (old !== null && old !== content) throw Error('Existing broadcast file changed: ' + destination);
  if (old === null) changes.set(dest, content);
}
const guide = await readFile(join(root, 'src/components/hybrid-guide.ts'), 'utf8');
if (!guide.includes("import { BroadcastPreview } from './broadcast-preview';") ||
    !guide.includes("action: 'broadcast'")) throw Error('HybridGuide antenna integration missing');
if (!dry) for (const [path, value] of changes) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, value, 'utf8');
}
console.log(JSON.stringify({ stage: 'local-broadcast-preview', status: dry ? 'validated' : 'applied', files: changes.size }));
