#!/usr/bin/env node
// LG Montecrestese Hybrid: paired, LAN-only DVB tuner inventory and optional
// single-channel switch. Never proxies DVB, bypasses DRM, or changes firmware.
// Requires one TV-side consent prompt for the initial pairing.
import LGTV from 'lgtv2';
import { readFileSync } from 'node:fs';
import { privateIPv4, normalizedChannels, selectTunerChannel } from './bridge-core.mjs';

const APP_ID = 'com.archsgio.iptv';
const commands = ['--list', '--tune', '--return', '--web'];

function usage() {
  console.log(
    'Usage:\n' +
    '  node lg-dtt.mjs --host 192.168.1.50 --list              (read-only)\n' +
    '  node lg-dtt.mjs --host 192.168.1.50 --tune 802          (explicit switch)\n' +
    '  node lg-dtt.mjs --host 192.168.1.50 --return            (launch our IPTV app)\n' +
    '  node lg-dtt.mjs --host 192.168.1.50 --web 57            (open verified official RaiPlay)\n' +
    '\nOnly RFC1918 private IPv4 LAN addresses are accepted.\n' +
    'The first connection requires approval on the TV; no root is required.\n'
  );
}

function parseArgs(args) {
  if (args.includes('--help') || args.includes('-h')) return { help: true };
  const hostIdx = args.indexOf('--host');
  if (hostIdx < 0 || !args[hostIdx + 1]) throw Error('Specify --host with the LAN IP of your LG TV');
  const host = args[hostIdx + 1];
  if (!privateIPv4(host)) throw Error('Refusing a non-local or invalid TV IP');
  const selected = commands.filter(c => args.includes(c));
  if (selected.length !== 1) throw Error('Choose exactly one of --list, --tune, --return, --web');
  const command = selected[0];
  const lcnIdx = args.indexOf(command);
  let lcn = null;
  if (command === '--tune' || command === '--web') {
    const value = args[lcnIdx + 1];
    if (!/^[1-9]\d{0,3}$/.test(value || '')) {
      throw Error('Provide a positive 1-to-4-digit LCN after ' + command);
    }
    lcn = Number(value);
  }
  // Fail closed on mistyped flags rather than silently launching a TV command.
  const expected = ['--host', host, command,
    ...(['--tune', '--web'].includes(command) ? [String(lcn)] : [])];
  if (args.length !== expected.length ||
      args.some((arg, index) => arg !== expected[index])) {
    throw Error('Unexpected option or argument order: use exactly the syntax in --help');
  }
  return { host, command, lcn };
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

    if (options.command === '--web') {
      const registry = JSON.parse(readFileSync(new URL('official-fallbacks.json', import.meta.url), 'utf8'));
      const entries = registry.entries.filter(x => x.lcn === options.lcn);
      if (entries.length !== 1 || !entries[0].url.startsWith('https://')) {
        throw Error('No vetted official HTTPS destination for LCN ' + options.lcn);
      }
      const entry = entries[0];
      console.log('Opening official ' + entry.kind + ' page for ' + entry.name + ': ' + entry.url);
      console.log(entry.note);
      await tv.request('ssap://system.launcher/open', { target: entry.url });
      console.log('Browser-open requested (actual browser video playback not guaranteed).');
      return;
    }

    const channels = normalizedChannels(await tv.request('ssap://tv/getChannelList'));
    if (options.command === '--list') {
      console.log('Received ' + channels.length + ' tuned channels from the LG tuner:');
      for (const channel of channels) {
        console.log(String(channel.lcn).padStart(4, ' ') + '  ' + channel.name +
          (channel.skipped ? ' [skipped]' : ''));
      }
      console.log('Read-only check complete. No channel or app was changed.');
      return;
    }

    // Same fail-closed selection rules as the app's bridge.
    const payload = selectTunerChannel(channels, options.lcn);
    const channel = channels.find(x => x.lcn === options.lcn && !x.skipped);
    // Only --tune triggers this request; --list is strictly read-only.
    await tv.request('ssap://tv/openChannel', payload);
    console.log('Requested native LG DVB-T channel ' + channel.lcn +
      ' (' + channel.name + '). The IPTV UI may leave the foreground.');
  } finally {
    if (timer) clearTimeout(timer);
    await tv.disconnect();
  }
}

run().catch(err => {
  console.error('LG hybrid probe:', err?.message || String(err));
  process.exitCode = 1;
});
