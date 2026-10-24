#!/usr/bin/env node
// Second, strictly guarded integration stage on top of the pinned v1.17.0 patches.
// Files stay in separate sources to keep the JSON manifest compact and auditable.
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';

const root = resolve(process.argv[2] || 'upstream-player');
const dry = process.argv.includes('--dry-run');
const me = new URL('./', import.meta.url);

function replaceOnce(text, find, repl, name) {
  if (text.includes(repl)) return text; // idempotent
  const hits = text.split(find).length - 1;
  if (hits !== 1) throw Error('Hybrid anchor mismatch for ' + name + ' (count ' + hits + ')');
  return text.replace(find, repl);
}
const files = new Map();
async function rewrite(path, transform) {
  const abs = join(root, path);
  const original = await readFile(abs, 'utf8');
  const changed = transform(original);
  if (original !== changed) files.set(abs, changed);
}
await rewrite('src/app.ts', text => {
  text = replaceOnce(text,
    "import { VirtualNumpad } from './components/virtual-numpad';",
    "import { VirtualNumpad } from './components/virtual-numpad';\nimport { HybridGuide } from './components/hybrid-guide';",
    'app import');
  text = replaceOnce(text,
    "import { HybridGuide } from './components/hybrid-guide';",
    "import { HybridGuide } from './components/hybrid-guide';\nimport { findHybridEntry, isKnownBad } from './components/hybrid-catalog';",
    'app catalog import');
  text = replaceOnce(text,
    `  // D-pad numeric entry works even when LG reserves the physical number keys for DTT.
  private readonly numericPad = new VirtualNumpad((number) => {
    if (findChannelIndexByLcn(PlaylistService.channels, number) < 0) return false;
    this.handleKey('number', { number });
    return true;
  });`,
    `  // Full 85-LCN hybrid guide: no dummy IPTV streams for unsourced channels.
  private readonly hybridGuide = new HybridGuide((number) => {
    const index = findChannelIndexByLcn(PlaylistService.channels, number);
    if (index < 0) return false;
    this.playChannel(index);
    return true;
  });
  // Empty VAI on the number pad opens the complete 85-LCN directory.
  private readonly numericPad = new VirtualNumpad((number) => {
    const original = findHybridEntry(number);
    if (findChannelIndexByLcn(PlaylistService.channels, number) < 0
        || (original && isKnownBad(original))) {
      this.hybridGuide.openForLcn(number);
      return true;
    }
    const index = findChannelIndexByLcn(PlaylistService.channels, number);
    this.playChannel(index);
    return true;
  }, () => this.hybridGuide.openCatalog());`,
    'app numericPad');
  text = replaceOnce(text,
    `    if (action === 'green' && currentView === 'player' && (this.sidebar.visible || this.menu.visible)) {
      this.togglePlayingFavorite();
      return;
    }`,
    `    if (action === 'green' && currentView === 'player' && !this.player.isVod()) {
      if (this.sidebar.visible || this.menu.visible) {
        this.togglePlayingFavorite();
      } else {
        // One keypress opens the 85-LCN directory during live TV.
        this.hybridGuide.openCatalog();
      }
      return;
    }`,
    'green one-click guide');
  text = replaceOnce(text,
    '        this.numericPad.close();\n        this.parentalPinPrompt.dismiss();',
    '        this.numericPad.close();\n        this.hybridGuide.close();\n        this.parentalPinPrompt.dismiss();',
    'visibility cleanup');
  return text;
});
// Montecrestese default: switch on and resume live TV immediately.
// Existing explicit OFF is stored in localStorage and remains authoritative.
await rewrite('src/services/storage-service.ts', text => replaceOnce(text,
  "return get<boolean>('auto_play', false);",
  "return get<boolean>('auto_play', true);",
  'living-room default auto-play'));
await rewrite('src/components/virtual-numpad.ts', text => {
  text = replaceOnce(text,
    '  constructor(private readonly tune: (lcn: number) => boolean) {}',
    '  constructor(private readonly tune: (lcn: number) => boolean,\n    private readonly openCatalog: () => void = () => {}) {}',
    'pad constructor');
  text = replaceOnce(text,
    `      const number = Number(this.digits);
      if (number > 0 && this.tune(number)) { this.close(); return; }
      this.message = this.digits ? 'LCN non presente nella playlist' : 'Inserisci un numero';`,
    `      if (!this.digits) { this.close(); this.openCatalog(); return; }
      const number = Number(this.digits);
      if (number > 0 && this.tune(number)) { this.close(); return; }
      this.message = 'LCN non presente nella playlist';`,
    'pad routing');
  text = replaceOnce(text,
    'Frecce: sposta · OK: scegli · Indietro: chiudi',
    'Vai senza numero = elenco 85 LCN · Indietro = chiudi',
    'pad usage label');
  return text;
});
await rewrite('index.html', text => replaceOnce(text,
  '<link rel="stylesheet" href="css/virtual-numpad.css">',
  '<link rel="stylesheet" href="css/virtual-numpad.css">\n  <link rel="stylesheet" href="css/hybrid-guide.css">',
  'HTML styles'));
// The TV's Italian locale may override the root app title: retain our own name
// in the localized app tile, not only in appinfo.json.
await rewrite('resources/it/appinfo.json', text => replaceOnce(text,
  '"title": "webOS IPTV Player"', '"title": "IPTV Montecrestese"',
  'Italian app title'));
const sources = [
  ['hybrid-catalog-source.ts', 'src/components/hybrid-catalog.ts'],
  ['hybrid-guide-source.ts', 'src/components/hybrid-guide.ts'],
  ['hybrid-guide.css', 'css/hybrid-guide.css'],
  ['hybrid-guide-source.test.ts', 'src/components/hybrid-guide.test.ts'],
];
for (const [from, to] of sources) {
  const content = await readFile(new URL(from, me), 'utf8');
  const dest = join(root, to);
  let original = null;
  try { original = await readFile(dest, 'utf8'); } catch (_e) { /* new file */ }
  if (original !== null && original !== content) throw Error('Existing hybrid file changed: ' + to);
  if (original === null) files.set(dest, content);
}
if (!dry) for (const [path, contents] of files) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents);
}
console.log(JSON.stringify({ stage: 'hybrid', result: dry ? 'validated' : 'applied',
  pendingFiles: files.size, sourceFiles: sources.length }));
