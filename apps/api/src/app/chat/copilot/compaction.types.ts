import { z } from "zod";

export const COMPACTION_QUEUE = "compaction-queue";
export const COMPACTION_JOB = "compaction";

export const compactionJobSchema = z.object({
  roomId: z.string().uuid(),
});

export type CompactionJob = z.infer<typeof compactionJobSchema>;

export const SENDER_ID_COMPACTOR = "compactor";
