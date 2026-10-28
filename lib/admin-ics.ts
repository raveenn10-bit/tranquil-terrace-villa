import type { BookingRecord, VillaName, BookingStatus, PaymentStatus } from "./booking-types";
import { normalizeVillaName } from "./villa-data";
import { toIsoDateString, addDaysToDate, parseSafeDate } from "./admin-date-utils";

/**
 * Escapes characters for RFC 5545 iCalendar values.
 * Escapes backslashes, semicolons, commas, and newlines.
 */
export function escapeIcsText(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/**
 * Unescapes RFC 5545 iCalendar escaped characters.
 */
export function unescapeIcsText(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

/**
 * Converts a date string or timestamp into compact RFC 5545 format (YYYYMMDD or YYYYMMDDTHHMMSSZ).
 */
export function formatIcsDate(dateStr: string, includeTime = false): string {
  const d = parseSafeDate(dateStr);
  if (!d) return "";

  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");

  if (!includeTime) {
    return `${y}${m}${day}`;
  }

  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${day}T${hh}${mm}${ss}Z`;
}

/**
 * Deterministically extracts or generates a unique ID string.
 */
function cleanUid(rawUid: string): string {
  return rawUid.trim().replace(/[^\w.@-]/g, "_");
}

/**
 * Parses RFC 5545 iCalendar (ICS) text content into an array of BookingRecord objects.
 * Handles:
 * - Line unfolding (CRLF/LF followed by space or tab)
 * - DTSTART / DTEND with TZID, UTC timestamps, or date-only values
 * - Missing DTEND (defaults to DTSTART + 1 day)
 * - STATUS (CONFIRMED, TENTATIVE, CANCELLED)
 * - Guest name heuristics from SUMMARY and DESCRIPTION
 * - Channel identification (Airbnb, Booking.com, Agoda, etc.)
 *
 * @param icsText Raw .ics calendar file text
 * @param targetVilla The villa this calendar applies to ("Araliya" or "Olu")
 * @param defaultSource Source channel fallback (e.g. "Airbnb", "Booking.com", "OTA Sync")
 */
export function parseIcsContent(
  icsText: string,
  targetVilla: VillaName | string,
  defaultSource = "iCal Import"
): BookingRecord[] {
  if (!icsText || typeof icsText !== "string") return [];

  const villa = normalizeVillaName(targetVilla);
  const bookings: BookingRecord[] = [];

  // RFC 5545 line unfolding: CRLF + space/tab or LF + space/tab
  const unfolded = icsText
    .replace(/\r\n[ \t]/g, "")
    .replace(/\n[ \t]/g, "");

  // Match each VEVENT block
  const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/gi;
  let match: RegExpExecArray | null;

  let eventCounter = 1;

  while ((match = eventRegex.exec(unfolded)) !== null) {
    const block = match[1];

    // 1. Extract DTSTART
    // Examples:
    // DTSTART;VALUE=DATE:20261024
    // DTSTART:20261024T140000Z
    // DTSTART;TZID=Asia/Colombo:20261024T140000
    const startMatch = block.match(/DTSTART(?:;[^:]*)?:([^\r\n]+)/i);
    if (!startMatch) continue;

    const checkin = toIsoDateString(startMatch[1].trim());
    if (!checkin) continue;

    // 2. Extract DTEND
    const endMatch = block.match(/DTEND(?:;[^:]*)?:([^\r\n]+)/i);
    let checkout = endMatch ? toIsoDateString(endMatch[1].trim()) : "";

    // If DTEND is missing or not after DTSTART, set to checkin + 1 day
    if (!checkout || checkout <= checkin) {
      checkout = addDaysToDate(checkin, 1);
    }

    // 3. Extract UID
    const uidMatch = block.match(/UID(?:;[^:]*)?:([^\r\n]+)/i);
    const rawUid = uidMatch ? unescapeIcsText(uidMatch[1].trim()) : `event-${eventCounter}-${checkin}`;

    // 4. Extract SUMMARY
    const summaryMatch = block.match(/SUMMARY(?:;[^:]*)?:([^\r\n]+)/i);
    const rawSummary = summaryMatch ? unescapeIcsText(summaryMatch[1].trim()) : `Reserved - Villa ${villa}`;

    // 5. Extract DESCRIPTION
    const descMatch = block.match(/DESCRIPTION(?:;[^:]*)?:([^\r\n]+)/i);
    const description = descMatch ? unescapeIcsText(descMatch[1].trim()) : "";

    // 6. Extract STATUS
    const statusMatch = block.match(/STATUS(?:;[^:]*)?:([^\r\n]+)/i);
    const rawStatus = statusMatch ? statusMatch[1].trim().toUpperCase() : "CONFIRMED";
    const status: BookingStatus = rawStatus === "CANCELLED" ? "cancelled" : "confirmed";

    // 7. Detect source channel from UID, SUMMARY, or defaultSource
    let source = defaultSource;
    const combinedContent = `${rawUid} ${rawSummary} ${description}`.toLowerCase();
    if (combinedContent.includes("airbnb")) {
      source = "Airbnb";
    } else if (combinedContent.includes("booking.com") || combinedContent.includes("booking_com")) {
      source = "Booking.com";
    } else if (combinedContent.includes("agoda")) {
      source = "Agoda";
    } else if (combinedContent.includes("expedia") || combinedContent.includes("vrbo")) {
      source = "VRBO";
    }

    // 8. Extract or infer guest name
    let guestName = "Reserved Guest";
    const cleanSummary = rawSummary.trim();

    // Airbnb pattern: "Reserved - John Doe" or "John Doe (HMXXXXXXXX)"
    // Booking.com pattern: "CLOSED - Not available" or "Sarah Daniel"
    if (cleanSummary && !/^(reserved|closed|not available|busy|blocked)/i.test(cleanSummary)) {
      // Remove trailing booking codes in parentheses if any
      const nameMatch = cleanSummary.replace(/\s*\([a-z0-9_-]+\)$/i, "").trim();
      if (nameMatch) {
        guestName = nameMatch.replace(/^Reserved\s*[-:]\s*/i, "").trim() || "Reserved Guest";
      }
    } else if (description) {
      // Look for "Guest: John Doe" or "Name: John Doe" in description
      const nameInDesc = description.match(/(?:Guest|Name|Guest Name):\s*([^\r\n,]+)/i);
      if (nameInDesc && nameInDesc[1].trim()) {
        guestName = nameInDesc[1].trim();
      }
    }

    // 9. Extract or format booking reference
    let reference = "";
    // Check for Airbnb code (e.g. HM4XYZ89)
    const airbnbCode = `${rawUid} ${rawSummary} ${description}`.match(/\b(HM[A-Z0-9]{8,10})\b/i);
    if (airbnbCode) {
      reference = `AIRBNB-${airbnbCode[1].toUpperCase()}`;
    } else if (rawUid && !rawUid.includes("@")) {
      reference = `ICAL-${rawUid.slice(0, 12).toUpperCase()}`;
    } else {
      reference = `TTG-IC-${checkin.replace(/-/g, "").slice(2)}-${String(eventCounter).padStart(3, "0")}`;
    }

    const bookingId = `ical-${cleanUid(rawUid)}`;
    const nowIso = new Date().toISOString();

    const booking: BookingRecord = {
      id: bookingId,
      reference,
      guestName,
      email: "",
      phone: "",
      villaName: villa,
      checkin,
      checkout,
      guests: 2,
      source,
      status,
      paymentStatus: "paid" as PaymentStatus, // External OTA syncs are settled through channel
      totalAmount: 0,
      paidAmount: 0,
      specialRequest: "",
      adminNotes: description ? `iCal Description: ${description}` : `Imported via iCal sync from ${source}`,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    bookings.push(booking);
    eventCounter++;
  }

  return bookings;
}

/**
 * Generates standard RFC 5545 iCalendar (.ics) text for a specific villa.
 * Suitable for importing into Airbnb, Booking.com, Agoda, Google Calendar, and Apple Calendar.
 *
 * @param villaName "Araliya" or "Olu"
 * @param bookings Array of BookingRecord items
 * @param calendarName Optional custom calendar title
 */
export function generateIcsCalendar(
  villaName: VillaName | string,
  bookings: BookingRecord[],
  calendarName?: string
): string {
  const villa = normalizeVillaName(villaName);
  const title = calendarName || `Tranquil Terrace - Villa ${villa}`;

  // Filter only active reservations for this villa with valid dates
  const activeBookings = (bookings || []).filter((b) => {
    if (normalizeVillaName(b.villaName) !== villa) return false;
    if (b.status === "cancelled") return false;
    return Boolean(toIsoDateString(b.checkin) && toIsoDateString(b.checkout));
  });

  const nowIsoCompact = formatIcsDate(new Date().toISOString(), true);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tranquil Terrace Galle//Hospitality Management System 2.0//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(title)}`,
    "X-WR-TIMEZONE:Asia/Colombo",
    `X-WR-CALDESC:${escapeIcsText(`Live reservation feed for Villa ${villa} at Tranquil Terrace Galle, Sri Lanka`)}`,
  ];

  for (const b of activeBookings) {
    const startClean = formatIcsDate(b.checkin, false);
    const endClean = formatIcsDate(b.checkout, false);

    if (!startClean || !endClean) continue;

    const uid = `${b.reference || b.id}@tranquilterracegalle.com`;
    const summary = `Reserved - Villa ${villa} (${b.guestName || "Direct Guest"})`;
    const description = `Ref: ${b.reference || b.id} | Villa: ${villa} | Source: ${b.source || "Website"} | Guests: ${b.guests || 2}`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${escapeIcsText(uid)}`);
    lines.push(`DTSTAMP:${nowIsoCompact}`);
    lines.push(`DTSTART;VALUE=DATE:${startClean}`);
    lines.push(`DTEND;VALUE=DATE:${endClean}`);
    lines.push(`SUMMARY:${escapeIcsText(summary)}`);
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
    lines.push("STATUS:CONFIRMED");
    lines.push("TRANSP:OPAQUE");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  // RFC 5545 requires CRLF line endings
  return lines.join("\r\n");
}

/**
 * Triggers a browser download of an .ics file.
 * Safely guards against server-side rendering execution.
 *
 * @param filename File name (e.g. "tranquil-terrace-araliya.ics")
 * @param content RFC 5545 calendar string
 */
export function downloadIcsFile(filename: string, content: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const safeFilename = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", safeFilename);
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
