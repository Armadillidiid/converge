import { Injectable, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { render } from "@repo/email";
import nodemailer from "nodemailer";
import type { AppConfig } from "../../../app.config.js";

@Injectable()
export class NodeMailerService {
  private readonly transporter: nodemailer.Transporter;

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService<AppConfig>,
  ) {
    const smtpURL = this.configService.getOrThrow("SMTP_URL", { infer: true });

    this.transporter = nodemailer.createTransport({
      url: smtpURL,
    });
  }

  async sendMail({
    template,
    mailOptions,
  }: {
    template: React.JSX.Element;
    mailOptions: nodemailer.SendMailOptions;
  }): Promise<void> {
    const html = await render(template);

    const defaultEmail = this.configService.getOrThrow("SMTP_FROM_EMAIL", {
      infer: true,
    });
    const defaultName = this.configService.getOrThrow("SMTP_FROM_NAME", {
      infer: true,
    });

    await this.transporter.sendMail({
      ...mailOptions,
      from: mailOptions.from
        ? mailOptions.from
        : `"${defaultName}" <${defaultEmail}>`,
      html: mailOptions.html ? mailOptions.html : html,
    });
  }
}
