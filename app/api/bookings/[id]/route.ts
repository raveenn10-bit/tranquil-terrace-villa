import { and, eq, gt, inArray, lt, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { bookings } from "@/db/schema";
import { isAdminRequest } from "@/lib/admin-auth";
import { bookingStatuses, paymentStatuses, villaNames } from "@/lib/booking-types";

function textValue(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Owner access required." }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const db = getDb();
    const [current] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    if (!current) return Response.json({ error: "Booking not found." }, { status: 404 });

    const payload = (await request.json()) as Record<string, unknown>;
    const next = {
      guestName: payload.guestName === undefined ? current.guestName : textValue(payload.guestName, 100),
      email: payload.email === undefined ? current.email : textValue(payload.email, 150).toLowerCase(),
      phone: payload.phone === undefined ? current.phone : textValue(payload.phone, 30),
      villaName: villaNames.includes(payload.villaName as never) ? String(payload.villaName) : current.villaName,
      checkin: payload.checkin === undefined ? current.checkin : textValue(payload.checkin, 10),
      checkout: payload.checkout === undefined ? current.checkout : textValue(payload.checkout, 10),
      guests: payload.guests === undefined ? current.guests : Number(payload.guests),
      source: payload.source === undefined ? current.source : textValue(payload.source, 30),
      status: bookingStatuses.includes(payload.status as never) ? String(payload.status) : current.status,
      paymentStatus: paymentStatuses.includes(payload.paymentStatus as never) ? String(payload.paymentStatus) : current.paymentStatus,
      totalAmount: payload.totalAmount === undefined ? current.totalAmount : Math.max(0, Math.round(Number(payload.totalAmount) || 0)),
      paidAmount: payload.paidAmount === undefined ? current.paidAmount : Math.max(0, Math.round(Number(payload.paidAmount) || 0)),
      specialRequest: payload.specialRequest === undefined ? current.specialRequest : textValue(payload.specialRequest, 1000),
      adminNotes: payload.adminNotes === undefined ? current.adminNotes : textValue(payload.adminNotes, 2000),
    };

    if (next.guestName.length < 2 || next.phone.length < 7) {
      return Response.json({ error: "Guest name and phone number are required." }, { status: 400 });
    }
    if (next.checkout <= next.checkin || !Number.isInteger(next.guests) || next.guests < 1 || next.guests > 2) {
      return Response.json({ error: "Please check the dates and guest count." }, { status: 400 });
    }
    if (next.paidAmount > next.totalAmount && next.totalAmount > 0) {
      return Response.json({ error: "Paid amount cannot exceed the total amount." }, { status: 400 });
    }

    if (["confirmed", "checked_in"].includes(next.status)) {
      const overlap = await db
        .select({ id: bookings.id, reference: bookings.reference })
        .from(bookings)
        .where(
          and(
            ne(bookings.id, id),
            eq(bookings.villaName, next.villaName),
            inArray(bookings.status, ["confirmed", "checked_in"]),
            lt(bookings.checkin, next.checkout),
            gt(bookings.checkout, next.checkin),
          ),
        )
        .limit(1);
      if (overlap.length) {
        return Response.json(
          { error: `${next.villaName} overlaps confirmed booking ${overlap[0].reference}.` },
          { status: 409 },
        );
      }
    }

    const [booking] = await db
      .update(bookings)
      .set({ ...next, updatedAt: new Date().toISOString() })
      .where(eq(bookings.id, id))
      .returning();
    return Response.json({ booking });
  } catch {
    return Response.json({ error: "The booking could not be updated." }, { status: 500 });
  }
}
