import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StreamEvent } from "../../../lib/types";

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
