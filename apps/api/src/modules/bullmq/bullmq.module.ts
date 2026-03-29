import { Global, Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";
import type { AppConfig } from "../../app.config.js";

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
  ],
  exports: [BullModule],
})
export class BullMqModule {}
