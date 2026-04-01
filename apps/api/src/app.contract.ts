import { chatContract } from "./app/chat/chat.contract.js";
import * as chatEvents from "./app/chat/chat-events.contract.js";
import { aiVoiceContract } from "./app/ai/ai-voice.contract.js";

export const router = {
  chat: chatContract,
  ai: aiVoiceContract,
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
