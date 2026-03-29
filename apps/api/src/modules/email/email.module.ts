import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { EmailService } from "./services/email.service.js";
import { NodeMailerService } from "./services/nodemailer.service.js";
import { EmailProcessor, EMAIL_QUEUE } from "./queue/email.processor.js";
import { EmailQueueEvents } from "./queue/email.event.js";

@Module({
  imports: [BullModule.registerQueue({ name: EMAIL_QUEUE })],
  providers: [
    NodeMailerService,
    EmailService,
    EmailProcessor,
    EmailQueueEvents,
  ],
  exports: [EmailService, BullModule],
})
export class EmailModule {}
