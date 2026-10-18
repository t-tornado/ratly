import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../test/renderWithProviders";
import { DashboardHeader } from ".";

const DEFAULT_PROPS = { isConnected: true, isError: false, onRetry: vi.fn() };

describe("DashboardHeader", () => {
  it("renders with data-testid", () => {
    renderWithProviders(<DashboardHeader {...DEFAULT_PROPS} />);
    expect(screen.getByTestId("dashboard-header")).toBeInTheDocument();
  });

  it("contains PageHeader", () => {
    renderWithProviders(<DashboardHeader {...DEFAULT_PROPS} />);
    expect(screen.getByTestId("page-header")).toBeInTheDocument();
  });

  it("contains the Logo SVG", () => {
    renderWithProviders(<DashboardHeader {...DEFAULT_PROPS} />);
    expect(screen.getByLabelText("Ratly logo")).toBeInTheDocument();
  });

  it("contains the ratly wordmark", () => {
    renderWithProviders(<DashboardHeader {...DEFAULT_PROPS} />);
    expect(screen.getByText("Ratly Console")).toBeInTheDocument();
  });

  it("shows LIVE status when connected", () => {
    renderWithProviders(<DashboardHeader {...DEFAULT_PROPS} />);
    expect(screen.getByText("LIVE · ws connected")).toBeInTheDocument();
  });

  it("shows disconnected when not connected", () => {
    renderWithProviders(<DashboardHeader {...DEFAULT_PROPS} isConnected={false} />);
    expect(screen.getByText("disconnected")).toBeInTheDocument();
  });

  it("shows retry button when fetch error", () => {
    renderWithProviders(<DashboardHeader {...DEFAULT_PROPS} isError />);
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("does not render env badge, nav links, or config text", () => {
    renderWithProviders(<DashboardHeader {...DEFAULT_PROPS} />);
    expect(screen.queryByText("prod")).not.toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByText("Audit log")).not.toBeInTheDocument();
    expect(screen.queryByText(/req \/ hour/)).not.toBeInTheDocument();
  });
});
