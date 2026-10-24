import { test } from 'node:test';
import assert from 'node:assert/strict';
import { privateIPv4, allowedOrigin, normalizedChannels, selectTunerChannel, validateAction }
  from './bridge-core.mjs';

const official = new Map([
  [8, { url: 'https://www.tv8.it/streaming' }],
  [57, { url: 'https://www.raiplay.it/dirette/italiana' }],
  [99, { url: 'http://malicious.example/path' }],
]);

test('only RFC1918 LAN IPv4 addresses are eligible', () => {
  for (const address of ['192.168.1.10', '10.200.1.8', '172.16.0.1', '172.31.255.254'])
    assert.equal(privateIPv4(address), true, address);
  for (const address of [undefined, null, '', '127.0.0.1', '0.0.0.0', '8.8.8.8',
    '172.15.1.1', '172.32.0.1', '169.254.0.1', '192.169.1.1',
    '192.168.1.999', '10.0.0.256', '192.168.1.1:8927', 'my-tv.local',
    '::1', '192.168.1.1.evil.net', '192.168.1.1/24'])
    assert.equal(privateIPv4(address), false, String(address));
});

test('CORS allows only installed webOS app and opaque packaged origins', () => {
  for (const origin of [undefined, 'null', 'file://com.archsgio.iptv'])
    assert.equal(allowedOrigin(origin), true);
  for (const origin of ['https://example.org', 'http://192.168.1.100',
    'file://com.archsgio.iptv.evil', 'file://com.lennylxx.iptv', '*', 'nullhttps'])
    assert.equal(allowedOrigin(origin), false);
});

test('LG tuner channel normalization ignores unusable LCNs', () => {
  const result = normalizedChannels({ channelList: [
    { channelNumber: '13', channelName: 'Rete 7', channelId: 'digital_13' },
    { channelNumber: '802', channelLabel: 'Rai 3 TGR Piemonte', channelId: 'regional_802' },
    { channelNumber: '0', channelName: 'bad' },
    { channelNumber: 'not-a-number', channelName: 'bad' },
    { channelNumber: '-1', channelName: 'bad' },
    { channelNumber: '10000', channelName: 'bad' },
    { channelNumber: '14', skipped: true, channelName: 'Primantenna' },
  ] });
  assert.deepEqual(result.map(x => x.lcn), [13, 802, 14]);
  assert.equal(result[1].name, 'Rai 3 TGR Piemonte');
  assert.equal(result[2].skipped, true);
  assert.throws(() => normalizedChannels({}), /lista canali/);
  assert.throws(() => normalizedChannels({ channels: 'not an array' }), /lista canali/);
});

test('DVB channel ID takes precedence over channel number', () => {
  assert.deepEqual(selectTunerChannel([{ lcn: 802, channelId: 'DTT_802', skipped: false }], 802),
    { channelId: 'DTT_802' });
  assert.deepEqual(selectTunerChannel([{ lcn: 8, channelId: '', skipped: false }], 8),
    { channelNumber: '8' });
});

test('DVB selection fails closed on duplicates, missing or skipped channels', () => {
  const channels = [
    { lcn: 15, channelId: 'a', skipped: false },
    { lcn: 15, channelId: 'b', skipped: false },
    { lcn: 14, channelId: 'c', skipped: true },
  ];
  assert.throws(() => selectTunerChannel(channels, 15), /2 corrispondenze/);
  assert.throws(() => selectTunerChannel(channels, 14), /0 corrispondenze/);
  assert.throws(() => selectTunerChannel(channels, 802), /0 corrispondenze/);
  assert.throws(() => selectTunerChannel(channels, 0), /LCN/);
});

test('web action can open only approved HTTPS first-party destinations', () => {
  assert.deepEqual(validateAction({ action: 'web', lcn: 57 }, official), {
    action: 'web', lcn: 57, url: 'https://www.raiplay.it/dirette/italiana',
  });
  assert.throws(() => validateAction({ action: 'web', lcn: 99 }, official), /ufficiale/);
  assert.throws(() => validateAction({ action: 'web', lcn: 41 }, official), /ufficiale/);
});

test('explicit valid tuner action needs integer LCN and exact action name', () => {
  assert.deepEqual(validateAction({ action: 'tune', lcn: 802 }, official),
    { action: 'tune', lcn: 802 });
  for (const bad of [null, {}, { action: 'launch', lcn: 8 },
    { action: 'tune', lcn: '8' }, { action: 'tune', lcn: 1.2 },
    { action: 'tune', lcn: 0 }, { action: 'tune', lcn: 10000 },
    { action: 'web', lcn: 8000 }, { action: 'tune' }])
    assert.throws(() => validateAction(bad, official));
});
