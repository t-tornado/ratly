import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLiveEvents } from "./useLiveEvents";
import { mockUserRow, mockExceededRow } from "../../../test/fixtures";

describe("useLiveEvents", () => {
  it("starts with empty events", () => {
    const { result } = renderHook(() => useLiveEvents());
    expect(result.current.liveEvents).toHaveLength(0);
  });

  it("prepends rate update events", () => {
    const { result } = renderHook(() => useLiveEvents());
    act(() => { result.current.addRateUpdate(mockUserRow); });
    expect(result.current.liveEvents).toHaveLength(1);
    expect(result.current.liveEvents[0].type).toBe("rate:update");
  });

  it("prepends limit exceeded events", () => {
    const { result } = renderHook(() => useLiveEvents());
    act(() => { result.current.addLimitExceeded(mockExceededRow); });
    expect(result.current.liveEvents[0].type).toBe("rate:limit_exceeded");
  });

  it("newest event is at index 0", () => {
    const { result } = renderHook(() => useLiveEvents());
    act(() => { result.current.addRateUpdate(mockUserRow); });
    act(() => { result.current.addLimitExceeded(mockExceededRow); });
    expect(result.current.liveEvents[0].type).toBe("rate:limit_exceeded");
  });

  it("caps events at 50", () => {
    const { result } = renderHook(() => useLiveEvents());
    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.addRateUpdate(mockUserRow);
      }
    });
    expect(result.current.liveEvents).toHaveLength(50);
  });
});
