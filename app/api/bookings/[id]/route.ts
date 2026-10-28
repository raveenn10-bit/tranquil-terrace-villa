import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { bookings } from "@/db/schema";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  bookingStatuses,
  paymentStatuses,
  type BookingRecord,
} from "@/lib/booking-types";
import {
  findBookingConflict,
  resolveCandidateStay,
  type CandidateStaySpan,
} from "@/lib/booking-conflict";
import { normalizeVillaName } from "@/lib/villa-data";

function textValue(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function PATCH(request: Request, context: any) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Owner access required." }, { status: 403 });
  }

  try {
    const params = await context?.params;
    const id = params?.id;
    const db = getDb();
    const [current] = (await db.select().from(bookings).where(eq(bookings.id, id)).limit(1)) as BookingRecord[];
    if (!current) return Response.json({ error: "Booking not found." }, { status: 404 });

    const payload = (await request.json()) as Record<string, unknown>;

    const villaName = normalizeVillaName(payload.villaName ?? current.villaName);
    const guestName = payload.guestName === undefined ? current.guestName : textValue(payload.guestName, 100);
    const email = payload.email === undefined ? current.email : textValue(payload.email, 150).toLowerCase();
    const phone = payload.phone === undefined ? current.phone : textValue(payload.phone, 30);
    const guests = payload.guests === undefined ? current.guests : Number(payload.guests);
    const source = payload.source === undefined ? current.source : textValue(payload.source, 30);
    const status = bookingStatuses.includes(payload.status as never)
      ? String(payload.status)
      : current.status;
    const paymentStatus = paymentStatuses.includes(payload.paymentStatus as never)
      ? String(payload.paymentStatus)
      : current.paymentStatus;
    const totalAmount = payload.totalAmount === undefined
      ? current.totalAmount
      : Math.max(0, Math.round(Number(payload.totalAmount) || 0));
    const paidAmount = payload.paidAmount === undefined
      ? current.paidAmount
      : Math.max(0, Math.round(Number(payload.paidAmount) || 0));
    const specialRequest = payload.specialRequest === undefined
      ? current.specialRequest
      : textValue(payload.specialRequest, 1000);
    const adminNotes = payload.adminNotes === undefined
      ? current.adminNotes
      : textValue(payload.adminNotes, 2000);
    const packageId = payload.packageId === undefined
      ? (current.packageId || "")
      : textValue(payload.packageId, 50);
    const timingOption = payload.timingOption === undefined
      ? (current.timingOption || "")
      : textValue(payload.timingOption, 10);

    const checkinInput = payload.checkin === undefined ? current.checkin : textValue(payload.checkin, 40);
    const checkoutInput = payload.checkout === undefined ? current.checkout : textValue(payload.checkout, 40);

    if (guestName.length < 2 || phone.length < 7) {
      return Response.json({ error: "Guest name and phone number are required." }, { status: 400 });
    }
    if (!Number.isInteger(guests) || guests < 1 || guests > 2) {
      return Response.json({ error: "Each villa accommodates one or two guests." }, { status: 400 });
    }
    if (paidAmount > totalAmount && totalAmount > 0) {
      return Response.json({ error: "Paid amount cannot exceed the total amount." }, { status: 400 });
    }

    // Resolve date and time window
    const candidateResolution = resolveCandidateStay({
      villaName,
      packageId,
      timingOption,
      checkin: checkinInput,
      checkout: checkoutInput,
    });

    if ("error" in candidateResolution) {
      return Response.json({ error: candidateResolution.error }, { status: 400 });
    }

    const candidate: CandidateStaySpan = candidateResolution;

    // Check overlap with other bookings (if active status)
    if (!["cancelled", "checked_out"].includes(status)) {
      const allBookings = (await db.select().from(bookings)) as BookingRecord[];
      const conflict = findBookingConflict(candidate, allBookings, id);

      if (conflict.hasConflict) {
        return Response.json(
          {
            error:
              conflict.message ||
              `Villa ${villaName} overlaps existing booking ${conflict.conflictingBooking?.reference}.`,
            conflictingReference: conflict.conflictingBooking?.reference,
          },
          { status: 409 }
        );
      }
    }

    const next = {
      guestName,
      email,
      phone,
      villaName: candidate.villaName,
      checkin: candidate.checkinFormatted,
      checkout: candidate.checkoutFormatted,
      guests,
      source,
      status,
      paymentStatus,
      totalAmount,
      paidAmount,
      specialRequest,
      adminNotes,
      packageId: candidate.packageId ?? "",
      timingOption: candidate.timingOption ?? "",
      updatedAt: new Date().toISOString(),
    };

    const [booking] = await db
      .update(bookings)
      .set(next)
      .where(eq(bookings.id, id))
      .returning();

    return Response.json({ booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The booking could not be updated.";
    return Response.json({ error: message }, { status: 500 });
  }
}
