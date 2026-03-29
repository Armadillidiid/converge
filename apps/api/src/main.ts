import "reflect-metadata";
import "dotenv/config";

import type { NestExpressApplication } from "@nestjs/platform-express";
import { bootstrap } from "./bootstrap.js";
import type { Express } from "express";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ConfigService } from "@nestjs/config";
import type { AppConfig } from "./app.config.js";

/**
 * Singleton Class to manage the NestJS App instance.
 * Ensures we only initialize the app once per container lifecycle.
 */
class NestServer {
  private static server: Express;

  private constructor() {}

  /**
   * Returns the cached server instance.
   * If it doesn't exist, it creates, bootstraps, and initializes it.
   */
  public static async getInstance(): Promise<Express> {
    if (!NestServer.server) {
      const app = await createNestApp();

      // Execute bootstrap (Pipes, Interceptors, CORS, etc.)
      await bootstrap(app);

      // Initialize the app (connects to DB, resolves modules)
      await app.init();

      NestServer.server = app.getHttpAdapter().getInstance();
    }
    return NestServer.server;
  }
}

/**
 * App factory
 */
export async function createNestApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Disable NestJS's built-in body parser to allow raw request body handling
    bodyParser: false,
  });

  return app;
}

async function run(): Promise<void> {
  const app = await createNestApp();
  try {
    await bootstrap(app);
    const config = app.get(ConfigService<AppConfig, true>);
    const port = config.getOrThrow("APP_PORT", { infer: true });

    await app.listen(port, "0.0.0.0");
    console.log(`Application started locally on port: ${port}`);
  } catch (error) {
    console.error("Application crashed during local startup", { error });
  }
}

run().catch((error: Error) => {
  console.error("Failed to start API:", error.message);
  process.exit(1);
});
