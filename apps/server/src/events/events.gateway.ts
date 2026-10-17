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
import { RATE_UPDATE_EVENT, RATE_LIMIT_EXCEEDED_EVENT, DASHBOARD_STATS_UPDATE_EVENT } from "@ratly/core";

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
    this.server.emit(RATE_UPDATE_EVENT, { type: RATE_UPDATE_EVENT, row });
  }

  emitLimitExceeded(row: UserRow) {
    this.server.emit(RATE_LIMIT_EXCEEDED_EVENT, { type: RATE_LIMIT_EXCEEDED_EVENT, row });
  }

  emitDashboardStats(stats: DashboardStats) {
    this.server.emit(DASHBOARD_STATS_UPDATE_EVENT, { type: DASHBOARD_STATS_UPDATE_EVENT, stats });
  }

  handleConnection(_client: Socket) {}

  handleDisconnect(_client: Socket) {}
}
