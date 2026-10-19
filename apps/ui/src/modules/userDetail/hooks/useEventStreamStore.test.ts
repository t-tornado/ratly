import { describe, it, expect, vi, beforeEach } from "vitest";
import { useEventStreamStore } from "./useEventStreamStore";
import type { StreamEvent } from "../../../lib/types";

const MAX_EVENTS_PER_USER = 200;
const OVERFLOW_COUNT = MAX_EVENTS_PER_USER + 10;

function createEvent(overrides?: Partial<StreamEvent>): StreamEvent {
  return {
    id: crypto.randomUUID(),
    type: "rate:update",
    timestamp: "12:00:00",
    description: "test event",
    severity: "info",
    ...overrides,
  };
}

describe("useEventStreamStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useEventStreamStore.setState({ streams: {} });
  });

  it("getStream returns empty stream for unknown userId", () => {
    const stream = useEventStreamStore.getState().getStream("unknown");

    expect(stream.events).toEqual([]);
    expect(stream.lastRecorded).toBeNull();
  });

  it("addEvent prepends event to stream", () => {
    const eventA = createEvent({ id: "a", timestamp: "12:00:00" });
    const eventB = createEvent({ id: "b", timestamp: "12:00:01" });

    useEventStreamStore.getState().addEvent("usr_ok", eventA);
    useEventStreamStore.getState().addEvent("usr_ok", eventB);

    const stream = useEventStreamStore.getState().getStream("usr_ok");
    expect(stream.events[0].id).toBe("b");
    expect(stream.events[1].id).toBe("a");
  });

  it("updates lastRecorded timestamp on add", () => {
    const event = createEvent({ timestamp: "14:30:00" });

    useEventStreamStore.getState().addEvent("usr_ok", event);

    const stream = useEventStreamStore.getState().getStream("usr_ok");
    expect(stream.lastRecorded).toBe("14:30:00");
  });

  it("caps at MAX_EVENTS_PER_USER", () => {
    for (let i = 0; i < OVERFLOW_COUNT; i++) {
      useEventStreamStore.getState().addEvent("usr_ok", createEvent({ id: `event-${i}` }));
    }

    const stream = useEventStreamStore.getState().getStream("usr_ok");
    expect(stream.events).toHaveLength(MAX_EVENTS_PER_USER);
    expect(stream.events[0].id).toBe(`event-${OVERFLOW_COUNT - 1}`);
  });

  it("maintains separate streams per userId", () => {
    useEventStreamStore.getState().addEvent("usr_a", createEvent({ id: "a1" }));
    useEventStreamStore.getState().addEvent("usr_b", createEvent({ id: "b1" }));
    useEventStreamStore.getState().addEvent("usr_a", createEvent({ id: "a2" }));

    const streamA = useEventStreamStore.getState().getStream("usr_a");
    const streamB = useEventStreamStore.getState().getStream("usr_b");

    expect(streamA.events).toHaveLength(2);
    expect(streamB.events).toHaveLength(1);
  });
});
