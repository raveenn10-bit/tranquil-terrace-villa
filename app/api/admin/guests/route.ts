import { isAdminRequest, sanitizeInputText } from "@/lib/admin-auth";
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
    const name = sanitizeInputText(body?.name, 100);
    if (!name || name.length < 2) {
      return Response.json({ error: "Guest name is required." }, { status: 400 });
    }

    const sanitizedGuest: GuestRecord = {
      ...body,
      id: sanitizeInputText(body.id, 80) || crypto.randomUUID(),
      name,
      email: sanitizeInputText(body.email, 150).toLowerCase(),
      phone: sanitizeInputText(body.phone, 30),
      country: sanitizeInputText(body.country, 60),
      notes: sanitizeInputText(body.notes, 2000),
      totalBookings: Math.max(0, Number(body.totalBookings) || 0),
      totalSpentLKR: Math.max(0, Number(body.totalSpentLKR) || 0),
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await serverSaveGuest(sanitizedGuest);
    return Response.json({ guest: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save guest.";
    return Response.json({ error: message }, { status: 500 });
  }
}
