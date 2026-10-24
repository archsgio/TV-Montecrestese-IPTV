/** TV-only last-source selection with no Mac, PC, HTTP bridge or socket.
 * A successful native TV launch is NOT proof of a particular DVB channel:
 * LG retains its internally tuned channel. Web launch != video playback.
 */
import { HYBRID_CATALOG } from '../components/hybrid-catalog';
import { openNativeLiveTv, openOfficialBrowser } from './native-tv-source';

const STATE_KEY = 'montecrestese_last_hybrid_channel_v1';

export type HybridSource = 'iptv' | 'dvb' | 'web';
export interface LastHybridChannel { source: HybridSource; lcn: number; at: number }
export type RestoreOutcome = 'none' | 'iptv' | 'external-restored' | 'external-unavailable';

export function validateLastHybrid(input: unknown): LastHybridChannel | null {
  if (!input || typeof input !== 'object') return null;
  const obj = input as Partial<LastHybridChannel>;
  if (obj.source !== 'iptv' && obj.source !== 'dvb' && obj.source !== 'web') return null;
  // DVB lcn=0 explicitly means 'use LG's native last tuned channel'.
  if (!Number.isSafeInteger(obj.lcn) ||
      ((obj.lcn ?? 0) < 1 && !(obj.source === 'dvb' && obj.lcn === 0)) ||
      (obj.lcn ?? 0) > 9999 ||
      !Number.isSafeInteger(obj['at']) || (obj['at'] ?? 0) < 0 ||
      (obj['at'] ?? 0) > Date.now() + 600000) return null;
  return obj as LastHybridChannel;
}

export function chooseLastHybrid(
  local: LastHybridChannel | null, remote: LastHybridChannel | null,
): LastHybridChannel | null {
  return !local ? remote : !remote ? local : remote['at'] > local['at'] ? remote : local;
}

export function getLocalLastHybrid(): LastHybridChannel | null {
  try {
    const s = localStorage.getItem(STATE_KEY);
    return s ? validateLastHybrid(JSON.parse(s)) : null;
  } catch (_e) { return null; }
}

/** Records a confirmed IPTV media-playing callback or an accepted app launch. */
export function rememberHybrid(source: HybridSource, lcn: number): void {
  if (!Number.isSafeInteger(lcn) || (lcn < 1 && !(source === 'dvb' && lcn === 0)) ||
      lcn > 9999) return;
  try { localStorage.setItem(STATE_KEY, JSON.stringify({ source, lcn, at: Date.now() })); }
  catch (_e) { /* Storage exhaustion must not prevent TV playback. */ }
}

export function confirmedIPTVPlaying(lcn: number): void {
  rememberHybrid('iptv', lcn);
}

/** Local-only lookup: no network requests and no startup delay. */
export async function getAbsoluteLastHybrid(): Promise<LastHybridChannel | null> {
  return getLocalLastHybrid();
}

/** Restore last launched source, using solely this LG TV's Application Manager.
 * On DVB this opens the TV's own last tuned channel; it cannot programmatically
 * select the remembered LCN. An unsupported native launch leaves guide available.
 */
export async function restoreExternalLastHybrid(
  last: LastHybridChannel,
): Promise<RestoreOutcome> {
  if (last.source === 'iptv') return 'iptv';
  let result;
  if (last.source === 'dvb') {
    result = await openNativeLiveTv();
  } else {
    const channel = HYBRID_CATALOG.find(row => row.lcn === last.lcn);
    if (!channel || !channel.web) return 'external-unavailable';
    result = await openOfficialBrowser(channel.web);
  }
  return result.ok ? 'external-restored' : 'external-unavailable';
}
