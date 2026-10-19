import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { mockRows, createMockRowEventStore } from "../../../../test/fixtures";
import { DashboardUsersTable } from ".";

vi.mock("../../../../lib/hooks/useMediaQuery", () => ({
  useMediaQuery: vi.fn(() => false),
}));

vi.mock("../../../../lib/hooks/useDebouncedSearch", () => ({
  useDebouncedSearch: () => ({ searchQuery: "", onSearchChange: vi.fn() }),
}));

const mockMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
};

vi.mock("../../hooks/useAdminActions", () => ({
  useAdminActions: () => ({
    resetWindowMutation: mockMutation,
    addExtraMutation: mockMutation,
    adjustLimitMutation: mockMutation,
    resetLimitMutation: mockMutation,
    pauseMutation: mockMutation,
    unlockMutation: mockMutation,
  }),
}));

describe("DashboardUsersTable", () => {
  it("renders rows from store", () => {
    const store = createMockRowEventStore(mockRows);
    render(
      <MemoryRouter>
        <DashboardUsersTable store={store} isConnected={true} />
      </MemoryRouter>,
    );
    expect(screen.getByText("usr_ok")).toBeInTheDocument();
    expect(screen.getByText("usr_warning")).toBeInTheDocument();
  });

  it("shows footer with row count", () => {
    const store = createMockRowEventStore(mockRows);
    render(
      <MemoryRouter>
        <DashboardUsersTable store={store} isConnected={true} />
      </MemoryRouter>,
    );
    expect(screen.getByText(`${mockRows.length} of ${mockRows.length} shown`)).toBeInTheDocument();
  });

  it("renders filter bar", () => {
    const store = createMockRowEventStore(mockRows);
    render(
      <MemoryRouter>
        <DashboardUsersTable store={store} isConnected={true} />
      </MemoryRouter>,
    );
    expect(screen.getByPlaceholderText("Search user ID…")).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
  });
});
