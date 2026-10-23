import { HYBRID_CATALOG, findHybridEntry, isIptvCandidate, type HybridEntry } from './hybrid-catalog';

type Screen = 'catalog' | 'actions' | 'settings';
type Command = 'tune' | 'web';

const KEY = 'montecrestese_hybrid_connection_v1';
const WATCH_KEYS = [13, 27, 37, 38, 39, 40, 405, 461, 8, 33, 34, 403, 404, 406, 412, 413, 415, 417];

export interface BridgeConfig { endpoint: string; token: string }

export function validateBridgeConfig(config: BridgeConfig): boolean {
  // The remote service is deliberately limited to a private RFC1918 IP.
  // Browser requests never receive an arbitrary destination or website URL.
  const m = /^http:\/\/(\d+)\.(\d+)\.(\d+)\.(\d+):(\d{2,5})$/.exec(config.endpoint);
  if (!m || !/^[0-9a-f]{64}$/i.test(config.token)) return false;
  const v = m.slice(1, 5).map(Number);
  const port = Number(m[5]);
  if (v.some(n => n < 0 || n > 255) || port < 1024 || port > 65535) return false;
  return v[0] === 10 || (v[0] === 172 && v[1] >= 16 && v[1] <= 31)
    || (v[0] === 192 && v[1] === 168);
}

function savedConfig(): BridgeConfig | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as BridgeConfig;
    return validateBridgeConfig(c) ? c : null;
  } catch (_e) { return null; }
}

export class HybridGuide {
  private dialog: HTMLElement | null = null;
  private screen: Screen = 'catalog';
  private position = 0;
  private option = 0;
  private settingsField = 0;
  private message = '';
  private config: BridgeConfig | null = savedConfig();
  private tuner = new Map<number, string>();
  private options: { label: string; action: 'iptv' | 'tune' | 'web' | 'settings' }[] = [];
  private pending = false;

  constructor(private readonly tuneIPTV: (lcn: number) => boolean) {}

