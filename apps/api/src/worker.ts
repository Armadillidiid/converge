import "reflect-metadata";
import "dotenv/config";

import { NestFactory } from "@nestjs/core";
import { WorkerModule } from "./modules/worker/worker.module.js";

async function run(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();
  console.log("Worker started — processing jobs...");
}

run().catch((error: Error) => {
  console.error("Worker failed to start:", error.message);
  process.exit(1);
});
