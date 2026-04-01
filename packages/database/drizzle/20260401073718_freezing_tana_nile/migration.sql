CREATE TABLE "chat_message_summary" (
	"id" text PRIMARY KEY,
	"room_id" text NOT NULL,
	"content" text NOT NULL,
	"start_message_id" text,
	"end_message_id" text,
	"token_count" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "chat_message_summary_room_id_idx" ON "chat_message_summary" ("room_id");--> statement-breakpoint
CREATE INDEX "chat_message_summary_room_created_idx" ON "chat_message_summary" ("room_id","created_at");--> statement-breakpoint
ALTER TABLE "chat_message_summary" ADD CONSTRAINT "chat_message_summary_room_id_chat_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "chat_room"("id") ON DELETE CASCADE;