  openCatalog(): void {
    if (this.dialog) return;
    this.position = 0;
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
    if (!this.dialog) return;
    const code = e.keyCode;
    // A TV's virtual keyboard must retain text input when configuring its bridge.
    const target = e.target as HTMLElement | null;
    if (this.screen === 'settings' && target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      if (![461, 405, 27, 38, 40, 13].includes(code)) return;
      (target as HTMLInputElement).blur();
    }
    if (!WATCH_KEYS.includes(code) && !(code >= 48 && code <= 57)) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    if (code === 405) { this.close(); return; }
    if (code === 461 || code === 27) {
      if (this.screen === 'catalog') this.close();
      else { this.screen = 'catalog'; this.message = ''; this.render(); }
      return;
    }
    if (this.pending) return;
    if (this.screen === 'settings') {
      if (code === 38 || code === 40) {
        this.settingsField = Math.max(0, Math.min(3, this.settingsField + (code === 38 ? -1 : 1)));
        this.focusSettings();
      } else if (code === 13) {
        if (this.settingsField < 2) {
          this.settingsField++;
          this.focusSettings();
        } else if (this.settingsField === 2) this.saveSettings();
        else { this.screen = 'actions'; this.render(); }
      }
      return;
    }
    if (this.screen === 'catalog') {
      if (code === 38 || code === 40 || code === 33 || code === 34) {
        const delta = code === 38 ? -1 : code === 40 ? 1 : code === 33 ? -9 : 9;
        this.position = Math.max(0, Math.min(HYBRID_CATALOG.length - 1, this.position + delta));
        this.render();
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

  private focusSettings(): void {
    if (!this.dialog) return;
    const controls = this.dialog.querySelectorAll<HTMLElement>('.hybrid-form input, .hybrid-form button');
    for (let i = 0; i < controls.length; i++) {
      controls[i].classList.toggle('hybrid-row--focus', i === this.settingsField);
    }
    controls[this.settingsField]?.focus();
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
      if (selected && typeof selected.scrollIntoView === 'function') {
        selected.scrollIntoView({ block: 'center' });
      }
    } else if (this.screen === 'actions') {
      const summary = document.createElement('div');
      summary.className = 'hybrid-heading';
      summary.textContent = String(entry.lcn).padStart(3, '0') + ' · ' + entry.name;
      root.appendChild(summary);
      this.options = [];
      if (isIptvCandidate(entry)) this.options.push({ label: 'Riproduci con IPTV', action: 'iptv' });
      this.options.push({ label: 'Apri canale TV terrestre (richiede collegamento locale)', action: 'tune' });
      if (entry.web) this.options.push({
        label: 'Apri sito ufficiale' + (entry.webType === 'official_info' ? ' (solo informazioni)' : ''),
        action: 'web',
      });
      this.options.push({ label: 'Configura collegamento locale', action: 'settings' });
      if (this.option >= this.options.length) this.option = 0;
      this.options.forEach((o, i) => this.addButton(root, o.label, this.option === i, () => this.selectOption(i)));
      const hint = document.createElement('p');
      hint.className = 'hybrid-info';
      hint.textContent = entry.kind === 'ESCLUSO_NON_FUNZIONANTE' ? 'Il precedente stream IPTV non funzionava sulla LG.'
        : entry.kind === 'SENZA_URL' ? 'Manca un flusso IPTV; provare antenna o diretta ufficiale.'
          : 'IPTV conservata come nella playlist v10. Il video dipende dalla sorgente.';
      root.appendChild(hint);
      if (this.tuner.size) {
        const tuned = document.createElement('p');
        tuned.className = 'hybrid-info';
        tuned.textContent = this.tuner.has(entry.lcn)
          ? 'Sintonizzatore: ' + this.tuner.get(entry.lcn)
          : 'Canale non presente nell’ultima scansione del sintonizzatore';
        root.appendChild(tuned);
      }
    } else {
      const form = document.createElement('div');
      form.className = 'hybrid-form';
      const label1 = document.createElement('label');
      label1.textContent = 'Indirizzo bridge sul PC (es. http://192.168.1.10:8927)';
      const endpoint = document.createElement('input');
      endpoint.id = 'hybrid-endpoint'; endpoint.type = 'text';
      endpoint.value = this.config?.endpoint || '';
      const label2 = document.createElement('label');
      label2.textContent = 'Chiave di accoppiamento (64 caratteri)';
      const token = document.createElement('input');
      token.id = 'hybrid-token'; token.type = 'password';
      token.value = this.config?.token || '';
      form.appendChild(label1); form.appendChild(endpoint); form.appendChild(label2); form.appendChild(token);
      this.addButton(form, 'Salva e controlla i canali del TV', false, () => this.saveSettings());
      this.addButton(form, 'Annulla', false, () => { this.screen = 'actions'; this.render(); });
      root.appendChild(form);
    }
    this.dialog.querySelector<HTMLElement>('.hybrid-status')!.textContent = this.message;
    if (this.screen === 'settings') this.focusSettings();
  }

  private selectOption(index: number): void {
    if (this.pending) return;
    const item = this.options[index];
    if (!item) return;
    const entry = HYBRID_CATALOG[this.position];
    if (item.action === 'settings') { this.screen = 'settings'; this.settingsField = 0; this.message = ''; this.render(); return; }
    if (item.action === 'iptv') {
      if (this.tuneIPTV(entry.lcn)) this.close();
      else { this.message = 'Il canale non è nella playlist IPTV attiva.'; this.render(); }
      return;
    }
    if (!this.config) {
      this.screen = 'settings'; this.settingsField = 0; this.message = 'Per il cambio automatico serve il servizio locale sul PC.'; this.render();
      return;
    }
    this.sendCommand(item.action, entry);
  }

  private saveSettings(): void {
    const endpoint = this.dialog?.querySelector<HTMLInputElement>('#hybrid-endpoint')?.value.trim() || '';
    const token = this.dialog?.querySelector<HTMLInputElement>('#hybrid-token')?.value.trim() || '';
    const config = { endpoint, token };
    if (!validateBridgeConfig(config)) {
      this.message = 'Usa IP privato, porta 1024-65535 e chiave esadecimale a 64 caratteri.';
      const status = this.dialog?.querySelector<HTMLElement>('.hybrid-status');
      if (status) status.textContent = this.message;
      return;
    }
    this.config = config;
    try { localStorage.setItem(KEY, JSON.stringify(config)); }
    catch (_e) { this.message = 'Impossibile salvare le impostazioni.'; this.render(); return; }
    this.screen = 'actions';
    this.message = 'Collegamento salvato. Controllo disponibilità canali…';
    this.render();
    void this.fetchChannels();
  }

  private async fetchChannels(): Promise<void> {
    if (!this.config) return;
    try {
      const response = await fetch(this.config.endpoint + '/v1/channels', {
        headers: { 'X-Montecrestese-Key': this.config.token },
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data: { channels?: { lcn: number; name: string }[] } = await response.json();
      this.tuner = new Map((data.channels || []).map(ch => [ch.lcn, ch.name]));
      this.message = 'Tuner collegato: ' + this.tuner.size + ' posizioni ricevute.';
    } catch (_e) {
      this.message = 'Bridge non raggiungibile. Verifica IP, chiave e firewall sul PC.';
    }
    if (this.dialog) this.render();
  }

  private async sendCommand(command: Command, entry: HybridEntry): Promise<void> {
    if (!this.config || this.pending) return;
    this.pending = true;
    this.message = 'Richiesta in corso…';
    this.render();
    try {
      const response = await fetch(this.config.endpoint + '/v1/action', {
        method: 'POST', headers: {
          'Content-Type': 'application/json',
          'X-Montecrestese-Key': this.config.token,
        },
        body: JSON.stringify({ action: command, lcn: entry.lcn }),
      });
      const result: { error?: string; message?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || 'HTTP ' + response.status);
      this.message = result.message || 'Richiesta inviata alla LG.';
    } catch (e) {
      this.message = e instanceof Error ? e.message : 'Collegamento fallito.';
    } finally {
      this.pending = false;
      if (this.dialog) this.render();
    }
  }
}
