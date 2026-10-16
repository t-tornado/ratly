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
    expect(
      screen.getByText("Event stream · usr_3e88d1")
    ).toBeInTheDocument();
  });

  it("shows event type labels", () => {
    render(<UserDetailEvents />);
    expect(screen.getAllByText("rate:update")).toHaveLength(5);
    expect(screen.getByText("rate:limit_exceeded")).toBeInTheDocument();
    expect(screen.getByText("admin:reset")).toBeInTheDocument();
  });

  it("shows event descriptions", () => {
    render(<UserDetailEvents />);
    expect(
      screen.getByText("blocked · retry at 13:04:40")
    ).toBeInTheDocument();
    expect(
      screen.getByText("window cleared by admin@spikerz")
    ).toBeInTheDocument();
  });
});
