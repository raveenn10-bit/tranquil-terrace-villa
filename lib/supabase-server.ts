import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { BookingRecord, BookingStatus, PaymentStatus, VillaName } from "./booking-types";
import { normalizeVillaName } from "./villa-data";
import { calculateStayWindow, isValidPackageId } from "./package-data";

export interface GuestRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  country?: string;
  totalBookings: number;
  totalSpentLKR: number;
  notes?: string;
  lastStay?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettingRecord {
  key: string;
  value: any;
  updatedAt: string;
}

const DEFAULT_SUPABASE_URL = "https://soxupctwalvgzujsxwwe.supabase.co";

let cachedClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(key && key.trim().length > 0);
}

export function getSupabaseAdminClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key || key.trim().length === 0) {
    throw new Error(
      "Supabase secret key is not configured. Please set SUPABASE_SECRET_KEY in environment variables."
    );
  }

  if (!cachedClient) {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedClient;
}

// =============================================================================
// Timezone Helpers (Property Location: Karapitiya, Galle, Sri Lanka = UTC+05:30)
// =============================================================================
const COLOMBO_OFFSET_MS = 5.5 * 3600 * 1000;

export function toColomboIso(dateInput: unknown): string {
  if (!dateInput) return "";
  const d = new Date(dateInput as string | number | Date);
  if (Number.isNaN(d.getTime())) return "";

  const colomboMs = d.getTime() + COLOMBO_OFFSET_MS;
  const cd = new Date(colomboMs);
  const Y = cd.getUTCFullYear();
  const M = String(cd.getUTCMonth() + 1).padStart(2, "0");
  const D = String(cd.getUTCDate()).padStart(2, "0");
  const h = String(cd.getUTCHours()).padStart(2, "0");
  const m = String(cd.getUTCMinutes()).padStart(2, "0");
  const s = String(cd.getUTCSeconds()).padStart(2, "0");

  return `${Y}-${M}-${D}T${h}:${m}:${s}+05:30`;
}

/**
 * Normalizes input date/time to exact timestamptz for PostgreSQL in Asia/Colombo (+05:30)
 */
export function toColomboTimestamptz(
  input: string | undefined,
  packageId?: string,
  timingOption?: string,
  boundary: "checkin" | "checkout" = "checkin"
): string {
  if (!input) return new Date().toISOString();
  const clean = input.trim();

  // If already full ISO with timezone offset
  if (clean.includes("T") && (clean.includes("+") || clean.includes("Z"))) {
    return clean;
  }

  // If package booking
  if (packageId && isValidPackageId(packageId)) {
    const calc = calculateStayWindow(clean.slice(0, 10), packageId, timingOption);
    const epochMs = boundary === "checkin" ? calc.checkinEpochMs : calc.checkoutEpochMs;
    return toColomboIso(epochMs);
  }

  // If date-only string "YYYY-MM-DD"
  const dateOnlyMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const time = boundary === "checkin" ? "14:00:00" : "11:00:00";
    return `${clean}T${time}+05:30`;
  }

  // Fallback to parsed Date
  const parsed = new Date(clean);
  if (!Number.isNaN(parsed.getTime())) {
    return toColomboIso(parsed.getTime());
  }

  return clean;
}

// =============================================================================
// Bidirectional Mappers (camelCase Application <-> snake_case PostgreSQL)
// =============================================================================

