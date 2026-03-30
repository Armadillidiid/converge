import { Inject, Logger, Module } from "@nestjs/common";
import type { DynamicModule, OnModuleInit } from "@nestjs/common";
import {
  type ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  type OPTIONS_TYPE,
  type AuthModuleOptions,
} from "./auth-module-definition.js";
import { AuthService } from "./auth.service.js";
import { AuthGuard } from "./guards/auth.guard.js";
import { SocketIOAuthService } from "./guards/socket-io-auth.service.js";
import { SocketIOAuthGuard } from "./guards/socket-io-auth.guard.js";
import { MODULE_OPTIONS_TOKEN } from "./constants.js";

/**
 * Vendored NestJS module for Better Auth (HTTP only).
 *
 * Stripped from @thallesp/nestjs-better-auth:
 *   - No GraphQL support
 *   - No WebSocket support
 *   - No Express body parser middleware (app bootstraps with bodyParser:false)
 *   - No hook system (@BeforeHook / @AfterHook)
 *   - No org/admin role decorators
 *   - No CORS override (handled in bootstrap.ts)
 *   - Not global — import it in whichever module needs it
 *
 * The Better Auth request handler is NOT mounted here.
 * Mount it in bootstrap.ts via: app.use('/api/auth', toNodeHandler(authService.instance))
 *
 * Export AuthGuard from this module and apply it yourself where needed,
 * either as a controller-level guard or via APP_GUARD in a specific module.
 */
@Module({
  providers: [AuthService, AuthGuard, SocketIOAuthService, SocketIOAuthGuard],
  exports: [
    AuthService,
    AuthGuard,
    SocketIOAuthService,
    SocketIOAuthGuard,
    MODULE_OPTIONS_TOKEN,
  ],
})
export class BetterAuthModule
  extends ConfigurableModuleClass
  implements OnModuleInit
{
  private readonly logger = new Logger(BetterAuthModule.name);

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: AuthModuleOptions,
  ) {
    super();
  }

  onModuleInit(): void {
    this.logger.log(`BetterAuthModule initialized`);
  }

  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    return super.forRoot(options);
  }

  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return super.forRootAsync(options);
  }
}
