import type { HybridEntry } from './hybrid-catalog';

/**
 * Experimental tuner picture-in-app using webOS Homebrew's undocumented
 * service/webos-broadcast video source. It cannot select an LCN and may be
 * rejected on stock LG webOS firmware. No external browser or relay involved.
 */
export class BroadcastPreview {
  private dialog: HTMLElement | null = null;
  private video: HTMLVideoElement | null = null;
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private hasMediaEvent = false;

  constructor(private readonly onClose: () => void = () => {}) {}

  open(entry: Pick<HybridEntry, 'lcn' | 'name'>): void {
    if (this.dialog) return;
    const root = document.createElement('div');
    root.className = 'broadcast-preview';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Anteprima antenna integrata');
    const panel = document.createElement('div');
    panel.className = 'broadcast-panel';

    const heading = document.createElement('div');
    heading.className = 'broadcast-heading';
    heading.textContent = 'Antenna nella app · prova sperimentale';
    const channel = document.createElement('div');
    channel.className = 'broadcast-request';
    channel.textContent = 'Richiesto: ' + entry.lcn + ' · ' + entry.name;

    const explanation = document.createElement('div');
    explanation.className = 'broadcast-explanation';
    explanation.textContent = 'ATTENZIONE: appare il canale DTT già sintonizzato dalla LG, '
      + 'NON necessariamente quello richiesto. webOS non autorizza '
      + 'questa app a sintonizzare direttamente un LCN.';

    const video = document.createElement('video');
    video.className = 'broadcast-video';
    video.autoplay = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-label', 'Segnale antenna corrente della LG');
    const source = document.createElement('source');
    source.setAttribute('src', 'tv://');
    source.setAttribute('type', 'service/webos-broadcast');
    video.appendChild(source);

    const status = document.createElement('div');
    status.className = 'broadcast-status';
    status.setAttribute('aria-live', 'polite');
    status.textContent = 'Richiesta del segnale TV integrato…';
    const help = document.createElement('div');
    help.className = 'broadcast-help';
    help.textContent = 'INDIETRO o GIALLO: ritorna alla lista · '
      + 'I numeri fisici sono gestiti dalla LG, non dall’app.';

    panel.append(heading, channel, explanation, video, status, help);
    root.appendChild(panel);
    document.body.appendChild(root);
    this.dialog = root;
    this.video = video;
    this.hasMediaEvent = false;

    const showStatus = (message: string): void => {
      if (this.dialog === root) status.textContent = message;
    };
    const mediaStarted = (): void => {
      if (this.dialog !== root) return;
      this.hasMediaEvent = true;
      showStatus('La LG segnala la riproduzione. Verifica immagine e audio: '
        + 'la sintonia del canale richiesto NON è confermata.');
    };
    video.addEventListener('playing', mediaStarted);
    video.addEventListener('loadeddata', mediaStarted);
    video.addEventListener('error', () => {
      if (this.dialog !== root) return;
      this.hasMediaEvent = true;
      showStatus('Il segnale antenna interno è stato rifiutato o non è disponibile. '
        + 'INDIETRO per le altre opzioni.');
    });
    this.timeout = setTimeout(() => {
      if (!this.hasMediaEvent) showStatus('Nessun fotogramma confermato dalla LG. '
        + 'Questo firmware potrebbe impedire il video antenna integrato.');
    }, 9500);
    window.addEventListener('keydown', this.onKey, true);
    try {
      const maybePromise = video.play();
      if (maybePromise && typeof maybePromise.catch === 'function') {
        void maybePromise.catch(() => {
          if (!this.hasMediaEvent) showStatus('La LG non ha avviato il segnale antenna: '
            + 'puoi tornare indietro e usare TV terrestre.');
        });
      }
    } catch (_error) {
      // Native webOS service may still drive the video despite play() failing
      // in jsdom or a browser engine that does not recognize the source type.
    }
  }

  close(): void {
    if (!this.dialog) return;
    window.removeEventListener('keydown', this.onKey, true);
    if (this.timeout !== null) clearTimeout(this.timeout);
    this.timeout = null;
    if (this.video) {
      try { this.video.pause(); } catch (_error) { /* unsupported in jsdom */ }
      this.video.removeAttribute('src');
      this.video.textContent = '';
    }
    this.video = null;
    this.dialog.remove();
    this.dialog = null;
    this.onClose();
  }

  isOpen(): boolean { return !!this.dialog; }

  private onKey = (event: KeyboardEvent): void => {
    if (!this.dialog) return;
    // Do not hijack physical number keys, potentially owned by native DTT.
    if (event.keyCode !== 27 && event.keyCode !== 461 && event.keyCode !== 405) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    this.close();
  };
}
