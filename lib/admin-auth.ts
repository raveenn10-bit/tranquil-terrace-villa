import { getChatGPTUser, chatGPTSignInPath } from "@/app/chatgpt-auth";
import { redirect } from "next/navigation";

const ADMIN_USER_IDS = new Set(["95dfcb1a-261e-4eb7-b813-b3347928b034"]);

export function isAdminUserId(userId: string | null | undefined) {
  return Boolean(userId && ADMIN_USER_IDS.has(userId));
}

export async function requireAdmin(returnTo = "/admin") {
  const user = await getChatGPTUser();
  if (!user) redirect(chatGPTSignInPath(returnTo));
  if (!isAdminUserId(user.userId)) redirect("/");
  return user;
}

export function isAdminRequest(request: Request) {
  const userId = request.headers.get("oai-authenticated-user-id");
  return isAdminUserId(userId);
}
