import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import type { Socket } from "socket.io-client";
import { useSocket, SocketContext } from "./useSocket";
import { ContextNotFoundError } from "../errors";

const MOCK_SOCKET = {
  on: vi.fn(),
  off: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
} as unknown as Socket;

describe("useSocket", () => {
  it("throws ContextNotFoundError outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useSocket())).toThrow(ContextNotFoundError);
    spy.mockRestore();
  });

  it("returns socket and isConnected when inside provider", () => {
    const contextValue = { socket: MOCK_SOCKET, isConnected: true };

    function wrapper({ children }: { children: ReactNode }) {
      return (
        <SocketContext value={contextValue}>{children}</SocketContext>
      );
    }

    const { result } = renderHook(() => useSocket(), { wrapper });

    expect(result.current.socket).toBe(MOCK_SOCKET);
    expect(result.current.isConnected).toBe(true);
  });
});
