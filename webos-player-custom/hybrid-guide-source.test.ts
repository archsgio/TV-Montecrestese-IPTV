// @vitest-environment jsdom
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { HYBRID_CATALOG, findHybridEntry, isIptvCandidate, isKnownBad } from './hybrid-catalog';
import { HybridGuide } from './hybrid-guide';

const mocks = vi.hoisted(() => ({ luna: vi.fn() }));
vi.mock('../services/luna', () => ({ lunaRequest: mocks.luna }));

describe('Montecrestese 85-LCN catalog stays accurate', () => {
  it('contains 85 unique ordered positions, retaining special Piemonte LCNs', () => {
    expect(HYBRID_CATALOG).toHaveLength(85);
    expect(new Set(HYBRID_CATALOG.map(ch => ch.lcn)).size).toBe(85);
    expect(HYBRID_CATALOG.every((row, i) => i === 0 || HYBRID_CATALOG[i - 1].lcn < row.lcn)).toBe(true);
    expect(findHybridEntry(802)?.name).toContain('Rai 3');
    expect(findHybridEntry(57)?.name).toBe('Italiana');
  });
  it('separates 60 IPTV, 6 failed streams and 19 missing streams', () => {
    expect(HYBRID_CATALOG.filter(isIptvCandidate)).toHaveLength(60);
    expect(HYBRID_CATALOG.filter(isKnownBad)).toHaveLength(6);
    expect(HYBRID_CATALOG.filter(x => x.kind === 'SENZA_URL')).toHaveLength(19);
    expect(findHybridEntry(83)?.kind).toBe('CANDIDATO_SIMULCAST');
  });
  it('only lists official HTTPS websites, never dummy video URLs', () => {
    const websites = HYBRID_CATALOG.filter(ch => !!ch.web);
    expect(websites).toHaveLength(13);
    expect(websites.every(x => x.web.startsWith('https://'))).toBe(true);
    expect(websites.every(x => !x.web.includes('.m3u8'))).toBe(true);
  });
});

