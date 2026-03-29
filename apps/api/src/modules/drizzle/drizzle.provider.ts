import type { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createDrizzle } from "@repo/database";
import type { AppConfig } from "../../app.config.js";

export const PG_CONNECTION = "PG_CONNECTION";

async function drizzleFactory(configService: ConfigService<AppConfig, true>) {
  const driver = configService.get("DB_DRIVER", { infer: true });
  const url = configService.get("DB_URL", { infer: true });
  const auroraDb = configService.get("DB_DATABASE", { infer: true });
  const auroraSecretArn = configService.get("DB_SECRET_ARN", { infer: true });
  const auroraResourceArn = configService.get("DB_RESOURCE_ARN", {
    infer: true,
  });

  return createDrizzle({
    DB_DRIVER: driver,
    DB_URL: url,
    DB_DATABASE: auroraDb,
    DB_SECRET_ARN: auroraSecretArn,
    DB_RESOURCE_ARN: auroraResourceArn,
  });
}

export const DrizzleProvider: Provider = {
  provide: PG_CONNECTION,
  inject: [ConfigService],
  useFactory: drizzleFactory,
};
