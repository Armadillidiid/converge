import { Inject, Injectable } from "@nestjs/common";
import { createDrizzle } from "@repo/database";
import { PG_CONNECTION } from "./drizzle.provider.js";

export type DrizzleDb = ReturnType<typeof createDrizzle>;

@Injectable()
export class DrizzleService {
  readonly db: DrizzleDb;

  constructor(@Inject(PG_CONNECTION) db: DrizzleDb) {
    this.db = db;
  }
}
