// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  validateLastHybrid, chooseLastHybrid, getAbsoluteLastHybrid,
  confirmedIPTVPlaying, restoreExternalLastHybrid, getLocalLastHybrid,
} from './hybrid-last-source';

const key = 'montecrestese_last_hybrid_channel_v1';
const setup = 'montecrestese_hybrid_connection_v1';
const cfg = { endpoint: 'http://192.168.1.10:8927', token: 'f'.repeat(64) };
const source = (s: 'iptv' | 'dvb' | 'web', lcn: number, at: number) => ({
  source: s, lcn, at,
});

describe('Cross-source last watched and fast startup', () => {
  beforeEach(() => { localStorage.clear(); vi.unstubAllGlobals(); });

  it('validates exactly IPTV, DVB and web entries', () => {
    const now = Date.now();
    expect(validateLastHybrid(source('dvb', 802, now))?.lcn).toBe(802);
    expect(validateLastHybrid(source('web', 57, now))?.source).toBe('web');
    expect(validateLastHybrid({ source: 'other', lcn: 802, at: now })).toBeNull();
    expect(validateLastHybrid(source('dvb', 0, now))).toBeNull();
  });

  it('selects the most recent channel regardless of source', () => {
    const a = source('iptv', 13, Date.now() - 2000);
    const b = source('dvb', 802, Date.now() - 1000);
    expect(chooseLastHybrid(a, b)).toEqual(b);
    expect(chooseLastHybrid(b, a)).toEqual(b);
  });

  it('gets newer actual DVB from companion instead of stale IPTV local cache', async () => {
    const a = source('iptv', 13, Date.now() - 3000);
    const b = source('dvb', 802, Date.now() - 100);
    localStorage.setItem(key, JSON.stringify(a));
    localStorage.setItem(setup, JSON.stringify(cfg));
    const network = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ last: b }) });
    vi.stubGlobal('fetch', network);
    expect(await getAbsoluteLastHybrid()).toEqual(b);
    expect(network.mock.calls[0][0]).toContain('/v1/last');
  });

  it('keeps the correct external LCN when bridge is offline; no fallback video', async () => {
    localStorage.setItem(key, JSON.stringify(source('dvb', 802, Date.now() - 800)));
    expect(await getAbsoluteLastHybrid()).toEqual(getLocalLastHybrid());
    expect(await restoreExternalLastHybrid(getLocalLastHybrid()!))
      .toBe('external-unavailable');
  });

  it('restores DVB via authenticated action but does not substitute IPTV', async () => {
    localStorage.setItem(setup, JSON.stringify(cfg));
    const network = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ message: 'OK' }) });
    vi.stubGlobal('fetch', network);
    expect(await restoreExternalLastHybrid(source('dvb', 802, Date.now())))
      .toBe('external-restored');
    const body = JSON.parse(network.mock.calls[0][1].body);
    expect(body).toEqual({ action: 'tune', lcn: 802 });
    expect(getLocalLastHybrid()?.source).toBe('dvb');
    expect(getLocalLastHybrid()?.lcn).toBe(802);
  });

  it('records IPTV only after explicit video playing event callback, not source hover', () => {
    expect(getLocalLastHybrid()).toBeNull();
    confirmedIPTVPlaying(59);
    expect(getLocalLastHybrid()?.source).toBe('iptv');
    expect(getLocalLastHybrid()?.lcn).toBe(59);
  });

  it('never contacts public IP or arbitrary website while resolving state', async () => {
    localStorage.setItem(setup, JSON.stringify({ ...cfg, endpoint: 'http://8.8.8.8:8927' }));
    const network = vi.fn();
    vi.stubGlobal('fetch', network);
    expect(await getAbsoluteLastHybrid()).toBeNull();
    expect(network).not.toHaveBeenCalled();
  });
});
