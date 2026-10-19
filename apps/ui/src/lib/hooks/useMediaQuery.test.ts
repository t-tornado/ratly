import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "./useMediaQuery";

function createMockMatchMedia(initialMatches: boolean) {
  let listener: ((event: MediaQueryListEvent) => void) | null = null;

  const mediaQueryList = {
    matches: initialMatches,
    media: "",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((_event: string, handler: (event: MediaQueryListEvent) => void) => {
      listener = handler;
    }),
    removeEventListener: vi.fn(),
    dispatchEvent: () => false,
  };

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn(() => mediaQueryList),
  });

  return {
    mediaQueryList,
    fireChange: (matches: boolean) => {
      mediaQueryList.matches = matches;
      listener?.({ matches } as MediaQueryListEvent);
    },
  };
}

describe("useMediaQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when query matches", () => {
    createMockMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("returns false when query does not match", () => {
    createMockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
  });

  it("updates on media query change event", () => {
    const { fireChange } = createMockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(result.current).toBe(false);

    act(() => fireChange(true));

    expect(result.current).toBe(true);
  });

  it("cleans up listener on unmount", () => {
    const { mediaQueryList } = createMockMatchMedia(true);
    const { unmount } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    unmount();

    expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });
});
