import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { ConfigService } from "@nestjs/config";
import { Logger, PinoLogger } from "nestjs-pino";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  app.useLogger(app.get(Logger));
  app.enableCors({ origin: "*" });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3000);
  const env = process.env.NODE_ENV ?? "development";

  await app.listen(port, "0.0.0.0");

  const logger = app.get(PinoLogger);
  logger.info({ port, env, nodeVersion: process.versions.node }, "Server:Bootstrap [Success]");
}

bootstrap().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Server:Bootstrap [Failed]", { error: message });
  process.exit(1);
});
