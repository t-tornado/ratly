import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from ".";

function BrokenChild(): never {
  throw new Error("Test error");
}

function GoodChild() {
  return <div>Working</div>;
}

describe("ErrorBoundary", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Working")).toBeInTheDocument();
  });

  it("catches thrown error and shows ErrorState", () => {
    render(
      <ErrorBoundary>
        <BrokenChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("inline mode: retry resets state and re-renders children", () => {
    let shouldThrow = true;

    function ConditionalChild() {
      if (shouldThrow) throw new Error("Test");
      return <div>Recovered</div>;
    }

    render(
      <ErrorBoundary inline>
        <ConditionalChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Failed to load")).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("Recovered")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("full-screen mode shows Logo and reload button", () => {
    render(
      <ErrorBoundary>
        <BrokenChild />
      </ErrorBoundary>,
    );
    const svgs = document.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Reload page" })).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("full-screen mode retry calls window.location.reload", () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...window.location, reload: reloadMock },
    });

    render(
      <ErrorBoundary>
        <BrokenChild />
      </ErrorBoundary>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reload page" }));
    expect(reloadMock).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
