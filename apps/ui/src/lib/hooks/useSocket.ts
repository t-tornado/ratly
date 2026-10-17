import { createContext, useContext } from "react";
import type { Socket } from "socket.io-client";
import { ContextNotFoundError } from "../errors";

interface SocketContextValue {
  socket: Socket;
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextValue | null>(null);

export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);

  if (context === null) {
    throw new ContextNotFoundError({ hookName: "useSocket", providerName: "SocketProvider" });
  }

  return context;
}
