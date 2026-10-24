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
  const original = files.has(abs) ? files.get(abs) : await readFile(abs, 'utf8');
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
// Distinct LCNs may intentionally simulcast the very same IPTV URL
// (13 Rete 7 and 83 Piemonte+). Keep these as distinct TV positions.
// Other duplicate streams with the SAME LCN retain upstream dedup behavior.
await rewrite('src/services/playlist-service.ts', text => {
  text = replaceOnce(text,
    "const existing = byUrl.get(ch.url);",
    "const lcnKey = ch.channelNumber && ch.channelNumber > 0 ? String(ch.channelNumber) : 'none';\n          const streamKey = ch.url + '#' + lcnKey;\n          const existing = byUrl.get(streamKey);",
    'preserve distinct LCN simulcasts lookup');
  text = replaceOnce(text,
    "byUrl.set(ch.url, ch);",
    "byUrl.set(streamKey, ch);",
    'preserve distinct LCN simulcasts insertion');
  return text;
});
// Regression: a simulcast URL may belong to multiple legitimate broadcast LCNs.
await rewrite('src/services/playlist-service.test.ts', text => replaceOnce(text,
  "  it('merges playlists and de-duplicates channels by URL', async () => {",
  "  it('retains both LCN 13 and 83 when the source is one simulcast URL', async () => {\n    storageMock.getPlaylists.mockReturnValue([\n      { id: 'v10', name: 'Montecrestese', url: 'http://home/montecrestese.m3u' },\n    ]);\n    fetchTextMock.mockResolvedValue(\n      '#EXTM3U\\n'\n      + '#EXTINF:-1 tvg-chno=\"13\",013 Rete 7 Piemonte\\n'\n      + 'https://example.org/rete7.m3u8\\n'\n      + '#EXTINF:-1 tvg-chno=\"83\",083 Piemonte+\\n'\n      + 'https://example.org/rete7.m3u8',\n    );\n    const channels = await PlaylistService.refresh();\n    expect(channels.map(c => c.channelNumber)).toEqual([13, 83]);\n    expect(channels.map(c => c.name)).toEqual(['013 Rete 7 Piemonte', '083 Piemonte+']);\n    expect(channels).toHaveLength(2);\n  });\n\n  it('merges playlists and de-duplicates channels by URL', async () => {",
  'test unique LCN simulcast'));
// Accessible directly from Diretta, no need to open IPTV fullscreen first.
await rewrite('src/components/channel-list.ts', text => {
  text = replaceOnce(text,
    "export interface ChannelListOptions {",
    "export interface ChannelListOptions {\n  onOpenHybridCatalog?: () => void;",
    'directory options');
  text = replaceOnce(text,
    "  private onListFocus: () => void;",
    "  private onListFocus: () => void;\n  private onOpenHybridCatalog: () => void;",
    'directory callback field');
  text = replaceOnce(text,
    "      onListFocus = () => {},",
    "      onListFocus = () => {},\n      onOpenHybridCatalog = () => {},",
    'directory callback default');
  text = replaceOnce(text,
    "    this.onListFocus = onListFocus;",
    "    this.onListFocus = onListFocus;\n    this.onOpenHybridCatalog = onOpenHybridCatalog;",
    'directory callback assignment');
  text = replaceOnce(text,
    "          ${showTabs ? html`",
    "          <div class=\"montecrestese-catalog-shortcut\"\n               data-key=\"montecrestese:catalog\" data-focusable data-hybrid-catalog\n               aria-label=\"Elenco completo 85 LCN\">\n            Guida completa TV · 85 LCN\n          </div>\n          ${showTabs ? html`",
    'visible 85-LCN directory entry');
  text = replaceOnce(text,
    "        if (focused.dataset.editChannels !== undefined) {",
    "        if (focused.dataset.hybridCatalog !== undefined) {\n          this.onOpenHybridCatalog();\n        } else if (focused.dataset.editChannels !== undefined) {",
    'directory OK action');
  return text;
});
await rewrite('src/app.ts', text => replaceOnce(text,
  "        onListFocus: () => this.livePreview?.leaveControls(false),",
  "        onListFocus: () => this.livePreview?.leaveControls(false),\n        onOpenHybridCatalog: () => this.hybridGuide.openCatalog(),",
  'app opens complete catalog from Diretta'));
