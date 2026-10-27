import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { bookings } from "@/db/schema";
import { isAdminRequest } from "@/lib/admin-auth";
import { bookingStatuses, paymentStatuses, villaNames } from "@/lib/booking-types";

function textValue(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
}

function reference() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `TTG-${stamp}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return message.includes("no such table")
    ? "The booking database is being prepared. Please try again shortly."
    : "The booking request could not be saved. Please try again.";
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Owner access required." }, { status: 403 });
  }
  try {
    const rows = await getDb()
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt))
      .limit(500);
    return Response.json({ bookings: rows });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    if (textValue(payload.website, 80)) {
      return Response.json({ accepted: true }, { status: 202 });
    }

    const admin = isAdminRequest(request);
    const guestName = textValue(payload.guestName ?? payload.name, 100);
    const email = textValue(payload.email, 150).toLowerCase();
    const phone = textValue(payload.phone, 30);
    const villaName = villaNames.includes(payload.villaName as never)
      ? (payload.villaName as (typeof villaNames)[number])
      : villaNames.includes(payload.villa as never)
        ? (payload.villa as (typeof villaNames)[number])
        : "Araliya";
    const checkin = textValue(payload.checkin, 10);
    const checkout = textValue(payload.checkout, 10);
    const guests = Number(payload.guests);
    const specialRequest = textValue(payload.specialRequest ?? payload.message, 1000);
    const source = admin ? textValue(payload.source, 30) || "manual" : "website";
    const status = admin && bookingStatuses.includes(payload.status as never)
      ? (payload.status as (typeof bookingStatuses)[number])
      : "inquiry";
    const paymentStatus = admin && paymentStatuses.includes(payload.paymentStatus as never)
      ? (payload.paymentStatus as (typeof paymentStatuses)[number])
      : "unpaid";
    const totalAmount = admin ? Math.max(0, Math.round(Number(payload.totalAmount) || 0)) : 0;
    const paidAmount = admin ? Math.max(0, Math.round(Number(payload.paidAmount) || 0)) : 0;

    if (guestName.length < 2) {
      return Response.json({ error: "Please enter the guest name." }, { status: 400 });
    }
    if (phone.length < 7) {
      return Response.json({ error: "Please enter a valid phone number." }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!validDate(checkin) || !validDate(checkout) || checkout <= checkin) {
      return Response.json({ error: "Check-out must be after check-in." }, { status: 400 });
    }
    if (!Number.isInteger(guests) || guests < 1 || guests > 2) {
      return Response.json({ error: "Each villa accommodates one or two guests." }, { status: 400 });
    }
    if (paidAmount > totalAmount && totalAmount > 0) {
      return Response.json({ error: "Paid amount cannot exceed the total amount." }, { status: 400 });
    }

    const [booking] = await getDb()
      .insert(bookings)
      .values({
        id: crypto.randomUUID(),
        reference: reference(),
        guestName,
        email,
        phone,
        villaName,
        checkin,
        checkout,
        guests,
        source,
        status,
        paymentStatus,
        totalAmount,
        paidAmount,
        specialRequest,
        adminNotes: admin ? textValue(payload.adminNotes, 2000) : "",
      })
      .returning();

    return Response.json({ booking }, { status: 201 });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
