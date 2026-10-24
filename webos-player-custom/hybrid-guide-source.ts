import { HYBRID_CATALOG, isIptvCandidate, type HybridEntry } from './hybrid-catalog';
import { BroadcastPreview } from './broadcast-preview';
import { openNativeLiveTv, openOfficialBrowser } from '../services/native-tv-source';
import { getLocalLastHybrid, rememberHybrid } from '../services/hybrid-last-source';

type Screen = 'catalog' | 'actions';
type Command = 'tune' | 'web';

const WATCH_KEYS = [13, 27, 37, 38, 39, 40, 405, 461, 8, 33, 34, 403, 404, 406, 412, 413, 415, 417];

export class HybridGuide {
  private dialog: HTMLElement | null = null;
  private screen: Screen = 'catalog';
  private position = 0;
  private option = 0;
  private message = '';
  private options: { label: string; action: 'iptv' | 'broadcast' | 'tune' | 'web' }[] = [];
  private pending = false;
  private broadcastPreview: BroadcastPreview | null = null;

  constructor(private readonly tuneIPTV: (lcn: number) => boolean) {}

  openCatalog(): void {
    if (this.dialog) return;
    const last = getLocalLastHybrid();
    const at = last ? HYBRID_CATALOG.findIndex(row => row.lcn === last.lcn) : -1;
    this.position = at >= 0 ? at : 0;
    this.screen = 'catalog';
    this.mount();
  }

  openForLcn(lcn: number): void {
    const idx = HYBRID_CATALOG.findIndex(c => c.lcn === lcn);
    if (idx < 0) { this.openCatalog(); this.message = 'Numero non nel catalogo LCN'; this.render(); return; }
    if (!this.dialog) this.mount();
    this.position = idx;
    this.option = 0;
    this.screen = 'actions';
    this.message = '';
    this.render();
  }

  close(): void {
    this.broadcastPreview?.close();
    this.broadcastPreview = null;
    window.removeEventListener('keydown', this.onKey, true);
    this.dialog?.parentNode?.removeChild(this.dialog);
    this.dialog = null;
    this.pending = false;
  }

  private mount(): void {
    const el = document.createElement('div');
    el.className = 'hybrid-guide';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Catalogo Montecrestese: IPTV, antenna, siti ufficiali');
    el.innerHTML = '<div class="hybrid-panel"><div class="hybrid-title">TV Montecrestese · 85 LCN</div>'
      + '<div class="hybrid-subtitle">IPTV · TV terrestre · dirette web ufficiali</div>'
      + '<div class="hybrid-content"></div><div class="hybrid-status" aria-live="polite"></div>'
      + '<div class="hybrid-help">↑ ↓ Scorri · OK Seleziona · Indietro Torna · Giallo Chiudi</div></div>';
    document.body.appendChild(el);
    this.dialog = el;
    window.addEventListener('keydown', this.onKey, true);
    this.render();
  }

  private onKey = (e: KeyboardEvent): void => {
    if (!this.dialog || this.broadcastPreview) return;
    const code = e.keyCode;
    if (!WATCH_KEYS.includes(code) && !(code >= 48 && code <= 57)) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    if (code === 405) { this.close(); return; }
    if (code === 461 || code === 27) {
      if (this.screen === 'catalog') this.close();
      else { this.screen = 'catalog'; this.message = ''; this.render(); }
      return;
    }
    if (this.pending) return;
    if (this.screen === 'catalog') {
      if (code === 38 || code === 40 || code === 33 || code === 34) {
        const delta = code === 38 ? -1 : code === 40 ? 1 : code === 33 ? -9 : 9;
        const before = this.position;
        this.position = Math.max(0, Math.min(HYBRID_CATALOG.length - 1, this.position + delta));
        this.moveCatalogFocus(before);
      } else if (code === 13 || code === 39) {
        this.screen = 'actions'; this.option = 0; this.message = ''; this.render();
      }
    } else if (this.screen === 'actions') {
      if (code === 38 || code === 40) {
        this.option = (this.option + (code === 38 ? -1 : 1) + this.options.length) % this.options.length;
        this.render();
      } else if (code === 37) {
        this.screen = 'catalog'; this.render();
      } else if (code === 13) this.selectOption(this.option);
    }
  };

  /** Move the highlight without rebuilding 85 buttons on every remote key.
   * Important on older LG TV CPUs, where repeated reflows add input latency.
   */
  private moveCatalogFocus(previous: number): void {
    if (!this.dialog || this.screen !== 'catalog') return;
    const list = this.dialog.querySelector<HTMLElement>('.hybrid-list');
    const viewport = this.dialog.querySelector<HTMLElement>('.hybrid-content');
    if (!list || !viewport) return;
    list.children[previous]?.classList.remove('hybrid-row--focus');
    const selected = list.children[this.position] as HTMLElement | undefined;
    if (!selected) return;
    selected.classList.add('hybrid-row--focus');
    const row = selected.getBoundingClientRect();
    const rect = viewport.getBoundingClientRect();
    viewport.scrollTop = Math.max(0, viewport.scrollTop +
      row.top - rect.top - (rect.height - row.height) / 2);
  }

  private clearContent(): HTMLElement {
    const root = this.dialog!.querySelector<HTMLElement>('.hybrid-content')!;
    root.textContent = '';
    return root;
  }

