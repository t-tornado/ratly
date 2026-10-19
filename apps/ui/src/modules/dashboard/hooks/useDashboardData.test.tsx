import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type { Socket } from "socket.io-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DASHBOARD_STATS_UPDATE_EVENT } from "@ratly/core";

import { mockRows, mockStats } from "../../../test/fixtures";
import { useDashboardData } from "./useDashboardData";

vi.mock("../../../lib/api", () => ({
  fetchDashboard: vi.fn(),
  queryKeys: {
    dashboard: ["dashboard"],
    user: (userId: string) => ["user", userId],
    activity: (userId: string, range: string) => ["activity", userId, range],
  },
}));

import { fetchDashboard } from "../../../lib/api";

const mockedFetchDashboard = vi.mocked(fetchDashboard);

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
    connect: vi.fn(),
    disconnect: vi.fn(),
  } as unknown as Socket & { emit: (event: string, data: unknown) => void };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useDashboardData", () => {
  let mockSocket: ReturnType<typeof createMockSocket>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket = createMockSocket();
  });

  it("fetches dashboard data via React Query", async () => {
    mockedFetchDashboard.mockResolvedValue({ rows: mockRows, stats: mockStats });

    const { result } = renderHook(() => useDashboardData(mockSocket as unknown as Socket), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.initialRows).toEqual(mockRows);
    expect(result.current.isError).toBe(false);
  });

  it("returns empty rows array while loading", () => {
    mockedFetchDashboard.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useDashboardData(mockSocket as unknown as Socket), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.initialRows).toEqual([]);
    expect(result.current.stats).toBeNull();
  });

  it("patches stats cache on dashboard_stats:update socket event", async () => {
    mockedFetchDashboard.mockResolvedValue({ rows: mockRows, stats: mockStats });

    const { result } = renderHook(() => useDashboardData(mockSocket as unknown as Socket), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const updatedStats = { ...mockStats, totalUsers: 10 };
    mockSocket.emit(DASHBOARD_STATS_UPDATE_EVENT, { stats: updatedStats });

    await waitFor(() => expect(result.current.stats?.totalUsers).toBe(10));
  });

  it("cleans up socket listener on unmount", async () => {
    mockedFetchDashboard.mockResolvedValue({ rows: mockRows, stats: mockStats });

    const { unmount } = renderHook(() => useDashboardData(mockSocket as unknown as Socket), {
      wrapper: createWrapper(),
    });

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith(DASHBOARD_STATS_UPDATE_EVENT, expect.any(Function));
  });

  it("sets isError when fetch fails", async () => {
    mockedFetchDashboard.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useDashboardData(mockSocket as unknown as Socket), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
