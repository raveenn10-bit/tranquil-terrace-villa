import * as schema from "./schema";
import {
  serverGetAllBookings,
  serverGetBookingById,
  serverSaveBooking,
  type BookingRecord,
} from "@/lib/supabase-server";

export type BookingItem = typeof schema.bookings.$inferSelect;

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

export function getDb() {
  return {
    select(_fields?: any) {
      return {
        from(_table: any) {
          const fetchPromise = serverGetAllBookings();

          return {
            where(predicate: any) {
              const targetId = findIdFromPredicate(predicate);
              const p = targetId
                ? serverGetBookingById(targetId).then((item) => (item ? [item] : []))
                : fetchPromise;

              return {
                limit(n: number) {
                  return p.then((list) => list.slice(0, n));
                },
                then(resolve: (val: any) => any, reject?: (err: any) => any) {
                  return p.then(resolve, reject);
                },
              };
            },
            orderBy(..._args: any[]) {
              return {
                limit(n: number) {
                  return fetchPromise.then((list) => list.slice(0, n));
                },
                then(resolve: (val: any) => any, reject?: (err: any) => any) {
                  return fetchPromise.then(resolve, reject);
                },
              };
            },
            limit(n: number) {
              return fetchPromise.then((list) => list.slice(0, n));
            },
            then(resolve: (val: any) => any, reject?: (err: any) => any) {
              return fetchPromise.then(resolve, reject);
            },
          };
        },
      };
    },
    insert(_table: any) {
      return {
        values(val: any) {
          const promise = serverSaveBooking(val as BookingRecord).then((saved) => [saved]);
          return {
            returning() {
              return promise;
            },
            then(resolve: (val: any) => any, reject?: (err: any) => any) {
              return promise.then(resolve, reject);
            },
          };
        },
      };
    },
    update(_table: any) {
      return {
        set(updates: any) {
          return {
            where(predicate: any) {
              const targetId = findIdFromPredicate(predicate);
              const promise = (async () => {
                if (!targetId) return [];
                const current = await serverGetBookingById(targetId);
                if (!current) return [];
                const updated = await serverSaveBooking({ ...current, ...updates });
                return [updated];
              })();

              return {
                returning() {
                  return promise;
                },
                then(resolve: (val: any) => any, reject?: (err: any) => any) {
                  return promise.then(resolve, reject);
                },
              };
            },
          };
        },
      };
    },
  };
}