describe('TV-only hybrid navigation, no Mac/PC required', () => {
  let modal: HybridGuide;
  let tune: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    tune = vi.fn(() => true);
    mocks.luna.mockReset();
    mocks.luna.mockImplementation((_uri: string, opts: {
      onSuccess?: (result: { returnValue: boolean }) => void;
    }) => {
      queueMicrotask(() => opts.onSuccess?.({ returnValue: true }));
      return { cancel: vi.fn() };
    });
    modal = new HybridGuide(tune);
  });
  afterEach(() => { modal.close(); document.body.innerHTML = ''; });
  it('opens complete directory and moves focus without recreating DOM', () => {
    modal.openCatalog();
    expect(document.querySelectorAll('.hybrid-list .hybrid-row')).toHaveLength(85);
    const first = document.querySelector('.hybrid-list .hybrid-row');
    for (let i = 0; i < 8; i++)
      window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, keyCode: 40 }));
    expect(document.querySelector('.hybrid-list .hybrid-row')).toBe(first);
    expect(document.querySelector('.hybrid-row--focus')?.textContent).toContain('009');
    expect(tune).not.toHaveBeenCalled();
  });
  it('opens directory focused on last requested source', () => {
    localStorage.setItem('montecrestese_last_hybrid_channel_v1',
      JSON.stringify({ source: 'dvb', lcn: 802, at: Date.now() }));
    modal.openCatalog();
    expect(document.querySelector('.hybrid-row--focus')?.textContent).toContain('802');
  });
  it('does not offer already rejected IPTV playback for regional Rai 3', () => {
    modal.openForLcn(802);
    const labels = [...document.querySelectorAll('button.hybrid-row')].map(x => x.textContent || '');
    expect(labels.some(x => x.includes('Guarda in IPTV'))).toBe(false);
    expect(labels.some(x => x.includes('TV terrestre LG'))).toBe(true);
    expect(labels.some(x => x.includes('PC') || x.includes('Mac'))).toBe(false);
  });
  it('selects existing IPTV without using Luna or a bridge', () => {
    modal.openForLcn(6);
    const play = [...document.querySelectorAll('button.hybrid-row')]
      .find(x => x.textContent?.includes('Guarda in IPTV')) as HTMLButtonElement;
    play.click();
    expect(tune).toHaveBeenCalledOnce();
    expect(tune).toHaveBeenCalledWith(6);
    expect(mocks.luna).not.toHaveBeenCalled();
  });
  it('opens native Live TV only after explicit selection and not as fake exact LCN tune', async () => {
    modal.openForLcn(802);
    expect(mocks.luna).not.toHaveBeenCalled();
    const open = [...document.querySelectorAll('button.hybrid-row')]
      .find(x => x.textContent?.includes('TV terrestre LG')) as HTMLButtonElement;
    open.click();
    await vi.waitFor(() => expect(mocks.luna).toHaveBeenCalledOnce());
    expect(mocks.luna.mock.calls[0][0]).toBe('luna://com.webos.applicationManager');
    expect(mocks.luna.mock.calls[0][1].parameters)
      .toEqual({ id: 'com.webos.app.livetv' });
    await vi.waitFor(() => expect(JSON.parse(
      localStorage.getItem('montecrestese_last_hybrid_channel_v1') || '{}'))
      .toMatchObject({ source: 'dvb', lcn: 0 }));
    expect(tune).not.toHaveBeenCalled();
  });
  it('opens the RaiPlay website in the native LG browser, no PC bridge', async () => {
    modal.openForLcn(57);
    const open = [...document.querySelectorAll('button.hybrid-row')]
      .find(x => x.textContent?.includes('sito ufficiale')) as HTMLButtonElement;
    open.click();
    await vi.waitFor(() => expect(mocks.luna).toHaveBeenCalledOnce());
    expect(mocks.luna.mock.calls[0][1].parameters).toEqual({
      id: 'com.webos.app.browser',
      params: { target: 'https://www.raiplay.it/dirette/italiana' },
    });
  });
  it('does not record failed TV-native launch as watched', async () => {
    mocks.luna.mockImplementation((_uri: string, opts: {
      onFailure?: (result: { returnValue: boolean; errorText: string }) => void;
    }) => {
      queueMicrotask(() => opts.onFailure?.({ returnValue: false, errorText: 'Denied' }));
      return { cancel: vi.fn() };
    });
    modal.openForLcn(802);
    const open = [...document.querySelectorAll('button.hybrid-row')]
      .find(x => x.textContent?.includes('TV terrestre LG')) as HTMLButtonElement;
    open.click();
    await vi.waitFor(() => expect(document.querySelector('.hybrid-status')?.textContent).toBe('Denied'));
    expect(localStorage.getItem('montecrestese_last_hybrid_channel_v1')).toBeNull();
    expect(document.querySelector('.hybrid-guide')).not.toBeNull();
  });
  it('reports -104 restricted native app launch without changing channel memory', async () => {
    mocks.luna.mockImplementation((_uri: string, opts: {
      onFailure?: (r: { returnValue: boolean; errorCode: number; errorText: string }) => void;
    }) => {
      queueMicrotask(() => opts.onFailure?.({
        returnValue: false, errorCode: -104, errorText: 'privileged launch denied',
      }));
      return { cancel: vi.fn() };
    });
    modal.openForLcn(802);
    const go = [...document.querySelectorAll('button.hybrid-row')]
      .find(x => x.textContent?.includes('TV terrestre LG')) as HTMLButtonElement;
    go.click();
    await vi.waitFor(() =>
      expect(document.querySelector('.hybrid-status')?.textContent).toContain('-104'));
    expect(document.querySelector('.hybrid-status')?.textContent).toContain('HOME');
    expect(localStorage.getItem('montecrestese_last_hybrid_channel_v1')).toBeNull();
    expect(document.querySelector('.hybrid-guide')).not.toBeNull();
  });

  it('closes safely on yellow without changing TV source', () => {
    modal.openForLcn(8);
    window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, keyCode: 405 }));
    expect(document.querySelector('.hybrid-guide')).toBeNull();
    expect(mocks.luna).not.toHaveBeenCalled();
  });
});
