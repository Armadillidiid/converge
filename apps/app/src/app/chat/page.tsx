import { redirect, RedirectType } from "next/navigation";
import { ChatView } from "@modules/chat";
import { auth } from "@/shared/lib/auth";
import { readAuthTokenFromServerCookies } from "@/shared/lib/auth-token-cookie.server";

export default async function ChatPage() {
  const token = await readAuthTokenFromServerCookies();
  const session = await auth.getSession({
    fetchOptions: {
      auth: { type: "Bearer", token },
    },
  });
  if (!session) {
    console.log("SESSION", session);
    redirect("/auth/sign-in", RedirectType.replace);
  }

  return <ChatView />;
}
