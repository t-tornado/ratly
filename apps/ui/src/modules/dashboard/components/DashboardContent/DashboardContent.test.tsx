import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { mockRows, createMockRowEventStore } from "../../../../test/fixtures";
import { DashboardContent } from ".";

const mockMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
};

vi.mock("../../../../lib/hooks", () => ({
  useMediaQuery: () => false,
  useDebouncedSearch: () => ({ searchQuery: "", onSearchChange: vi.fn() }),
  useSocket: () => ({ socket: { on: vi.fn(), off: vi.fn() }, isConnected: true }),
}));

vi.mock("../../hooks/useAdminActions", () => ({
  useAdminActions: () => ({
    handleResetWindow: vi.fn(),
    handleAdjustLimit: vi.fn(),
    handleResetLimit: vi.fn(),
    handleAddExtra: vi.fn(),
    handlePauseUser: vi.fn(),
    handleUnlockUser: vi.fn(),
    resetWindowMutation: mockMutation,
    addExtraMutation: mockMutation,
    adjustLimitMutation: mockMutation,
    resetLimitMutation: mockMutation,
    pauseMutation: mockMutation,
    unlockMutation: mockMutation,
  }),
}));

describe("DashboardContent", () => {
  it("renders DashboardUsersTable with store prop", () => {
    const store = createMockRowEventStore(mockRows);
    render(
      <MemoryRouter>
        <DashboardContent store={store} isLoading={false} isConnected={true} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("dashboard-content")).toBeInTheDocument();
  });
});
