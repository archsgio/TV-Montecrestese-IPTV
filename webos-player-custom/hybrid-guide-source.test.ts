// @vitest-environment jsdom
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { HYBRID_CATALOG, findHybridEntry, isIptvCandidate, isKnownBad } from './hybrid-catalog';
import { HybridGuide, validateBridgeConfig } from './hybrid-guide';

describe('85 LCN hybrid catalog integrity', () => {
  it('preserves all 85 distinct, ordered regional/national LCNs', () => {
    expect(HYBRID_CATALOG).toHaveLength(85);
    expect(new Set(HYBRID_CATALOG.map(x => x.lcn)).size).toBe(85);
    expect(HYBRID_CATALOG.every((x, i) =>
      i === 0 || HYBRID_CATALOG[i - 1].lcn < x.lcn)).toBe(true);
    expect(findHybridEntry(802)?.name).toContain('Rai 3');
    expect(findHybridEntry(57)?.name).toBe('Italiana');
  });

  it('distinguishes 60 IPTV candidates, 6 failed LG streams and 19 unsourced positions', () => {
    expect(HYBRID_CATALOG.filter(isIptvCandidate)).toHaveLength(60);
    expect(HYBRID_CATALOG.filter(isKnownBad)).toHaveLength(6);
    expect(HYBRID_CATALOG.filter(x => x.kind === 'SENZA_URL')).toHaveLength(19);
    expect(isKnownBad(findHybridEntry(14)!)).toBe(true);
    expect(isKnownBad(findHybridEntry(802)!)).toBe(true);
    expect(findHybridEntry(83)?.kind).toBe('CANDIDATO_SIMULCAST');
    expect(findHybridEntry(59)?.kind).toBe('CANDIDATO_DA_COLLAUDARE');
  });

  it('links only HTTPS official destinations (and no placeholder streams)', () => {
    const urls = HYBRID_CATALOG.filter(x => !!x.web);
    expect(urls.length).toBe(13);
    expect(urls.every(x => x.web.startsWith('https://'))).toBe(true);
    expect(HYBRID_CATALOG.every(x => !x.web.includes('.m3u8'))).toBe(true);
  });
});

const token = 'a'.repeat(64);
describe('Local bridge input validation', () => {
  it('allows only private PC IP and 64-hex token', () => {
    expect(validateBridgeConfig({ endpoint: 'http://192.168.1.50:8927', token })).toBe(true);
    expect(validateBridgeConfig({ endpoint: 'http://10.0.0.2:8927', token })).toBe(true);
    expect(validateBridgeConfig({ endpoint: 'http://172.16.0.2:8927', token })).toBe(true);
    for (const endpoint of [
      'http://8.8.8.8:8927', 'http://127.0.0.1:8927',
      'https://example.com:8927', 'http://192.168.1.50:80',
      'http://192.168.1.50:8927/trick', 'http://172.32.0.2:8927',
    ]) expect(validateBridgeConfig({ endpoint, token })).toBe(false);
    expect(validateBridgeConfig({
      endpoint: 'http://192.168.1.50:8927', token: 'xyz',
    })).toBe(false);
  });
});

