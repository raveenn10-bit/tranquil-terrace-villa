import { isServerAdminAuthenticated } from "@/lib/admin-auth";
import AdminDashboard from "./admin-dashboard";
import AdminLoginForm from "./admin-login-form";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authenticated = await isServerAdminAuthenticated();
  if (!authenticated) {
    return <AdminLoginForm />;
  }

  return (
    <AdminDashboard
      live={true}
      displayName="Admin"
      authHref="/api/admin/logout"
    />
  );
}
