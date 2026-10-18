import type { UserRow } from "@ratly/core";
import type { StatItem } from "../../../components/StatsRow";

const LOW_REMAINING_THRESHOLD = 10;

function getRemainingAccent(remaining: number): StatItem["accent"] {
  if (remaining === 0) return "error";
  if (remaining < LOW_REMAINING_THRESHOLD) return "warning";
  return undefined;
}

function formatCountdown(resetAt: number): string {
  const remainingMs = resetAt - Date.now();
  if (remainingMs <= 0) return "0s";

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${seconds}s`;
}

function formatTimestamp(epochMs: number): string {
  const date = new Date(epochMs);
  return date.toLocaleTimeString("en-GB", { hour12: false });
}

function buildLiveStatItems(row: UserRow): StatItem[] {
  const remainingItem: StatItem = {
    label: "Remaining",
    value: String(row.remaining),
    sub: row.bonus > 0 ? (
      `of ${row.allowedTotal} (admin override)`
    ) : (
      `of ${row.allowedTotal}`
    ),
    accent: getRemainingAccent(row.remaining),
  };

  const resetsInItem: StatItem = {
    label: "Resets in",
    value: row.resetAt ? formatCountdown(row.resetAt) : "--",
  };

  const lastResetTimestamp = row.resetAt;
  const lastResetItem: StatItem = {
    label: "Last reset",
    value: lastResetTimestamp ? formatTimestamp(lastResetTimestamp) : "--",
    sub: lastResetTimestamp ? "today" : undefined,
  };

  const rejectedCount = row.rejectedToday ?? 0;
  const rejectedTodayItem: StatItem = {
    label: "Rejected today",
    value: String(rejectedCount),
    accent: rejectedCount === 0 ? "success" : rejectedCount < 10 ? "warning" : "error",
  };

  return [remainingItem, resetsInItem, lastResetItem, rejectedTodayItem];
}

export { formatCountdown, buildLiveStatItems };
