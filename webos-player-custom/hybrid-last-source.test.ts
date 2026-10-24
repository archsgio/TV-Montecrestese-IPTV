// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  validateLastHybrid, chooseLastHybrid, getAbsoluteLastHybrid,
  confirmedIPTVPlaying, restoreExternalLastHybrid, getLocalLastHybrid,
} from './hybrid-last-source';

const calls = vi.hoisted(() => ({
  live: vi.fn(), web: vi.fn(),
}));
vi.mock('./native-tv-source', () => ({
  openNativeLiveTv: calls.live,
  openOfficialBrowser: calls.web,
}));

const key = 'montecrestese_last_hybrid_channel_v1';
const source = (s: 'iptv' | 'dvb' | 'web', lcn: number, at: number) => ({
  source: s, lcn, at,
});

describe('TV-only last source - never requires Mac or PC', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    calls.live.mockReset().mockResolvedValue({ ok: true, message: 'TV opened' });
    calls.web.mockReset().mockResolvedValue({ ok: true, message: 'Browser opened' });
  });

  it('accepts only well-formed IPTV, DVB, and web events', () => {
    const now = Date.now();
    expect(validateLastHybrid(source('dvb', 802, now))?.lcn).toBe(802);
    expect(validateLastHybrid(source('web', 57, now))?.source).toBe('web');
    expect(validateLastHybrid({ source: 'other', lcn: 802, at: now })).toBeNull();
    expect(validateLastHybrid(source('dvb', 0, now))).toBeNull();
  });

  it('uses the most recent local history independent of source', () => {
    const old = source('iptv', 13, Date.now() - 2000);
    const newer = source('dvb', 802, Date.now() - 1000);
    expect(chooseLastHybrid(old, newer)).toEqual(newer);
    expect(chooseLastHybrid(newer, old)).toEqual(newer);
  });

  it('represents native LG tuner return without inventing the tuned LCN', () => {
    expect(validateLastHybrid(source('dvb', 0, Date.now()))).toMatchObject({
      source: 'dvb', lcn: 0,
    });
    expect(validateLastHybrid(source('iptv', 0, Date.now()))).toBeNull();
    expect(validateLastHybrid(source('web', 0, Date.now()))).toBeNull();
  });

  it('reads history from the TV local storage without network or bridge configuration', async () => {
    const last = source('dvb', 802, Date.now() - 2000);
    localStorage.setItem(key, JSON.stringify(last));
    const network = vi.fn();
    vi.stubGlobal('fetch', network);
    expect(await getAbsoluteLastHybrid()).toEqual(last);
    expect(network).not.toHaveBeenCalled();
  });

  it('reopens native LG Live TV; LG restores its own last tuned DVB channel', async () => {
    const last = source('dvb', 802, Date.now());
    expect(await restoreExternalLastHybrid(last)).toBe('external-restored');
    expect(calls.live).toHaveBeenCalledOnce();
    expect(calls.web).not.toHaveBeenCalled();
  });

  it('reopens the official broadcaster website without any intermediary PC', async () => {
    expect(await restoreExternalLastHybrid(source('web', 57, Date.now())))
      .toBe('external-restored');
    expect(calls.web).toHaveBeenCalledWith('https://www.raiplay.it/dirette/italiana');
  });

  it('does not open an arbitrary URL if missing from official channel registry', async () => {
    expect(await restoreExternalLastHybrid(source('web', 802, Date.now())))
      .toBe('external-unavailable');
    expect(calls.web).not.toHaveBeenCalled();
  });

  it('does not declare a failed native launch successful', async () => {
    calls.live.mockResolvedValueOnce({ ok: false, message: 'Not authorized' });
    expect(await restoreExternalLastHybrid(source('dvb', 802, Date.now())))
      .toBe('external-unavailable');
  });

  it('stores IPTV playback locally only when media playing is confirmed', () => {
    expect(getLocalLastHybrid()).toBeNull();
    confirmedIPTVPlaying(59);
    expect(getLocalLastHybrid()?.source).toBe('iptv');
    expect(getLocalLastHybrid()?.lcn).toBe(59);
  });
});
