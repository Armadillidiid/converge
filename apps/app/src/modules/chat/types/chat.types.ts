export interface ChatRoom {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoomWithLastMessage extends ChatRoom {
  lastMessage?: {
    id: string;
    content: string;
    senderName: string;
    createdAt: string;
  };
}

export interface ChatMember {
  id: string;
  roomId: string;
  userId: string;
  role: "owner" | "member";
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  content: string;
  createdAt: string;
}

export interface ChatInvitation {
  id: string;
  roomId: string;
  inviterId: string;
  inviteeId: string;
  status: "pending" | "accepted" | "declined" | "expired";
  expiresAt: string;
  createdAt: string;
  room: {
    id: string;
    name: string;
  };
  inviter: {
    id: string;
    name: string;
  };
}

export interface NewMessageEvent {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  content: string;
  createdAt: string;
}

export interface PresenceEvent {
  userId: string;
  userName: string;
  roomId: string;
  status: "online" | "offline";
}

export interface TypingEvent {
  userId: string;
  userName: string;
  roomId: string;
  isTyping: boolean;
}
