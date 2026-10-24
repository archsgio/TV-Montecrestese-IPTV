/** Single validated local bridge configuration shared by startup and guide. */
export const HYBRID_BRIDGE_KEY = 'montecrestese_hybrid_connection_v1';
export interface BridgeConfig { endpoint: string; token: string }

export function validateBridgeConfig(config: BridgeConfig): boolean {
  if (!config || typeof config.endpoint !== 'string' ||
      typeof config.token !== 'string' || !/^[0-9a-f]{64}$/i.test(config.token)) return false;
  const m = /^http:\/\/(\d+)\.(\d+)\.(\d+)\.(\d+):(\d{2,5})$/.exec(config.endpoint);
  if (!m) return false;
  const octets = m.slice(1, 5).map(Number), port = Number(m[5]);
  if (octets.some(n => n > 255 || n < 0) || port < 1024 || port > 65535) return false;
  return octets[0] === 10 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168);
}

export function savedBridgeConfig(): BridgeConfig | null {
  try {
    const raw = localStorage.getItem(HYBRID_BRIDGE_KEY);
    if (!raw) return null;
    const cfg = JSON.parse(raw) as BridgeConfig;
    return validateBridgeConfig(cfg) ? cfg : null;
  } catch (_e) { return null; }
}
