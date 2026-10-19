import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { ConfigService } from "@nestjs/config";
import { Logger, PinoLogger } from "nestjs-pino";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const allowedOrigin = configService.get<string>("ALLOWED_ORIGIN", "http://localhost:5173");
  app.enableCors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  const port = configService.get<number>("PORT", 3000);
  const env = process.env.NODE_ENV ?? "development";

  await app.listen(port, "0.0.0.0");

  const logger = await app.resolve(PinoLogger);
  logger.info(
    { port, env, allowedOrigin, nodeVersion: process.versions.node },
    "Server:Bootstrap [Success]",
  );
}

bootstrap().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Server:Bootstrap [Failed]", { error: message });
  process.exit(1);
});
