import { isAdminRequest, sanitizeInputText } from "@/lib/admin-auth";
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
import {
  serverGetBookingById,
  serverSaveBooking,
  serverDeleteBooking,
  serverGetAllBookings,
} from "@/lib/supabase-server";

function textValue(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Owner access required." }, { status: 403 });
  }

  try {
    const { id } = await Promise.resolve(context.params);
    const booking = await serverGetBookingById(id);
    if (!booking) {
      return Response.json({ error: "Booking not found." }, { status: 404 });
    }
    return Response.json({ booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load booking.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Owner access required." }, { status: 403 });
  }

  try {
    const { id } = await Promise.resolve(context.params);
    const current = await serverGetBookingById(id);
    if (!current) {
      return Response.json({ error: "Booking not found." }, { status: 404 });
    }

    const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const villaName = normalizeVillaName(payload.villaName ?? current.villaName);
    const guestName = payload.guestName === undefined ? current.guestName : sanitizeInputText(payload.guestName, 100);
    const email = payload.email === undefined ? current.email : sanitizeInputText(payload.email, 150).toLowerCase();
    const phone = payload.phone === undefined ? current.phone : sanitizeInputText(payload.phone, 30);
    const guests = payload.guests === undefined ? current.guests : Number(payload.guests);
    const source = payload.source === undefined ? current.source : sanitizeInputText(payload.source, 30);
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
      : sanitizeInputText(payload.specialRequest, 1000);
    const adminNotes = payload.adminNotes === undefined
      ? current.adminNotes
      : sanitizeInputText(payload.adminNotes, 2000);
    const packageId = payload.packageId === undefined
      ? (current.packageId || "")
      : sanitizeInputText(payload.packageId, 50);
    const timingOption = payload.timingOption === undefined
      ? (current.timingOption || "")
      : sanitizeInputText(payload.timingOption, 10);

    const checkinInput = payload.checkin === undefined ? current.checkin : sanitizeInputText(payload.checkin, 40);
    const checkoutInput = payload.checkout === undefined ? current.checkout : sanitizeInputText(payload.checkout, 40);

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

    // Pre-check overlap if status is active
    if (!["cancelled", "checked_out"].includes(status)) {
      const allBookings = await serverGetAllBookings();
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

    const updatedBooking: BookingRecord = {
      ...current,
      id,
      guestName,
      email,
      phone,
      villaName: candidate.villaName,
      checkin: candidate.checkinFormatted,
      checkout: candidate.checkoutFormatted,
      guests,
      source,
      status: status as BookingRecord["status"],
      paymentStatus: paymentStatus as BookingRecord["paymentStatus"],
      totalAmount,
      paidAmount,
      specialRequest,
      adminNotes,
      packageId: candidate.packageId ?? "",
      timingOption: candidate.timingOption ?? "",
      updatedAt: new Date().toISOString(),
    };

    const saved = await serverSaveBooking(updatedBooking);
    return Response.json({ booking: saved });
  } catch (error: any) {
    if (error?.status === 409 || error?.message?.includes("already reserved") || error?.code === "23P01") {
      return Response.json(
        { error: error.message || "Villa is already reserved for the selected period." },
        { status: 409 }
      );
    }
    const message = error instanceof Error ? error.message : "The booking could not be updated.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Owner access required." }, { status: 403 });
  }

  try {
    const { id } = await Promise.resolve(context.params);
    await serverDeleteBooking(id);
    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete booking.";
    return Response.json({ error: message }, { status: 500 });
  }
}
