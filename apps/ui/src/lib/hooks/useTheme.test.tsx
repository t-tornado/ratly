import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { useTheme, ThemeContext } from "./useTheme";
import { ContextNotFoundError } from "../errors";
import type { ThemeContext as ThemeContextType } from "../types";

describe("useTheme", () => {
  it("throws ContextNotFoundError outside ThemeProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow(ContextNotFoundError);
    spy.mockRestore();
  });

  it("returns theme context inside ThemeProvider", () => {
    const mockContext: ThemeContextType = {
      theme: "dark",
      resolvedTheme: "dark",
      setTheme: vi.fn(),
    };

    function wrapper({ children }: { children: ReactNode }) {
      return <ThemeContext value={mockContext}>{children}</ThemeContext>;
    }

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
    expect(result.current.setTheme).toBe(mockContext.setTheme);
  });
});
