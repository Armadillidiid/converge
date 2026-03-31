import { z } from "zod";
import { schema as dbSchema } from "@repo/database/keys";
import { schema as authSchema } from "@repo/auth/keys";
import { schema as aiSchema } from "@repo/ai/keys";

const PORT = 4448;
export const _API_PREFIX = "api";

const baseSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .optional()
    .default("development"),

  // App
  APP_PORT: z.coerce.number().int().positive().optional().default(PORT),
  APP_PREFIX: z.string().min(1).optional().default(_API_PREFIX),
  APP_FRONTEND_URL: z.string().min(1).optional().default("http://converge.co"),
  APP_BACKEND_URL: z
    .string()
    .min(1)
    .optional()
    .default(`http://localhost:${PORT}`),
  APP_TRUSTED_ORIGINS: z
    .string()
    .min(1)
    .optional()
    .transform((v) => v?.split(","))
    .default(["*"]),

  // Email
  SMTP_URL: z.string().min(1),
  SMTP_FROM_EMAIL: z.string().min(1).optional().default("hello@converge.co"),
  SMTP_FROM_NAME: z.string().min(1).optional().default("Converge"),

  // Redis
  REDIS_CACHE_TTL: z.coerce.number().int().positive(),
  REDIS_URL: z.string().min(1),

  // Rate limit
  RATE_LIMIT_TTL: z.coerce.number().int().positive().optional().default(60),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().optional().default(120),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
});

export const envSchema = baseSchema
  .extend(dbSchema.shape)
  .extend(authSchema.shape)
  .extend(aiSchema.shape)
  .refine(
    (v) =>
      !(
        (v.DB_DRIVER === "postgres" && !v.DB_URL) ||
        (v.DB_DRIVER === "aurora-data-api" &&
          (!v.DB_DATABASE || !v.DB_SECRET_ARN || !v.DB_RESOURCE_ARN))
      ),
    {
      message:
        "Invalid DB config: postgres requires DB_URL; aurora-data-api requires DB_DATABASE, DB_SECRET_ARN, DB_RESOURCE_ARN",
    },
  );

export type AppConfig = z.infer<typeof envSchema>;
export const env = () => {
  const out = envSchema.safeParse(process.env);
  if (process.env["SKIP_ENV_VALIDATION"]) {
    return process.env;
  }
  if (!out.success) {
    throw out.error;
  }
  return out.data;
};
