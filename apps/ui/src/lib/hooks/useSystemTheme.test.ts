import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSystemTheme } from "./useSystemTheme";

function createMockMatchMedia(prefersDark: boolean) {
  let listener: (() => void) | null = null;

  const mediaQueryList = {
    matches: prefersDark,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((_event: string, handler: () => void) => {
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
    fireChange: (prefersDarkNew: boolean) => {
      mediaQueryList.matches = prefersDarkNew;
      listener?.();
    },
  };
}

describe("useSystemTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 'dark' when system prefers dark", () => {
    createMockMatchMedia(true);
    const { result } = renderHook(() => useSystemTheme());
    expect(result.current).toBe("dark");
  });

  it("returns 'light' when system prefers light", () => {
    createMockMatchMedia(false);
    const { result } = renderHook(() => useSystemTheme());
    expect(result.current).toBe("light");
  });

  it("updates on system theme change", () => {
    const { fireChange } = createMockMatchMedia(true);
    const { result } = renderHook(() => useSystemTheme());

    expect(result.current).toBe("dark");

    act(() => fireChange(false));

    expect(result.current).toBe("light");
  });

  it("cleans up listener on unmount", () => {
    const { mediaQueryList } = createMockMatchMedia(true);
    const { unmount } = renderHook(() => useSystemTheme());

    unmount();

    expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });
});
