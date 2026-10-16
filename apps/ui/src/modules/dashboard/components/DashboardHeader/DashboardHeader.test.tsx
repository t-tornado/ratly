import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardHeader } from ".";

describe("DashboardHeader", () => {
  it("renders with data-testid", () => {
    render(<DashboardHeader isConnected />);
    expect(screen.getByTestId("dashboard-header")).toBeInTheDocument();
  });

  it("contains PageHeader", () => {
    render(<DashboardHeader isConnected />);
    expect(screen.getByTestId("page-header")).toBeInTheDocument();
  });

  it("contains the Logo SVG", () => {
    render(<DashboardHeader isConnected />);
    expect(screen.getByLabelText("Ratly logo")).toBeInTheDocument();
  });

  it("contains the ratly wordmark", () => {
    render(<DashboardHeader isConnected />);
    expect(screen.getByText("ratly")).toBeInTheDocument();
  });

  it("shows LIVE status when connected", () => {
    render(<DashboardHeader isConnected />);
    expect(screen.getByText("LIVE · ws connected")).toBeInTheDocument();
  });

  it("shows disconnected when not connected", () => {
    render(<DashboardHeader isConnected={false} />);
    expect(screen.getByText("disconnected")).toBeInTheDocument();
  });

  it("does not render env badge, nav links, or config text", () => {
    render(<DashboardHeader isConnected />);
    expect(screen.queryByText("prod")).not.toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByText("Audit log")).not.toBeInTheDocument();
    expect(screen.queryByText(/req \/ hour/)).not.toBeInTheDocument();
  });
});
