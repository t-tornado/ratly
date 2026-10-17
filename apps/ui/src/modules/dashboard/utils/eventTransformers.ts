import { RATE_UPDATE_EVENT, RATE_LIMIT_EXCEEDED_EVENT } from "@ratly/core";
import type { UserRow } from "@ratly/core";
import type { LiveEvent } from "../../../components/LiveEventsFeed";
import { formatTime, formatTimeWithSeconds } from "../../../lib/utils";

function toRateUpdateEvent(row: UserRow): LiveEvent {
  return {
    time: formatTime(row.at),
    type: RATE_UPDATE_EVENT,
    description: `${row.userId} \u00b7 ${row.remaining} left`,
    severity: "info",
  };
}

function toLimitExceededEvent(row: UserRow): LiveEvent {
  const resetTime = row.resetAt ? formatTimeWithSeconds(row.resetAt) : "unknown";
  return {
    time: formatTime(row.at),
    type: RATE_LIMIT_EXCEEDED_EVENT,
    description: `${row.userId} \u00b7 retry ${resetTime}`,
    severity: "error",
  };
}

export { toRateUpdateEvent, toLimitExceededEvent };
