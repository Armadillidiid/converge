import { ChatView } from "./chat.view";
import { RoomListSidebar } from "./components/room-list-sidebar";

type ChatIdViewProps = {
  roomId: string;
};

export const ChatIdView = ({ roomId }: ChatIdViewProps) => {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <RoomListSidebar activeRoomId={roomId} onRoomSelect={() => {}} />
      <div className="flex-1">
        <ChatView />
      </div>
    </div>
  );
};
