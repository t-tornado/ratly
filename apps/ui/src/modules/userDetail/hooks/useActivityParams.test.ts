import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useActivityParams } from "./useActivityParams";

const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = vi.fn((updater: (prev: URLSearchParams) => URLSearchParams) => {
  const newParams = updater(mockSearchParams);
  for (const [key, value] of newParams.entries()) {
    mockSearchParams.set(key, value);
  }
});

vi.mock("react-router-dom", () => ({
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}));

describe("useActivityParams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of [...mockSearchParams.keys()]) {
      mockSearchParams.delete(key);
    }
  });

  it("falls back to defaults for missing params", () => {
    const { result } = renderHook(() => useActivityParams());

    expect(result.current.range).toBe("hour");
    expect(result.current.refresh).toBe("off");
  });

  it("reads range from URL search params", () => {
    mockSearchParams.set("range", "day");
    const { result } = renderHook(() => useActivityParams());
    expect(result.current.range).toBe("day");
  });

  it("reads refresh from URL search params", () => {
    mockSearchParams.set("refresh", "30s");
    const { result } = renderHook(() => useActivityParams());
    expect(result.current.refresh).toBe("30s");
  });

  it("falls back to defaults for invalid values", () => {
    mockSearchParams.set("range", "invalid");
    mockSearchParams.set("refresh", "invalid");
    const { result } = renderHook(() => useActivityParams());
    expect(result.current.range).toBe("hour");
    expect(result.current.refresh).toBe("off");
  });

  it("setRange updates URL param", () => {
    const { result } = renderHook(() => useActivityParams());

    act(() => result.current.setRange("day"));

    expect(mockSetSearchParams).toHaveBeenCalledWith(expect.any(Function));
  });

  it("setRefresh updates URL param", () => {
    const { result } = renderHook(() => useActivityParams());

    act(() => result.current.setRefresh("1m"));

    expect(mockSetSearchParams).toHaveBeenCalledWith(expect.any(Function));
  });
});
