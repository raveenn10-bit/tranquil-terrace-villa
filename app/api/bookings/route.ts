import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { bookings } from "@/db/schema";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  bookingStatuses,
  paymentStatuses,
  villaNames,
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
  getPackageById,
  isValidPackageId,
} from "@/lib/package-data";
import { normalizeVillaName } from "@/lib/villa-data";

function textValue(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function reference(): string {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `TTG-${stamp}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

function errorMessage(error: unknown): string {
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
    console.error("Booking route error:", error);
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    
    // Honeypot spam protection
    if (textValue(payload.website, 80)) {
      return Response.json({ accepted: true }, { status: 202 });
    }

    const admin = isAdminRequest(request);
    const guestName = textValue(payload.guestName ?? payload.name, 100);
    const email = textValue(payload.email, 150).toLowerCase();
    const phone = textValue(payload.phone, 30);
    const rawVilla = payload.villaName ?? payload.villa;
    const villaName = normalizeVillaName(rawVilla);
    const guests = Number(payload.guests ?? 2);
    const specialRequest = textValue(payload.specialRequest ?? payload.message, 1000);
    const source = admin ? textValue(payload.source, 30) || "manual" : "website";
    const status = admin && bookingStatuses.includes(payload.status as never)
      ? (payload.status as (typeof bookingStatuses)[number])
      : "inquiry";
    const paymentStatus = admin && paymentStatuses.includes(payload.paymentStatus as never)
      ? (payload.paymentStatus as (typeof paymentStatuses)[number])
      : "unpaid";

    // 1. Basic field validations
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

    // 2. Resolve stay span, package, timing option, checkin/checkout dates & times
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

    // Pricing: Use admin input if specified, otherwise package price
    const inputTotal = Math.max(0, Math.round(Number(payload.totalAmount) || 0));
    const totalAmount = inputTotal > 0 ? inputTotal : candidate.totalPriceLKR;
    const paidAmount = admin ? Math.max(0, Math.round(Number(payload.paidAmount) || 0)) : 0;

    if (paidAmount > totalAmount && totalAmount > 0) {
      return Response.json({ error: "Paid amount cannot exceed the total amount." }, { status: 400 });
    }

    // 3. Conflict validation: Check for overlapping bookings on the same villa
    const db = getDb();
    const existingBookings = (await db.select().from(bookings)) as BookingRecord[];
    const conflict = findBookingConflict(candidate, existingBookings);

    if (conflict.hasConflict) {
      return Response.json(
        {
          error:
            conflict.message ||
            `Villa ${villaName} is already reserved for the requested dates/times. Please select another time or villa.`,
          conflictingReference: conflict.conflictingBooking?.reference,
        },
        { status: 409 }
      );
    }

    // 4. Insert booking into database
    const bookingValues = {
      id: crypto.randomUUID(),
      reference: reference(),
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
    };

    const [savedBooking] = await db.insert(bookings).values(bookingValues).returning();

    // 5. Generate formatted WhatsApp message & direct URL
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

    return Response.json(
      {
        booking: savedBooking,
        whatsAppMessage,
        whatsAppUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking route error:", error);
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
