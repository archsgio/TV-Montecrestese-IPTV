// Persistent shared last-tuned source for the optional LAN SSAP companion.
// The record is an intent/confirmed LG command, not proof the web video played.
export const LAST_SOURCES = Object.freeze(['iptv', 'dvb', 'web']);

export function validatedLastSource(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const { source, lcn, at } = value;
  if (!LAST_SOURCES.includes(source) || !Number.isSafeInteger(lcn) ||
      lcn < 1 || lcn > 9999 || !Number.isSafeInteger(at) || at < 0 ||
      at > Date.now() + 10 * 60_000) return null;
  return { source, lcn, at };
}

export function nativeTvForeground(foreground) {
  // LG TVs may report webOS Live TV under these known system app identifiers.
  const id = String(foreground?.appId || '');
  return id === 'com.webos.app.livetv' || id === 'com.webos.app.liveTV' ||
    id === 'com.webos.app.tv';
}

export function currentNativeChannel(channel) {
  const n = Number(channel?.channelNumber);
  if (!Number.isSafeInteger(n) || n < 1 || n > 9999) return null;
  return n;
}

/** Reject a late-arriving history write from an older stream-playing event.
 * DVB/web changes must not be overwritten by slow asynchronous IPTV POSTs.
 */
export function chooseLatestSourceState(previous, candidate) {
  const next = validatedLastSource(candidate);
  if (!next) throw Error('Invalid candidate last source');
  const old = validatedLastSource(previous);
  return old && old.at > next.at ? old : next;
}
