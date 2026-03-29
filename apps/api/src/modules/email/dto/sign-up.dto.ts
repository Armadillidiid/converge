import { z } from "zod";

export const signUpEmailSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  hash: z.string(),
});

export type SignUpEmailDto = z.infer<typeof signUpEmailSchema>;