export function mapBookingDbToApp(row: Record<string, any>): BookingRecord {
  return {
    id: String(row.id),
    reference: String(row.reference || ""),
    guestName: String(row.guest_name || ""),
    email: String(row.email || ""),
    phone: String(row.phone || ""),
    villaName: normalizeVillaName(row.villa_name),
    checkin: toColomboIso(row.checkin),
    checkout: toColomboIso(row.checkout),
    guests: Number(row.guests) || 2,
    source: String(row.source || "website"),
    status: (row.status || "inquiry") as BookingStatus,
    paymentStatus: (row.payment_status || "unpaid") as PaymentStatus,
    totalAmount: Number(row.total_amount) || 0,
    paidAmount: Number(row.paid_amount) || 0,
    specialRequest: String(row.special_request || ""),
    adminNotes: String(row.admin_notes || ""),
    packageId: row.package_id || "",
    timingOption: row.timing_option || "",
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function mapBookingAppToDb(b: Partial<BookingRecord>): Record<string, any> {
  const row: Record<string, any> = {};
  if (b.id !== undefined) row.id = b.id;
  if (b.reference !== undefined) row.reference = b.reference;
  if (b.guestName !== undefined) row.guest_name = b.guestName;
  if (b.email !== undefined) row.email = b.email;
  if (b.phone !== undefined) row.phone = b.phone;
  if (b.villaName !== undefined) row.villa_name = b.villaName;
  if (b.checkin !== undefined) row.checkin = toColomboTimestamptz(b.checkin, b.packageId, b.timingOption, "checkin");
  if (b.checkout !== undefined) row.checkout = toColomboTimestamptz(b.checkout, b.packageId, b.timingOption, "checkout");
  if (b.guests !== undefined) row.guests = Math.min(2, Math.max(1, Number(b.guests) || 2));
  if (b.source !== undefined) row.source = b.source;
  if (b.status !== undefined) row.status = b.status;
  if (b.paymentStatus !== undefined) row.payment_status = b.paymentStatus;
  if (b.totalAmount !== undefined) row.total_amount = Math.max(0, Number(b.totalAmount) || 0);
  if (b.paidAmount !== undefined) row.paid_amount = Math.max(0, Number(b.paidAmount) || 0);
  if (b.specialRequest !== undefined) row.special_request = b.specialRequest;
  if (b.adminNotes !== undefined) row.admin_notes = b.adminNotes;
  if (b.packageId !== undefined) row.package_id = b.packageId;
  if (b.timingOption !== undefined) row.timing_option = b.timingOption;
  return row;
}

export function mapGuestDbToApp(row: Record<string, any>): GuestRecord {
  return {
    id: String(row.id),
    name: String(row.name || ""),
    email: String(row.email || ""),
    phone: String(row.phone || ""),
    country: row.country || "",
    totalBookings: Number(row.total_bookings) || 0,
    totalSpentLKR: Number(row.total_spent_lkr) || 0,
    notes: row.notes || "",
    lastStay: row.last_stay ? toColomboIso(row.last_stay) : "",
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function mapGuestAppToDb(g: Partial<GuestRecord>): Record<string, any> {
  const row: Record<string, any> = {};
  if (g.id !== undefined) row.id = g.id;
  if (g.name !== undefined) row.name = g.name;
  if (g.email !== undefined) row.email = g.email;
  if (g.phone !== undefined) row.phone = g.phone;
  if (g.country !== undefined) row.country = g.country;
  if (g.totalBookings !== undefined) row.total_bookings = Number(g.totalBookings) || 0;
  if (g.totalSpentLKR !== undefined) row.total_spent_lkr = Number(g.totalSpentLKR) || 0;
  if (g.notes !== undefined) row.notes = g.notes;
  if (g.lastStay !== undefined) row.last_stay = g.lastStay ? toColomboTimestamptz(g.lastStay, undefined, undefined, "checkin") : null;
  return row;
}

// =============================================================================
// Guest Synchronization (Idempotent, No Duplicate Profiles, Actual Payments)
// =============================================================================
export async function syncGuestForBooking(
  client: SupabaseClient,
  booking: BookingRecord
): Promise<string | null> {
  try {
    const email = booking.email?.trim().toLowerCase() || "";
    const phone = booking.phone?.trim() || "";
    const name = booking.guestName?.trim() || "Guest";

    if (!email && !phone) return null;

    // 1. Look for existing guest by email or phone
    let existingGuest: Record<string, any> | null = null;

    if (email) {
      const { data } = await client
        .from("guests")
        .select("*")
        .ilike("email", email)
        .limit(1)
        .maybeSingle();
      if (data) existingGuest = data;
    }

    if (!existingGuest && phone) {
      const { data } = await client
        .from("guests")
        .select("*")
        .eq("phone", phone)
        .limit(1)
        .maybeSingle();
      if (data) existingGuest = data;
    }

    const guestId = existingGuest?.id || crypto.randomUUID();

    // 2. Fetch all non-cancelled bookings associated with this guest to compute exact aggregates
    let query = client.from("bookings").select("paid_amount, checkin, status, guest_id, email, phone");
    if (existingGuest) {
      query = query.or(`guest_id.eq.${guestId},email.ilike.${email || "___"},phone.eq.${phone || "___"}`);
    } else {
      query = query.or(`email.ilike.${email || "___"},phone.eq.${phone || "___"}`);
    }

    const { data: guestBookings } = await query;
    const allBookings = guestBookings || [];

    // Filter out cancelled
    const activeBookings = allBookings.filter((b) => b.status !== "cancelled");
    const totalBookings = Math.max(1, activeBookings.length);
    const totalSpentLKR = activeBookings.reduce(
      (sum, b) => sum + (Number(b.paid_amount) || 0),
      0
    );

    // Latest stay
    let latestCheckin = booking.checkin;
    for (const b of activeBookings) {
      if (b.checkin && (!latestCheckin || b.checkin > latestCheckin)) {
        latestCheckin = b.checkin;
      }
    }

    const guestRow = {
      id: guestId,
      name: name || existingGuest?.name || "Guest",
      email: email || existingGuest?.email || "",
      phone: phone || existingGuest?.phone || "",
      country: existingGuest?.country || "",
      total_bookings: totalBookings,
      total_spent_lkr: totalSpentLKR,
      notes: existingGuest?.notes || "",
      last_stay: latestCheckin ? toColomboTimestamptz(latestCheckin) : null,
      updated_at: new Date().toISOString(),
    };

    if (existingGuest) {
      await client.from("guests").update(guestRow).eq("id", guestId);
    } else {
      await client.from("guests").insert({
        ...guestRow,
        created_at: new Date().toISOString(),
      });
    }

    return guestId;
  } catch (err) {
    console.error("Guest sync error:", err);
    return null;
  }
}

// =============================================================================
// Server Operations (Bookings)
// =============================================================================

export async function serverGetAllBookings(): Promise<BookingRecord[]> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from("bookings")
    .select("*")
    .order("checkin", { ascending: false });

  if (error) throw new Error(`Supabase error fetching bookings: ${error.message}`);
  return (data || []).map(mapBookingDbToApp);
}

export async function serverGetBookingById(id: string): Promise<BookingRecord | null> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Supabase error fetching booking ${id}: ${error.message}`);
  return data ? mapBookingDbToApp(data) : null;
}

export async function serverSaveBooking(booking: BookingRecord): Promise<BookingRecord> {
  const client = getSupabaseAdminClient();
  const dbRow = mapBookingAppToDb(booking);

  // Sync guest and assign guest_id
  const guestId = await syncGuestForBooking(client, booking);
  if (guestId) {
    dbRow.guest_id = guestId;
  }

  // Check if booking already exists
  const { data: existing } = await client
    .from("bookings")
    .select("id")
    .eq("id", booking.id)
    .maybeSingle();

  if (existing) {
    dbRow.updated_at = new Date().toISOString();
    const { data, error } = await client
      .from("bookings")
      .update(dbRow)
      .eq("id", booking.id)
      .select()
      .single();

    if (error) {
      if (error.code === "23P01" || error.message?.includes("exclusion")) {
        const err = new Error(
          `Villa ${booking.villaName} is already reserved for the requested dates/times. Please select another time or villa.`
        );
        (err as any).status = 409;
        throw err;
      }
      throw new Error(`Failed to update booking: ${error.message}`);
    }

    return mapBookingDbToApp(data);
  }

  // Insert new booking
  if (!dbRow.id) dbRow.id = crypto.randomUUID();
  dbRow.created_at = new Date().toISOString();
  dbRow.updated_at = new Date().toISOString();

  const { data, error } = await client
    .from("bookings")
    .insert(dbRow)
    .select()
    .single();

  if (error) {
    if (error.code === "23P01" || error.message?.includes("exclusion")) {
      const err = new Error(
        `Villa ${booking.villaName} is already reserved for the requested dates/times. Please select another time or villa.`
      );
      (err as any).status = 409;
      throw err;
    }
    throw new Error(`Failed to insert booking: ${error.message}`);
  }

  return mapBookingDbToApp(data);
}

export async function serverDeleteBooking(id: string): Promise<boolean> {
  const client = getSupabaseAdminClient();
  const { error } = await client.from("bookings").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete booking: ${error.message}`);
  return true;
}

// =============================================================================
// Server Operations (Guests)
// =============================================================================

export async function serverGetAllGuests(): Promise<GuestRecord[]> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from("guests")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`Supabase error fetching guests: ${error.message}`);
  return (data || []).map(mapGuestDbToApp);
}

