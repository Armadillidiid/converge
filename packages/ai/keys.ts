import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const schema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_BASE_URL: z.string().min(1),
});

export const keys = () =>
  createEnv({
    server: schema.shape,
    runtimeEnv: {
      OPENAI_API_KEY: process.env["OPENAI_API_KEY"],
      OPENAI_BASE_URL: process.env["OPENAI_BASE_URL"],
    },
  });
