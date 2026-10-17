import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { DashboardStatsService } from "../services/dashboard/dashboard-stats.service.js";
import { UserRow, DashboardStats } from "../lib/types/index.js";
import { STATS_INTERVAL_MS } from "../lib/constants.js";

@WebSocketGateway({ cors: { origin: "*" } })
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy
{
  @WebSocketServer()
  server!: Server;

  private statsTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly dashboardStatsService: DashboardStatsService) {}

  onModuleInit() {
    this.statsTimer = setInterval(async () => {
      const stats = await this.dashboardStatsService.getStats();
      this.emitDashboardStats(stats);
    }, STATS_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.statsTimer) {
      clearInterval(this.statsTimer);
      this.statsTimer = null;
    }
  }

  emitRateUpdate(row: UserRow) {
    this.server.emit("rate:update", { type: "rate:update", row });
  }

  emitLimitExceeded(row: UserRow) {
    this.server.emit("rate:limit_exceeded", { type: "rate:limit_exceeded", row });
  }

  emitDashboardStats(stats: DashboardStats) {
    this.server.emit("dashboard_stats:update", { type: "dashboard_stats:update", stats });
  }

  handleConnection(_client: Socket) {}

  handleDisconnect(_client: Socket) {}
}
