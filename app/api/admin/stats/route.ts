import { isAdminRequest } from "@/lib/admin-auth";
import { serverGetStorageCounts } from "@/lib/supabase-server";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Owner access required." }, { status: 403 });
  }

  try {
    const counts = await serverGetStorageCounts();
    return Response.json(counts);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load storage counts.";
    return Response.json({ error: message }, { status: 500 });
  }
}
