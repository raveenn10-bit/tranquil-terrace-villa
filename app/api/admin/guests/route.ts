import { isAdminRequest } from "@/lib/admin-auth";
import {
  serverGetAllGuests,
  serverSaveGuest,
  type GuestRecord,
} from "@/lib/supabase-server";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Owner access required." }, { status: 403 });
  }

  try {
    const guests = await serverGetAllGuests();
    return Response.json({ guests });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load guests.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Owner access required." }, { status: 403 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as GuestRecord;
    if (!body || !body.name) {
      return Response.json({ error: "Guest name is required." }, { status: 400 });
    }

    const saved = await serverSaveGuest(body);
    return Response.json({ guest: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save guest.";
    return Response.json({ error: message }, { status: 500 });
  }
}
