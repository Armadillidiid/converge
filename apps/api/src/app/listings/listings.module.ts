import { Module } from "@nestjs/common";
import { DrizzleModule } from "#src/modules/drizzle/drizzle.module.js";
import { ListingsController } from "./listings.controller.js";
import { ListingsService } from "./listings.service.js";

@Module({
  imports: [DrizzleModule],
  controllers: [ListingsController],
  providers: [ListingsService],
})
export class ListingsModule {}
