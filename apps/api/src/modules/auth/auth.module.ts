import { Module } from "@nestjs/common";
import { createAuth } from "@repo/auth/server";
import { VerifyEmailTemplate, ResetPasswordTemplate } from "@repo/email";
import { getQueueToken } from "@nestjs/bullmq";
import { DrizzleModule } from "../drizzle/drizzle.module.js";
import { DrizzleService } from "../drizzle/drizzle.service.js";
import { BetterAuthModule } from "../better-auth/auth.module.js";
import { RedisModule } from "../redis/redis.module.js";
import { RedisService } from "../redis/redis.service.js";
import { type AppConfig } from "#src/app.config.js";
import { ConfigService } from "@nestjs/config";
import type { Queue } from "bullmq";
import { EmailModule } from "../email/email.module.js";
import { EMAIL_QUEUE } from "../email/queue/email.processor.js";
import type { SignUpEmailDto, ResetPasswordEmailDto } from "../email/index.js";

/**
 * App-level auth module.
 * Wires the Better Auth instance to the NestJS DI container using DrizzleService.
 *
 * The request handler is mounted in bootstrap.ts via:
 *   app.use('/api/auth', toNodeHandler(authService.instance))
 */
@Module({
  imports: [
    BetterAuthModule.forRootAsync({
      imports: [DrizzleModule, RedisModule, EmailModule],
      inject: [
        DrizzleService,
        RedisService,
        getQueueToken(EMAIL_QUEUE),
        ConfigService,
      ],
      useFactory: (
        _drizzle: DrizzleService,
        redis: RedisService,
        emailQueue: Queue,
        configService: ConfigService<AppConfig>,
      ) => ({
        auth: createAuth({
          db: _drizzle.db,
          redis: redis.redis,
          socialProviders: {
            google: {
              clientId: configService.getOrThrow<string>("GOOGLE_CLIENT_ID", {
                infer: true,
              }),
              clientSecret: configService.getOrThrow<string>(
                "GOOGLE_CLIENT_SECRET",
                { infer: true },
              ),
            },
          },
          trustedOrigins: configService.getOrThrow("APP_TRUSTED_ORIGINS", {
            infer: true,
          }),
          emailAndPassword: {
            enabled: true,
            requireEmailVerification: true,
            sendResetPassword: async ({ user, token }) => {
              await emailQueue.add(ResetPasswordTemplate.displayName, {
                email: user.email,
                hash: token,
              } satisfies ResetPasswordEmailDto);
            },
          },
          emailVerification: {
            sendOnSignUp: true,
            sendOnSignIn: true,
            autoSignInAfterVerification: true,
            sendVerificationEmail: async ({ user, token }) => {
              await emailQueue.add(VerifyEmailTemplate.displayName, {
                userId: user.id,
                email: user.email,
                hash: token,
              } satisfies SignUpEmailDto);
            },
          },
        }),
      }),
    }),
  ],
  exports: [BetterAuthModule],
})
export class AuthModule {}
