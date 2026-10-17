import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserDetailEvents } from ".";

describe("UserDetailEvents", () => {
  it("renders with data-testid", () => {
    render(<UserDetailEvents />);
    expect(screen.getByTestId("user-detail-events")).toBeInTheDocument();
  });

  it("shows section heading", () => {
    render(<UserDetailEvents />);
    expect(screen.getByText("Event stream")).toBeInTheDocument();
  });
});
