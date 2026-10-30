import type { BookingRecord, BookingStatus, PaymentStatus, VillaName } from "./booking-types";

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

const DB_NAME = "TranquilTerraceDB";
const DB_VERSION = 1;

const STORES = {
  BOOKINGS: "bookings",
  GUESTS: "guests",
  SETTINGS: "settings",
} as const;

/**
 * Initial demo bookings - set to empty for a clean production database.
 */
export const initialDemoBookings: BookingRecord[] = [];

/**
 * Initial demo guests - set to empty for a clean production database.
 */
export const initialDemoGuests: GuestRecord[] = [];

export function isDemoBooking(b: BookingRecord): boolean {
  if (!b) return false;
  return (
    (typeof b.id === "string" && b.id.startsWith("demo-")) ||
    (typeof b.reference === "string" && (
      b.reference.startsWith("TTG-2410-A18F") ||
      b.reference.startsWith("TTG-2810-C92B") ||
      b.reference.startsWith("TTG-0211-F71D")
    )) ||
    (typeof b.email === "string" && b.email.toLowerCase().includes("example.com"))
  );
}

export function isDemoGuest(g: GuestRecord): boolean {
  if (!g) return false;
  return (
    (typeof g.id === "string" && (
      g.id.startsWith("guest-sarah") ||
      g.id.startsWith("guest-nimal") ||
      g.id.startsWith("guest-maya") ||
      g.id.startsWith("demo-")
    )) ||
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

// ---------------------------------------------------------------------------
// In-Memory & LocalStorage Fallback Engine (for SSR, Private Browsing & Tests)
// ---------------------------------------------------------------------------
declare global {
  // eslint-disable-next-line no-var
  var __tt_memory_bookings: Map<string, BookingRecord> | undefined;
  // eslint-disable-next-line no-var
  var __tt_memory_guests: Map<string, GuestRecord> | undefined;
  // eslint-disable-next-line no-var
  var __tt_memory_settings: Map<string, any> | undefined;
  // eslint-disable-next-line no-var
  var __tt_db_force_fallback: boolean | undefined;
}

function getMemoryStorage() {
  if (!globalThis.__tt_memory_bookings) {
    globalThis.__tt_memory_bookings = new Map();
  }

  if (!globalThis.__tt_memory_guests) {
    globalThis.__tt_memory_guests = new Map();
  }

  if (!globalThis.__tt_memory_settings) {
    globalThis.__tt_memory_settings = new Map();
    // Seed default settings
    for (const [k, v] of Object.entries(defaultSettings)) {
      globalThis.__tt_memory_settings.set(k, { key: k, value: v, updatedAt: new Date().toISOString() });
    }
  }

  return {
    bookings: globalThis.__tt_memory_bookings,
    guests: globalThis.__tt_memory_guests,
    settings: globalThis.__tt_memory_settings,
  };
}

function hasLocalStorage(): boolean {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined" && window.localStorage !== null;
  } catch {
    return false;
  }
}

function readFromLocalStorage<T>(key: string): T[] | null {
  if (!hasLocalStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeToLocalStorage<T>(key: string, data: T[]): void {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore quota or private browsing errors
  }
}

// ---------------------------------------------------------------------------
// IndexedDB Engine
// ---------------------------------------------------------------------------
let dbInstance: IDBDatabase | null = null;
let isIndexedDbAvailable: boolean | null = null;

function checkIndexedDbSupport(): boolean {
  if (globalThis.__tt_db_force_fallback) return false;
  if (typeof window === "undefined") return false;
  if (typeof indexedDB === "undefined" || !indexedDB) return false;
  return true;
}

export function forceFallbackMode(enable: boolean): void {
  globalThis.__tt_db_force_fallback = enable;
  dbInstance = null;
  isIndexedDbAvailable = !enable;
}

async function getDatabase(): Promise<IDBDatabase | null> {
  if (!checkIndexedDbSupport()) {
    isIndexedDbAvailable = false;
    return null;
  }

  if (dbInstance) return dbInstance;

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Bookings Store
        if (!db.objectStoreNames.contains(STORES.BOOKINGS)) {
          const bookingStore = db.createObjectStore(STORES.BOOKINGS, { keyPath: "id" });
          bookingStore.createIndex("reference", "reference", { unique: true });
          bookingStore.createIndex("villaName", "villaName", { unique: false });
          bookingStore.createIndex("checkin", "checkin", { unique: false });
          bookingStore.createIndex("status", "status", { unique: false });
          bookingStore.createIndex("createdAt", "createdAt", { unique: false });
        }

        // 2. Guests Store
        if (!db.objectStoreNames.contains(STORES.GUESTS)) {
          const guestStore = db.createObjectStore(STORES.GUESTS, { keyPath: "id" });
          guestStore.createIndex("email", "email", { unique: false });
          guestStore.createIndex("name", "name", { unique: false });
        }

        // 3. Settings Store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: "key" });
        }
      };

      request.onsuccess = async (event) => {
        dbInstance = (event.target as IDBOpenDBRequest).result;
        isIndexedDbAvailable = true;

        // Seed if and only if empty
        try {
          await seedIfEmpty(dbInstance);
        } catch {
          // Non-blocking seed error handling
        }

        resolve(dbInstance);
      };

      request.onerror = () => {
        isIndexedDbAvailable = false;
        resolve(null);
      };

      request.onblocked = () => {
        isIndexedDbAvailable = false;
        resolve(null);
      };
    } catch {
      isIndexedDbAvailable = false;
      resolve(null);
    }
  });
}

