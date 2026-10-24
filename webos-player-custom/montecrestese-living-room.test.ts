// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import type { Channel } from '../types';
import { StorageService } from './storage-service';
import { findChannelIndexByLcn } from '../utils/channel-lcn';

describe('Montecrestese TV-like startup and numeric LCN', () => {
  beforeEach(() => { localStorage.clear(); });

  it('automatically resumes television on fresh installations without extra clicks', () => {
    expect(localStorage.getItem('iptv_auto_play')).toBeNull();
    expect(StorageService.getAutoPlay()).toBe(true);
  });

  it('keeps explicit OFF across subsequent launches and allows turning it back on', () => {
    StorageService.setAutoPlay(false);
    expect(StorageService.getAutoPlay()).toBe(false);
    expect(localStorage.getItem('iptv_auto_play')).toBe('false');
    StorageService.setAutoPlay(true);
    expect(StorageService.getAutoPlay()).toBe(true);
  });

  it('retains the last channel index and stable key for the next startup', () => {
    StorageService.setLastChannel(2);
    StorageService.setLastChannelKey('playlist-stable|last-seen-stream');
    expect(StorageService.getLastChannel()).toBe(2);
    expect(StorageService.getLastChannelKey()).toBe('playlist-stable|last-seen-stream');
  });

  it('maps broadcaster LCN to playlist index, even if not consecutive', () => {
    const channels = [6, 13, 59, 83, 802].map(channelNumber => ({ channelNumber } as Channel));
    expect(findChannelIndexByLcn(channels, 6)).toBe(0);
    expect(findChannelIndexByLcn(channels, 83)).toBe(3);
    expect(findChannelIndexByLcn(channels, 802)).toBe(4);
    expect(findChannelIndexByLcn(channels, 75)).toBe(-1);
  });
});
