// Pure LG hybrid request validation and channel selection.
// Kept independent of hardware so CI can test without pairing to a real TV.
export function privateIPv4(address) {
  if (typeof address !== 'string' || !/^\d{1,3}(\.\d{1,3}){3}$/.test(address)) return false;
  const octets = address.split('.').map(Number);
  if (octets.some(v => !Number.isInteger(v) || v < 0 || v > 255)) return false;
  return octets[0] === 10 || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)
    || (octets[0] === 192 && octets[1] === 168);
}

export function allowedOrigin(origin) {
  return origin === undefined || origin === 'null' || origin === 'file://com.archsgio.iptv';
}

export function normalizedChannels(response) {
  const list = response?.channelList ?? response?.channels;
  if (!Array.isArray(list)) throw new Error('La LG non ha restituito la lista canali');
  return list.map(channel => ({
    lcn: Number(channel.channelNumber),
    name: String(channel.channelName ?? channel.channelLabel ?? ''),
    channelId: String(channel.channelId ?? ''),
    skipped: Boolean(channel.skipped || channel.invisible || channel.Invisible),
  })).filter(channel => Number.isSafeInteger(channel.lcn) &&
    channel.lcn >= 1 && channel.lcn <= 9999);
}

export function selectTunerChannel(channels, lcn) {
  if (!Number.isSafeInteger(lcn) || lcn < 1 || lcn > 9999) throw Error('LCN fuori intervallo');
  const matches = channels.filter(ch => ch.lcn === lcn && !ch.skipped);
  if (matches.length !== 1) throw Error('Canale DVB ' + lcn +
    ' non identificato univocamente nel tuner LG (' + matches.length + ' corrispondenze)');
  const channel = matches[0];
  return channel.channelId ? { channelId: channel.channelId }
    : { channelNumber: String(channel.lcn) };
}

export function validateAction(body, official) {
  if (!body || !Number.isSafeInteger(body.lcn) || body.lcn < 1 || body.lcn > 9999 ||
      !['tune', 'web'].includes(body.action)) throw Error('Comando non valido');
  if (body.action === 'web') {
    const selection = official.get(body.lcn);
    if (!selection || !/^https:\/\//.test(selection.url)) throw Error('Nessun sito ufficiale approvato per questa LCN');
    return { action: 'web', lcn: body.lcn, url: selection.url };
  }
  return { action: 'tune', lcn: body.lcn };
}

