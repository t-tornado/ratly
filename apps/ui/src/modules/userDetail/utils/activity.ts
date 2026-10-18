import type { RefreshOption, ActivityRange } from "../types/activity";

const REFRESH_INTERVAL_MS: Record<RefreshOption, number | false> = {
  off: false,
  "30s": 30_000,
  "1m": 60_000,
  "5m": 300_000,
};

const TICK_INTERVAL_BY_RANGE: Record<ActivityRange, number> = {
  hour: 9,
  day: 3,
};

function formatBucketTimestamp(timestamp: string, _range: ActivityRange): string {
  return timestamp;
}

function formatTooltipTimestamp(timestamp: string): string {
  return timestamp;
}

export {
  REFRESH_INTERVAL_MS,
  TICK_INTERVAL_BY_RANGE,
  formatBucketTimestamp,
  formatTooltipTimestamp,
};
