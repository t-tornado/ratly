import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { DEFAULT_LIMIT } from "@ratly/core";
import { DashboardActionMenu } from ".";
import { mockUserRow, mockPausedRow, mockCustomLimitRow } from "../../../../test/fixtures";

const NOOP_CALLBACKS = {
  onResetWindow: vi.fn(),
  onAddExtra: vi.fn(),
  onAdjustLimit: vi.fn(),
  onResetLimit: vi.fn(),
  onPause: vi.fn(),
  onUnlock: vi.fn(),
};

function openActionMenu(userId: string) {
  const trigger = screen.getByRole("button", { name: `Admin actions for ${userId}` });
  act(() => {
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
    fireEvent.pointerUp(trigger, { button: 0 });
    fireEvent.click(trigger);
  });
}

describe("DashboardActionMenu", () => {
  it("renders trigger button without crash", () => {
    render(<DashboardActionMenu row={mockUserRow} {...NOOP_CALLBACKS} />);
    expect(
      screen.getByRole("button", { name: `Admin actions for ${mockUserRow.userId}` })
    ).toBeInTheDocument();
  });

  it("shows 'Start throttling' when row is not paused", () => {
    render(<DashboardActionMenu row={mockUserRow} {...NOOP_CALLBACKS} />);
    openActionMenu(mockUserRow.userId);
    expect(screen.getByText("Start throttling")).toBeInTheDocument();
  });

  it("shows 'Pause throttling' when row.paused is true", () => {
    render(<DashboardActionMenu row={mockPausedRow} {...NOOP_CALLBACKS} />);
    openActionMenu(mockPausedRow.userId);
    expect(screen.getByText("Pause throttling")).toBeInTheDocument();
  });

  it("hides 'Reset to default' when row.limit equals DEFAULT_LIMIT", () => {
    expect(mockUserRow.limit).toBe(DEFAULT_LIMIT);
    render(<DashboardActionMenu row={mockUserRow} {...NOOP_CALLBACKS} />);
    openActionMenu(mockUserRow.userId);
    expect(screen.queryByText("Reset to default")).not.toBeInTheDocument();
  });

  it("shows 'Reset to default' when row.limit differs from DEFAULT_LIMIT", () => {
    expect(mockCustomLimitRow.limit).not.toBe(DEFAULT_LIMIT);
    render(<DashboardActionMenu row={mockCustomLimitRow} {...NOOP_CALLBACKS} />);
    openActionMenu(mockCustomLimitRow.userId);
    expect(screen.getByText("Reset to default")).toBeInTheDocument();
  });

  it("renders all standard action items", () => {
    render(<DashboardActionMenu row={mockUserRow} {...NOOP_CALLBACKS} />);
    openActionMenu(mockUserRow.userId);
    expect(screen.getByText("Reset window")).toBeInTheDocument();
    expect(screen.getByText("Add extra requests")).toBeInTheDocument();
    expect(screen.getByText("Adjust limit")).toBeInTheDocument();
  });
});