describe('LG hybrid modal navigation and safety', () => {
  let modal: HybridGuide;
  let tune: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    tune = vi.fn(() => true);
    modal = new HybridGuide(tune);
  });
  afterEach(() => { modal.close(); vi.unstubAllGlobals(); document.body.innerHTML = ''; });

  it('shows the complete 85-LCN directory using D-pad and OK', () => {
    modal.openCatalog();
    expect(document.querySelectorAll('.hybrid-list .hybrid-row')).toHaveLength(85);
    const first = document.querySelector('.hybrid-row--focus');
    expect(first?.textContent).toContain('001');
    window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, keyCode: 40 }));
    expect(document.querySelector('.hybrid-row--focus')?.textContent).toContain('002');
    window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, keyCode: 13 }));
    expect(document.querySelector('.hybrid-heading')?.textContent).toContain('002');
  });

  it('reuses the same 85 rendered rows across repeated remote arrows', () => {
    modal.openCatalog();
    const firstRow = document.querySelector('.hybrid-list .hybrid-row');
    const firstList = document.querySelector('.hybrid-list');
    for (let i = 0; i < 8; i++) {
      window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, keyCode: 40 }));
    }
    expect(document.querySelector('.hybrid-list')).toBe(firstList);
    expect(document.querySelector('.hybrid-list .hybrid-row')).toBe(firstRow);
    expect(document.querySelectorAll('.hybrid-list .hybrid-row')).toHaveLength(85);
    expect(document.querySelector('.hybrid-row--focus')?.textContent).toContain('009');
    expect(tune).not.toHaveBeenCalled();
  });

  it('opens the 85-LCN guide focused on the most recently watched LCN', () => {
    localStorage.setItem('montecrestese_last_hybrid_channel_v1',
      JSON.stringify({ source: 'dvb', lcn: 802, at: Date.now() }));
    modal.openCatalog();
    expect(document.querySelector('.hybrid-row--focus')?.textContent)
      .toContain('802');
    expect(tune).not.toHaveBeenCalled();
  });

  it('does not offer IPTV playback for LCN 802 already rejected by LG', () => {
    modal.openForLcn(802);
    const items = Array.from(document.querySelectorAll('.hybrid-row'))
      .map(x => x.textContent || '');
    expect(items.some(x => x.includes('Riproduci con IPTV'))).toBe(false);
    expect(items.some(x => x.includes('TV terrestre'))).toBe(true);
    expect(tune).not.toHaveBeenCalled();
  });

  it('requires explicit bridge setup before attempting tuner command', () => {
    modal.openForLcn(14);
    const button = Array.from(document.querySelectorAll('button.hybrid-row'))
      .find(x => x.textContent?.includes('TV terrestre')) as HTMLButtonElement;
    button.click();
    expect(document.querySelector('#hybrid-endpoint')).not.toBeNull();
    expect(tune).not.toHaveBeenCalled();
  });

  it('closes without channel changes on yellow key', () => {
    modal.openForLcn(8);
    window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, keyCode: 405 }));
    expect(document.querySelector('.hybrid-guide')).toBeNull();
    expect(tune).not.toHaveBeenCalled();
  });

  it('for an IPTV candidate tunes only after explicit selection', () => {
    modal.openForLcn(6);
    expect(tune).not.toHaveBeenCalled();
    const play = Array.from(document.querySelectorAll('button.hybrid-row'))
      .find(x => x.textContent?.includes('Riproduci con IPTV')) as HTMLButtonElement;
    play.click();
    expect(tune).toHaveBeenCalledOnce();
    expect(tune).toHaveBeenCalledWith(6);
    expect(document.querySelector('.hybrid-guide')).toBeNull();
  });

  it('only sends DVB switch after explicit configured user action', async () => {
    const network = vi.fn().mockResolvedValueOnce({
      ok: true, json: async () => ({ channels: [{ lcn: 802, name: 'Rai 3 Piemonte' }] }),
    }).mockResolvedValueOnce({
      ok: true, json: async () => ({ message: 'Comando inviato' }),
    });
    vi.stubGlobal('fetch', network);
    modal.openForLcn(802);
    expect(network).not.toHaveBeenCalled();
    (Array.from(document.querySelectorAll('button.hybrid-row'))
      .find(x => x.textContent?.includes('TV terrestre')) as HTMLButtonElement).click();
    expect(network).not.toHaveBeenCalled();
    (document.querySelector('#hybrid-endpoint') as HTMLInputElement).value =
      'http://192.168.1.10:8927';
    (document.querySelector('#hybrid-token') as HTMLInputElement).value = token;
    (Array.from(document.querySelectorAll('button.hybrid-row'))
      .find(x => x.textContent?.includes('Salva')) as HTMLButtonElement).click();
    await vi.waitFor(() => expect(network).toHaveBeenCalledTimes(1));
    expect(network.mock.calls[0][0]).toBe('http://192.168.1.10:8927/v1/channels');
    expect(network.mock.calls[0][1].headers['X-Montecrestese-Key']).toBe(token);
    expect(tune).not.toHaveBeenCalled();
    (Array.from(document.querySelectorAll('button.hybrid-row'))
      .find(x => x.textContent?.includes('TV terrestre')) as HTMLButtonElement).click();
    await vi.waitFor(() => expect(network).toHaveBeenCalledTimes(2));
    expect(network.mock.calls[1][0]).toBe('http://192.168.1.10:8927/v1/action');
    expect(JSON.parse(network.mock.calls[1][1].body)).toEqual({ action: 'tune', lcn: 802 });
    await vi.waitFor(() => expect(JSON.parse(localStorage.getItem('montecrestese_last_hybrid_channel_v1') || '{}'))
      .toMatchObject({ source: 'dvb', lcn: 802 }));
  });

  it('official broadcaster click sends LCN, never arbitrary URL', async () => {
    const network = vi.fn().mockResolvedValueOnce({
      ok: true, json: async () => ({ channels: [] }),
    }).mockResolvedValueOnce({
      ok: true, json: async () => ({ message: 'Sito aperto' }),
    });
    vi.stubGlobal('fetch', network);
    modal.openForLcn(57);
    (Array.from(document.querySelectorAll('button.hybrid-row'))
      .find(x => x.textContent?.includes('Configura')) as HTMLButtonElement).click();
    (document.querySelector('#hybrid-endpoint') as HTMLInputElement).value =
      'http://192.168.1.10:8927';
    (document.querySelector('#hybrid-token') as HTMLInputElement).value = token;
    (Array.from(document.querySelectorAll('button.hybrid-row'))
      .find(x => x.textContent?.includes('Salva')) as HTMLButtonElement).click();
    await vi.waitFor(() => expect(network).toHaveBeenCalledTimes(1));
    (Array.from(document.querySelectorAll('button.hybrid-row'))
      .find(x => x.textContent?.includes('sito ufficiale')) as HTMLButtonElement).click();
    await vi.waitFor(() => expect(network).toHaveBeenCalledTimes(2));
    expect(JSON.parse(network.mock.calls[1][1].body)).toEqual({ action: 'web', lcn: 57 });
    expect(network.mock.calls[1][1].body).not.toContain('raiplay.it');
    await vi.waitFor(() => expect(JSON.parse(localStorage.getItem('montecrestese_last_hybrid_channel_v1') || '{}'))
      .toMatchObject({ source: 'web', lcn: 57 }));
    expect(tune).not.toHaveBeenCalled();
  });

  it('refuses invalid bridge credentials without network request', () => {
    const network = vi.fn();
    vi.stubGlobal('fetch', network);
    modal.openForLcn(8);
    (Array.from(document.querySelectorAll('button.hybrid-row'))
      .find(x => x.textContent?.includes('Configura')) as HTMLButtonElement).click();
    (document.querySelector('#hybrid-endpoint') as HTMLInputElement).value =
      'http://8.8.8.8:8927';
    (document.querySelector('#hybrid-token') as HTMLInputElement).value = token;
    (Array.from(document.querySelectorAll('button.hybrid-row'))
      .find(x => x.textContent?.includes('Salva')) as HTMLButtonElement).click();
    expect(network).not.toHaveBeenCalled();
  });
});
