import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { VerifyEmailTemplate, ResetPasswordTemplate } from "@repo/email";
import type { Job } from "bullmq";
import { signUpEmailSchema, resetPasswordEmailSchema } from "../index.js";
import { EmailService } from "../services/email.service.js";

export const EMAIL_QUEUE = "email-queue";

@Injectable()
@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case VerifyEmailTemplate.displayName: {
        await this.sendEmailVerification(job);
        break;
      }
      case ResetPasswordTemplate.displayName: {
        await this.sendResetPasswordEmail(job);
        break;
      }
      default:
        throw new Error(
          `Unknown job name '${job.name ?? "unknown"}' with ID '${job.id ?? "unknown"}'`,
        );
    }
  }

  async sendEmailVerification(job: Job) {
    const data = signUpEmailSchema.parse(job.data);
    await this.emailService.signUp(data);
  }

  async sendResetPasswordEmail(job: Job) {
    const data = resetPasswordEmailSchema.parse(job.data);
    await this.emailService.resetPassword(data);
  }

  @OnWorkerEvent("completed")
  onCompleted() {
    console.log("Job completed");
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job | undefined, error: Error) {
    const jobName = job?.name ?? "unknown job";
    const jobId = job?.id ?? "unknown ID";

    console.error(
      `Job ${jobName} with ID of ${jobId} failed with error: ${error.message}`,
    );
  }
}
