import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from ".";
import { useTheme } from "../../lib/hooks";
import { ContextNotFoundError } from "../../lib/errors";

vi.mock("../../lib/safeLocalStorage", () => ({
  safeLocalStorage: {
    get: vi.fn(() => null),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

import { safeLocalStorage } from "../../lib/safeLocalStorage";

const mockedStorage = vi.mocked(safeLocalStorage);

function ThemeConsumer() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme("light")}>set light</button>
      <button onClick={() => setTheme("dark")}>set dark</button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove("dark", "light");
  });

  it("provides default theme 'system' when no localStorage value", () => {
    mockedStorage.get.mockReturnValue(null);
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("system");
  });

  it("reads stored theme from localStorage on mount", () => {
    mockedStorage.get.mockReturnValue("light");
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(mockedStorage.get).toHaveBeenCalledWith("ratly-theme");
  });

  it("setTheme updates context value and writes to localStorage", () => {
    mockedStorage.get.mockReturnValue(null);
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByText("set light"));

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(mockedStorage.set).toHaveBeenCalledWith("ratly-theme", "light");
  });

  it("throws ContextNotFoundError when useTheme called outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ThemeConsumer />)).toThrow(ContextNotFoundError);
    spy.mockRestore();
  });

  it("applies .dark class to documentElement when resolved theme is dark", () => {
    mockedStorage.get.mockReturnValue("dark");
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("applies .light class to documentElement when resolved theme is light", () => {
    mockedStorage.get.mockReturnValue("light");
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });
});
