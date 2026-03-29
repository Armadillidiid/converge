import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const schema = z.object({
  DB_DRIVER: z.union([z.literal("aurora-data-api"), z.literal("postgres")]),
  DB_URL: z.string().min(1).optional(),
  DB_DATABASE: z.string().min(1).optional(),
  DB_SECRET_ARN: z.string().min(1).optional(),
  DB_RESOURCE_ARN: z.string().min(1).optional(),
});

export const keys = () =>
  createEnv({
    server: schema.shape,
    runtimeEnv: {
      DB_DRIVER: process.env["DB_DRIVER"],
      DB_URL: process.env["DB_URL"],
      DB_DATABASE: process.env["DB_DATABASE"],
      DB_SECRET_ARN: process.env["DB_SECRET_ARN"],
      DB_RESOURCE_ARN: process.env["DB_RESOURCE_ARN"],
    },
  });
