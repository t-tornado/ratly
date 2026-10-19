import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventStream } from ".";
import type { StreamEvent } from "../../lib/types";

const mockEvents: StreamEvent[] = [
  {
    id: "1",
    type: "rate:update",
    timestamp: "12:00:01",
    description: "remaining 50 / 100",
    severity: "info",
  },
  {
    id: "2",
    type: "rate:limit_exceeded",
    timestamp: "12:00:02",
    description: "blocked",
    severity: "error",
  },
];

describe("EventStream", () => {
  it("renders events with type, timestamp, and description", () => {
    render(<EventStream title="Events" events={mockEvents} />);
    expect(screen.getByText("rate:update")).toBeInTheDocument();
    expect(screen.getByText("12:00:01")).toBeInTheDocument();
    expect(screen.getByText("remaining 50 / 100")).toBeInTheDocument();
    expect(screen.getByText("rate:limit_exceeded")).toBeInTheDocument();
  });

  it("applies severity color classes", () => {
    const { container } = render(<EventStream title="Events" events={mockEvents} />);
    expect(container.innerHTML).toContain("bg-accent-purple");
    expect(container.innerHTML).toContain("bg-error");
  });

  it("renders empty container for empty events", () => {
    render(<EventStream title="Events" events={[]} />);
    expect(screen.getByText("Events")).toBeInTheDocument();
  });

  it("renders headerRight slot", () => {
    render(
      <EventStream
        title="Events"
        events={[]}
        headerRight={<button>Clear</button>}
      />,
    );
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("renders footer slot", () => {
    render(
      <EventStream title="Events" events={[]} footer={<span>Total: 0</span>} />,
    );
    expect(screen.getByText("Total: 0")).toBeInTheDocument();
  });

  it("renders section heading with title", () => {
    render(<EventStream title="Live Feed" events={[]} />);
    expect(screen.getByText("Live Feed")).toBeInTheDocument();
  });
});
