import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
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

  constructor(
    private readonly dashboardStatsService: DashboardStatsService,
    @InjectPinoLogger(EventsGateway.name) private readonly logger: PinoLogger,
  ) {}

  onModuleInit() {
    this.statsTimer = setInterval(async () => {
      const stats = await this.dashboardStatsService.getStats();
      this.emitDashboardStats(stats);
    }, STATS_INTERVAL_MS);

    this.logger.info({ intervalMs: STATS_INTERVAL_MS }, "WS:StatsTimer [Start]");
  }

  onModuleDestroy() {
    if (this.statsTimer) {
      clearInterval(this.statsTimer);
      this.statsTimer = null;
    }
    this.logger.info("WS:StatsTimer [Stop]");
  }

  emitRateUpdate(row: UserRow) {
    this.server.emit(RATE_UPDATE_EVENT, { type: RATE_UPDATE_EVENT, row });
    this.logger.debug({ event: RATE_UPDATE_EVENT, userId: row.userId }, "WS:Emit [Success]");
  }

  emitLimitExceeded(row: UserRow) {
    this.server.emit(RATE_LIMIT_EXCEEDED_EVENT, { type: RATE_LIMIT_EXCEEDED_EVENT, row });
    this.logger.debug({ event: RATE_LIMIT_EXCEEDED_EVENT, userId: row.userId }, "WS:Emit [Success]");
  }

  emitDashboardStats(stats: DashboardStats) {
    this.server.emit(DASHBOARD_STATS_UPDATE_EVENT, { type: DASHBOARD_STATS_UPDATE_EVENT, stats });
    this.logger.debug({ event: DASHBOARD_STATS_UPDATE_EVENT }, "WS:Emit [Success]");
  }

  handleConnection(client: Socket) {
    const totalClients = this.server.engine.clientsCount;
    this.logger.info({ clientId: client.id, totalClients }, "WS:Client [Connect]");
  }

  handleDisconnect(client: Socket) {
    const totalClients = this.server.engine.clientsCount;
    this.logger.info({ clientId: client.id, totalClients }, "WS:Client [Disconnect]");
  }
}
