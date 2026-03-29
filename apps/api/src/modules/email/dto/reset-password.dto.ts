import { z } from "zod";

export const resetPasswordEmailSchema = z.object({
  email: z.string().email(),
  hash: z.string(),
});

export type ResetPasswordEmailDto = z.infer<typeof resetPasswordEmailSchema>;
