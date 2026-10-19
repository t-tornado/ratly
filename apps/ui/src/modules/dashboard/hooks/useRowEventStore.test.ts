import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { Socket } from "socket.io-client";
import { RATE_UPDATE_EVENT, RATE_LIMIT_EXCEEDED_EVENT } from "@ratly/core";
import type { UserRow } from "@ratly/core";
import { mockRows, mockUserRow, mockWarningRow } from "../../../test/fixtures";
import { useRowEventStore } from "./useRowEventStore";

type SocketHandler = (...args: unknown[]) => void;

function createMockSocket() {
  const handlers = new Map<string, SocketHandler>();
  return {
    on: vi.fn((event: string, handler: SocketHandler) => {
      handlers.set(event, handler);
    }),
    off: vi.fn((event: string) => {
      handlers.delete(event);
    }),
    emit: (event: string, data: unknown) => {
      handlers.get(event)?.(data);
    },
    handlers,
    connect: vi.fn(),
    disconnect: vi.fn(),
  } as unknown as Socket & { emit: (event: string, data: unknown) => void; handlers: Map<string, SocketHandler> };
}

describe("useRowEventStore", () => {
  let mockSocket: ReturnType<typeof createMockSocket>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket = createMockSocket();
  });

  it("seeds store with initial rows on mount", () => {
    const { result } = renderHook(() => useRowEventStore(mockSocket as unknown as Socket, mockRows));

    expect(result.current.userIds).toEqual(mockRows.map((r) => r.userId));
  });

  it("returns row data for seeded users", () => {
    const { result } = renderHook(() => useRowEventStore(mockSocket as unknown as Socket, mockRows));

    expect(result.current.getRow("usr_ok")).toEqual(mockUserRow);
    expect(result.current.getRow("usr_warning")).toEqual(mockWarningRow);
  });

  it("returns undefined for missing userId", () => {
    const { result } = renderHook(() => useRowEventStore(mockSocket as unknown as Socket, mockRows));

    expect(result.current.getRow("nonexistent")).toBeUndefined();
  });

  it("updates store on rate:update socket event", () => {
    const { result } = renderHook(() => useRowEventStore(mockSocket as unknown as Socket, mockRows));

    const updatedRow: UserRow = { ...mockUserRow, used: 50, remaining: 50 };

    act(() => {
      mockSocket.emit(RATE_UPDATE_EVENT, { row: updatedRow });
    });

    expect(result.current.getRow("usr_ok")?.used).toBe(50);
  });

  it("updates store on rate:limit_exceeded socket event", () => {
    const { result } = renderHook(() => useRowEventStore(mockSocket as unknown as Socket, mockRows));

    const exceededRow: UserRow = { ...mockUserRow, used: 100, remaining: 0, status: "exceeded" };

    act(() => {
      mockSocket.emit(RATE_LIMIT_EXCEEDED_EVENT, { row: exceededRow });
    });

    expect(result.current.getRow("usr_ok")?.status).toBe("exceeded");
  });

  it("adds new user to userIds on event for unknown user", () => {
    const { result } = renderHook(() => useRowEventStore(mockSocket as unknown as Socket, mockRows));

    const newRow: UserRow = { ...mockUserRow, userId: "usr_new" };

    act(() => {
      mockSocket.emit(RATE_UPDATE_EVENT, { row: newRow });
    });

    expect(result.current.userIds).toContain("usr_new");
  });

  it("cleans up socket listeners on unmount", () => {
    const { unmount } = renderHook(() => useRowEventStore(mockSocket as unknown as Socket, mockRows));

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith(RATE_UPDATE_EVENT, expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith(RATE_LIMIT_EXCEEDED_EVENT, expect.any(Function));
  });
});
