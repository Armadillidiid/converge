import { Inject, Injectable } from "@nestjs/common";
import type { Socket } from "socket.io";
import { type AuthModuleOptions } from "../auth-module-definition.js";
import { MODULE_OPTIONS_TOKEN } from "../constants.js";
import type { UserSession } from "./auth.guard.js";

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    userName: string;
    session?: UserSession;
  };
}

@Injectable()
export class SocketIOAuthService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: AuthModuleOptions,
  ) {}

  async authenticateClient(
    client: AuthenticatedSocket,
  ): Promise<UserSession | null> {
    const token = client.handshake?.auth?.["token"];
    console.log("Socket auth token:", token);

    if (!token) {
      console.log("No token found in auth for client:", client.id);
      return null;
    }

    const session: UserSession | null = await this.options.auth.api.getSession({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (!session) {
      console.log("No session found for client:", client.id);
      return null;
    }

    client.data.session = session;
    client.data.userId = session.user.id;
    client.data.userName = session.user.name;

    return session;
  }
}
