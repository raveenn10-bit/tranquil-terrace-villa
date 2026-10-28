import { calculateStayWindow, getPackageById, isValidPackageId, type StayPackageId } from "./package-data";
import { normalizeVillaName } from "./villa-data";
import type { BookingRecord, VillaName } from "./booking-types";

/**
 * Parses diverse date/time representations into an epoch timestamp in milliseconds (UTC).
 * Supports:
 * - "YYYY-MM-DD"
 * - "YYYY-MM-DD HH:MM" (24-hour)
 * - "YYYY-MM-DD hh:mm AM/PM" (12-hour)
 * - "YYYY-MM-DDTHH:mm:ss" (ISO)
 */
export function parseDateTimeToEpochMs(
  dateOrDateTimeStr: string,
  fallbackHour = 12,
  fallbackMinute = 0
): number | null {
  if (!dateOrDateTimeStr || typeof dateOrDateTimeStr !== "string") return null;
  const trimmed = dateOrDateTimeStr.trim();
  if (!trimmed) return null;

  // 1. Check for standard 12-hour AM/PM: "YYYY-MM-DD h:mm AM/PM"
  const ampmMatch = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[\sT]+(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i
  );
  if (ampmMatch) {
    const year = parseInt(ampmMatch[1], 10);
    const month = parseInt(ampmMatch[2], 10) - 1;
    const day = parseInt(ampmMatch[3], 10);
    let hour = parseInt(ampmMatch[4], 10);
    const minute = parseInt(ampmMatch[5], 10);
    const meridiem = ampmMatch[6]?.toUpperCase();

    if (meridiem === "PM" && hour < 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;

    return Date.UTC(year, month, day, hour, minute, 0);
  }

  // 2. Check for date-only: "YYYY-MM-DD"
  const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const year = parseInt(dateOnlyMatch[1], 10);
    const month = parseInt(dateOnlyMatch[2], 10) - 1;
    const day = parseInt(dateOnlyMatch[3], 10);
    return Date.UTC(year, month, day, fallbackHour, fallbackMinute, 0);
  }

  // 3. Fallback to standard Date.parse
  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

export interface CandidateStaySpan {
  villaName: VillaName;
  startMs: number;
  endMs: number;
  checkinFormatted: string;
  checkoutFormatted: string;
  packageId?: string;
  timingOption?: string;
  totalPriceLKR: number;
  packageName: string;
}

/**
 * Resolves checkin/checkout/package inputs into a normalized candidate stay span.
 */
export function resolveCandidateStay(payload: {
  villaName?: unknown;
  villa?: unknown;
  packageId?: unknown;
  package?: unknown;
  timingOption?: unknown;
  timing?: unknown;
  selectedDate?: unknown;
  date?: unknown;
  checkin?: unknown;
  checkout?: unknown;
}): CandidateStaySpan | { error: string } {
  const villaName = normalizeVillaName(payload.villaName ?? payload.villa);
  const rawPackageId = String(payload.packageId ?? payload.package ?? "").trim();
  const timingOptionId = String(payload.timingOption ?? payload.timing ?? "").toUpperCase().trim() || "A";

  const arrivalDateStr = String(
    payload.selectedDate ?? payload.date ?? payload.checkin ?? ""
  ).trim().slice(0, 10);

  // Validate arrival date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(arrivalDateStr)) {
    return { error: "Please choose a valid check-in date in YYYY-MM-DD format." };
  }

  if (isValidPackageId(rawPackageId)) {
    const calc = calculateStayWindow(arrivalDateStr, rawPackageId, timingOptionId);
    return {
      villaName,
      startMs: calc.checkinEpochMs,
      endMs: calc.checkoutEpochMs,
      checkinFormatted: calc.checkinDateTime,
      checkoutFormatted: calc.checkoutDateTime,
      packageId: calc.packageId,
      timingOption: calc.timingOption?.id,
      totalPriceLKR: calc.priceLKR,
      packageName: calc.packageName,
    };
  }

  // Check if raw checkin and checkout contain times or custom dates
  const rawCheckin = String(payload.checkin ?? arrivalDateStr).trim();
  const rawCheckout = String(payload.checkout ?? "").trim();

  // If no checkout specified, default to next day 11:00 AM
  const checkinMs = parseDateTimeToEpochMs(rawCheckin, 14, 0); // 2:00 PM standard
  let checkoutMs: number | null = null;

  if (rawCheckout) {
    checkoutMs = parseDateTimeToEpochMs(rawCheckout, 11, 0); // 11:00 AM standard
  } else {
    // Default to 1-night stay
    if (checkinMs !== null) {
      checkoutMs = checkinMs + 21 * 3600 * 1000; // 21 hours later
    }
  }

  if (checkinMs === null || checkoutMs === null || checkoutMs <= checkinMs) {
    return { error: "Check-out time must be after check-in time." };
  }

  return {
    villaName,
    startMs: checkinMs,
    endMs: checkoutMs,
    checkinFormatted: rawCheckin,
    checkoutFormatted: rawCheckout || new Date(checkoutMs).toISOString().slice(0, 10),
    totalPriceLKR: 0,
    packageName: "Custom Stay",
  };
}

export interface BookingConflictDetails {
  hasConflict: boolean;
  conflictingBooking?: BookingRecord;
  message?: string;
}

/**
 * Checks whether the candidate stay interval conflicts with any existing booking for the specified villa.
 *
 * Excludes cancelled and checked-out bookings.
 * Standard interval overlap: startA < endB && endA > startB.
 */
export function findBookingConflict(
  candidate: CandidateStaySpan,
  existingBookings: BookingRecord[],
  excludeBookingId?: string
): BookingConflictDetails {
  for (const b of existingBookings) {
    // Skip self when updating an existing booking
    if (excludeBookingId && b.id === excludeBookingId) continue;

    // Must be for the same villa
    if (normalizeVillaName(b.villaName) !== candidate.villaName) continue;

    // Skip cancelled or checked out bookings
    if (b.status === "cancelled" || b.status === "checked_out") continue;

    // Determine existing booking time window
    let bStartMs: number | null = null;
    let bEndMs: number | null = null;

    if (b.packageId && isValidPackageId(b.packageId)) {
      const calc = calculateStayWindow(b.checkin, b.packageId, b.timingOption);
      bStartMs = calc.checkinEpochMs;
      bEndMs = calc.checkoutEpochMs;
    } else {
      bStartMs = parseDateTimeToEpochMs(b.checkin, 14, 0);
      bEndMs = parseDateTimeToEpochMs(b.checkout, 11, 0);
    }

    if (bStartMs === null || bEndMs === null) continue;

    // Overlap condition:
    // candidate.startMs < bEndMs && candidate.endMs > bStartMs
    if (candidate.startMs < bEndMs && candidate.endMs > bStartMs) {
      return {
        hasConflict: true,
        conflictingBooking: b,
        message: `Villa ${candidate.villaName} is already booked for the requested period (${candidate.checkinFormatted} – ${candidate.checkoutFormatted}). Overlaps existing reservation ${b.reference}.`,
      };
    }
  }

  return { hasConflict: false };
}
