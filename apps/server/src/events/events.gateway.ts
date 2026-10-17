import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RateLimitEvent } from "../lib/types/index.js";

@WebSocketGateway({ cors: { origin: "*" } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  async emitRateEvent(event: RateLimitEvent) {
    const sockets = await this.server.fetchSockets();
    console.log(`[Gateway] emitting rate:event to ${sockets.length} connected clients`);
    this.server.emit("rate:event", event);
  }

  handleConnection(client: Socket) {
    console.log(`[Server] -> Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Server] -> Client disconnected: ${client.id}`);
  }
}
