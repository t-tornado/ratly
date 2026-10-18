import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { AdminService } from "../../services/admin/admin.service.js";
import { EventsGateway } from "../../events/events.gateway.js";
import { SkipRateLimit } from "../../services/rate-limit/skip-rate-limit.decorator.js";

@Controller("admin/users")
@SkipRateLimit()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Get(":id")
  async getUser(@Param("id") userId: string) {
    return this.adminService.getUser(userId);
  }

  @Post(":id/reset")
  async resetWindow(@Param("id") userId: string) {
    const row = await this.adminService.resetWindow(userId);
    this.eventsGateway.emitRateUpdate(row);
    return row;
  }

  @Put(":id/limit")
  async adjustLimit(@Param("id") userId: string, @Body("limit") limit: number) {
    const row = await this.adminService.adjustLimit(userId, limit);
    this.eventsGateway.emitRateUpdate(row);
    return row;
  }

  @Delete(":id/limit")
  async resetLimitToDefault(@Param("id") userId: string) {
    const row = await this.adminService.resetLimitToDefault(userId);
    this.eventsGateway.emitRateUpdate(row);
    return row;
  }

  @Post(":id/extra")
  async addExtra(@Param("id") userId: string, @Body("amount") amount: number) {
    const row = await this.adminService.addExtra(userId, amount);
    this.eventsGateway.emitRateUpdate(row);
    return row;
  }

  @Post(":id/pause")
  async pause(@Param("id") userId: string, @Body("seconds") seconds: number) {
    const row = await this.adminService.pause(userId, seconds);
    this.eventsGateway.emitRateUpdate(row);
    return row;
  }

  @Delete(":id/pause")
  async unlock(@Param("id") userId: string) {
    const row = await this.adminService.unlock(userId);
    this.eventsGateway.emitRateUpdate(row);
    return row;
  }
}
