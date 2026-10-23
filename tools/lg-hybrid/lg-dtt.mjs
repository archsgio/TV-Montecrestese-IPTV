#!/usr/bin/env node
// LG Montecrestese Hybrid: paired, LAN-only DVB tuner inventory and optional
// single-channel switch. Never proxies DVB, bypasses DRM, or changes firmware.
// Requires one TV-side consent prompt for the initial pairing.
import LGTV from 'lgtv2';

const APP_ID = 'com.archsgio.iptv';
const commands = ['--list', '--tune', '--return'];

function usage() {
  console.log(
    'Usage:\n' +
    '  node lg-dtt.mjs --host 192.168.1.50 --list              (read-only)\n' +
    '  node lg-dtt.mjs --host 192.168.1.50 --tune 802          (explicit switch)\n' +
    '  node lg-dtt.mjs --host 192.168.1.50 --return            (launch our IPTV app)\n' +
    '\nOnly RFC1918 private IPv4 LAN addresses are accepted.\n' +
    'The first connection requires approval on the TV; no root is required.\n'
  );
}

function privateIPv4(address) {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(address)) return false;
  const n = address.split('.').map(Number);
  if (n.some(v => !Number.isInteger(v) || v < 0 || v > 255)) return false;
  return n[0] === 10 || (n[0] === 172 && n[1] >= 16 && n[1] <= 31) ||
    (n[0] === 192 && n[1] === 168);
}

function parseArgs(args) {
  if (args.includes('--help') || args.includes('-h')) return { help: true };
  const hostIdx = args.indexOf('--host');
  if (hostIdx < 0 || !args[hostIdx + 1]) throw Error('Specify --host with the LAN IP of your LG TV');
  const host = args[hostIdx + 1];
  if (!privateIPv4(host)) throw Error('Refusing a non-local or invalid TV IP');
  const selected = commands.filter(c => args.includes(c));
  if (selected.length !== 1) throw Error('Choose exactly one of --list, --tune, --return');
  const command = selected[0];
  const lcnIdx = args.indexOf('--tune');
  let lcn = null;
  if (command === '--tune') {
    const value = args[lcnIdx + 1];
    if (!/^[1-9]\d{0,3}$/.test(value || '')) {
      throw Error('Provide a positive 1-to-4-digit LCN after --tune');
    }
    lcn = Number(value);
  }
  // Fail closed on mistyped flags rather than silently launching a TV command.
  const expected = ['--host', host, command, ...(command === '--tune' ? [String(lcn)] : [])];
  if (args.length !== expected.length ||
      args.some((arg, index) => arg !== expected[index])) {
    throw Error('Unexpected option or argument order: use exactly the syntax in --help');
  }
  return { host, command, lcn };
}

function extractChannels(res) {
  const list = res?.channelList || res?.channels;
  if (!Array.isArray(list)) throw Error('LG did not return a tuner channel list (possibly not tuned or permission denied)');
  return list.map(x => ({
    channelNumber: String(x.channelNumber ?? ''),
    channelId: String(x.channelId ?? ''),
    channelName: String(x.channelName ?? x.channelLabel ?? ''),
    source: String(x.sourceIndex ?? x.source ?? ''),
    skipped: Boolean(x.skipped || x.invisible || x.Invisible),
  })).filter(x => x.channelNumber);
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) { usage(); return; }

  // lgtv2 handles TV pairing prompt, private certificate and wss:3001/ws:3000
  // fallback. The client key lives ONLY on the user's PC, in its OS app-data
  // folder. Never save it in the GitHub repository.
  const tv = new LGTV({
    host: options.host, reconnect: false, verifyCert: 'tofu', timeout: 12000,
  });
  let timer;
  try {
    await new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(Error('LG connection/pairing timed out')), 60000);
      tv.once('connect', resolve);
      tv.once('error', reject);
      tv.on('prompt', () => console.log('Approve the LG Remote connection request on the TV screen.'));
    });

    if (options.command === '--return') {
      await tv.request('ssap://com.webos.applicationManager/launch', { id: APP_ID });
      console.log('Requested LG to bring IPTV Montecrestese to foreground.');
      return;
    }

    const channels = extractChannels(await tv.request('ssap://tv/getChannelList'));
    if (options.command === '--list') {
      console.log('Received ' + channels.length + ' tuned channels from the LG tuner:');
      for (const channel of channels) {
        console.log(channel.channelNumber.padStart(4, ' ') + '  ' + channel.channelName +
          (channel.skipped ? ' [skipped]' : ''));
      }
      console.log('Read-only check complete. No channel or app was changed.');
      return;
    }

    const matches = channels.filter(x => x.channelNumber === String(options.lcn) && !x.skipped);
    if (matches.length !== 1) {
      throw Error('Expected exactly one tuned, visible channel with LCN ' + options.lcn +
        ', found ' + matches.length + '. No switch performed.');
    }
    const channel = matches[0];
    const payload = channel.channelId ? { channelId: channel.channelId }
      : { channelNumber: channel.channelNumber };
    // Only --tune triggers this request; --list is strictly read-only.
    await tv.request('ssap://tv/openChannel', payload);
    console.log('Requested native LG DVB-T channel ' + channel.channelNumber +
      ' (' + channel.channelName + '). The IPTV UI may leave the foreground.');
  } finally {
    if (timer) clearTimeout(timer);
    await tv.disconnect();
  }
}

run().catch(err => {
  console.error('LG hybrid probe:', err?.message || String(err));
  process.exitCode = 1;
});
