import { createContext, useContext } from "react";
import type { Socket } from "socket.io-client";
import { ContextNotFoundError } from "../errors";

interface SocketContextValue {
  socket: Socket;
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextValue | null>(null);

/**
 * Access the shared Socket.IO instance from {@link SocketProvider}.
 *
 * Returns the socket and connection status. Throws if called
 * outside SocketProvider — never returns null at runtime.
 *
 * @throws {ContextNotFoundError} When used outside SocketProvider
 * @see SocketProvider — owns the connection lifecycle
 */
export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);

  if (context === null) {
    throw new ContextNotFoundError({ hookName: "useSocket", providerName: "SocketProvider" });
  }

  return context;
}
