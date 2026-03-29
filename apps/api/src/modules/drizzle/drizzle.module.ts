import { Module } from "@nestjs/common";
import { DrizzleProvider } from "./drizzle.provider.js";
import { DrizzleService } from "./drizzle.service.js";

@Module({
  providers: [DrizzleProvider, DrizzleService],
  exports: [DrizzleService],
})
export class DrizzleModule {}
