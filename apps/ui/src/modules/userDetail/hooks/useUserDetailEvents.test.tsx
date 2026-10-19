import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import type { Socket } from "socket.io-client";
import { RATE_UPDATE_EVENT, RATE_LIMIT_EXCEEDED_EVENT } from "@ratly/core";

import { mockUserRow, mockExceededRow } from "../../../test/fixtures";
import { SocketContext } from "../../../lib/hooks/useSocket";
import { useUserDetailEvents } from "./useUserDetailEvents";
import { useEventStreamStore } from "./useEventStreamStore";

type SocketHandler = (...args: unknown[]) => void;

function createMockSocket() {
  const handlers = new Map<string, SocketHandler[]>();
  return {
    on: vi.fn((event: string, handler: SocketHandler) => {
      const list = handlers.get(event) ?? [];
      list.push(handler);
      handlers.set(event, list);
    }),
    off: vi.fn((event: string, handler: SocketHandler) => {
      const list = handlers.get(event) ?? [];
      handlers.set(event, list.filter((h) => h !== handler));
    }),
    emit: (event: string, data: unknown) => {
      for (const handler of handlers.get(event) ?? []) handler(data);
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  } as unknown as Socket & { emit: (event: string, data: unknown) => void };
}

function createWrapper(socket: Socket) {
  const contextValue = { socket, isConnected: true };
  return function Wrapper({ children }: { children: ReactNode }) {
    return <SocketContext value={contextValue}>{children}</SocketContext>;
  };
}

describe("useUserDetailEvents", () => {
  let mockSocket: ReturnType<typeof createMockSocket>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket = createMockSocket();
    useEventStreamStore.setState({ streams: {} });
  });

  it("pushes rate:update event for matching userId to store", () => {
    const { result } = renderHook(() => useUserDetailEvents("usr_ok"), {
      wrapper: createWrapper(mockSocket as unknown as Socket),
    });

    act(() => {
      mockSocket.emit(RATE_UPDATE_EVENT, { row: mockUserRow });
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].type).toBe(RATE_UPDATE_EVENT);
    expect(result.current.events[0].severity).toBe("info");
  });

  it("pushes rate:limit_exceeded event for matching userId to store", () => {
    const exceededRow = { ...mockUserRow, userId: "usr_ok", used: 100, remaining: 0, status: "exceeded" as const };

    const { result } = renderHook(() => useUserDetailEvents("usr_ok"), {
      wrapper: createWrapper(mockSocket as unknown as Socket),
    });

    act(() => {
      mockSocket.emit(RATE_LIMIT_EXCEEDED_EVENT, { row: exceededRow });
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].type).toBe(RATE_LIMIT_EXCEEDED_EVENT);
    expect(result.current.events[0].severity).toBe("error");
  });

  it("ignores events for non-matching userId", () => {
    const { result } = renderHook(() => useUserDetailEvents("usr_ok"), {
      wrapper: createWrapper(mockSocket as unknown as Socket),
    });

    act(() => {
      mockSocket.emit(RATE_UPDATE_EVENT, { row: mockExceededRow });
    });

    expect(result.current.events).toHaveLength(0);
  });

  it("cleans up listeners on unmount", () => {
    const { unmount } = renderHook(() => useUserDetailEvents("usr_ok"), {
      wrapper: createWrapper(mockSocket as unknown as Socket),
    });

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith(RATE_UPDATE_EVENT, expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith(RATE_LIMIT_EXCEEDED_EVENT, expect.any(Function));
  });

  it("returns empty stream initially", () => {
    const { result } = renderHook(() => useUserDetailEvents("usr_ok"), {
      wrapper: createWrapper(mockSocket as unknown as Socket),
    });

    expect(result.current.events).toEqual([]);
    expect(result.current.lastRecorded).toBeNull();
  });
});
