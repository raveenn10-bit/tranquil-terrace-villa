import type { BookingRecord, BookingStatus, PaymentStatus, VillaName } from "./booking-types";
import type { GuestRecord } from "./admin-db";
import { normalizeVillaName } from "./villa-data";
import { calculateNights, getTodayIsoDate, toIsoDateString, isValidDateString } from "./admin-date-utils";
import { convertLkrToUsd, DEFAULT_USD_LKR_RATE, formatLKR, formatUSD } from "./currency";

export interface FinancialSummary {
  totalRevenueLKR: number;
  paidRevenueLKR: number;
  pendingRevenueLKR: number;
  totalRevenueUSD: number;
  paidRevenueUSD: number;
  pendingRevenueUSD: number;
  totalRevenue?: number;
  totalCollected?: number;
  totalPending?: number;
  usdExchangeRate: number;
  statusCounts: {
    total: number;
    active: number;
    confirmed: number;
    checked_in: number;
    checked_out: number;
    pending: number;
    inquiry: number;
    cancelled: number;
  };
  paymentCounts: {
    paid: number;
    partial: number;
    unpaid: number;
    refunded: number;
  };
  villaBreakdown: {
    Araliya: {
      bookingsCount: number;
      revenueLKR: number;
      nightsCount: number;
    };
    Olu: {
      bookingsCount: number;
      revenueLKR: number;
      nightsCount: number;
    };
  };
}

export interface BackupValidationResult {
  valid: boolean;
  error?: string;
  data?: {
    version: string;
    exportedAt: string;
    bookings: BookingRecord[];
    guests: GuestRecord[];
    settings: any[];
    financialSummary: FinancialSummary;
  };
}

/**
 * Calculates comprehensive financial and operational metrics from a set of bookings.
 */
export function calculateFinancialSummary(
  bookings: BookingRecord[],
  usdRate = DEFAULT_USD_LKR_RATE
): FinancialSummary {
  const summary: FinancialSummary = {
    totalRevenueLKR: 0,
    paidRevenueLKR: 0,
    pendingRevenueLKR: 0,
    totalRevenueUSD: 0,
    paidRevenueUSD: 0,
    pendingRevenueUSD: 0,
    usdExchangeRate: usdRate,
    statusCounts: {
      total: 0,
      active: 0,
      confirmed: 0,
      checked_in: 0,
      checked_out: 0,
      pending: 0,
      inquiry: 0,
      cancelled: 0,
    },
    paymentCounts: {
      paid: 0,
      partial: 0,
      unpaid: 0,
      refunded: 0,
    },
    villaBreakdown: {
      Araliya: { bookingsCount: 0, revenueLKR: 0, nightsCount: 0 },
      Olu: { bookingsCount: 0, revenueLKR: 0, nightsCount: 0 },
    },
  };

  if (!bookings || !Array.isArray(bookings)) return summary;

  summary.statusCounts.total = bookings.length;

  for (const b of bookings) {
    const status = b.status || "inquiry";
    const payment = b.paymentStatus || "unpaid";
    const villa = normalizeVillaName(b.villaName);
    const nights = calculateNights(b.checkin, b.checkout);

    // Count statuses
    if (status === "cancelled") {
      summary.statusCounts.cancelled++;
    } else {
      summary.statusCounts.active++;
      if (status === "confirmed") summary.statusCounts.confirmed++;
      else if (status === "checked_in") summary.statusCounts.checked_in++;
      else if (status === "checked_out") summary.statusCounts.checked_out++;
      else if (status === "pending") summary.statusCounts.pending++;
      else if (status === "inquiry") summary.statusCounts.inquiry++;

      // Financial summation (only for non-cancelled reservations)
      const total = Number(b.totalAmount) || 0;
      const paid = Number(b.paidAmount) || 0;
      const pending = Math.max(0, total - paid);

      summary.totalRevenueLKR += total;
      summary.paidRevenueLKR += paid;
      summary.pendingRevenueLKR += pending;

      // Villa breakdown
      summary.villaBreakdown[villa].bookingsCount++;
      summary.villaBreakdown[villa].revenueLKR += total;
      summary.villaBreakdown[villa].nightsCount += nights;
    }

    // Payment statuses
    if (payment === "paid") summary.paymentCounts.paid++;
    else if (payment === "partial") summary.paymentCounts.partial++;
    else if (payment === "refunded") summary.paymentCounts.refunded++;
    else summary.paymentCounts.unpaid++;
  }

  summary.totalRevenueUSD = Math.round(convertLkrToUsd(summary.totalRevenueLKR, usdRate));
  summary.paidRevenueUSD = Math.round(convertLkrToUsd(summary.paidRevenueLKR, usdRate));
  summary.pendingRevenueUSD = Math.round(convertLkrToUsd(summary.pendingRevenueLKR, usdRate));

  summary.totalRevenue = summary.totalRevenueLKR;
  summary.totalCollected = summary.paidRevenueLKR;
  summary.totalPending = summary.pendingRevenueLKR;

  return summary;
}

