import { useEffect, useRef } from "react";

import { RATE_UPDATE_EVENT, RATE_LIMIT_EXCEEDED_EVENT } from "@ratly/core";
import type { RateUpdateEvent, RateLimitExceededEvent } from "@ratly/core";
import type { StreamEvent } from "../../../lib/types";

import { useSocket } from "../../../lib/hooks";
import {
  EVENT_BUFFER_FLUSH_MS,
  mapRateUpdateToStreamEvent,
  mapLimitExceededToStreamEvent,
} from "../utils/eventStream";
import { useEventStreamStore } from "./useEventStreamStore";
import type { UserEventStream } from "./useEventStreamStore";

/**
 * Buffers socket events and flushes them into the persisted event stream.
 *
 * Collects incoming `rate:update` and `rate:limit_exceeded` events in a
 * ref-based buffer, then flushes the batch into {@link useEventStreamStore}
 * every {@link EVENT_BUFFER_FLUSH_MS}ms. This reduces Zustand `set()` calls
 * and localStorage serialization from N/sec to ~4/sec under pressure.
 *
 * Cleanup flushes remaining buffered events so none are lost on unmount.
 *
 * @param userId - Filter events to this user only
 * @returns Current event stream (survives page refresh)
 * @listens socket "rate:update" — buffered via {@link mapRateUpdateToStreamEvent}
 * @listens socket "rate:limit_exceeded" — buffered via {@link mapLimitExceededToStreamEvent}
 * @see useUserDetailStats — sibling hook for stat display
 * @see useEventStreamStore — persistence layer (receives flushed batches)
 */
function useUserDetailEvents(userId: string): UserEventStream {
  const { socket } = useSocket();
  const addEvents = useEventStreamStore((state) => state.addEvents);
  const stream = useEventStreamStore((state) => state.getStream(userId));
  const eventBufferRef = useRef<StreamEvent[]>([]);

  useEffect(() => {
    const flushEventBuffer = () => {
      if (eventBufferRef.current.length === 0) return;
      const bufferedEvents = eventBufferRef.current;
      eventBufferRef.current = [];
      addEvents(userId, bufferedEvents);
    };

    const intervalId = setInterval(flushEventBuffer, EVENT_BUFFER_FLUSH_MS);

    const handleRateUpdate = ({ row }: RateUpdateEvent) => {
      if (row.userId !== userId) return;
      eventBufferRef.current.push(mapRateUpdateToStreamEvent(row));
    };

    const handleLimitExceeded = ({ row }: RateLimitExceededEvent) => {
      if (row.userId !== userId) return;
      eventBufferRef.current.push(mapLimitExceededToStreamEvent(row));
    };

    socket.on(RATE_UPDATE_EVENT, handleRateUpdate);
    socket.on(RATE_LIMIT_EXCEEDED_EVENT, handleLimitExceeded);

    return () => {
      clearInterval(intervalId);
      flushEventBuffer();
      socket.off(RATE_UPDATE_EVENT, handleRateUpdate);
      socket.off(RATE_LIMIT_EXCEEDED_EVENT, handleLimitExceeded);
    };
  }, [socket, userId, addEvents]);

  return stream;
}

export { useUserDetailEvents };
