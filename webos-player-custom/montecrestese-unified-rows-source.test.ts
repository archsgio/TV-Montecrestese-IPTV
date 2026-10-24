import { describe, expect, it } from 'vitest';
import type { Channel } from '../types';
import { buildUnifiedLcnRows } from './montecrestese-unified-rows';

const channel = (lcn: number, url: string) =>
  ({ channelNumber: lcn, url, name: 'IPTV ' + lcn } as Channel);

describe('Montecrestese unified 85-LCN presentation model', () => {
  it('renders every catalog number, including absent 8 and 12, without fake IPTV channels', () => {
    const sources = [channel(13, 'https://tv.example/rete7.m3u8')];
    const rows = buildUnifiedLcnRows(sources);
    expect(rows).toHaveLength(85);
    expect(new Set(rows.map(r => r.entry.lcn)).size).toBe(85);
    expect(rows.every((r, i) => i === 0 || rows[i - 1].entry.lcn < r.entry.lcn)).toBe(true);
    expect(rows.find(r => r.entry.lcn === 8)).toMatchObject({ channelIndex: -1, channel: null });
    expect(rows.find(r => r.entry.lcn === 12)).toMatchObject({ channelIndex: -1, channel: null });
    expect(rows.find(r => r.entry.lcn === 13)?.channelIndex).toBe(0);
    expect(sources).toHaveLength(1);
  });

  it('keeps separate 13 and 83 LCN for a shared stream and never reintroduces rejected 802', () => {
    const url = 'https://tv.example/rete7.m3u8';
    const rows = buildUnifiedLcnRows([
      channel(13, url), channel(83, url), channel(802, 'https://example.org/rejected.m3u8'),
    ]);
    expect(rows.find(r => r.entry.lcn === 13)?.channelIndex).toBe(0);
    expect(rows.find(r => r.entry.lcn === 83)?.channelIndex).toBe(1);
    expect(rows.find(r => r.entry.lcn === 802)?.channelIndex).toBe(-1);
  });

  it('does not guess catalog identities for channels lacking an explicit broadcaster LCN', () => {
    const rows = buildUnifiedLcnRows([{ name: 'Unnumbered' } as Channel]);
    expect(rows.filter(r => r.channel !== null)).toHaveLength(0);
    expect(rows.find(r => r.entry.lcn === 1)?.channel).toBeNull();
  });

  it('does not promote TV8 and Videogruppo from unverified external playlist URLs', () => {
    const rows = buildUnifiedLcnRows([
      channel(8, 'https://example.org/unverified-tv8.m3u8'),
      channel(12, 'https://example.org/unverified-videogruppo.m3u8'),
    ]);
    expect(rows.find(r => r.entry.lcn === 8)?.channel).toBeNull();
    expect(rows.find(r => r.entry.lcn === 12)?.channel).toBeNull();
  });
});
