import * as schema from "./schema";

export type BookingItem = typeof schema.bookings.$inferSelect;

declare global {
  // eslint-disable-next-line no-var
  var __tranquil_bookings_store: BookingItem[] | undefined;
}

const initialDemoBookings: BookingItem[] = [
  {
    id: "demo-1",
    reference: "TTG-2410-A18F",
    guestName: "Sarah & Daniel",
    email: "sarah@example.com",
    phone: "+44 7700 900123",
    villaName: "Araliya",
    checkin: "2026-10-24 17:00",
    checkout: "2026-10-27 09:00",
    guests: 2,
    source: "website",
    status: "confirmed",
    paymentStatus: "partial",
    totalAmount: 75000,
    paidAmount: 37500,
    specialRequest: "Airport pickup information, please.",
    adminNotes: "Arrival around 3.30 PM.",
    packageId: "night-package",
    timingOption: "",
    createdAt: "2026-10-18 10:30:00",
    updatedAt: "2026-10-21 08:15:00",
  },
  {
    id: "demo-2",
    reference: "TTG-2810-C92B",
    guestName: "Nimal Perera",
    email: "nimal@example.com",
    phone: "+94 77 123 4567",
    villaName: "Olu",
    checkin: "2026-10-28 11:00",
    checkout: "2026-10-30 09:00",
    guests: 2,
    source: "WhatsApp",
    status: "pending",
    paymentStatus: "unpaid",
    totalAmount: 50000,
    paidAmount: 0,
    specialRequest: "Floating breakfast availability?",
    adminNotes: "Follow up this evening.",
    packageId: "day-night-package",
    timingOption: "A",
    createdAt: "2026-10-21 13:10:00",
    updatedAt: "2026-10-21 13:10:00",
  },
];

function getStore(): BookingItem[] {
  if (!globalThis.__tranquil_bookings_store) {
    globalThis.__tranquil_bookings_store = [...initialDemoBookings];
  }
  return globalThis.__tranquil_bookings_store;
}

function findIdFromPredicate(predicate: any): string | null {
  if (!predicate) return null;
  try {
    const serialized = JSON.stringify(predicate);
    const match = serialized.match(/"value":"([a-zA-Z0-9_-]+)"/);
    if (match) return match[1];
  } catch {
    // Ignore serialization failure
  }
  return null;
}

function createMemoryDb() {
  return {
    select(fields?: any) {
      return {
        from(table: any) {
          let results = [...getStore()];
          return {
            where(predicate: any) {
              const targetId = findIdFromPredicate(predicate);
              let filtered = results;
              if (targetId) {
                filtered = results.filter((r) => r.id === targetId);
              }
              return {
                limit(n: number) {
                  return Promise.resolve(filtered.slice(0, n));
                },
                then(resolve: (val: any) => any, reject?: (err: any) => any) {
                  return Promise.resolve(filtered).then(resolve, reject);
                },
              };
            },
            orderBy(..._args: any[]) {
              results.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
              return {
                limit(n: number) {
                  return Promise.resolve(results.slice(0, n));
                },
                then(resolve: (val: any) => any, reject?: (err: any) => any) {
                  return Promise.resolve(results).then(resolve, reject);
                },
              };
            },
            limit(n: number) {
              return Promise.resolve(results.slice(0, n));
            },
            then(resolve: (val: any) => any, reject?: (err: any) => any) {
              return Promise.resolve(results).then(resolve, reject);
            },
          };
        },
      };
    },
    insert(table: any) {
      return {
        values(val: any) {
          const store = getStore();
          const item: BookingItem = {
            id: val.id || crypto.randomUUID(),
            reference: val.reference || `TTG-${Date.now()}`,
            guestName: val.guestName || "",
            email: val.email || "",
            phone: val.phone || "",
            villaName: val.villaName || "Araliya",
            checkin: val.checkin || "",
            checkout: val.checkout || "",
            guests: val.guests || 2,
            source: val.source || "website",
            status: val.status || "inquiry",
            paymentStatus: val.paymentStatus || "unpaid",
            totalAmount: val.totalAmount || 0,
            paidAmount: val.paidAmount || 0,
            specialRequest: val.specialRequest || "",
            adminNotes: val.adminNotes || "",
            packageId: val.packageId || "",
            timingOption: val.timingOption || "",
            createdAt: val.createdAt || new Date().toISOString(),
            updatedAt: val.updatedAt || new Date().toISOString(),
          };
          store.unshift(item);
          return {
            returning() {
              return Promise.resolve([item]);
            },
            then(resolve: (val: any) => any, reject?: (err: any) => any) {
              return Promise.resolve([item]).then(resolve, reject);
            },
          };
        },
      };
    },
    update(table: any) {
      return {
        set(updates: any) {
          return {
            where(predicate: any) {
              const targetId = findIdFromPredicate(predicate);
              const store = getStore();
              let updatedItem: BookingItem | undefined;
              if (targetId) {
                const index = store.findIndex((r) => r.id === targetId);
                if (index !== -1) {
                  store[index] = { ...store[index], ...updates };
                  updatedItem = store[index];
                }
              }
              if (!updatedItem && store.length > 0) {
                store[0] = { ...store[0], ...updates };
                updatedItem = store[0];
              }
              return {
                returning() {
                  return Promise.resolve(updatedItem ? [updatedItem] : []);
                },
                then(resolve: (val: any) => any, reject?: (err: any) => any) {
                  return Promise.resolve(updatedItem ? [updatedItem] : []).then(resolve, reject);
                },
              };
            },
          };
        },
      };
    },
  };
}

export function getDb(): any {
  return createMemoryDb();
}
