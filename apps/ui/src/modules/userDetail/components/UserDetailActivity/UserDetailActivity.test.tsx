import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../../test/renderWithProviders";
import { UserDetailActivity } from ".";

vi.mock("../../hooks/useActivityData", () => ({
  useActivityData: () => ({
    activityBuckets: [
      { timestamp: "2026-10-18T12:00:00Z", allowed: 10, rejected: 2 },
      { timestamp: "2026-10-18T12:01:00Z", allowed: 15, rejected: 0 },
    ],
    isLoading: false,
    isError: false,
  }),
}));

describe("UserDetailActivity", () => {
  it("renders with data-testid", () => {
    renderWithProviders(<UserDetailActivity userId="test-user" />);
    expect(screen.getByTestId("user-detail-activity")).toBeInTheDocument();
  });

  it("shows activity heading", () => {
    renderWithProviders(<UserDetailActivity userId="test-user" />);
    expect(
      screen.getByText("Activity · requests per minute")
    ).toBeInTheDocument();
  });

  it("has range toggle buttons", () => {
    renderWithProviders(<UserDetailActivity userId="test-user" />);
    expect(screen.getByText("Past hour")).toBeInTheDocument();
    expect(screen.getByText("Past day")).toBeInTheDocument();
  });

  it("shows legend items", () => {
    renderWithProviders(<UserDetailActivity userId="test-user" />);
    expect(screen.getByText("Allowed")).toBeInTheDocument();
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });

  it("renders recharts BarChart", () => {
    renderWithProviders(<UserDetailActivity userId="test-user" />);
    expect(
      screen.getByRole("region", { name: "Activity history" })
    ).toBeInTheDocument();
    expect(
      document.querySelector(".recharts-responsive-container")
    ).toBeInTheDocument();
  });

  it("shows auto-refresh dropdown", () => {
    renderWithProviders(<UserDetailActivity userId="test-user" />);
    const refreshSelect = screen.getByLabelText("Auto-refresh interval");
    expect(refreshSelect).toBeInTheDocument();
    expect(refreshSelect).toHaveValue("off");
  });

  it("allows changing auto-refresh option", () => {
    renderWithProviders(<UserDetailActivity userId="test-user" />);
    const refreshSelect = screen.getByLabelText("Auto-refresh interval");
    fireEvent.change(refreshSelect, { target: { value: "30s" } });
    expect(refreshSelect).toHaveValue("30s");
  });
});
