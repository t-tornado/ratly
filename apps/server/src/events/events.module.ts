import { Module } from "@nestjs/common";
import { EventsGateway } from "./events.gateway.js";

@Module({
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
