import { auth } from "@/shared/lib/auth";
import { redirect, RedirectType } from "next/navigation";
import { ChatIdView } from "@/modules/chat/chat-id.view";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const session = await auth.getSession();
  if (!session) {
    redirect("/auth/sign-in", RedirectType.replace);
  }

  return <ChatIdView roomId={roomId} />;
}
