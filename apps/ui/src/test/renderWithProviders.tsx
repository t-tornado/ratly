import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "../providers/ThemeProvider";
import { SocketContext } from "../lib/hooks/useSocket";
import type { Socket } from "socket.io-client";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

const MOCK_SOCKET = {
  on: () => {},
  off: () => {},
  connect: () => {},
  disconnect: () => {},
} as unknown as Socket;

const MOCK_SOCKET_CONTEXT = { socket: MOCK_SOCKET, isConnected: false };

function AllProviders({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SocketContext value={MOCK_SOCKET_CONTEXT}>
          {children}
        </SocketContext>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}