/**
 * Seeds initial demo data if and ONLY if the stores are empty.
 * Never overwrites or duplicates existing data.
 */
async function seedIfEmpty(db: IDBDatabase): Promise<void> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORES.SETTINGS], "readwrite");
      const settingsStore = tx.objectStore(STORES.SETTINGS);

      const countReq = settingsStore.count();
      countReq.onsuccess = () => {
        if (countReq.result === 0) {
          for (const [k, v] of Object.entries(defaultSettings)) {
            settingsStore.put({ key: k, value: v, updatedAt: new Date().toISOString() });
          }
        }
        resolve();
      };
      countReq.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

// ---------------------------------------------------------------------------
// Public Bookings CRUD
// ---------------------------------------------------------------------------

/**
 * Retrieves all bookings from storage.
 */
export async function getAllBookings(): Promise<BookingRecord[]> {
  const db = await getDatabase();

  if (db) {
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORES.BOOKINGS, "readonly");
        const store = tx.objectStore(STORES.BOOKINGS);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = ((req.result || []) as BookingRecord[]).filter((b) => !isDemoBooking(b));
          // Sort chronologically by checkin descending or createdAt descending
          list.sort((a, b) => (b.checkin || "").localeCompare(a.checkin || ""));
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  // Fallback (LocalStorage / In-Memory)
  if (hasLocalStorage()) {
    const local = readFromLocalStorage<BookingRecord>("tt_bookings");
    if (local && local.length > 0) {
      const filtered = local.filter((b) => !isDemoBooking(b));
      filtered.sort((a, b) => (b.checkin || "").localeCompare(a.checkin || ""));
      return filtered;
    }
  }

  const mem = getMemoryStorage();
  const list = Array.from(mem.bookings.values()).filter((b) => !isDemoBooking(b));
  list.sort((a, b) => (b.checkin || "").localeCompare(a.checkin || ""));
  return list;
}

/**
 * Retrieves a booking by its ID.
 */
export async function getBookingById(id: string): Promise<BookingRecord | null> {
  if (!id) return null;
  const db = await getDatabase();

  if (db) {
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORES.BOOKINGS, "readonly");
        const store = tx.objectStore(STORES.BOOKINGS);
        const req = store.get(id);
        req.onsuccess = () => resolve((req.result as BookingRecord) || null);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  // Fallback
  if (hasLocalStorage()) {
    const local = readFromLocalStorage<BookingRecord>("tt_bookings");
    if (local) {
      const found = local.find((b) => b.id === id);
      if (found) return found;
    }
  }

  const mem = getMemoryStorage();
  return mem.bookings.get(id) || null;
}