/**
 * Escapes a string or value for standard RFC 4180 CSV output.
 */
function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Exports all bookings to standard RFC 4180 CSV format and optionally triggers browser download.
 *
 * @param bookings Array of BookingRecord items
 * @param triggerDownload Whether to prompt a browser download file (default: true in browser)
 * @returns The generated CSV string
 */
export function exportBookingsCsv(bookings: BookingRecord[], triggerDownload = true): string {
  const headers = [
    "Reference",
    "Guest Name",
    "Email",
    "Phone",
    "Villa",
    "Check-in",
    "Check-out",
    "Nights",
    "Guests",
    "Status",
    "Payment Status",
    "Total (LKR)",
    "Paid (LKR)",
    "Balance (LKR)",
    "Total (USD)",
    "Source",
    "Special Request",
    "Admin Notes",
    "Created At",
  ];

  const rows: string[] = [headers.map(escapeCsvCell).join(",")];

  for (const b of bookings || []) {
    const nights = calculateNights(b.checkin, b.checkout);
    const totalLkr = Number(b.totalAmount) || 0;
    const paidLkr = Number(b.paidAmount) || 0;
    const balanceLkr = Math.max(0, totalLkr - paidLkr);
    const totalUsd = Math.round(convertLkrToUsd(totalLkr));

    const row = [
      b.reference || b.id,
      b.guestName || "Guest",
      b.email || "",
      b.phone || "",
      normalizeVillaName(b.villaName),
      toIsoDateString(b.checkin),
      toIsoDateString(b.checkout),
      nights,
      b.guests || 2,
      b.status || "inquiry",
      b.paymentStatus || "unpaid",
      totalLkr,
      paidLkr,
      balanceLkr,
      totalUsd,
      b.source || "website",
      b.specialRequest || "",
      b.adminNotes || "",
      b.createdAt || "",
    ];

    rows.push(row.map(escapeCsvCell).join(","));
  }

  const csvContent = rows.join("\r\n");

  if (triggerDownload && typeof window !== "undefined" && typeof document !== "undefined") {
    const filename = `tranquil-terrace-bookings-${getTodayIsoDate()}.csv`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return csvContent;
}

/**
 * Creates a complete JSON backup of bookings, guests, and settings, and triggers browser download.
 *
 * @param bookings Array of BookingRecord items
 * @param guests Optional array of GuestRecord items
 * @param settings Optional settings payload
 * @param triggerDownload Whether to trigger a browser download (default: true in browser)
 * @returns Serialized JSON backup string
 */
export function exportBackupJson(
  bookings: BookingRecord[],
  guests: GuestRecord[] = [],
  settings: any[] = [],
  triggerDownload = true
): string {
  const financial = calculateFinancialSummary(bookings);
  const nowIso = new Date().toISOString();

  const backupPayload = {
    version: "1.0",
    appName: "Tranquil Terrace Galle Admin",
    exportedAt: nowIso,
    summary: {
      totalBookings: bookings.length,
      totalGuests: guests.length,
      financial,
    },
    bookings: bookings || [],
    guests: guests || [],
    settings: settings || [],
  };

  const jsonString = JSON.stringify(backupPayload, null, 2);

  if (triggerDownload && typeof window !== "undefined" && typeof document !== "undefined") {
    const filename = `tranquil-terrace-backup-${getTodayIsoDate()}.json`;
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return jsonString;
}

/**
 * Thoroughly validates a backup JSON payload before restoring into database.
 * Checks structure, required fields, date sanity, and data types.
 *
 * @param rawJson Raw JSON string or parsed object
 */
export function validateBackupJson(rawJson: unknown): BackupValidationResult {
  if (!rawJson) {
    return { valid: false, error: "Empty backup payload provided." };
  }

  let parsed: any;
  if (typeof rawJson === "string") {
    try {
      parsed = JSON.parse(rawJson);
    } catch (err) {
      return {
        valid: false,
        error: `Invalid JSON syntax: ${err instanceof Error ? err.message : "Parse error"}`,
      };
    }
  } else if (typeof rawJson === "object") {
    parsed = rawJson;
  } else {
    return { valid: false, error: "Invalid backup data type. Expected JSON string or object." };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { valid: false, error: "Root backup structure must be a JSON object." };
  }

  // Check bookings array
  if (!parsed.bookings || !Array.isArray(parsed.bookings)) {
    return { valid: false, error: "Backup file is missing required 'bookings' array." };
  }

  const validStatuses: BookingStatus[] = [
    "inquiry",
    "pending",
    "confirmed",
    "checked_in",
    "checked_out",
    "cancelled",
  ];
  const validPayments: PaymentStatus[] = ["unpaid", "partial", "paid", "refunded"];

  const sanitizedBookings: BookingRecord[] = [];

  for (let i = 0; i < parsed.bookings.length; i++) {
    const b = parsed.bookings[i];
    if (typeof b !== "object" || b === null) {
      return { valid: false, error: `Booking at index ${i} is not a valid object.` };
    }

    if (!b.id || typeof b.id !== "string") {
      return { valid: false, error: `Booking at index ${i} is missing a required 'id'.` };
    }

    if (!b.guestName || typeof b.guestName !== "string") {
      return { valid: false, error: `Booking ${b.id} is missing a valid 'guestName'.` };
    }

    if (!isValidDateString(b.checkin)) {
      return { valid: false, error: `Booking ${b.id} has invalid check-in date: '${b.checkin}'.` };
    }

    if (!isValidDateString(b.checkout)) {
      return { valid: false, error: `Booking ${b.id} has invalid check-out date: '${b.checkout}'.` };
    }

    const checkin = toIsoDateString(b.checkin);
    const checkout = toIsoDateString(b.checkout);

    if (checkout <= checkin) {
      return {
        valid: false,
        error: `Booking ${b.id} check-out (${checkout}) must be after check-in (${checkin}).`,
      };
    }

    const villa = normalizeVillaName(b.villaName);
    const status: BookingStatus = validStatuses.includes(b.status) ? b.status : "inquiry";
    const paymentStatus: PaymentStatus = validPayments.includes(b.paymentStatus) ? b.paymentStatus : "unpaid";

    sanitizedBookings.push({
      id: String(b.id).trim(),
      reference: b.reference ? String(b.reference).trim() : `TTG-${Date.now().toString(36).toUpperCase()}`,
      guestName: String(b.guestName).trim(),
      email: b.email ? String(b.email).trim() : "",
      phone: b.phone ? String(b.phone).trim() : "",
      villaName: villa,
      checkin,
      checkout,
      guests: Number(b.guests) > 0 ? Number(b.guests) : 2,
      source: b.source ? String(b.source).trim() : "website",
      status,
      paymentStatus,
      totalAmount: Math.max(0, Number(b.totalAmount) || 0),
      paidAmount: Math.max(0, Number(b.paidAmount) || 0),
      specialRequest: b.specialRequest ? String(b.specialRequest).trim() : "",
      adminNotes: b.adminNotes ? String(b.adminNotes).trim() : "",
      packageId: b.packageId ? String(b.packageId).trim() : "",
      timingOption: b.timingOption ? String(b.timingOption).trim() : "",
      createdAt: b.createdAt ? String(b.createdAt) : new Date().toISOString(),
      updatedAt: b.updatedAt ? String(b.updatedAt) : new Date().toISOString(),
    });
  }

  // Sanitize guests
  const sanitizedGuests: GuestRecord[] = [];
  if (Array.isArray(parsed.guests)) {
    for (const g of parsed.guests) {
      if (typeof g === "object" && g !== null && g.id && g.name) {
        sanitizedGuests.push({
          id: String(g.id).trim(),
          name: String(g.name).trim(),
          email: g.email ? String(g.email).trim() : "",
          phone: g.phone ? String(g.phone).trim() : "",
          country: g.country ? String(g.country).trim() : "",
          totalBookings: Math.max(1, Number(g.totalBookings) || 1),
          totalSpentLKR: Math.max(0, Number(g.totalSpentLKR) || 0),
          notes: g.notes ? String(g.notes).trim() : "",
          lastStay: g.lastStay ? toIsoDateString(g.lastStay) : "",
          createdAt: g.createdAt ? String(g.createdAt) : new Date().toISOString(),
          updatedAt: g.updatedAt ? String(g.updatedAt) : new Date().toISOString(),
        });
      }
    }
  }

  const sanitizedSettings = Array.isArray(parsed.settings) ? parsed.settings : [];
  const financialSummary = calculateFinancialSummary(sanitizedBookings);

  return {
    valid: true,
    data: {
      version: parsed.version || "1.0",
      exportedAt: parsed.exportedAt || new Date().toISOString(),
      bookings: sanitizedBookings,
      guests: sanitizedGuests,
      settings: sanitizedSettings,
      financialSummary,
    },
  };
}

/**
 * Triggers a client-side file download for arbitrary content.
 */
export function downloadFile(filename: string, content: string, mimeType = "text/plain;charset=utf-8;"): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

