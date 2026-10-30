import {
  isAdminRequest,
  verifyAdminOrigin,
} from "@/lib/admin-auth";
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
import {
  generateWhatsAppBookingMessage,
  generateWhatsAppLink,
} from "@/lib/package-data";
import { normalizeVillaName } from "@/lib/villa-data";
import {
  serverGetAllBookings,
  serverSaveBooking,
  isSupabaseConfigured,
} from "@/lib/supabase-server";

function textValue(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function generateReference(): string {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `TTG-${stamp}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Owner access required." }, { status: 403 });
  }

  try {
    const rows = await serverGetAllBookings();
    return Response.json({ bookings: rows });
  } catch (error) {
    console.error("Booking route GET error:", error);
    const msg = error instanceof Error ? error.message : "Failed to load bookings.";
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Origin / CSRF protection
    if (!verifyAdminOrigin(request)) {
      return Response.json(
        { error: "Forbidden: cross-origin submission." },
        { status: 403 }
      );
    }

    const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    // 2. Honeypot anti-spam protection
    if (textValue(payload.website, 80)) {
      return Response.json({ accepted: true }, { status: 202 });
    }

    const admin = isAdminRequest(request);
    const guestName = textValue(payload.guestName ?? payload.name, 100);
    const email = textValue(payload.email, 150).toLowerCase();
    const phone = textValue(payload.phone, 30);
    const rawVilla = payload.villaName ?? payload.villa;
    const villaName = normalizeVillaName(rawVilla);
    const guests = Math.min(2, Math.max(1, Number(payload.guests ?? 2)));
    const specialRequest = textValue(payload.specialRequest ?? payload.message, 1000);
    const source = admin ? textValue(payload.source, 30) || "manual" : "website";
    const status = admin && bookingStatuses.includes(payload.status as never)
      ? (payload.status as (typeof bookingStatuses)[number])
      : "inquiry";
    const paymentStatus = admin && paymentStatuses.includes(payload.paymentStatus as never)
      ? (payload.paymentStatus as (typeof paymentStatuses)[number])
      : "unpaid";

    // 3. Field validations
    if (guestName.length < 2) {
      return Response.json({ error: "Please enter the guest name." }, { status: 400 });
    }
    if (phone.length < 7) {
      return Response.json({ error: "Please enter a valid phone number." }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!Number.isInteger(guests) || guests < 1 || guests > 2) {
      return Response.json({ error: "Each villa accommodates one or two guests." }, { status: 400 });
    }

    // 4. Resolve stay window in Asia/Colombo
    const candidateResolution = resolveCandidateStay({
      villaName,
      packageId: payload.packageId ?? payload.package,
      timingOption: payload.timingOption ?? payload.timing,
      selectedDate: payload.selectedDate ?? payload.date,
      checkin: payload.checkin,
      checkout: payload.checkout,
    });

    if ("error" in candidateResolution) {
      return Response.json({ error: candidateResolution.error }, { status: 400 });
    }

    const candidate: CandidateStaySpan = candidateResolution;

    // Pricing calculation (server authoritative)
    let totalAmount = candidate.totalPriceLKR;
    let paidAmount = 0;

    if (admin) {
      const inputTotal = Math.max(0, Math.round(Number(payload.totalAmount) || 0));
      totalAmount = inputTotal > 0 ? inputTotal : candidate.totalPriceLKR;
      paidAmount = Math.max(0, Math.round(Number(payload.paidAmount) || 0));

      if (paidAmount > totalAmount && totalAmount > 0) {
        return Response.json(
          { error: "Paid amount cannot exceed the total amount." },
          { status: 400 }
        );
      }
    }

    // 5. Overlap check against existing reservations
    let existingBookings: BookingRecord[] = [];
    try {
      if (isSupabaseConfigured()) {
        existingBookings = await serverGetAllBookings();
      }
    } catch (dbErr) {
      console.warn("Could not fetch existing bookings for pre-check:", dbErr);
    }

    const conflict = findBookingConflict(candidate, existingBookings);
    if (conflict.hasConflict) {
      return Response.json(
        {
          error: `Villa ${villaName} is already reserved for the requested dates/times. Please select another time or villa.`,
        },
        { status: 409 }
      );
    }

    // 6. Build booking record
    const finalId = admin && textValue(payload.id, 80) ? textValue(payload.id, 80) : crypto.randomUUID();
    const finalReference = admin && textValue(payload.reference, 80) ? textValue(payload.reference, 80) : generateReference();

    const bookingValues: BookingRecord = {
      id: finalId,
      reference: finalReference,
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
      adminNotes: admin ? textValue(payload.adminNotes, 2000) : "",
      packageId: candidate.packageId ?? "",
      timingOption: candidate.timingOption ?? "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 7. Save into Supabase
    const savedBooking = await serverSaveBooking(bookingValues);

    // 8. Generate WhatsApp direct message & link
    const whatsAppMessage = generateWhatsAppBookingMessage({
      villaName: candidate.villaName,
      packageName: candidate.packageName,
      checkin: candidate.checkinFormatted,
      checkout: candidate.checkoutFormatted,
      guests,
      priceLKR: totalAmount,
    });

    const whatsAppUrl = generateWhatsAppLink({
      villaName: candidate.villaName,
      packageName: candidate.packageName,
      checkin: candidate.checkinFormatted,
      checkout: candidate.checkoutFormatted,
      guests,
      priceLKR: totalAmount,
    });

    // 9. Return response
    if (!admin) {
      // Public response: sanitize private internal details
      return Response.json(
        {
          booking: {
            id: savedBooking.id,
            reference: savedBooking.reference,
            villaName: savedBooking.villaName,
            checkin: savedBooking.checkin,
            checkout: savedBooking.checkout,
            guests: savedBooking.guests,
            totalAmount: savedBooking.totalAmount,
            status: savedBooking.status,
          },
          whatsAppMessage,
          whatsAppUrl,
        },
        { status: 201 }
      );
    }

    // Admin response: return full booking
    return Response.json(
      {
        booking: savedBooking,
        whatsAppMessage,
        whatsAppUrl,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Booking route POST error:", error);
    if (error?.status === 409 || error?.code === "23P01" || error?.message?.includes("exclusion")) {
      return Response.json(
        {
          error: "Villa is already reserved for the requested dates/times. Please select another time or villa.",
        },
        { status: 409 }
      );
    }
    const msg = error instanceof Error ? error.message : "The booking request could not be saved.";
    return Response.json({ error: msg }, { status: 500 });
  }
}
