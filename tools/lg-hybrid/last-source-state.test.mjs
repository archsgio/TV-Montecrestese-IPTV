import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatedLastSource, nativeTvForeground, currentNativeChannel, chooseLatestSourceState } from './last-source-state.mjs';

test('shared last channel supports IPTV / DVB / official web with timestamps', () => {
  const at = Date.now() - 1000;
  for (const source of ['iptv', 'dvb', 'web']) {
    assert.deepEqual(validatedLastSource({ source, lcn: 802, at }), { source, lcn: 802, at });
  }
});
test('rejects corrupt and future-dated resume data', () => {
  for (const value of [null, '', [], {}, { source: 'root', lcn: 802, at: Date.now() },
    { source: 'iptv', lcn: '802', at: Date.now() },
    { source: 'web', lcn: 0, at: Date.now() },
    { source: 'dvb', lcn: 123, at: Date.now() + 3_600_000 }])
    assert.equal(validatedLastSource(value), null);
});
test('polling recognizes native Live TV and never overwrites IPTV while foreground', () => {
  assert.equal(nativeTvForeground({ appId: 'com.webos.app.livetv' }), true);
  assert.equal(nativeTvForeground({ appId: 'com.archsgio.iptv' }), false);
  assert.equal(nativeTvForeground({ appId: 'com.webos.app.browser' }), false);
  assert.equal(nativeTvForeground({}), false);
  assert.equal(currentNativeChannel({ channelNumber: '802' }), 802);
  assert.equal(currentNativeChannel({ channelNumber: '0' }), null);
  assert.equal(currentNativeChannel({ channelNumber: 'abc' }), null);
});

test('delayed IPTV report cannot overtake a later native DVB selection', () => {
  const t = Date.now();
  const dvb = { source: 'dvb', lcn: 802, at: t - 100 };
  const earlierIptv = { source: 'iptv', lcn: 6, at: t - 1000 };
  assert.deepEqual(chooseLatestSourceState(dvb, earlierIptv), dvb);
  const latestIptv = { source: 'iptv', lcn: 19, at: t };
  assert.deepEqual(chooseLatestSourceState(dvb, latestIptv), latestIptv);
  assert.deepEqual(chooseLatestSourceState(null, earlierIptv), earlierIptv);
  assert.throws(() => chooseLatestSourceState(dvb, { source: 'unknown', lcn: 19, at: t }));
});
