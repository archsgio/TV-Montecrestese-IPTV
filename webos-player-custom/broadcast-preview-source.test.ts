// @vitest-environment jsdom
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { BroadcastPreview } from './broadcast-preview';

describe('TV-only in-app broadcast preview, experimental', () => {
  let preview: BroadcastPreview;
  let exit: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    document.body.innerHTML = '';
    exit = vi.fn();
    preview = new BroadcastPreview(exit);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  });
  afterEach(() => {
    preview.close();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });
  it('creates only a local TV source (no browser, iframe, network URL or synthetic IPTV stream)', () => {
    preview.open({ lcn: 8, name: 'TV8' });
    expect(preview.isOpen()).toBe(true);
    const el = document.querySelector<HTMLSourceElement>('.broadcast-video source');
    expect(el?.getAttribute('type')).toBe('service/webos-broadcast');
    expect(el?.getAttribute('src')).toBe('tv://');
    expect(document.querySelector('iframe')).toBeNull();
    expect(document.querySelector('.broadcast-request')?.textContent).toContain('8 · TV8');
    expect(document.querySelector('.broadcast-explanation')?.textContent)
      .toContain('NON necessariamente');
  });
  it('does not claim correct channel or a picture merely when opening; plays only after actual video event', () => {
    preview.open({ lcn: 12, name: 'Videogruppo' });
    expect(document.querySelector('.broadcast-status')?.textContent).toContain('Richiesta');
    const video = document.querySelector('video')!;
    video.dispatchEvent(new Event('playing'));
    expect(document.querySelector('.broadcast-status')?.textContent).toContain('NON è confermata');
  });
  it('reports media error without leaving the app', () => {
    preview.open({ lcn: 8, name: 'TV8' });
    document.querySelector('video')!.dispatchEvent(new Event('error'));
    expect(document.querySelector('.broadcast-status')?.textContent).toContain('rifiutato');
    expect(preview.isOpen()).toBe(true);
  });
  it('closes on BACK and does not capture number keys', () => {
    preview.open({ lcn: 8, name: 'TV8' });
    const numeric = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, keyCode: 56 });
    window.dispatchEvent(numeric);
    expect(numeric.defaultPrevented).toBe(false);
    expect(preview.isOpen()).toBe(true);
    const back = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, keyCode: 461 });
    window.dispatchEvent(back);
    expect(back.defaultPrevented).toBe(true);
    expect(preview.isOpen()).toBe(false);
    expect(exit).toHaveBeenCalledOnce();
  });
  it('does not retain a video element when closed', () => {
    preview.open({ lcn: 12, name: 'Videogruppo' });
    preview.close();
    expect(document.querySelector('video')).toBeNull();
    expect(document.querySelector('.broadcast-preview')).toBeNull();
  });
});
