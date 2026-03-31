import { Inject, Injectable } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import type { Socket } from "socket.io";
import { type AuthModuleOptions } from "../auth-module-definition.js";
import { MODULE_OPTIONS_TOKEN } from "../constants.js";
import type { UserSession } from "./auth.guard.js";

interface AuthenticatedSocket extends Socket {
  data: {
    session: UserSession;
  };
}

@Injectable()
export class SocketIOAuthService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: AuthModuleOptions,
  ) {}

  async authenticateClient(client: AuthenticatedSocket): Promise<UserSession> {
    const token = client.handshake?.auth?.["token"];

    if (!token) {
      throw new WsException("No token found in auth");
    }

    const session = await this.options.auth.api.getSession({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (!session) {
      throw new WsException("No session found");
    }

    client.data.session = session;

    return session;
  }
}
