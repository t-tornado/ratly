import type { RefreshOption } from "../../../components/ActivityChart";
import type { ActivityRange } from "../types/activity";

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

function formatBucketTimestamp(timestamp: string, range: ActivityRange): string {
  const date = new Date(timestamp);
  if (range === "hour") {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatTooltipTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export {
  REFRESH_INTERVAL_MS,
  TICK_INTERVAL_BY_RANGE,
  formatBucketTimestamp,
  formatTooltipTimestamp,
};
