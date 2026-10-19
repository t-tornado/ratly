import { describe, it, expect, vi, beforeEach } from "vitest";
import { useEventStreamStore, MAX_EVENTS_PER_USER } from "./useEventStreamStore";
import type { StreamEvent } from "../../../lib/types";

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

  it("addEvents reverses batch to newest-first and prepends to stream", () => {
    const eventA = createEvent({ id: "a", timestamp: "12:00:00" });
    const eventB = createEvent({ id: "b", timestamp: "12:00:01" });

    useEventStreamStore.getState().addEvents("usr_ok", [eventA, eventB]);

    const stream = useEventStreamStore.getState().getStream("usr_ok");
    expect(stream.events[0].id).toBe("b");
    expect(stream.events[1].id).toBe("a");
  });

  it("addEvents prepends new batch before existing events", () => {
    const firstBatch = [createEvent({ id: "a" }), createEvent({ id: "b" })];
    const secondBatch = [createEvent({ id: "c" }), createEvent({ id: "d" })];

    useEventStreamStore.getState().addEvents("usr_ok", firstBatch);
    useEventStreamStore.getState().addEvents("usr_ok", secondBatch);

    const stream = useEventStreamStore.getState().getStream("usr_ok");
    expect(stream.events.map((e) => e.id)).toEqual(["d", "c", "b", "a"]);
  });

  it("addEvents is a no-op for empty batch", () => {
    useEventStreamStore.getState().addEvents("usr_ok", [createEvent({ id: "a" })]);
    const before = useEventStreamStore.getState().streams;

    useEventStreamStore.getState().addEvents("usr_ok", []);

    expect(useEventStreamStore.getState().streams).toBe(before);
  });

  it("updates lastRecorded to newest event timestamp in batch", () => {
    const events = [
      createEvent({ timestamp: "14:00:00" }),
      createEvent({ timestamp: "14:30:00" }),
    ];

    useEventStreamStore.getState().addEvents("usr_ok", events);

    const stream = useEventStreamStore.getState().getStream("usr_ok");
    expect(stream.lastRecorded).toBe("14:30:00");
  });

  it("caps at MAX_EVENTS_PER_USER", () => {
    const overflowBatch = Array.from({ length: OVERFLOW_COUNT }, (_, i) =>
      createEvent({ id: `event-${i}` }),
    );

    useEventStreamStore.getState().addEvents("usr_ok", overflowBatch);

    const stream = useEventStreamStore.getState().getStream("usr_ok");
    expect(stream.events).toHaveLength(MAX_EVENTS_PER_USER);
    expect(stream.events[0].id).toBe(`event-${OVERFLOW_COUNT - 1}`);
  });

  it("maintains separate streams per userId", () => {
    useEventStreamStore.getState().addEvents("usr_a", [createEvent({ id: "a1" }), createEvent({ id: "a2" })]);
    useEventStreamStore.getState().addEvents("usr_b", [createEvent({ id: "b1" })]);

    const streamA = useEventStreamStore.getState().getStream("usr_a");
    const streamB = useEventStreamStore.getState().getStream("usr_b");

    expect(streamA.events).toHaveLength(2);
    expect(streamB.events).toHaveLength(1);
  });
});
