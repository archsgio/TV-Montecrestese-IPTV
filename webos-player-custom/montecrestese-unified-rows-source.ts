import type { Channel } from '../types';
import { HYBRID_CATALOG, isIptvCandidate, type HybridEntry } from './hybrid-catalog';

// Presentation-only directory: never adds synthetic channels or URLs to PlaylistService.
export interface UnifiedLcnRow {
  entry: HybridEntry;
  channel: Channel | null;
  channelIndex: number;
}

export function buildUnifiedLcnRows(channels: readonly Channel[]): UnifiedLcnRow[] {
  const byLcn = new Map<number, number>();
  for (let i = 0; i < channels.length; i++) {
    const lcn = channels[i].channelNumber;
    if (typeof lcn === 'number' && Number.isInteger(lcn) && lcn > 0
        && !byLcn.has(lcn)) byLcn.set(lcn, i);
  }
  return HYBRID_CATALOG.map(entry => {
    // Previously rejected/missing official sources are not silently promoted
    // even if a different playlist adds an unverified URL with the same LCN.
    const index = isIptvCandidate(entry) ? (byLcn.get(entry.lcn) ?? -1) : -1;
    return {
      entry,
      channelIndex: index,
      channel: index >= 0 ? channels[index] : null,
    };
  });
}
