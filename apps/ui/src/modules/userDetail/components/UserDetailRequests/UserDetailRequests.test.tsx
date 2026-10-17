import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserDetailRequests } from ".";

const EXPECTED_ROW_COUNT = 7;

describe("UserDetailRequests", () => {
  it("renders with data-testid", () => {
    render(<UserDetailRequests />);
    expect(screen.getByTestId("user-detail-requests")).toBeInTheDocument();
  });

  it("shows section heading", () => {
    render(<UserDetailRequests />);
    expect(screen.getByText("Recent requests")).toBeInTheDocument();
  });

  it("renders correct number of rows", () => {
    render(<UserDetailRequests />);
    const rows = screen.getAllByRole("row");
    // +1 for header row
    expect(rows).toHaveLength(EXPECTED_ROW_COUNT + 1);
  });

  it("shows 429 status codes in error color", () => {
    render(<UserDetailRequests />);
    const errorCells = screen
      .getAllByText("429")
      .filter((el) => el.className.includes("text-error"));
    expect(errorCells).toHaveLength(2);
  });
});
