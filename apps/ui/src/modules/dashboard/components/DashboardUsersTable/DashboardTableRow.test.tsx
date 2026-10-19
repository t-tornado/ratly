import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMockRowEventStore, mockRows } from "../../../../test/fixtures";
import { DashboardTableRow } from "./DashboardTableRow";

vi.mock("../../../../lib/hooks/useMediaQuery", () => ({
  useMediaQuery: vi.fn(() => false),
}));

import { useMediaQuery } from "../../../../lib/hooks/useMediaQuery";

const mockedUseMediaQuery = vi.mocked(useMediaQuery);

const mockMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
};

const mockAdminActions = {
  resetWindowMutation: mockMutation,
  addExtraMutation: mockMutation,
  adjustLimitMutation: mockMutation,
  resetLimitMutation: mockMutation,
  pauseMutation: mockMutation,
  unlockMutation: mockMutation,
};

describe("DashboardTableRow", () => {
  it("returns null when row missing from store", () => {
    const store = createMockRowEventStore([]);
    const { container } = render(
      <DashboardTableRow
        userId="nonexistent"
        store={store}
        onRowClick={vi.fn()}
        adminActions={mockAdminActions}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders table variant on desktop", () => {
    mockedUseMediaQuery.mockReturnValue(false);
    const store = createMockRowEventStore(mockRows);
    render(
      <DashboardTableRow
        userId="usr_ok"
        store={store}
        onRowClick={vi.fn()}
        adminActions={mockAdminActions}
      />,
    );
    expect(screen.getByText("usr_ok")).toBeInTheDocument();
  });

  it("renders card variant on mobile", () => {
    mockedUseMediaQuery.mockReturnValue(true);
    const store = createMockRowEventStore(mockRows);
    render(
      <DashboardTableRow
        userId="usr_ok"
        store={store}
        onRowClick={vi.fn()}
        adminActions={mockAdminActions}
      />,
    );
    expect(screen.getByText("usr_ok")).toBeInTheDocument();
  });

  it("fires onRowClick", () => {
    mockedUseMediaQuery.mockReturnValue(false);
    const store = createMockRowEventStore(mockRows);
    const handleClick = vi.fn();
    render(
      <DashboardTableRow
        userId="usr_ok"
        store={store}
        onRowClick={handleClick}
        adminActions={mockAdminActions}
      />,
    );
    const row = screen.getByText("58 / 100").closest("tr")!;
    fireEvent.click(row);
    expect(handleClick).toHaveBeenCalled();
  });
});
