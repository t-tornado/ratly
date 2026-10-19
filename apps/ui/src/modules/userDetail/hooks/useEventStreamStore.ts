import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StreamEvent } from "../../../lib/types";

/** Oldest events evicted beyond this cap — history lives server-side. */
const MAX_EVENTS_PER_USER = 200;

interface UserEventStream {
  events: StreamEvent[];
  lastRecorded: string | null;
}

interface EventStreamState {
  streams: Record<string, UserEventStream>;
  addEvent: (userId: string, event: StreamEvent) => void;
  getStream: (userId: string) => UserEventStream;
}

const EMPTY_STREAM: UserEventStream = { events: [], lastRecorded: null };

/**
 * Zustand store for user event streams — persisted to localStorage.
 *
 * Each user gets an independent stream capped at {@link MAX_EVENTS_PER_USER}.
 * Fed by {@link useUserDetailEvents} which maps socket events into
 * {@link StreamEvent} objects.
 *
 * @remarks Persisted under key `"ratly-event-streams"`. Survives
 * page refresh so the user sees recent history on return.
 * @see useUserDetailEvents — the socket-to-store bridge
 */
const useEventStreamStore = create<EventStreamState>()(
  persist(
    (set, get) => ({
      streams: {},

      addEvent: (userId, event) =>
        set((state) => {
          const existing = state.streams[userId] ?? EMPTY_STREAM;
          const updatedEvents = [event, ...existing.events].slice(0, MAX_EVENTS_PER_USER);
          return {
            streams: {
              ...state.streams,
              [userId]: {
                events: updatedEvents,
                lastRecorded: event.timestamp,
              },
            },
          };
        }),

      getStream: (userId) => get().streams[userId] ?? EMPTY_STREAM,
    }),
    {
      name: "ratly-event-streams",
    }
  )
);

export { useEventStreamStore };
export type { UserEventStream };
