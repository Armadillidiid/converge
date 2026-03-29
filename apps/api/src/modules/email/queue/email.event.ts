import {
  OnQueueEvent,
  QueueEventsHost,
  QueueEventsListener,
} from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { EMAIL_QUEUE } from "./email.processor.js";

@Injectable()
@QueueEventsListener(EMAIL_QUEUE)
export class EmailQueueEvents extends QueueEventsHost {
  @OnQueueEvent("active")
  onActive(
    args: {
      jobId: string;
      prev?: string;
    },
    id: string,
  ) {
    console.log(
      `Active event on ${EMAIL_QUEUE} with id: ${id} and args: ${JSON.stringify(args)}`,
    );
  }

  @OnQueueEvent("completed")
  onCompleted(
    args: {
      jobId: string;
      returnvalue: string;
      prev?: string;
    },
    id: string,
  ) {
    console.log(
      `Completed event on ${EMAIL_QUEUE} with id: ${id} and args: ${JSON.stringify(args)}`,
    );
  }

  @OnQueueEvent("failed")
  onFailed(
    args: {
      jobId: string;
      failedReason: string;
      prev?: string;
    },
    id: string,
  ) {
    console.log(
      `Failed event on ${EMAIL_QUEUE} with id: ${id} and args: ${JSON.stringify(args)}`,
    );
  }
}
