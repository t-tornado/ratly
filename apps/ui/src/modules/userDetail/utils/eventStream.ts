import { RATE_UPDATE_EVENT, RATE_LIMIT_EXCEEDED_EVENT } from "@ratly/core";
import type { UserRow } from "@ratly/core";
import type { StreamEvent } from "../../../lib/types";

/** How often buffered socket events flush into the Zustand store. */
const EVENT_BUFFER_FLUSH_MS = 250;

/** How long after the last Zustand write before persisting to localStorage. */
const STORAGE_DEBOUNCE_MS = 1000;

interface DebouncedStorage {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
}

/**
 * localStorage wrapper that debounces writes.
 *
 * Reads are synchronous pass-through. Writes are delayed — only the
 * last `setItem` within the debounce window hits localStorage, cutting
 * `JSON.stringify` + I/O from N/sec to ~1/sec under pressure.
 *
 * @see useEventStreamStore — uses this as its persist storage
 */
function createDebouncedStorage(delayMs: number): DebouncedStorage {
  let pendingTimeoutId: ReturnType<typeof setTimeout> | null = null;

  return {
    getItem: (name) => localStorage.getItem(name),
    setItem: (name, value) => {
      if (pendingTimeoutId !== null) clearTimeout(pendingTimeoutId);
      pendingTimeoutId = setTimeout(() => {
        localStorage.setItem(name, value);
        pendingTimeoutId = null;
      }, delayMs);
    },
    removeItem: (name) => {
      if (pendingTimeoutId !== null) clearTimeout(pendingTimeoutId);
      localStorage.removeItem(name);
    },
  };
}

/**
 * Mappers that convert raw {@link UserRow} socket payloads into
 * display-ready {@link StreamEvent} objects for the event stream UI.
 *
 * Each mapper stamps a client-side timestamp and UUID — the server
 * doesn't provide these since events are ephemeral broadcasts.
 *
 * @see useUserDetailEvents — calls these on each socket event
 * @see useEventStreamStore — receives the mapped events
 */

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

export {
  EVENT_BUFFER_FLUSH_MS,
  STORAGE_DEBOUNCE_MS,
  createDebouncedStorage,
  mapRateUpdateToStreamEvent,
  mapLimitExceededToStreamEvent,
};
