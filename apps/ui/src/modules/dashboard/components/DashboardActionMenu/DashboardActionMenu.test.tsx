import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DEFAULT_LIMIT } from "@ratly/core";
import { DashboardActionMenu } from ".";
import { mockUserRow, mockPausedRow, mockCustomLimitRow } from "../../../../test/fixtures";

const NOOP_CALLBACKS = {
  onClose: vi.fn(),
  onResetWindow: vi.fn(),
  onAddExtra: vi.fn(),
  onAdjustLimit: vi.fn(),
  onResetLimit: vi.fn(),
  onPause: vi.fn(),
  onUnlock: vi.fn(),
};

describe("DashboardActionMenu", () => {
  it("renders without crash", () => {
    render(<DashboardActionMenu row={mockUserRow} {...NOOP_CALLBACKS} />);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("shows 'Pause throttling' when row is not paused", () => {
    render(<DashboardActionMenu row={mockUserRow} {...NOOP_CALLBACKS} />);
    expect(screen.getByText("Pause throttling")).toBeInTheDocument();
  });

  it("shows 'Resume throttling' when row.paused is true", () => {
    render(<DashboardActionMenu row={mockPausedRow} {...NOOP_CALLBACKS} />);
    expect(screen.getByText("Resume throttling")).toBeInTheDocument();
  });

  it("hides 'Reset to default' when row.limit equals DEFAULT_LIMIT", () => {
    expect(mockUserRow.limit).toBe(DEFAULT_LIMIT);
    render(<DashboardActionMenu row={mockUserRow} {...NOOP_CALLBACKS} />);
    expect(screen.queryByText("Reset to default")).not.toBeInTheDocument();
  });

  it("shows 'Reset to default' when row.limit differs from DEFAULT_LIMIT", () => {
    expect(mockCustomLimitRow.limit).not.toBe(DEFAULT_LIMIT);
    render(<DashboardActionMenu row={mockCustomLimitRow} {...NOOP_CALLBACKS} />);
    expect(screen.getByText("Reset to default")).toBeInTheDocument();
  });

  it("renders all standard action items", () => {
    render(<DashboardActionMenu row={mockUserRow} {...NOOP_CALLBACKS} />);
    expect(screen.getByText("Reset window")).toBeInTheDocument();
    expect(screen.getByText("Add extra requests")).toBeInTheDocument();
    expect(screen.getByText("Adjust limit")).toBeInTheDocument();
  });
});
