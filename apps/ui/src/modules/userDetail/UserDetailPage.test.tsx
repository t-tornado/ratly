import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UserDetailPage from ".";

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/users/usr_test123"]}>
        <Routes>
          <Route path="/users/:userId" element={<UserDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("UserDetailPage", () => {
  it("renders with data-testid", () => {
    renderPage();
    expect(screen.getByTestId("user-detail-page")).toBeInTheDocument();
  });

  it("contains PageHeader", () => {
    renderPage();
    expect(screen.getByTestId("page-header")).toBeInTheDocument();
  });

  it("shows Logo", () => {
    renderPage();
    expect(screen.getByLabelText("Ratly logo")).toBeInTheDocument();
  });

  it("contains user detail content area", () => {
    renderPage();
    expect(screen.getByTestId("user-detail-content")).toBeInTheDocument();
  });
});
