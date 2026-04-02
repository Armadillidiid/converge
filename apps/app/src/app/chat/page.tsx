import { redirect, RedirectType } from "next/navigation";
import { ChatView } from "@modules/chat";
import { auth } from "@/shared/lib/auth";
import { readBearerTokenFromServerCookies } from "@/shared/lib/auth-token-cookie.server";

export default async function ChatPage() {
  const token = await readBearerTokenFromServerCookies();
  const { data: session } = await auth.getSession({
    fetchOptions: {
      auth: { type: "Bearer", token },
    },
  });

  if (!session) {
    redirect("/auth/sign-in", RedirectType.replace);
  }

  return <ChatView />;
}
