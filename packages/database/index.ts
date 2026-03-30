import * as schema from "./schemas/schema.js";
import { schema as dbSchema } from "./keys.js";
import { z } from "zod";
import { drizzle as dAurora } from "drizzle-orm/aws-data-api/pg";
import { drizzle as dPostgres } from "drizzle-orm/node-postgres";

export type { NodePgDatabase } from "drizzle-orm/node-postgres";

export async function createDrizzle(config: z.infer<typeof dbSchema>) {
  if (config.DB_DRIVER === "aurora-data-api") {
    return dAurora({
      connection: {
        database: config.DB_DATABASE!,
        secretArn: config.DB_SECRET_ARN!,
        resourceArn: config.DB_RESOURCE_ARN!,
      },
      schema,
    });
  }

  return dPostgres(config.DB_URL!, {
    schema,
  });
}

export { schema }; // Don't import from here. Prefer importing from "./schemas/schema.js" directly
export * from "drizzle-orm";
export * from "drizzle-orm/zod";
