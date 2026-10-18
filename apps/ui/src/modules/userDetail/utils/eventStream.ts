import { RATE_UPDATE_EVENT, RATE_LIMIT_EXCEEDED_EVENT } from "@ratly/core";
import type { UserRow } from "@ratly/core";
import type { StreamEvent } from "../../../lib/types";

function formatEventTimestamp(): string {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

function buildEventDescription(row: UserRow): string {
  return `remaining ${row.remaining} / ${row.allowedTotal} · resets ${row.resetAt ? new Date(row.resetAt).toLocaleTimeString("en-GB", { hour12: false }) : "--"}`;
}

function mapRateUpdateToStreamEvent(row: UserRow): StreamEvent {
  return {
    id: crypto.randomUUID(),
    type: RATE_UPDATE_EVENT,
    timestamp: formatEventTimestamp(),
    description: buildEventDescription(row),
    severity: "info",
  };
}

function mapLimitExceededToStreamEvent(row: UserRow): StreamEvent {
  return {
    id: crypto.randomUUID(),
    type: RATE_LIMIT_EXCEEDED_EVENT,
    timestamp: formatEventTimestamp(),
    description: `blocked · retry at ${row.resetAt ? new Date(row.resetAt).toLocaleTimeString("en-GB", { hour12: false }) : "--"}`,
    severity: "error",
  };
}

export { mapRateUpdateToStreamEvent, mapLimitExceededToStreamEvent };
