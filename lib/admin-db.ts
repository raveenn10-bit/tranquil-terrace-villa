import type { BookingRecord, BookingStatus, PaymentStatus, VillaName } from "./booking-types";
import type { GuestRecord, SettingRecord } from "./supabase-server";

export type { GuestRecord, SettingRecord };

export const initialDemoBookings: BookingRecord[] = [];
export const initialDemoGuests: GuestRecord[] = [];

export function isDemoBooking(b: BookingRecord): boolean {
  if (!b) return false;
  return (
    (typeof b.id === "string" && b.id.startsWith("demo-")) ||
    (typeof b.email === "string" && b.email.toLowerCase().includes("example.com"))
  );
}

export function isDemoGuest(g: GuestRecord): boolean {
  if (!g) return false;
  return (
    (typeof g.id === "string" && g.id.startsWith("demo-")) ||
    (typeof g.email === "string" && g.email.toLowerCase().includes("example.com"))
  );
}

export const defaultSettings: Record<string, any> = {
  rates: {
    usdToLkr: 308,
    araliyaBaseNight: 35000,
    oluBaseNight: 35000,
  },
  calendarFeeds: {
    Araliya: { bookingUrl: "", airbnbUrl: "", agodaUrl: "" },
    Olu: { bookingUrl: "", airbnbUrl: "", agodaUrl: "" },
  },
  villaMetadata: {
    Araliya: { capacity: 2, maxGuests: 2, bedrooms: 1, bathrooms: 1 },
    Olu: { capacity: 2, maxGuests: 2, bedrooms: 1, bathrooms: 1 },
  },
};

export function forceFallbackMode(_enable: boolean): void {
  // Retained for API compatibility
}

// ---------------------------------------------------------------------------
// Bookings Operations
// ---------------------------------------------------------------------------

export async function getAllBookings(): Promise<BookingRecord[]> {
  if (typeof window === "undefined") {
    const { serverGetAllBookings } = await import("./supabase-server");
    return serverGetAllBookings();
  }

  const res = await fetch("/api/bookings", { cache: "no-store" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to fetch bookings (${res.status})`);
  }
  const data = await res.json();
  return (data.bookings || []) as BookingRecord[];
}

export async function getBookingById(id: string): Promise<BookingRecord | null> {
  if (!id) return null;
  if (typeof window === "undefined") {
    const { serverGetBookingById } = await import("./supabase-server");
    return serverGetBookingById(id);
  }

  const res = await fetch(`/api/bookings/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to fetch booking (${res.status})`);
  }
  const data = await res.json();
  return data.booking as BookingRecord;
}

export async function saveBooking(booking: BookingRecord): Promise<BookingRecord> {
  if (typeof window === "undefined") {
    const { serverSaveBooking } = await import("./supabase-server");
    return serverSaveBooking(booking);
  }

  // If booking has an id, attempt PATCH first
  if (booking.id) {
    const patchRes = await fetch(`/api/bookings/${encodeURIComponent(booking.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(booking),
    });

    if (patchRes.ok) {
      const data = await patchRes.json();
      return data.booking;
    }

    if (patchRes.status === 409) {
      const data = await patchRes.json();
      throw new Error(data.error || "Villa is already reserved for the selected period.");
    }

    if (patchRes.status !== 404) {
      const data = await patchRes.json().catch(() => ({}));
      throw new Error(data.error || `Failed to update booking (${patchRes.status})`);
    }
  }

  // Otherwise, create via POST
  const postRes = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
  });

  if (!postRes.ok) {
    const data = await postRes.json().catch(() => ({}));
    throw new Error(data.error || `Failed to save booking (${postRes.status})`);
  }

  const data = await postRes.json();
  return data.booking;
}

