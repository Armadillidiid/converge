import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BullMqModule } from "../bullmq/bullmq.module.js";
import { EmailModule } from "../email/email.module.js";
import { appConfig } from "../../app.config.js";

/**
 * Root module for the standalone worker process.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [appConfig],
    }),
    BullMqModule,
    EmailModule,
  ],
})
export class WorkerModule {}
