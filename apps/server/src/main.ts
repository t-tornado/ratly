import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const isDev = process.env.NODE_ENV !== "production";
  const app = await NestFactory.create(
    AppModule,
    new FastifyAdapter({
      logger: isDev
        ? { transport: { target: "pino-pretty", options: { colorize: true } } }
        : true,
    }),
  );

  app.enableCors({ origin: "*" });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3000);
  await app.listen(port, "0.0.0.0");
}

bootstrap();
