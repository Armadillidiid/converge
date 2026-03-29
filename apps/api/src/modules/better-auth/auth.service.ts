import { Inject, Injectable } from "@nestjs/common";
import type { Auth } from "@repo/auth/server";
import { type AuthModuleOptions } from "./auth-module-definition.js";
import { MODULE_OPTIONS_TOKEN } from "./constants.js";

/**
 * Provides access to the Better Auth instance within NestJS DI.
 * Use generics to type auth instances extended by plugins.
 */
@Injectable()
export class AuthService<T extends { api: T["api"] } = Auth> {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: AuthModuleOptions<T>,
  ) {}

  /**
   * Returns the API endpoints provided by the Better Auth instance.
   */
  get api(): T["api"] {
    return this.options.auth.api;
  }

  /**
   * Returns the complete Better Auth instance.
   */
  get instance(): T {
    return this.options.auth;
  }
}
