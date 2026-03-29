import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { UserSession } from "./auth.guard.js";

/**
 * Enforces role-based access on routes that are already authenticated.
 *
 * Must be used together with AuthGuard (AuthGuard runs first and attaches
 * the session; RolesGuard reads it). Apply both with @UseGuards():
 *
 *   @UseGuards(AuthGuard, RolesGuard)
 *   @Roles(['admin'])
 *
 * Roles are checked against the `user.role` field from Better Auth's
 * admin plugin. A comma-separated string or an array are both accepted.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>("ROLES", [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() decorator — nothing to enforce
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const session: UserSession | null = request.session;

    if (!session) {
      // AuthGuard should have already rejected the request; this is a safeguard
      throw new ForbiddenException({
        code: "FORBIDDEN",
        message: "Insufficient permissions",
      });
    }

    const hasRole = this.matchesRequiredRole(session.user.role, requiredRoles);

    if (!hasRole) {
      throw new ForbiddenException({
        code: "FORBIDDEN",
        message: "Insufficient permissions",
      });
    }

    return true;
  }

  private matchesRequiredRole(
    role: string | string[] | undefined,
    requiredRoles: string[],
  ): boolean {
    if (!role) return false;
    if (Array.isArray(role)) return role.some((r) => requiredRoles.includes(r));
    return role.split(",").some((r) => requiredRoles.includes(r.trim()));
  }
}