// Montecrestese default: switch on and resume live TV immediately.
// Existing explicit OFF is stored in localStorage and remains authoritative.
await rewrite('src/services/storage-service.ts', text => replaceOnce(text,
  "return get<boolean>('auto_play', false);",
  "return get<boolean>('auto_play', true);",
  'living-room default auto-play'));
// Startup source reconciliation is issued in parallel with playlist loading.
// IPTV continues to use the robust saved stream key; external sources use bridge.
await rewrite('src/app.ts', text => {
  text = replaceOnce(text,
    "import { HybridGuide } from './components/hybrid-guide';",
    "import { HybridGuide } from './components/hybrid-guide';\nimport { getAbsoluteLastHybrid, restoreExternalLastHybrid } from './services/hybrid-last-source';",
    'hybrid startup import');
  text = replaceOnce(text,
    "  private async loadData(forceEpgRefresh = false): Promise<void> {",
    "  private async loadData(forceEpgRefresh = false): Promise<void> {\n    const lastHybridLookup = StorageService.getAutoPlay()\n      ? getAbsoluteLastHybrid() : Promise.resolve(null);",
    'prefetch last-channel during playlist/network load');
  text = replaceOnce(text,
    `      if (StorageService.getAutoPlay()) {
        // The per-stream key survives customization and provider reshuffles.
        const lastCh = PlaylistService.resolveLastChannelIndex(
          StorageService.getLastChannelKey(),
          StorageService.getLastChannel(),
        );
        const last = PlaylistService.channels[lastCh];
        // A locked channel must not open a PIN prompt over a cold start.
        if (last && ParentalControlService.decision(liveParentalRequest(last)).allowed) {
          log.info('Auto-play resuming last channel index', lastCh);
          this.playChannel(lastCh);
        }
      }`,
    `      if (StorageService.getAutoPlay()) {
        const lastHybrid = await lastHybridLookup;
        if (lastHybrid && lastHybrid.source !== 'iptv') {
          // The last watched channel may be native DVB or official browser.
          const outcome = await restoreExternalLastHybrid(lastHybrid);
          if (outcome === 'external-unavailable') {
            // Native Live TV source is intentionally stored with LCN 0:
            // it stands for LG's own last tuned channel, not a catalog row.
            if (lastHybrid.source === 'dvb') this.hybridGuide.openCatalog();
            else this.hybridGuide.openForLcn(lastHybrid.lcn);
          }
        } else {
          // Existing source-key handling remains the stable fallback when
          // the installation predates the source-agnostic history.
          const lastCh = lastHybrid?.source === 'iptv'
            ? findChannelIndexByLcn(PlaylistService.channels, lastHybrid.lcn)
            : PlaylistService.resolveLastChannelIndex(
              StorageService.getLastChannelKey(),
              StorageService.getLastChannel(),
            );
          const last = lastCh >= 0 ? PlaylistService.channels[lastCh] : null;
          if (last && ParentalControlService.decision(liveParentalRequest(last)).allowed) {
            log.info('Auto-play resuming exact last IPTV LCN', lastCh);
            this.playChannel(lastCh);
          } else if (lastHybrid?.source === 'iptv') {
            // Source has disappeared: show it, never silently show another LCN.
            this.hybridGuide.openForLcn(lastHybrid.lcn);
          }
        }
      }`,
    'unified last-watched startup');
  return text;
});
await rewrite('src/components/player.ts', text => {
  text = replaceOnce(text,
    "import { ChannelHealthService } from '../services/channel-health';",
    "import { ChannelHealthService } from '../services/channel-health';\nimport { confirmedIPTVPlaying } from '../services/hybrid-last-source';",
    'player resume import');
  text = replaceOnce(text,
    "      this.markTrackedLiveHealthy();",
    `      this.markTrackedLiveHealthy();
      if (this.liveSessionActive && this.currentChannel && this.currentIndex >= 0
          && !document.hidden && !this.livePreviewMode && !this.catchupInfo && !this.vod) {
        confirmedIPTVPlaying(channelLcn(this.currentChannel, this.currentIndex));
      }`,
    'remember video only when playing');
  text = replaceOnce(text,
    "export class Player {",
    "export class Player {\n  private montecresteseSwitchStart = 0;",
    'add one stopwatch for playback diagnostics');
  text = replaceOnce(text,
    "    this.loadStream(url, channel.extras);",
    "    this.montecresteseSwitchStart = Date.now();\n    this.loadStream(url, channel.extras);",
    'start channel warmup stopwatch');
  text = replaceOnce(text,
    "        confirmedIPTVPlaying(channelLcn(this.currentChannel, this.currentIndex));",
    "        // From stream handoff to first real HTML5 'playing' event, not a guessed ETA.\n        const elapsedMs = Math.max(0, Date.now() - this.montecresteseSwitchStart);\n        if (this.montecresteseSwitchStart > 0) {\n          log.info('Montecrestese IPTV channel ready', 'elapsed_ms=' + elapsedMs);\n          this.montecresteseSwitchStart = 0;\n        }\n        confirmedIPTVPlaying(channelLcn(this.currentChannel, this.currentIndex));",
    'record observed channel startup latency');
  return text;
});
await rewrite('src/components/settings.ts', text => {
  text = replaceOnce(text,
    '  private healthProgress: ChannelHealthProgress | null = null;',
    "  private healthProgress: ChannelHealthProgress | null = null;\n  private healthLastRedrawAt = 0;",
    'throttle health updates property');
  text = replaceOnce(text,
    `          this.healthProgress = progress;
          this.updateChannelHealthPanel();`,
    `          this.healthProgress = progress;
          // Limit full DOM morph+85-LCN regrouping to 4Hz during network probes.
          const now = Date.now();
          if (now - this.healthLastRedrawAt >= 250 || progress.completed === progress.total) {
            this.healthLastRedrawAt = now;
            this.updateChannelHealthPanel();
          }`,
    'throttle health list during progress');

  text = replaceOnce(text,
    "import {\n  ChannelHealthService,",
    "import { groupChannelHealthIssues } from './channel-health-issues';\nimport {\n  ChannelHealthService,",
    'health issue import');
  text = replaceOnce(text,
    "    const summary = ChannelHealthService.getSummary(channels);\n    return html`",
    "    const summary = ChannelHealthService.getSummary(channels);\n    const issues = groupChannelHealthIssues(channels, ch => ChannelHealthService.getRecord(ch)?.status);\n    return html`",
    'health grouped list');
  text = replaceOnce(text,
    "        <div class=\"settings-item-hint\">${t('settings.channelHealthHint')}</div>",
    "        <div class=\"channel-health-issues\">\n          ${([\n            { id: 'suspect', name: 'Sospetti', entries: issues.suspect },\n            { id: 'unavailable', name: 'Non disponibili', entries: issues.unavailable },\n            { id: 'unknown', name: 'Non verificati', entries: issues.unknown },\n          ]).filter(group => group.entries.length > 0).map(group => html`\n            <div class=\"channel-health-issue-group ${group.id}\">\n              <div class=\"channel-health-issue-label\">${group.name} (${group.entries.length})</div>\n              <div class=\"channel-health-issue-list\">\n                ${group.entries.map(issue => html`\n                  <div class=\"channel-health-issue\">\n                    <span class=\"channel-health-issue-lcn\">${String(issue.lcn)}</span>\n                    <span>${issue.name}</span>\n                  </div>\n                `)}\n              </div>\n            </div>\n          `)}\n        </div>\n        <div class=\"settings-item-hint\">${t('settings.channelHealthHint')}</div>",
    'under counters issue groups');
  return text;
});
await rewrite('index.html', text => replaceOnce(text,
  '<link rel="stylesheet" href="css/legacy-webos-overrides.css">',
  '<link rel="stylesheet" href="css/legacy-webos-overrides.css">\n  <link rel="stylesheet" href="css/channel-health-issues.css">',
  'health list style import'));
// Update upstream settings test double to expose the public health record API.
// The new groups are derived from the same records as the existing counters.
await rewrite('src/components/settings.test.ts', text => replaceOnce(text,
  "    healthMock: {\n      getSummary:",
  "    healthMock: {\n      getRecord: vi.fn(() => null),\n      getSummary:",
  'health record test double'));
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
  ['montecrestese-living-room.test.ts', 'src/services/montecrestese-living-room.test.ts'],
  ['hybrid-bridge-config.ts', 'src/services/hybrid-bridge-config.ts'],
  ['hybrid-last-source.ts', 'src/services/hybrid-last-source.ts'],
  ['native-tv-source.ts', 'src/services/native-tv-source.ts'],
  ['hybrid-last-source.test.ts', 'src/services/hybrid-last-source.test.ts'],
  ['channel-health-issues-source.ts', 'src/components/channel-health-issues.ts'],
  ['channel-health-issues-source.test.ts', 'src/components/channel-health-issues.test.ts'],
  ['channel-health-issues.css', 'css/channel-health-issues.css'],
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
