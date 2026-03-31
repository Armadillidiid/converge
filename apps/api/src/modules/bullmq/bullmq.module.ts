import { Global, Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";
import type { AppConfig } from "../../app.config.js";
import { BullBoardModule } from "@bull-board/nestjs";
import { ExpressAdapter } from "@bull-board/express";
import basicAuth from "express-basic-auth";

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService<AppConfig>) => {
        const url = configService.getOrThrow<string>("REDIS_URL", {
          infer: true,
        });

        return {
          connection: { url },
        };
      },
      inject: [ConfigService],
    }),
    BullBoardModule.forRoot({
      route: "/queues",
      adapter: ExpressAdapter,
      middleware: basicAuth({
        challenge: true,
        users: {
          admin: process.env["BULL_BOARD_PASSWORD"] ?? "admin",
        },
      }),
    }),
  ],
  exports: [BullModule],
})
export class BullMqModule {}
