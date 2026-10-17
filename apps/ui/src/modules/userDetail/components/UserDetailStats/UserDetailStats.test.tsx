import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserDetailStats } from ".";

describe("UserDetailStats", () => {
  it("renders with data-testid", () => {
    render(<UserDetailStats />);
    expect(screen.getByTestId("user-detail-stats")).toBeInTheDocument();
  });

  it("shows all 5 stat labels", () => {
    render(<UserDetailStats />);
    expect(screen.getByText("Remaining")).toBeInTheDocument();
    expect(screen.getByText("Resets in")).toBeInTheDocument();
    expect(screen.getByText("Current window")).toBeInTheDocument();
    expect(screen.getByText("Last reset")).toBeInTheDocument();
    expect(screen.getByText("429s today")).toBeInTheDocument();
  });

  it("shows stat values", () => {
    render(<UserDetailStats />);
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("4m 02s")).toBeInTheDocument();
    expect(screen.getByText("136")).toBeInTheDocument();
    expect(screen.getByText("13:11:58")).toBeInTheDocument();
    expect(screen.getByText("47")).toBeInTheDocument();
  });

  it("applies warning accent to Remaining card", () => {
    render(<UserDetailStats />);
    const statsRow = screen.getByTestId("user-detail-stats");
    const cards = statsRow.querySelectorAll("[class*='bg-']");
    const remainingCard = Array.from(cards).find((card) =>
      card.textContent?.includes("Remaining")
    );
    const valueLine = remainingCard?.querySelector(
      "[class*='text-warning-text']"
    );
    expect(valueLine).toBeTruthy();
  });

  it("applies error accent to Current window card", () => {
    render(<UserDetailStats />);
    const statsRow = screen.getByTestId("user-detail-stats");
    const cards = statsRow.querySelectorAll("[class*='bg-']");
    const windowCard = Array.from(cards).find((card) =>
      card.textContent?.includes("Current window")
    );
    const valueLine = windowCard?.querySelector(
      "[class*='text-error-text']"
    );
    expect(valueLine).toBeTruthy();
  });
});
