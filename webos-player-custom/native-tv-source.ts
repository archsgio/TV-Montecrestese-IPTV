/** LG webOS TV-only source launcher.
 *
 * Uses only the system Application Manager from the installed app.
 * No Mac/PC, local HTTP bridge, Node, pairing, SSAP socket or root.
 *
 * CAUTION: Launching Live TV shows the tuner channel last tuned by LG;
 * this public API DOES NOT select a requested LCN nor expose channel changes.
 * A successful browser launch DOES NOT prove the video on the website played.
 */
import { lunaRequest, type LunaRequestHandle } from './luna';
import { HYBRID_CATALOG } from '../components/hybrid-catalog';

export type NativeSource = 'dvb' | 'web';
export type NativeLaunchResult = { ok: boolean; message: string };

const APP_MANAGER = 'luna://com.webos.applicationManager';
const LIVE_TV_APP = 'com.webos.app.livetv';
const BROWSER_APP = 'com.webos.app.browser';

function launchApp(id: string, params?: { target: string }): Promise<NativeLaunchResult> {
  return new Promise(resolve => {
    let settled = false;
    let request: LunaRequestHandle | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const finish = (ok: boolean, message: string): void => {
      if (settled) return;
      settled = true;
      if (timer !== null) clearTimeout(timer);
      if (!ok) request?.cancel();
      resolve({ ok, message });
    };
    // A hung native API must never leave the D-pad locked.
    timer = setTimeout(() => finish(false, 'Il televisore non ha risposto.'), 5000);
    request = lunaRequest(APP_MANAGER, {
      method: 'launch',
      parameters: { id, ...(params ? { params } : {}) },
      onSuccess: response => {
        if (response.returnValue === false) {
          finish(false, response.errorText || 'Operazione rifiutata dalla TV.');
        } else finish(true, 'Applicazione nativa richiesta.');
      },
      onFailure: response => finish(false,
        response.errorText || 'La TV non consente di aprire questa sorgente.'),
    });
  });
}

/** Open the LG native terrestrial receiver with its last tuned channel.
 * Not an exact tune: for the chosen LCN use the numeric keys in LG Live TV.
 */
export function openNativeLiveTv(): Promise<NativeLaunchResult> {
  return launchApp(LIVE_TV_APP);
}

/** The URL is never user-provided; caller must pass the HTTPS URL
 * from the immutable official-fallbacks-based channel catalog.
 */
export function openOfficialBrowser(url: string): Promise<NativeLaunchResult> {
  if (!/^https:\/\//.test(url) || /[\s\u0000-\u001f]/.test(url) ||
      !HYBRID_CATALOG.some(channel => channel.web === url && !!channel.web)) {
    return Promise.resolve({ ok: false, message: 'Indirizzo ufficiale non valido.' });
  }
  return launchApp(BROWSER_APP, { target: url });
}
