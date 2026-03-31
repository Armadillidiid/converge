import { relations } from "drizzle-orm/_relations";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./better-auth.js";

export const chatMemberRole = ["owner", "member"] as const;
export const chatInvitationStatus = [
  "pending",
  "accepted",
  "declined",
  "expired",
] as const;

export const chatRoom = pgTable(
  "chat_room",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("chat_room_owner_id_idx").on(table.ownerId)],
);

export const chatMember = pgTable(
  "chat_member",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    roomId: text("room_id")
      .notNull()
      .references(() => chatRoom.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role", { enum: chatMemberRole }).notNull().default("member"),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [
    index("chat_member_room_id_idx").on(table.roomId),
    index("chat_member_user_id_idx").on(table.userId),
  ],
);

export const chatMessage = pgTable(
  "chat_message",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    roomId: text("room_id")
      .notNull()
      .references(() => chatRoom.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("chat_message_room_id_idx").on(table.roomId),
    index("chat_message_sender_id_idx").on(table.senderId),
  ],
);

export const chatInvitation = pgTable(
  "chat_invitation",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    roomId: text("room_id")
      .notNull()
      .references(() => chatRoom.id, { onDelete: "cascade" }),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    inviteeId: text("invitee_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status", { enum: chatInvitationStatus })
      .notNull()
      .default("pending"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("chat_invitation_room_id_idx").on(table.roomId),
    index("chat_invitation_invitee_id_idx").on(table.inviteeId),
    index("chat_message_room_created_idx").on(table.roomId, table.createdAt),
  ],
);

export const chatRoomRelations = relations(chatRoom, ({ one, many }) => ({
  owner: one(user, {
    fields: [chatRoom.ownerId],
    references: [user.id],
  }),
  members: many(chatMember),
  messages: many(chatMessage),
  invitations: many(chatInvitation),
}));

export const chatMemberRelations = relations(chatMember, ({ one }) => ({
  room: one(chatRoom, {
    fields: [chatMember.roomId],
    references: [chatRoom.id],
  }),
  user: one(user, {
    fields: [chatMember.userId],
    references: [user.id],
  }),
}));

export const chatMessageRelations = relations(chatMessage, ({ one }) => ({
  room: one(chatRoom, {
    fields: [chatMessage.roomId],
    references: [chatRoom.id],
  }),
  sender: one(user, {
    fields: [chatMessage.senderId],
    references: [user.id],
  }),
}));

export const chatInvitationRelations = relations(chatInvitation, ({ one }) => ({
  room: one(chatRoom, {
    fields: [chatInvitation.roomId],
    references: [chatRoom.id],
  }),
  inviter: one(user, {
    fields: [chatInvitation.inviterId],
    references: [user.id],
  }),
  invitee: one(user, {
    fields: [chatInvitation.inviteeId],
    references: [user.id],
  }),
}));
