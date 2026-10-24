import { savedBridgeConfig } from './hybrid-bridge-config';
/** Last verified selection shared between IPTV and the optional LG LAN bridge.
 * Timestamp is monotonic by user action, not by catalog row/highlight.
 */
const STATE_KEY = 'montecrestese_last_hybrid_channel_v1';

export type HybridSource = 'iptv' | 'dvb' | 'web';
export interface LastHybridChannel { source: HybridSource; lcn: number; at: number }
export type RestoreOutcome = 'none' | 'iptv' | 'external-restored' | 'external-unavailable';

export function validateLastHybrid(input: unknown): LastHybridChannel | null {
  if (!input || typeof input !== 'object') return null;
  const obj = input as Partial<LastHybridChannel>;
  if (obj.source !== 'iptv' && obj.source !== 'dvb' && obj.source !== 'web') return null;
  if (!Number.isSafeInteger(obj.lcn) || (obj.lcn ?? 0) < 1 || (obj.lcn ?? 0) > 9999 ||
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

export function rememberHybrid(source: HybridSource, lcn: number): void {
  if (!Number.isSafeInteger(lcn) || lcn < 1 || lcn > 9999) return;
  try { localStorage.setItem(STATE_KEY, JSON.stringify({ source, lcn, at: Date.now() })); }
  catch (_e) { /* Storage exhaustion must not stop playback. */ }
}

async function briefRequest(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1250);
  try { return await fetch(url, { ...init, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

/** Records last IPTV only after the HTML5 media element fires playing. */
export function confirmedIPTVPlaying(lcn: number): void {
  rememberHybrid('iptv', lcn);
  const cfg = savedBridgeConfig();
  if (!cfg) return;
  // Noncritical best effort. Do not force storage/network I/O on the player.
  void fetch(cfg.endpoint + '/v1/remember', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Montecrestese-Key': cfg.token },
    body: JSON.stringify({ source: 'iptv', lcn }),
  }).catch(() => {});
}

/** Read-only reconciliation, never changes channel. */
export async function getAbsoluteLastHybrid(): Promise<LastHybridChannel | null> {
  const local = getLocalLastHybrid();
  const cfg = savedBridgeConfig();
  if (!cfg) return local;
  try {
    const res = await briefRequest(cfg.endpoint + '/v1/last', {
      headers: { 'X-Montecrestese-Key': cfg.token },
    });
    if (!res.ok) return local;
    const body = await res.json() as { last?: unknown };
    return chooseLastHybrid(local, validateLastHybrid(body.last));
  } catch (_e) { return local; }
}

/** Called only when Auto Play enabled. Stops the old IPTV fallback if the most
 * recent watched source is external; never substitutes an unrelated IPTV stream.
 */
export async function restoreExternalLastHybrid(
  last: LastHybridChannel,
): Promise<RestoreOutcome> {
  if (last.source === 'iptv') return 'iptv';
  const cfg = savedBridgeConfig();
  if (!cfg) return 'external-unavailable';
  try {
    const res = await briefRequest(cfg.endpoint + '/v1/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Montecrestese-Key': cfg.token },
      body: JSON.stringify({ action: last.source === 'dvb' ? 'tune' : 'web',
        lcn: last.lcn }),
    });
    if (!res.ok) return 'external-unavailable';
    rememberHybrid(last.source, last.lcn);
    return 'external-restored';
  } catch (_e) { return 'external-unavailable'; }
}
