import { SetMetadata, createParamDecorator } from "@nestjs/common";
import type { CustomDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Allows unauthenticated (anonymous) access to a route or controller.
 * The AuthGuard will skip authentication checks entirely.
 */
export const AllowAnonymous = (): CustomDecorator<string> =>
  SetMetadata("PUBLIC", true);

/**
 * Marks a route or controller as having optional authentication.
 * The AuthGuard allows the request to proceed even if no session is present.
 * The session will be null if not authenticated.
 */
export const OptionalAuth = (): CustomDecorator<string> =>
  SetMetadata("OPTIONAL", true);

/**
 * Specifies user-level roles required to access a route or controller.
 * Checks the `user.role` field (from Better Auth's admin plugin).
 *
 * @param roles - The roles required for access
 */
export const Roles = (roles: string[]): CustomDecorator =>
  SetMetadata("ROLES", roles);

/**
 * Parameter decorator that extracts the user session from the HTTP request.
 */
export const Session: ReturnType<typeof createParamDecorator> =
  createParamDecorator((_data: unknown, context: ExecutionContext): unknown => {
    const request = context.switchToHttp().getRequest();
    return request.session;
  });