  private addButton(root: HTMLElement, text: string, active: boolean, click: () => void): HTMLElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hybrid-row' + (active ? ' hybrid-row--focus' : '');
    btn.textContent = text;
    btn.addEventListener('click', click);
    root.appendChild(btn);
    return btn;
  }

  private render(): void {
    if (!this.dialog) return;
    const root = this.clearContent();
    const entry = HYBRID_CATALOG[this.position];
    if (this.screen === 'catalog') {
      const wrap = document.createElement('div');
      wrap.className = 'hybrid-list';
      root.appendChild(wrap);
      for (let i = 0; i < HYBRID_CATALOG.length; i++) {
        const row = HYBRID_CATALOG[i];
        const state = row.kind === 'ESCLUSO_NON_FUNZIONANTE' ? '⚠ IPTV non funzionante'
          : row.kind === 'SENZA_URL' ? '— Nessuno stream' : row.kind === 'CANDIDATO_DA_COLLAUDARE'
            ? '◌ IPTV da provare' : '✓ IPTV disponibile in lista';
        this.addButton(wrap, String(row.lcn).padStart(3, '0') + ' · ' + row.name + '    ' + state,
          i === this.position, () => { this.position = i; this.option = 0; this.screen = 'actions'; this.render(); });
      }
      const selected = wrap.children[this.position] as HTMLElement | undefined;
      if (selected) {
        // Scoped list scrolling: never reposition the entire application.
        const viewport = this.dialog!.querySelector<HTMLElement>('.hybrid-content')!;
        const row = selected.getBoundingClientRect();
        const rect = viewport.getBoundingClientRect();
        viewport.scrollTop = Math.max(0, viewport.scrollTop +
          row.top - rect.top - (rect.height - row.height) / 2);
      }
    } else if (this.screen === 'actions') {
      const summary = document.createElement('div');
      summary.className = 'hybrid-heading';
      summary.textContent = String(entry.lcn).padStart(3, '0') + ' · ' + entry.name;
      root.appendChild(summary);
      this.options = [];
      if (isIptvCandidate(entry)) this.options.push({ label: 'Guarda in IPTV', action: 'iptv' });
      this.options.push({ label: 'Prova antenna integrata (resta nell’app · sperimentale)', action: 'broadcast' });
      this.options.push({
        label: 'Apri TV terrestre LG (ultimo canale sintonizzato)', action: 'tune',
      });
      // Not a TV channel: keep the browser as an explicitly labeled,
      // last-resort action. Do not imply that a website equals live playback.
      if (entry.web) this.options.push({
        label: entry.webType === 'official_info'
          ? 'Sito dell’emittente (solo informazioni, fuori dall’app)'
          : 'Apri sito ufficiale (alternativa esterna, fuori dall’app)',
        action: 'web',
      });
      if (this.option >= this.options.length) this.option = 0;
      this.options.forEach((o, i) => this.addButton(root, o.label, this.option === i, () => this.selectOption(i)));
      const hint = document.createElement('p');
      hint.className = 'hybrid-info';
      hint.textContent = entry.kind === 'ESCLUSO_NON_FUNZIONANTE' ? 'Il precedente stream IPTV non funzionava sulla LG.'
        : entry.kind === 'SENZA_URL' ? 'Manca un flusso IPTV integrato: il sito esterno non equivale a un canale TV.'
          : 'IPTV conservata come nella playlist v10. Il video dipende dalla sorgente.';
      root.appendChild(hint);
      const limitation = document.createElement('p');
      limitation.className = 'hybrid-info';
      limitation.textContent = 'Nessun computer necessario. La prova antenna integrata ' +
        'mostra solo il canale GIA sintonizzato, se il firmware lo permette; ' +
        'non cambia automaticamente il numero LCN. La TV terrestre apre ' +
        'l’ultimo canale antenna della LG.';
      root.appendChild(limitation);
    }
    this.dialog.querySelector<HTMLElement>('.hybrid-status')!.textContent = this.message;

  }

  private selectOption(index: number): void {
    if (this.pending) return;
    const item = this.options[index];
    if (!item) return;
    const entry = HYBRID_CATALOG[this.position];
    if (item.action === 'iptv') {
      if (this.tuneIPTV(entry.lcn)) this.close();
      else { this.message = 'Il canale non è nella playlist IPTV attiva.'; this.render(); }
      return;
    }
    if (item.action === 'broadcast') {
      this.broadcastPreview = new BroadcastPreview(() => { this.broadcastPreview = null; });
      this.broadcastPreview.open(entry);
      return;
    }
    void this.sendNativeAction(item.action, entry);
  }

  private async sendNativeAction(command: Command, entry: HybridEntry): Promise<void> {
    if (this.pending) return;
    this.pending = true;
    this.message = 'Apertura sulla LG…';
    this.render();
    try {
      const result = command === 'tune'
        ? await openNativeLiveTv()
        : await openOfficialBrowser(entry.web);
      if (!result.ok) {
        this.message = result.message;
        return;
      }
      // This is the last requested source. For native DTT the numeric LCN
      // is NOT independently confirmed: Live TV controls its own tuner.
      // Do not claim the selected catalog LCN is the tuner channel: LG
      // opens its own last remembered terrestrial channel independently.
      rememberHybrid(command === 'tune' ? 'dvb' : 'web', command === 'tune' ? 0 : entry.lcn);
      this.close();
    } catch (_e) {
      this.message = 'Impossibile aprire la sorgente dal televisore.';
    } finally {
      this.pending = false;
      if (this.dialog) this.render();
    }
  }
}
