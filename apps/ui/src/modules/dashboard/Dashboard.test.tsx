import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DashboardPage from ".";

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/"]}>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("DashboardPage", () => {
  it("renders with data-testid", () => {
    renderPage();
    expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
  });

  it("contains PageHeader", () => {
    renderPage();
    expect(screen.getByTestId("page-header")).toBeInTheDocument();
  });

  it("shows Logo", () => {
    renderPage();
    expect(screen.getByLabelText("Ratly logo")).toBeInTheDocument();
  });

  it("contains dashboard content area", () => {
    renderPage();
    expect(screen.getByTestId("dashboard-content")).toBeInTheDocument();
  });
});
