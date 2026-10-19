import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";
import type { Socket } from "socket.io-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RATE_UPDATE_EVENT, RATE_LIMIT_EXCEEDED_EVENT } from "@ratly/core";

import { mockUserRow, mockExceededRow } from "../../../test/fixtures";
import { SocketContext } from "../../../lib/hooks/useSocket";
import { useUserDetailStats } from "./useUserDetailStats";
import { EMPTY_STATS } from "../utils/userStats";

vi.mock("../../../lib/api", () => ({
  fetchUser: vi.fn(),
  queryKeys: {
    dashboard: ["dashboard"],
    user: (userId: string) => ["user", userId],
    activity: (userId: string, range: string) => ["activity", userId, range],
  },
}));

import { fetchUser } from "../../../lib/api";

const mockedFetchUser = vi.mocked(fetchUser);

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
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const contextValue = { socket, isConnected: true };
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <SocketContext value={contextValue}>{children}</SocketContext>
      </QueryClientProvider>
    );
  };
}

describe("useUserDetailStats", () => {
  let mockSocket: ReturnType<typeof createMockSocket>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket = createMockSocket();
  });

  it("returns empty stats while loading", () => {
    mockedFetchUser.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useUserDetailStats("usr_ok"), {
      wrapper: createWrapper(mockSocket as unknown as Socket),
    });

    expect(result.current.statItems).toEqual(EMPTY_STATS);
    expect(result.current.status).toBeNull();
    expect(result.current.currentRemaining).toBeNull();
    expect(result.current.currentLimit).toBeNull();
    expect(result.current.paused).toBe(false);
    expect(result.current.hasActiveWindow).toBe(false);
  });

  it("fetches user and returns stat items", async () => {
    mockedFetchUser.mockResolvedValue(mockUserRow);

    const { result } = renderHook(() => useUserDetailStats("usr_ok"), {
      wrapper: createWrapper(mockSocket as unknown as Socket),
    });

    await waitFor(() => expect(result.current.status).toBe("ok"));

    expect(result.current.currentRemaining).toBe(58);
    expect(result.current.currentLimit).toBe(100);
    expect(result.current.paused).toBe(false);
    expect(result.current.hasActiveWindow).toBe(true);
    expect(result.current.statItems).toHaveLength(4);
  });

  it("patches cache on rate:update matching userId", async () => {
    mockedFetchUser.mockResolvedValue(mockUserRow);

    const { result } = renderHook(() => useUserDetailStats("usr_ok"), {
      wrapper: createWrapper(mockSocket as unknown as Socket),
    });

    await waitFor(() => expect(result.current.status).toBe("ok"));

    const updatedRow = { ...mockUserRow, used: 80, remaining: 20, status: "warning" as const };
    act(() => {
      mockSocket.emit(RATE_UPDATE_EVENT, { row: updatedRow });
    });

    await waitFor(() => expect(result.current.currentRemaining).toBe(20));
    expect(result.current.status).toBe("warning");
  });

  it("ignores rate:update for non-matching userId", async () => {
    mockedFetchUser.mockResolvedValue(mockUserRow);

    const { result } = renderHook(() => useUserDetailStats("usr_ok"), {
      wrapper: createWrapper(mockSocket as unknown as Socket),
    });

    await waitFor(() => expect(result.current.status).toBe("ok"));

    act(() => {
      mockSocket.emit(RATE_UPDATE_EVENT, { row: { ...mockExceededRow } });
    });

    expect(result.current.currentRemaining).toBe(58);
  });

  it("patches cache on rate:limit_exceeded matching userId", async () => {
    mockedFetchUser.mockResolvedValue(mockUserRow);

    const { result } = renderHook(() => useUserDetailStats("usr_ok"), {
      wrapper: createWrapper(mockSocket as unknown as Socket),
    });

    await waitFor(() => expect(result.current.status).toBe("ok"));

    const exceededRow = { ...mockUserRow, used: 100, remaining: 0, status: "exceeded" as const };
    act(() => {
      mockSocket.emit(RATE_LIMIT_EXCEEDED_EVENT, { row: exceededRow });
    });

    await waitFor(() => expect(result.current.currentRemaining).toBe(0));
    expect(result.current.status).toBe("exceeded");
  });

  it("cleans up socket listeners on unmount", async () => {
    mockedFetchUser.mockResolvedValue(mockUserRow);

    const { unmount } = renderHook(() => useUserDetailStats("usr_ok"), {
      wrapper: createWrapper(mockSocket as unknown as Socket),
    });

    await waitFor(() => expect(mockedFetchUser).toHaveBeenCalled());

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith(RATE_UPDATE_EVENT, expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith(RATE_LIMIT_EXCEEDED_EVENT, expect.any(Function));
  });

  it("sets isError when fetch fails", async () => {
    mockedFetchUser.mockRejectedValue(new Error("Not found"));

    const { result } = renderHook(() => useUserDetailStats("usr_ok"), {
      wrapper: createWrapper(mockSocket as unknown as Socket),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
