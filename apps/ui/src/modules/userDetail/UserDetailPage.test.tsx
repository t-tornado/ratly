import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "../../providers/ThemeProvider";
import { SocketContext } from "../../lib/hooks/useSocket";
import type { Socket } from "socket.io-client";
import UserDetailPage from ".";

const MOCK_SOCKET = {
  on: () => {},
  off: () => {},
  connect: () => {},
  disconnect: () => {},
} as unknown as Socket;

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SocketContext value={{ socket: MOCK_SOCKET, isConnected: false }}>
          <MemoryRouter initialEntries={["/users/usr_test123"]}>
            <Routes>
              <Route path="/users/:userId" element={<UserDetailPage />} />
            </Routes>
          </MemoryRouter>
        </SocketContext>
      </ThemeProvider>
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
