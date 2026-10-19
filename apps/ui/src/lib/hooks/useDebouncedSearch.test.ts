import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedSearch } from "./useDebouncedSearch";

describe("useDebouncedSearch", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("searchQuery starts empty", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDebouncedSearch());
    expect(result.current.searchQuery).toBe("");
  });

  it("debouncedQuery (searchQuery) lags by 300ms", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDebouncedSearch());

    act(() => result.current.onSearchChange("hello"));
    vi.advanceTimersByTime(100);

    expect(result.current.searchQuery).toBe("");

    act(() => vi.advanceTimersByTime(200));

    expect(result.current.searchQuery).toBe("hello");
  });

  it("multiple rapid changes only emit final value", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDebouncedSearch());

    act(() => result.current.onSearchChange("a"));
    vi.advanceTimersByTime(100);
    act(() => result.current.onSearchChange("ab"));
    vi.advanceTimersByTime(100);
    act(() => result.current.onSearchChange("abc"));

    act(() => vi.advanceTimersByTime(300));

    expect(result.current.searchQuery).toBe("abc");
  });
});
