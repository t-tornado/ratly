import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { SocketContext } from "../../lib/hooks/useSocket";

/**
 * Top-level WebSocket provider — single connection shared by all consumers.
 *
 * Creates one Socket.IO client at mount, exposes it via {@link SocketContext}.
 * Every hook that needs real-time data ({@link useRowEventStore},
 * {@link useUserDetailStats}, {@link useUserDetailEvents}) reads from
 * this shared instance — no per-hook connections.
 *
 * @see useSocket — context accessor hook
 * @see useRowEventStore — dashboard table subscriber
 * @see useUserDetailStats — single-user stat subscriber
 */

const SOCKET_URL = import.meta.env.VITE_API_URL;

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket] = useState<Socket>(() => io(SOCKET_URL, { autoConnect: false }));
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onError = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onError);

    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onError);
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext value={{ socket, isConnected }}>
      {children}
    </SocketContext>
  );
}

export type { SocketProviderProps };
