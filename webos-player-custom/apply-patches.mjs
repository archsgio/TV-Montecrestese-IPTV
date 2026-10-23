#!/usr/bin/env node
// Applies the guarded Montecrestese modifications to a separate upstream clone.
// Usage: node apply-patches.mjs /absolute/path/to/webos-iptv-player [--dry-run]
import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';

const root = resolve(process.argv[2] || '.');
const dryRun = process.argv.includes('--dry-run');
const manifest = JSON.parse(await readFile(new URL('./patch-manifest.json', import.meta.url), 'utf8'));

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}
const packagePath = join(root, 'package.json');
if (!await exists(packagePath)) throw new Error('Not an upstream checkout: no package.json');
const pkg = JSON.parse(await readFile(packagePath, 'utf8'));
if (pkg.name !== 'webos-iptv-player' || pkg.version !== '1.17.0') {
  throw new Error('Expected webos-iptv-player 1.17.0; refusing unknown code');
}
const staged = new Map();
const stats = { changed: 0, already: 0, newFiles: 0 };
for (const [name, edits] of Object.entries(manifest.operations)) {
  const filepath = join(root, name);
  if (!await exists(filepath)) throw new Error('Missing upstream file: ' + name);
  let content = await readFile(filepath, 'utf8');
  const original = content;
  for (const edit of edits) {
    if ('append' in edit) {
      if (content.includes(edit.append)) { stats.already++; continue; }
      content += edit.append;
      continue;
    }
    if (edit.find === edit.replace) throw new Error('No-op find/replace: ' + name);
    const hits = content.split(edit.find).length - 1;
    // Some replacements intentionally retain their anchor (e.g. an import
    // followed by an extra import). Recognize the completed edit FIRST.
    if (content.includes(edit.replace)) {
      stats.already++;
    } else if (hits === edit.expected) {
      content = content.split(edit.find).join(edit.replace);
    } else {
      throw new Error('Upstream changed: ' + name + ', expected ' + edit.expected
        + ' occurrences of anchor; found ' + hits);
    }
  }
  if (content !== original) { staged.set(filepath, content); stats.changed++; }
}
for (const [name, contents] of Object.entries(manifest.create)) {
  const filepath = join(root, name);
  if (await exists(filepath)) {
    const prior = await readFile(filepath, 'utf8');
    if (prior !== contents) throw new Error('Custom file already exists with different content: ' + name);
    stats.already++;
  } else {
    staged.set(filepath, contents);
    stats.newFiles++;
  }
}
if (!dryRun) for (const [filepath, contents] of staged) {
  await mkdir(dirname(filepath), { recursive: true });
  await writeFile(filepath, contents, 'utf8');
}
console.log(JSON.stringify({ result: dryRun ? 'validated' : 'applied', root,
  filesToWrite: staged.size, ...stats }, null, 2));
if (!dryRun) console.log('Next: npm ci && npm run typecheck && npm run lint && npm test && npm run package');
