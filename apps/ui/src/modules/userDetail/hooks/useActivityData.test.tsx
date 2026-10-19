import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useActivityData } from "./useActivityData";
import type { ActivityBucket } from "../types/activity";

vi.mock("../../../lib/api", () => ({
  fetchActivity: vi.fn(),
  queryKeys: {
    dashboard: ["dashboard"],
    user: (userId: string) => ["user", userId],
    activity: (userId: string, range: string) => ["activity", userId, range],
  },
}));

import { fetchActivity } from "../../../lib/api";

const mockedFetchActivity = vi.mocked(fetchActivity);

const mockBuckets: ActivityBucket[] = [
  { timestamp: "2026-10-19T12:00:00Z", allowed: 10, rejected: 2 },
  { timestamp: "2026-10-19T12:05:00Z", allowed: 15, rejected: 0 },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useActivityData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches activity buckets by userId and range", async () => {
    mockedFetchActivity.mockResolvedValue(mockBuckets);

    const { result } = renderHook(
      () => useActivityData({ userId: "usr_ok", range: "hour", refreshIntervalMs: false }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activityBuckets).toEqual(mockBuckets);
    expect(result.current.isError).toBe(false);
    expect(mockedFetchActivity).toHaveBeenCalledWith("usr_ok", "hour");
  });

  it("disabled when userId empty", () => {
    const { result } = renderHook(
      () => useActivityData({ userId: "", range: "hour", refreshIntervalMs: false }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.activityBuckets).toEqual([]);
    expect(mockedFetchActivity).not.toHaveBeenCalled();
  });

  it("returns isError when fetch fails", async () => {
    mockedFetchActivity.mockRejectedValue(new Error("fail"));

    const { result } = renderHook(
      () => useActivityData({ userId: "usr_ok", range: "day", refreshIntervalMs: false }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.activityBuckets).toEqual([]);
  });
});
