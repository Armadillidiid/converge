import { redisStorage } from "@better-auth/redis-storage";
import { schema } from "@repo/database";
import { drizzleAdapter, type DB } from "better-auth/adapters/drizzle";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { type Redis } from "ioredis";
import { plugins } from "./plugins.js";

type Options = {
  db: DB;
  redis: Redis;
} & Omit<BetterAuthOptions, "secondaryStorage" | "database">;

export function createAuth({
  db,
  redis,
  emailAndPassword,
  ...options
}: Options) {
  return betterAuth({
    ...options,
    verification: {
      ...options.verification,
      storeInDatabase: options.verification?.storeInDatabase ?? true,
    },
    session: {
      ...options.session,
      storeSessionInDatabase: options.session?.storeSessionInDatabase ?? true,
    },
    secondaryStorage: redisStorage({
      client: redis,
    }),
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    emailAndPassword: {
      ...emailAndPassword,
      enabled: emailAndPassword?.enabled ?? true,
    },
    plugins: [...(options.plugins ?? plugins)],
  });
}

export type Auth = ReturnType<typeof createAuth>;
