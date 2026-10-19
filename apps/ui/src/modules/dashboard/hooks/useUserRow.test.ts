import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { mockRows, mockUserRow, createMockRowEventStore } from "../../../test/fixtures";
import type { UserRow } from "@ratly/core";
import { useUserRow } from "./useUserRow";
import type { RowEventStore } from "./useRowEventStore";

describe("useUserRow", () => {
  let store: RowEventStore;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createMockRowEventStore(mockRows);
  });

  it("returns UserRow for existing userId", () => {
    const { result } = renderHook(() => useUserRow("usr_ok", store));

    expect(result.current).toEqual(mockUserRow);
  });

  it("returns undefined for missing userId", () => {
    const { result } = renderHook(() => useUserRow("nonexistent", store));

    expect(result.current).toBeUndefined();
  });

  it("re-renders when row data changes via store subscriber", () => {
    let subscribedCallback: ((row: UserRow) => void) | null = null;
    const subscribingStore: RowEventStore = {
      ...store,
      subscribe: vi.fn((userId: string, callback: (row: UserRow) => void) => {
        subscribedCallback = callback;
      }),
      unsubscribe: vi.fn(),
      getRow: vi.fn()
        .mockReturnValueOnce(mockUserRow)
        .mockReturnValue({ ...mockUserRow, used: 99, remaining: 1 }),
    };

    const { result } = renderHook(() => useUserRow("usr_ok", subscribingStore));

    expect(subscribingStore.subscribe).toHaveBeenCalledWith("usr_ok", expect.any(Function));

    act(() => {
      subscribedCallback?.({ ...mockUserRow, used: 99, remaining: 1 });
    });

    expect(result.current?.used).toBe(99);
  });

  it("unsubscribes on unmount", () => {
    const unsubscribeSpy = vi.fn();
    const unsubStore: RowEventStore = {
      ...store,
      subscribe: vi.fn(),
      unsubscribe: unsubscribeSpy,
    };

    const { unmount } = renderHook(() => useUserRow("usr_ok", unsubStore));

    unmount();

    expect(unsubscribeSpy).toHaveBeenCalledWith("usr_ok");
  });
});
