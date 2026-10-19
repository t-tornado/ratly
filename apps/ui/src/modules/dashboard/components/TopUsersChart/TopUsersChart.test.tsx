import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { mockTopUsers } from "../../../../test/fixtures";
import { TopUsersChart } from ".";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chart-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Cell: () => null,
}));

describe("TopUsersChart", () => {
  it("renders chart container with data", () => {
    render(
      <MemoryRouter>
        <TopUsersChart topUsers={mockTopUsers} isError={false} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    expect(screen.getByText("Top Requests by Window")).toBeInTheDocument();
  });

  it("shows error state message", () => {
    render(
      <MemoryRouter>
        <TopUsersChart topUsers={[]} isError={true} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Failed to load chart data")).toBeInTheDocument();
  });

  it("shows empty state when no topUsers", () => {
    render(
      <MemoryRouter>
        <TopUsersChart topUsers={[]} isError={false} />
      </MemoryRouter>,
    );
    expect(screen.getByText("No active windows")).toBeInTheDocument();
  });
});
