import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { getSession } from "better-auth/api";
import { fromNodeHeaders } from "better-auth/node";
import type { Server, Socket } from "socket.io";
import { type AuthModuleOptions } from "../auth-module-definition.js";
import { MODULE_OPTIONS_TOKEN } from "../constants.js";
import type { UserSession } from "./auth.guard.js";

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    userName: string;
  };
}

@Injectable()
export class SocketIOAuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector)
    private readonly reflector: Reflector,
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: AuthModuleOptions,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let headers: Record<string, string | string[]> = {};

    try {
      const client = context.switchToWs().getClient<AuthenticatedSocket>();
      const handshakeHeaders = client.handshake?.headers;
      if (handshakeHeaders) {
        headers = Object.fromEntries(
          Object.entries(handshakeHeaders).map(([k, v]) => [
            k,
            Array.isArray(v) ? v : (v ?? ""),
          ]),
        );
      }
    } catch {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: "Unable to extract handshake headers",
      });
    }

    const session: UserSession | null = await this.options.auth.api.getSession({
      headers: fromNodeHeaders(headers),
    });

    if (!session) {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      });
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>("PUBLIC", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return true;
  }
}