export async function serverGetGuestById(id: string): Promise<GuestRecord | null> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from("guests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Supabase error fetching guest ${id}: ${error.message}`);
  return data ? mapGuestDbToApp(data) : null;
}

export async function serverSaveGuest(guest: GuestRecord): Promise<GuestRecord> {
  const client = getSupabaseAdminClient();
  const dbRow = mapGuestAppToDb(guest);

  const { data: existing } = await client
    .from("guests")
    .select("id")
    .eq("id", guest.id)
    .maybeSingle();

  if (existing) {
    dbRow.updated_at = new Date().toISOString();
    const { data, error } = await client
      .from("guests")
      .update(dbRow)
      .eq("id", guest.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update guest: ${error.message}`);
    return mapGuestDbToApp(data);
  }

  if (!dbRow.id) dbRow.id = crypto.randomUUID();
  dbRow.created_at = new Date().toISOString();
  dbRow.updated_at = new Date().toISOString();

  const { data, error } = await client
    .from("guests")
    .insert(dbRow)
    .select()
    .single();

  if (error) throw new Error(`Failed to insert guest: ${error.message}`);
  return mapGuestDbToApp(data);
}

export async function serverDeleteGuest(id: string): Promise<boolean> {
  const client = getSupabaseAdminClient();
  const { error } = await client.from("guests").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete guest: ${error.message}`);
  return true;
}

// =============================================================================
// Server Operations (Settings)
// =============================================================================

export async function serverGetAllSettings(): Promise<SettingRecord[]> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client.from("settings").select("*");
  if (error) throw new Error(`Failed to fetch settings: ${error.message}`);
  return (data || []).map((row) => ({
    key: String(row.key),
    value: row.value,
    updatedAt: row.updated_at || new Date().toISOString(),
  }));
}

