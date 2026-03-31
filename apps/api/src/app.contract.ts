import { chatContract } from "./app/chat/chat.contract.js";
import * as chatEvents from "./app/chat/chat-events.js";

export const router = {
  chat: chatContract,
};

export const commonSchemas = {
  ClientToServerEventName: { schema: chatEvents.clientToServerEventNameEnum },
  ServerToClientEventName: { schema: chatEvents.serverToClientEventNameEnum },
  wsJoinRoomInput: { schema: chatEvents.wsJoinRoomInputSchema },
  wsLeaveRoomInput: { schema: chatEvents.wsLeaveRoomInputSchema },
  wsSendMessageInput: { schema: chatEvents.wsSendMessageInputSchema },
  wsTypingInput: { schema: chatEvents.wsTypingInputSchema },
  wsMessageNewOutput: { schema: chatEvents.wsMessageNewOutputSchema },
  wsUserPresenceOutput: { schema: chatEvents.wsUserPresenceOutputSchema },
  wsUserTypingOutput: { schema: chatEvents.wsUserTypingOutputSchema },
  wsErrorOutput: { schema: chatEvents.wsErrorOutputSchema },
};
