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

  it("wraps content in PageSection", () => {
    renderPage();
    expect(screen.getByTestId("page-section")).toBeInTheDocument();
  });

  it("renders dashboard stats row", () => {
    renderPage();
    expect(screen.getByTestId("dashboard-stats")).toBeInTheDocument();
  });

  it("shows all 3 stat card labels", () => {
    renderPage();
    expect(screen.getByText("Total users")).toBeInTheDocument();
    expect(screen.getByText(/Near limit/)).toBeInTheDocument();
    expect(screen.getByText("429s today")).toBeInTheDocument();
  });

  it("does not show admin overrides card", () => {
    renderPage();
    expect(screen.queryByText(/admin override/i)).not.toBeInTheDocument();
  });

  it("applies error accent to 429s card value", () => {
    renderPage();
    const statsRow = screen.getByTestId("dashboard-stats");
    const cards = statsRow.querySelectorAll("[class*='bg-']");
    const rateLimitCard = Array.from(cards).find((card) =>
      card.textContent?.includes("429s today")
    );
    const valueLine = rateLimitCard?.querySelector("[class*='color-error-text']");
    expect(valueLine).toBeTruthy();
  });

  it("applies warning accent to near limit card value", () => {
    renderPage();
    const statsRow = screen.getByTestId("dashboard-stats");
    const cards = statsRow.querySelectorAll("[class*='bg-']");
    const nearLimitCard = Array.from(cards).find((card) =>
      card.textContent?.includes("Near limit")
    );
    const valueLine = nearLimitCard?.querySelector("[class*='color-warning-text']");
    expect(valueLine).toBeTruthy();
  });

  it("applies success color to active users sub text", () => {
    renderPage();
    const statsRow = screen.getByTestId("dashboard-stats");
    const successElement = statsRow.querySelector("[class*='color-success-text']");
    expect(successElement).toBeTruthy();
  });

  it("does not apply color accent to total users value", () => {
    renderPage();
    const statsRow = screen.getByTestId("dashboard-stats");
    const cards = statsRow.querySelectorAll("[class*='bg-']");
    const totalUsersCard = Array.from(cards).find((card) =>
      card.textContent?.includes("Total users")
    );
    const valueDiv = totalUsersCard?.querySelector("[class*='text-\\[32px\\]']");
    expect(valueDiv?.className).not.toContain("color-error-text");
    expect(valueDiv?.className).not.toContain("color-warning-text");
    expect(valueDiv?.className).not.toContain("color-success-text");
  });

  it("renders dashboard content layout", () => {
    renderPage();
    expect(screen.getByTestId("dashboard-content")).toBeInTheDocument();
  });

  it("renders users table", () => {
    renderPage();
    expect(screen.getByTestId("dashboard-users-table")).toBeInTheDocument();
  });

  it("renders top users chart", () => {
    renderPage();
    expect(screen.getByTestId("dashboard-top-users")).toBeInTheDocument();
  });

  it("renders live events feed", () => {
    renderPage();
    expect(screen.getByTestId("dashboard-live-events")).toBeInTheDocument();
  });
});