export async function serverGetSetting<T>(key: string, defaultValue?: T): Promise<T | null> {
  try {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error || !data) return defaultValue ?? null;
    return (data.value as T) ?? defaultValue ?? null;
  } catch {
    return defaultValue ?? null;
  }
}

export async function serverSaveSetting<T>(key: string, value: T): Promise<void> {
  const client = getSupabaseAdminClient();
  const row = {
    key,
    value,
    updated_at: new Date().toISOString(),
  };

  const { error } = await client.from("settings").upsert(row);
  if (error) throw new Error(`Failed to save setting ${key}: ${error.message}`);
}

// =============================================================================
// Server Operations (Stats & Reset)
// =============================================================================

export async function serverGetStorageCounts(): Promise<{ bookings: number; guests: number }> {
  const client = getSupabaseAdminClient();
  const [bRes, gRes] = await Promise.all([
    client.from("bookings").select("id", { count: "exact", head: true }),
    client.from("guests").select("id", { count: "exact", head: true }),
  ]);

  return {
    bookings: bRes.count || 0,
    guests: gRes.count || 0,
  };
}

export async function serverClearAllData(): Promise<void> {
  const client = getSupabaseAdminClient();
  await client.from("bookings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await client.from("guests").delete().neq("id", "00000000-0000-0000-0000-000000000000");
}
