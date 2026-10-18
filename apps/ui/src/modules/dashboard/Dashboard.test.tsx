import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithProviders } from "../../test/renderWithProviders";
import { mockStats, mockRows } from "../../test/fixtures";

vi.mock("../../lib/api/admin", () => ({
  fetchDashboard: vi.fn().mockResolvedValue({ stats: mockStats, rows: mockRows }),
}));

vi.mock("./hooks/useAdminActions", () => ({
  useAdminActions: () => ({
    resetWindowMutation: { mutate: vi.fn() },
    adjustLimitMutation: { mutate: vi.fn() },
    resetLimitMutation: { mutate: vi.fn() },
    addExtraMutation: { mutate: vi.fn() },
    pauseMutation: { mutate: vi.fn() },
    unlockMutation: { mutate: vi.fn() },
  }),
}));

const { default: DashboardPage } = await import("./index");

beforeEach(() => {
  vi.clearAllMocks();
});

function renderPage() {
  return renderWithProviders(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );
}

describe("DashboardPage", () => {
  it("renders without crashing", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  it("shows user rows from API response", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(mockRows[0].userId)).toBeInTheDocument();
    });
  });

  it("shows stat counts from API response", async () => {
    renderPage();
    await waitFor(() => {
      expect(
        screen.getAllByText(String(mockStats.totalUsers)).length
      ).toBeGreaterThan(0);
    });
  });

  it("renders dashboard page structure", async () => {
    renderPage();
    expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
    expect(screen.getByTestId("page-header")).toBeInTheDocument();
  });

  it("renders dashboard content layout", async () => {
    renderPage();
    expect(screen.getByTestId("dashboard-content")).toBeInTheDocument();
  });

  it("renders users table", async () => {
    renderPage();
    expect(screen.getByTestId("dashboard-users-table")).toBeInTheDocument();
  });

  it("opens action menu for a row when the action button is clicked", async () => {
    renderPage();
    const firstRow = mockRows[0];
    await waitFor(() => {
      expect(screen.getByText(firstRow.userId)).toBeInTheDocument();
    });
    const actionButton = screen.getByRole("button", {
      name: `Admin actions for ${firstRow.userId}`,
    });
    act(() => {
      fireEvent.pointerDown(actionButton, { button: 0, ctrlKey: false });
      fireEvent.pointerUp(actionButton, { button: 0 });
      fireEvent.click(actionButton);
    });
    await waitFor(() => {
      expect(screen.getByText("Reset window")).toBeInTheDocument();
    });
  });
});
