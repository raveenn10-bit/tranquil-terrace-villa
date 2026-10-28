import type { BookingRecord, VillaName } from "./booking-types";
import { normalizeVillaName } from "./villa-data";

/**
 * Month names for human-readable display.
 */
const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
] as const;

const MONTH_NAMES_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
] as const;

/**
 * Safely parses any date representation into a valid Date object.
 *
 * Supported formats:
 * - "YYYY-MM-DD" (normalized to 12:00:00 UTC to prevent timezone shifts)
 * - "YYYY-MM-DD HH:MM" or "YYYY-MM-DD HH:MM:SS" (24h)
 * - "YYYY-MM-DD hh:mm AM/PM" (12h)
 * - "YYYY-MM-DDTHH:mm:ss.sssZ" (ISO)
 * - "YYYYMMDD" or "YYYYMMDDTHHMMSSZ" (RFC 5545 ICS formats)
 * - "DD/MM/YYYY" or "DD-MM-YYYY"
 * - JavaScript Date objects or Unix timestamps (in ms or seconds)
 *
 * Returns null if input cannot be parsed or represents an Invalid Date.
 */
export function parseSafeDate(input: unknown): Date | null {
  if (input === null || input === undefined) return null;

  // Already a valid Date object
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : new Date(input.getTime());
  }

  // Numeric epoch timestamp
  if (typeof input === "number") {
    if (Number.isNaN(input) || !Number.isFinite(input)) return null;
    // Handle seconds vs milliseconds (e.g. < 10000000000 is likely seconds)
    const ms = input < 10_000_000_000 ? input * 1000 : input;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 1. Check for 12-hour AM/PM: "YYYY-MM-DD hh:mm[:ss] AM/PM"
  const ampmMatch = trimmed.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})[\sT]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i
  );
  if (ampmMatch) {
    const year = parseInt(ampmMatch[1], 10);
    const month = parseInt(ampmMatch[2], 10) - 1;
    const day = parseInt(ampmMatch[3], 10);
    let hour = parseInt(ampmMatch[4], 10);
    const minute = parseInt(ampmMatch[5], 10);
    const second = ampmMatch[6] ? parseInt(ampmMatch[6], 10) : 0;
    const meridiem = ampmMatch[7]?.toUpperCase();

    if (meridiem === "PM" && hour < 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;

    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const d = new Date(Date.UTC(year, month, day, hour, minute, second));
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }

  // 2. Check for standard "YYYY-MM-DD" (date-only)
  const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (dateOnlyMatch) {
    const year = parseInt(dateOnlyMatch[1], 10);
    const month = parseInt(dateOnlyMatch[2], 10) - 1;
    const day = parseInt(dateOnlyMatch[3], 10);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      // Set to 12:00:00 UTC to prevent any timezone shifts across all meridians
      const d = new Date(Date.UTC(year, month, day, 12, 0, 0));
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }

  // 3. Compact ICS format: "YYYYMMDD" or "YYYYMMDDTHHMMSS" / "YYYYMMDDTHHMMSSZ"
  const icsMatch = trimmed.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?$/i);
  if (icsMatch) {
    const year = parseInt(icsMatch[1], 10);
    const month = parseInt(icsMatch[2], 10) - 1;
    const day = parseInt(icsMatch[3], 10);
    const hour = icsMatch[4] ? parseInt(icsMatch[4], 10) : 12;
    const minute = icsMatch[5] ? parseInt(icsMatch[5], 10) : 0;
    const second = icsMatch[6] ? parseInt(icsMatch[6], 10) : 0;
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const d = new Date(Date.UTC(year, month, day, hour, minute, second));
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }

  // 4. Common localized format: "DD/MM/YYYY" or "DD-MM-YYYY"
  const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const d = new Date(Date.UTC(year, month, day, 12, 0, 0));
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }

  // 5. Fallback to native Date parsing with safety check
  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) {
    const d = new Date(parsed);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}

/**
 * Extracts a normalized "YYYY-MM-DD" calendar date string.
 * Returns an empty string if input is invalid.
 */
