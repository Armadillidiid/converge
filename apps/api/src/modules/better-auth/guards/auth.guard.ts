import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { getSession } from "better-auth/api";
import { fromNodeHeaders } from "better-auth/node";
import { type AuthModuleOptions } from "../auth-module-definition.js";
import { MODULE_OPTIONS_TOKEN } from "../constants.js";

/**
 * Type representing a valid user session after authentication.
 * Excludes null and undefined from the session return type.
 */
export type BaseUserSession = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getSession>>>
>;

export type UserSession = BaseUserSession & {
  user: BaseUserSession["user"] & {
    role?: string | string[];
  };
};

/**
 * Verifies that the incoming request carries a valid Better Auth session.
 *
 * Attach to a controller or route with @UseGuards(AuthGuard).
 *
 * Routes can opt out via:
 *   @AllowAnonymous() — skip the check entirely
 *   @OptionalAuth()   — allow unauthenticated, but attach session if present
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector)
    private readonly reflector: Reflector,
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: AuthModuleOptions,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const session: UserSession | null = await this.options.auth.api.getSession({
      headers: fromNodeHeaders(request.headers ?? {}),
    });

    request.session = session;
    // Attach user for observability tools (e.g. Sentry)
    request.user = session?.user ?? null;

    const isPublic = this.reflector.getAllAndOverride<boolean>("PUBLIC", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const isOptional = this.reflector.getAllAndOverride<boolean>("OPTIONAL", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!session && isOptional) return true;

    if (!session) {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      });
    }

    return true;
  }
}
