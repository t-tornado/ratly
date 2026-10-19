import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StreamEvent } from "../../../lib/types";
import { STORAGE_DEBOUNCE_MS, createDebouncedStorage } from "../utils/eventStream";

/** Oldest events evicted beyond this cap — history lives server-side. */
const MAX_EVENTS_PER_USER = 200;

interface UserEventStream {
  events: StreamEvent[];
  lastRecorded: string | null;
}

interface EventStreamState {
  streams: Record<string, UserEventStream>;
  addEvents: (userId: string, newEvents: StreamEvent[]) => void;
  getStream: (userId: string) => UserEventStream;
}

const EMPTY_STREAM: UserEventStream = { events: [], lastRecorded: null };

/**
 * Zustand store for user event streams — persisted to localStorage.
 *
 * Each user gets an independent stream capped at {@link MAX_EVENTS_PER_USER}.
 * Fed by {@link useUserDetailEvents} which buffers socket events and
 * flushes batches of {@link StreamEvent} objects on an interval.
 *
 * @remarks Persisted under key `"ratly-event-streams"` with debounced
 * localStorage writes to avoid serialization churn under pressure.
 * @see useUserDetailEvents — the socket-to-store bridge (buffers + flushes)
 * @see createDebouncedStorage — the debounced localStorage adapter
 */
const useEventStreamStore = create<EventStreamState>()(
  persist(
    (set, get) => ({
      streams: {},

      addEvents: (userId, newEvents) =>
        set((state) => {
          if (newEvents.length === 0) return state;
          const existing = state.streams[userId] ?? EMPTY_STREAM;
          const newestFirst = [...newEvents].reverse();
          const updatedEvents = [...newestFirst, ...existing.events].slice(0, MAX_EVENTS_PER_USER);
          return {
            streams: {
              ...state.streams,
              [userId]: {
                events: updatedEvents,
                lastRecorded: newestFirst[0].timestamp,
              },
            },
          };
        }),

      getStream: (userId) => get().streams[userId] ?? EMPTY_STREAM,
    }),
    {
      name: "ratly-event-streams",
      storage: createJSONStorage(() => createDebouncedStorage(STORAGE_DEBOUNCE_MS)),
    }
  )
);

export { useEventStreamStore, MAX_EVENTS_PER_USER };
export type { UserEventStream };