export function toIsoDateString(input: unknown): string {
  const d = parseSafeDate(input);
  if (!d) return "";
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Checks whether a given input is a valid, parseable date.
 */
export function isValidDateString(input: unknown): boolean {
  return parseSafeDate(input) !== null;
}

/**
 * Formats a date into a clean luxury display format (e.g. "24 Oct 2026").
 * Guaranteed NEVER to return "Invalid Date".
 *
 * @param dateStr Any valid or invalid date representation
 * @param fallback Fallback string if date cannot be parsed (default: "—")
 * @param options Display options:
 *   - monthFormat: "short" (e.g. "24 Oct 2026") or "long" (e.g. "24 October 2026")
 *   - padDay: whether to pad day to 2 digits (e.g. "04 Oct 2026" vs "4 Oct 2026", default: true)
 */
export function formatDateDisplay(
  dateStr: unknown,
  fallbackOrOptions: string | { monthFormat?: "short" | "long"; padDay?: boolean; showDayOfWeek?: boolean } = "—",
  options?: { monthFormat?: "short" | "long"; padDay?: boolean; showDayOfWeek?: boolean }
): string {
  let fallback = "—";
  let opts = options;

  if (typeof fallbackOrOptions === "object" && fallbackOrOptions !== null) {
    opts = fallbackOrOptions;
    fallback = "—";
  } else if (typeof fallbackOrOptions === "string") {
    fallback = fallbackOrOptions;
  }

  const d = parseSafeDate(dateStr);
  if (!d) return fallback;

  const day = opts?.padDay === false ? String(d.getUTCDate()) : String(d.getUTCDate()).padStart(2, "0");
  const monthIndex = d.getUTCMonth();
  const month = opts?.monthFormat === "long" ? MONTH_NAMES_LONG[monthIndex] : MONTH_NAMES_SHORT[monthIndex];
  const year = d.getUTCFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Formats a date and time into a clean human-readable string (e.g. "24 Oct 2026, 05:00 PM").
 * Guaranteed NEVER to return "Invalid Date".
 */
export function formatDateTimeDisplay(dateStr: unknown, fallback = "—"): string {
  const d = parseSafeDate(dateStr);
  if (!d) return fallback;

  const datePart = formatDateDisplay(d);
  let hours = d.getUTCHours();
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const formattedHour = String(hours).padStart(2, "0");

  // If hours and minutes are exactly 12:00 and was created from date-only, return just the date
  if (d.getUTCHours() === 12 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0) {
    if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
      return datePart;
    }
  }

  return `${datePart}, ${formattedHour}:${minutes} ${ampm}`;
}

/**
 * Calculates the number of nights between checkin and checkout.
 *
 * Guarantees:
 * - Always returns an integer >= 0 (never NaN, never negative).
 * - Treats checkin == checkout as 0 nights (same day / day pass).
 * - Gracefully handles date-time strings, localized strings, and inverted ranges.
 */
export function calculateNights(checkinStr: unknown, checkoutStr: unknown): number {
  const checkinIso = toIsoDateString(checkinStr);
  const checkoutIso = toIsoDateString(checkoutStr);

  if (!checkinIso || !checkoutIso) return 0;

  const [yIn, mIn, dIn] = checkinIso.split("-").map(Number);
  const [yOut, mOut, dOut] = checkoutIso.split("-").map(Number);

  const msIn = Date.UTC(yIn, mIn - 1, dIn);
  const msOut = Date.UTC(yOut, mOut - 1, dOut);

  const diffMs = msOut - msIn;
  if (Number.isNaN(diffMs) || diffMs <= 0) return 0;

  const nights = Math.round(diffMs / (24 * 60 * 60 * 1000));
  return Number.isNaN(nights) ? 0 : Math.max(0, nights);
}

/**
 * Determines whether two booking date intervals overlap.
 *
 * In hospitality operations:
 * - Guest A arrives on startA and departs on endA (morning checkout).
 * - Guest B arrives on startB and departs on endB (afternoon checkin).
 * - Overlap occurs when startA < endB AND endA > startB.
 * - Back-to-back stays (e.g. endA === startB) do NOT conflict because
 *   one guest departs in the morning before the next guest arrives in the afternoon.
 * - Day passes (start === end) are handled safely: a day pass on date D conflicts
 *   with an overnight booking that includes night D.
 */
export function isRangeOverlapping(
  startA: unknown,
  endA: unknown,
  startB: unknown,
  endB: unknown
): boolean {
  const inA = toIsoDateString(startA);
  const outA = toIsoDateString(endA);
  const inB = toIsoDateString(startB);
  const outB = toIsoDateString(endB);

  // If any input is invalid, cannot determine overlap
  if (!inA || !outA || !inB || !outB) return false;

  // Case 1: Both are same-day / day passes
  if (inA === outA && inB === outB) {
    return inA === inB;
  }

  // Case 2: Stay A is a day pass, Stay B is overnight
  if (inA === outA) {
    return inA >= inB && inA < outB;
  }

  // Case 3: Stay B is a day pass, Stay A is overnight
  if (inB === outB) {
    return inB >= inA && inB < outA;
  }

  // Case 4: Standard hospitality overnight stays
  // [inA, outA) overlaps [inB, outB) <=> inA < outB && outA > inB
  return inA < outB && outA > inB;
}

/**
 * Detects conflicts between a candidate stay and existing bookings for a specific villa.
 *
 * Rules:
 * - Only checks active bookings (excludes cancelled bookings).
 * - Matches villa by canonical name ("Araliya" vs "Olu").
 * - Skips the booking with `excludeId` (useful when editing an existing booking).
 * - Returns an array of conflicting BookingRecord items.
 */
export function detectConflicts(
  bookings: BookingRecord[],
  villaName: string,
  checkin: string,
  checkout: string,
  excludeId?: string
): BookingRecord[] {
  if (!bookings || !Array.isArray(bookings)) return [];

  const targetVilla = normalizeVillaName(villaName);
  const candIn = toIsoDateString(checkin);
  const candOut = toIsoDateString(checkout);

  if (!candIn || !candOut) return [];

  return bookings.filter((b) => {
    // Skip self when updating an existing booking
    if (excludeId && b.id === excludeId) return false;

    // Skip cancelled bookings
    if (b.status === "cancelled") return false;

    // Must be for the same villa
    if (normalizeVillaName(b.villaName) !== targetVilla) return false;

    // Check interval overlap
    return isRangeOverlapping(b.checkin, b.checkout, candIn, candOut);
  });
}

/**
 * Returns today's calendar date in "YYYY-MM-DD" format (Asia/Colombo / local time).
 */
export function getTodayIsoDate(): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Colombo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
}

/**
 * Adds a number of calendar days to an ISO date string ("YYYY-MM-DD").
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const d = parseSafeDate(dateStr);
  if (!d) return "";
  d.setUTCDate(d.getUTCDate() + days);
  return toIsoDateString(d);
}

/**
 * Compares two date strings chronologically.
 * Returns -1 if a < b, 1 if a > b, 0 if equal.
 */
export function compareDates(a: unknown, b: unknown): number {
  const isoA = toIsoDateString(a);
  const isoB = toIsoDateString(b);
  if (isoA < isoB) return -1;
  if (isoA > isoB) return 1;
  return 0;
}
