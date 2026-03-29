import { Injectable, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { VerifyEmailTemplate, ResetPasswordTemplate } from "@repo/email";
import type { SignUpEmailDto, ResetPasswordEmailDto } from "../index.js";
import type { AppConfig } from "../../../app.config.js";
import { NodeMailerService } from "./nodemailer.service.js";

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: NodeMailerService,
    @Inject(ConfigService)
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  async signUp(props: SignUpEmailDto) {
    const frontendURL = this.configService.getOrThrow("APP_FRONTEND_URL", {
      infer: true,
    });
    const verifyURL = new URL("/auth/verify-email", frontendURL);
    verifyURL.searchParams.append("token", props.hash);

    const subject = "Confirm your email";

    const template = VerifyEmailTemplate({
      email: props.email,
      hash: props.hash,
    });

    await this.mailerService.sendMail({
      template,
      mailOptions: {
        to: props.email,
        subject,
        text: `Confirm your email: ${verifyURL.toString()}`,
      },
    });
  }

  async resetPassword(props: ResetPasswordEmailDto) {
    const frontendURL = this.configService.getOrThrow("APP_FRONTEND_URL", {
      infer: true,
    });
    const resetURL = new URL("/auth/reset-password", frontendURL);
    resetURL.searchParams.append("token", props.hash);

    const subject = "Reset your password";

    const template = ResetPasswordTemplate({
      email: props.email,
      hash: props.hash,
    });

    await this.mailerService.sendMail({
      template,
      mailOptions: {
        to: props.email,
        subject,
        text: `Reset your password: ${resetURL.toString()}`,
      },
    });
  }
}
