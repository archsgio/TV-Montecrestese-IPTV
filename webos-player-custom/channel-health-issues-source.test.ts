import { describe, expect, it } from 'vitest';
import type { Channel, ChannelHealthStatus } from '../types';
import { groupChannelHealthIssues } from './channel-health-issues';

const ch = (channelNumber: number, name: string) =>
  ({ channelNumber, name } as Channel);

describe('Montecrestese channel-health detailed problem lists', () => {
  it('lists only suspect, unavailable and unchecked channels with real LCN', () => {
    const channels = [ch(83, 'Piemonte+'), ch(41, 'K2'), ch(13, 'Rete 7'),
      ch(802, 'Rai 3 Piemonte'), ch(14, 'Primantenna')];
    const byLcn = new Map<number, ChannelHealthStatus>([
      [83, 'suspect'], [41, 'unavailable'], [13, 'healthy'], [14, 'suspect'],
    ]);
    const results = groupChannelHealthIssues(channels, c => byLcn.get(c.channelNumber));
    expect(results.suspect).toEqual([
      { lcn: 14, name: 'Primantenna' }, { lcn: 83, name: 'Piemonte+' },
    ]);
    expect(results.unavailable).toEqual([{ lcn: 41, name: 'K2' }]);
    expect(results.unknown).toEqual([{ lcn: 802, name: 'Rai 3 Piemonte' }]);
    expect(JSON.stringify(results)).not.toContain('Rete 7');
  });

  it('immediately moves a channel to healthy when rechecked', () => {
    const channel = ch(75, 'Top Calcio');
    expect(groupChannelHealthIssues([channel], () => null).unknown).toHaveLength(1);
    expect(groupChannelHealthIssues([channel], () => 'suspect').suspect).toHaveLength(1);
    expect(groupChannelHealthIssues([channel], () => 'healthy')).toEqual({
      suspect: [], unavailable: [], unknown: [],
    });
  });

  it('falls back to positional numbering only for unnumbered stream entries', () => {
    const issues = groupChannelHealthIssues([
      ({ channelNumber: 0, name: 'Unnamed stream' } as Channel),
      ch(802, 'Regional'),
    ], () => undefined);
    expect(issues.unknown.map(x => x.lcn)).toEqual([1, 802]);
  });
});
