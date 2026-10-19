import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsRow } from ".";
import type { StatItem } from ".";

const items: StatItem[] = [
  { label: "Total", value: "100" },
  { label: "Active", value: "42", sub: "online" },
  { label: "Rejected", value: "3", accent: "error" },
];

describe("StatsRow", () => {
  it("maps items to StatCards", () => {
    render(<StatsRow items={items} />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Rejected")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});
