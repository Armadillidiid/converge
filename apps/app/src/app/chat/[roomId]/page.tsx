import { auth } from "@/shared/lib/auth";
import { redirect, RedirectType } from "next/navigation";
import { ChatIdView } from "@/modules/chat/chat-id.view";
import { readAuthTokenFromServerCookies } from "@/shared/lib/auth-token-cookie.server";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const token = await readAuthTokenFromServerCookies();
  const { data: session } = await auth.getSession({
    fetchOptions: {
      auth: { type: "Bearer", token },
    },
  });
  if (!session) {
    redirect("/auth/sign-in", RedirectType.replace);
  }

  return <ChatIdView roomId={roomId} />;
}
