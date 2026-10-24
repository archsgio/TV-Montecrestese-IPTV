import type { Channel, ChannelHealthStatus } from '../types';
import { channelLcn } from '../utils/channel-lcn';

export interface ChannelHealthIssue {
  lcn: number;
  name: string;
}
export interface ChannelHealthIssueGroups {
  suspect: ChannelHealthIssue[];
  unavailable: ChannelHealthIssue[];
  unknown: ChannelHealthIssue[];
}

/** Uses precisely the same allChannels list as the existing health summary.
 * A missing record is 'not verified'; the 'healthy' group is deliberately omitted.
 */
export function groupChannelHealthIssues(
  channels: readonly Channel[],
  statusOf: (channel: Channel) => ChannelHealthStatus | null | undefined,
): ChannelHealthIssueGroups {
  const issues: ChannelHealthIssueGroups = { suspect: [], unavailable: [], unknown: [] };
  channels.forEach((channel, index) => {
    const status = statusOf(channel);
    if (status === 'healthy') return;
    const item = { lcn: channelLcn(channel, index), name: channel.name };
    if (status === 'suspect') issues.suspect.push(item);
    else if (status === 'unavailable') issues.unavailable.push(item);
    else issues.unknown.push(item);
  });
  for (const entries of [issues.suspect, issues.unavailable, issues.unknown]) {
    entries.sort((a, b) => a.lcn - b.lcn || a.name.localeCompare(b.name));
  }
  return issues;
}
