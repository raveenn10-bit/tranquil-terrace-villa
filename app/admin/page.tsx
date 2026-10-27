import { getChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { isAdminUserId } from "@/lib/admin-auth";
import AdminDashboard from "./admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getChatGPTUser();
  const live = isAdminUserId(user?.userId);

  return (
    <AdminDashboard
      live={live}
      displayName={live ? user?.displayName ?? "Owner" : "Client preview"}
      authHref={live ? chatGPTSignOutPath("/admin") : chatGPTSignInPath("/admin")}
    />
  );
}
