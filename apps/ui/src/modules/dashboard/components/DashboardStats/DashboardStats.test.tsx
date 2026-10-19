import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { mockStats } from "../../../../test/fixtures";
import { DashboardStats } from ".";

describe("DashboardStats", () => {
  it("renders stat items from stats data", () => {
    render(<DashboardStats stats={mockStats} isLoading={false} isError={false} />);
    expect(screen.getByText("Total users")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("renders loading placeholder values", () => {
    render(<DashboardStats stats={null} isLoading={true} isError={false} />);
    expect(screen.getByText("Total users")).toBeInTheDocument();
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });
});
