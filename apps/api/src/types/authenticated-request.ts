import type { UserSession } from "#src/modules/better-auth/guards/auth.guard.js";
import type { Request } from "express";

export interface AuthenticatedRequest extends Omit<
  Request,
  "params" | "user" | "session"
> {
  user?: UserSession["user"];
  session?: UserSession;
  params: {
    [key: string]: string | string[] | undefined;
  };
}
