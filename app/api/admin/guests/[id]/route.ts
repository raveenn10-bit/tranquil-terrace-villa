import { isAdminRequest } from "@/lib/admin-auth";
import {
  serverGetGuestById,
  serverDeleteGuest,
} from "@/lib/supabase-server";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Owner access required." }, { status: 403 });
  }

  try {
    const { id } = await Promise.resolve(context.params);
    const guest = await serverGetGuestById(id);
    if (!guest) {
      return Response.json({ error: "Guest not found." }, { status: 404 });
    }
    return Response.json({ guest });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load guest.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Owner access required." }, { status: 403 });
  }

  try {
    const { id } = await Promise.resolve(context.params);
    await serverDeleteGuest(id);
    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete guest.";
    return Response.json({ error: message }, { status: 500 });
  }
}
