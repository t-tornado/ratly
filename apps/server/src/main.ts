import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new FastifyAdapter({
      logger: {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      },
    }),
  );

  app.enableCors({ origin: "*" });

  await app.listen(3000);
}

bootstrap();
