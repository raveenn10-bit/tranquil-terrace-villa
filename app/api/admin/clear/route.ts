import { isAdminRequest } from "@/lib/admin-auth";
import { serverClearAllData } from "@/lib/supabase-server";

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Owner access required." }, { status: 403 });
  }

  try {
    await serverClearAllData();
    return Response.json({ success: true, message: "All database records cleared." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to clear records.";
    return Response.json({ error: message }, { status: 500 });
  }
}