/**
 * Saves (inserts or updates) a booking in storage.
 * Automatically synchronizes or updates the corresponding Guest record.
 */
export async function saveBooking(booking: BookingRecord): Promise<BookingRecord> {
  const nowIso = new Date().toISOString();
  const record: BookingRecord = {
    ...booking,
    updatedAt: nowIso,
    createdAt: booking.createdAt || nowIso,
  };

  const db = await getDatabase();

  if (db) {
    await new Promise<void>((resolve, reject) => {
      try {
        const tx = db.transaction(STORES.BOOKINGS, "readwrite");
        const store = tx.objectStore(STORES.BOOKINGS);
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  } else {
    // Fallback
    const mem = getMemoryStorage();
    mem.bookings.set(record.id, record);

    if (hasLocalStorage()) {
      const local = readFromLocalStorage<BookingRecord>("tt_bookings") || Array.from(mem.bookings.values());
      const idx = local.findIndex((b) => b.id === record.id);
      if (idx !== -1) {
        local[idx] = record;
      } else {
        local.unshift(record);
      }
      writeToLocalStorage("tt_bookings", local);
    }
  }

  // Synchronize Guest profile
  try {
    await syncGuestProfile(record);
  } catch {
    // Guest sync is auxiliary, do not fail booking save
  }

  return record;
}

/**
 * Deletes a booking by its ID.
 */
export async function deleteBooking(id: string): Promise<boolean> {
  if (!id) return false;
  const db = await getDatabase();

  if (db) {
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORES.BOOKINGS, "readwrite");
        const store = tx.objectStore(STORES.BOOKINGS);
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  // Fallback
  const mem = getMemoryStorage();
  const existed = mem.bookings.delete(id);

  if (hasLocalStorage()) {
    const local = readFromLocalStorage<BookingRecord>("tt_bookings");
    if (local) {
      const filtered = local.filter((b) => b.id !== id);
      writeToLocalStorage("tt_bookings", filtered);
    }
  }

  return existed;
}

// ---------------------------------------------------------------------------
// Public Guests CRUD
// ---------------------------------------------------------------------------

/**
 * Retrieves all guest profiles.
 */
export async function getAllGuests(): Promise<GuestRecord[]> {
  const db = await getDatabase();

  if (db) {
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORES.GUESTS, "readonly");
        const store = tx.objectStore(STORES.GUESTS);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = ((req.result || []) as GuestRecord[]).filter((g) => !isDemoGuest(g));
          list.sort((a, b) => a.name.localeCompare(b.name));
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  // Fallback
  if (hasLocalStorage()) {
    const local = readFromLocalStorage<GuestRecord>("tt_guests");
    if (local && local.length > 0) {
      local.sort((a, b) => a.name.localeCompare(b.name));
      return local;
    }
  }

  const mem = getMemoryStorage();
  const list = Array.from(mem.guests.values()).filter((g) => !isDemoGuest(g));
  list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

/**
 * Retrieves a guest profile by ID.
 */
export async function getGuestById(id: string): Promise<GuestRecord | null> {
  if (!id) return null;
  const db = await getDatabase();

  if (db) {
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORES.GUESTS, "readonly");
        const store = tx.objectStore(STORES.GUESTS);
        const req = store.get(id);
        req.onsuccess = () => resolve((req.result as GuestRecord) || null);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  if (hasLocalStorage()) {
    const local = readFromLocalStorage<GuestRecord>("tt_guests");
    if (local) {
      const found = local.find((g) => g.id === id);
      if (found) return found;
    }
  }

  const mem = getMemoryStorage();
  return mem.guests.get(id) || null;
}

/**
 * Saves a guest profile.
 */
export async function saveGuest(guest: GuestRecord): Promise<GuestRecord> {
  const nowIso = new Date().toISOString();
  const record: GuestRecord = {
    ...guest,
    updatedAt: nowIso,
    createdAt: guest.createdAt || nowIso,
  };

  const db = await getDatabase();

  if (db) {
    await new Promise<void>((resolve, reject) => {
      try {
        const tx = db.transaction(STORES.GUESTS, "readwrite");
        const store = tx.objectStore(STORES.GUESTS);
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  } else {
    const mem = getMemoryStorage();
    mem.guests.set(record.id, record);

    if (hasLocalStorage()) {
      const local = readFromLocalStorage<GuestRecord>("tt_guests") || Array.from(mem.guests.values());
      const idx = local.findIndex((g) => g.id === record.id);
      if (idx !== -1) {
        local[idx] = record;
      } else {
        local.push(record);
      }
      writeToLocalStorage("tt_guests", local);
    }
  }

  return record;
}

/**
 * Deletes a guest profile by ID.
 */
export async function deleteGuest(id: string): Promise<boolean> {
  if (!id) return false;
  const db = await getDatabase();

  if (db) {
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORES.GUESTS, "readwrite");
        const store = tx.objectStore(STORES.GUESTS);
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  const mem = getMemoryStorage();
  const existed = mem.guests.delete(id);

  if (hasLocalStorage()) {
    const local = readFromLocalStorage<GuestRecord>("tt_guests");
    if (local) {
      const filtered = local.filter((g) => g.id !== id);
      writeToLocalStorage("tt_guests", filtered);
    }
  }

  return existed;
}

/**
 * Synchronizes or creates a guest profile whenever a booking is created or updated.
 */
async function syncGuestProfile(booking: BookingRecord): Promise<void> {
  if (!booking.guestName || booking.guestName.trim() === "") return;

  const guests = await getAllGuests();
  const cleanName = booking.guestName.trim().toLowerCase();
  const cleanEmail = (booking.email || "").trim().toLowerCase();

  // Find by email or exact name
  let existing = guests.find(
    (g) =>
      (cleanEmail && g.email && g.email.toLowerCase() === cleanEmail) ||
      g.name.toLowerCase() === cleanName
  );

  const nowIso = new Date().toISOString();

  if (existing) {
    existing = {
      ...existing,
      phone: booking.phone || existing.phone,
      email: booking.email || existing.email,
      totalBookings: Math.max(1, existing.totalBookings + 1),
      totalSpentLKR: existing.totalSpentLKR + (booking.totalAmount || 0),
      lastStay: booking.checkin || existing.lastStay,
      updatedAt: nowIso,
    };
    await saveGuest(existing);
  } else {
    const guestId = `guest-${booking.guestName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`;
    const newGuest: GuestRecord = {
      id: guestId,
      name: booking.guestName.trim(),
      email: booking.email ? booking.email.trim() : "",
      phone: booking.phone ? booking.phone.trim() : "",
      country: "",
      totalBookings: 1,
      totalSpentLKR: booking.totalAmount || 0,
      notes: booking.specialRequest ? `Special request: ${booking.specialRequest}` : "",
      lastStay: booking.checkin || "",
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    await saveGuest(newGuest);
  }
}

// ---------------------------------------------------------------------------
// Settings CRUD
// ---------------------------------------------------------------------------

/**
 * Gets a setting value by key.
 */
export async function getSetting<T>(key: string, defaultValue?: T): Promise<T | null> {
  const db = await getDatabase();

  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.SETTINGS, "readonly");
        const store = tx.objectStore(STORES.SETTINGS);
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result && req.result.value !== undefined) {
            resolve(req.result.value as T);
          } else {
            resolve(defaultValue !== undefined ? defaultValue : null);
          }
        };
        req.onerror = () => resolve(defaultValue !== undefined ? defaultValue : null);
      } catch {
        resolve(defaultValue !== undefined ? defaultValue : null);
      }
    });
  }

  // Fallback
  if (hasLocalStorage()) {
    const raw = window.localStorage.getItem(`tt_setting_${key}`);
    if (raw) {
      try {
        return JSON.parse(raw) as T;
      } catch {
        // Fall through
      }
    }
  }

  const mem = getMemoryStorage();
  const entry = mem.settings.get(key);
  if (entry && entry.value !== undefined) {
    return entry.value as T;
  }

  return defaultValue !== undefined ? defaultValue : null;
}

/**
 * Saves a setting value by key.
 */
export async function saveSetting<T>(key: string, value: T): Promise<void> {
  const nowIso = new Date().toISOString();
  const item = { key, value, updatedAt: nowIso };

  const db = await getDatabase();

  if (db) {
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORES.SETTINGS, "readwrite");
        const store = tx.objectStore(STORES.SETTINGS);
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  // Fallback
  const mem = getMemoryStorage();
  mem.settings.set(key, item);

  if (hasLocalStorage()) {
    try {
      window.localStorage.setItem(`tt_setting_${key}`, JSON.stringify(value));
    } catch {
      // Ignore storage errors
    }
  }
}

/**
 * Clears all stores in the database.
 * Used for hard test resets or administrative clean-up.
 */
export async function clearAllData(): Promise<void> {
  const db = await getDatabase();

  if (db) {
    await new Promise<void>((resolve, reject) => {
      try {
        const tx = db.transaction([STORES.BOOKINGS, STORES.GUESTS, STORES.SETTINGS], "readwrite");
        tx.objectStore(STORES.BOOKINGS).clear();
        tx.objectStore(STORES.GUESTS).clear();
        tx.objectStore(STORES.SETTINGS).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  // Clear memory & localStorage
  if (globalThis.__tt_memory_bookings) globalThis.__tt_memory_bookings.clear();
  if (globalThis.__tt_memory_guests) globalThis.__tt_memory_guests.clear();
  if (globalThis.__tt_memory_settings) globalThis.__tt_memory_settings.clear();

  if (hasLocalStorage()) {
    try {
      window.localStorage.removeItem("tt_bookings");
      window.localStorage.removeItem("tt_guests");
    } catch {
      // Ignore
    }
  }
}

/**
 * Returns summary count of bookings and guests in storage.
 */
export async function getStorageCounts(): Promise<{ bookings: number; guests: number }> {
  const bookings = await getAllBookings();
  const guests = await getAllGuests();
  return {
    bookings: bookings.length,
    guests: guests.length,
  };
}

/**
 * Automatically purges legacy demonstration data from IndexedDB, LocalStorage, and memory.
 */
export async function purgeLegacyDemoData(): Promise<void> {
  const db = await getDatabase();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction([STORES.BOOKINGS, STORES.GUESTS], "readwrite");
        const bStore = tx.objectStore(STORES.BOOKINGS);
        const gStore = tx.objectStore(STORES.GUESTS);

        const reqB = bStore.getAll();
        reqB.onsuccess = () => {
          const list = (reqB.result || []) as BookingRecord[];
          for (const b of list) {
            if (isDemoBooking(b)) {
              bStore.delete(b.id);
            }
          }
        };

        const reqG = gStore.getAll();
        reqG.onsuccess = () => {
          const list = (reqG.result || []) as GuestRecord[];
          for (const g of list) {
            if (isDemoGuest(g)) {
              gStore.delete(g.id);
            }
          }
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  if (globalThis.__tt_memory_bookings) {
    for (const [id, b] of Array.from(globalThis.__tt_memory_bookings.entries())) {
      if (isDemoBooking(b)) globalThis.__tt_memory_bookings.delete(id);
    }
  }
  if (globalThis.__tt_memory_guests) {
    for (const [id, g] of Array.from(globalThis.__tt_memory_guests.entries())) {
      if (isDemoGuest(g)) globalThis.__tt_memory_guests.delete(id);
    }
  }

  if (hasLocalStorage()) {
    try {
      const localB = readFromLocalStorage<BookingRecord>("tt_bookings");
      if (localB) {
        const cleaned = localB.filter((b) => !isDemoBooking(b));
        writeToLocalStorage("tt_bookings", cleaned);
      }
      const localG = readFromLocalStorage<GuestRecord>("tt_guests");
      if (localG) {
        const cleaned = localG.filter((g) => !isDemoGuest(g));
        writeToLocalStorage("tt_guests", cleaned);
      }
    } catch {
      // ignore
    }
  }
}