export async function deleteBooking(id: string): Promise<boolean> {
  if (!id) return false;
  if (typeof window === "undefined") {
    const { serverDeleteBooking } = await import("./supabase-server");
    return serverDeleteBooking(id);
  }

  const res = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to delete booking (${res.status})`);
  }

  return true;
}

// ---------------------------------------------------------------------------
// Guests Operations
// ---------------------------------------------------------------------------

export async function getAllGuests(): Promise<GuestRecord[]> {
  if (typeof window === "undefined") {
    const { serverGetAllGuests } = await import("./supabase-server");
    return serverGetAllGuests();
  }

  const res = await fetch("/api/admin/guests", { cache: "no-store" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to fetch guests (${res.status})`);
  }
  const data = await res.json();
  return (data.guests || []) as GuestRecord[];
}

export async function getGuestById(id: string): Promise<GuestRecord | null> {
  if (!id) return null;
  if (typeof window === "undefined") {
    const { serverGetGuestById } = await import("./supabase-server");
    return serverGetGuestById(id);
  }

  const res = await fetch(`/api/admin/guests/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to fetch guest (${res.status})`);
  }
  const data = await res.json();
  return data.guest as GuestRecord;
}

export async function saveGuest(guest: GuestRecord): Promise<GuestRecord> {
  if (typeof window === "undefined") {
    const { serverSaveGuest } = await import("./supabase-server");
    return serverSaveGuest(guest);
  }

  const res = await fetch("/api/admin/guests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(guest),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to save guest (${res.status})`);
  }

  const data = await res.json();
  return data.guest as GuestRecord;
}

export async function deleteGuest(id: string): Promise<boolean> {
  if (!id) return false;
  if (typeof window === "undefined") {
    const { serverDeleteGuest } = await import("./supabase-server");
    return serverDeleteGuest(id);
  }

  const res = await fetch(`/api/admin/guests/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to delete guest (${res.status})`);
  }

  return true;
}

// ---------------------------------------------------------------------------
// Settings Operations
// ---------------------------------------------------------------------------

export async function getSetting<T>(key: string, defaultValue?: T): Promise<T | null> {
  if (typeof window === "undefined") {
    const { serverGetSetting } = await import("./supabase-server");
    return serverGetSetting<T>(key, defaultValue);
  }

  try {
    const res = await fetch(`/api/admin/settings?key=${encodeURIComponent(key)}`);
    if (!res.ok) return defaultValue ?? null;
    const data = await res.json();
    return (data.value as T) ?? defaultValue ?? null;
  } catch {
    return defaultValue ?? null;
  }
}

export async function saveSetting<T>(key: string, value: T): Promise<void> {
  if (typeof window === "undefined") {
    const { serverSaveSetting } = await import("./supabase-server");
    return serverSaveSetting(key, value);
  }

  const res = await fetch("/api/admin/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to save setting (${res.status})`);
  }
}

// ---------------------------------------------------------------------------
// Storage Stats & Data Management
// ---------------------------------------------------------------------------

export async function getStorageCounts(): Promise<{ bookings: number; guests: number }> {
  if (typeof window === "undefined") {
    const { serverGetStorageCounts } = await import("./supabase-server");
    return serverGetStorageCounts();
  }

  try {
    const res = await fetch("/api/admin/stats");
    if (!res.ok) {
      const [bookings, guests] = await Promise.all([getAllBookings(), getAllGuests()]);
      return { bookings: bookings.length, guests: guests.length };
    }
    const data = await res.json();
    return { bookings: data.bookings || 0, guests: data.guests || 0 };
  } catch {
    return { bookings: 0, guests: 0 };
  }
}

export async function clearAllData(): Promise<void> {
  if (typeof window === "undefined") {
    const { serverClearAllData } = await import("./supabase-server");
    return serverClearAllData();
  }

  const res = await fetch("/api/admin/clear", {
    method: "POST",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to clear records (${res.status})`);
  }
}

export async function purgeLegacyDemoData(): Promise<void> {
  // Preserves legitimate records. Zero destructive client heuristics.
}
