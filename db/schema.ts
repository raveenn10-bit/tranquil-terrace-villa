import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const bookings = sqliteTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    guestName: text("guest_name").notNull(),
    email: text("email").notNull().default(""),
    phone: text("phone").notNull(),
    villaName: text("villa_name").notNull().default("Araliya"),
    checkin: text("checkin").notNull(),
    checkout: text("checkout").notNull(),
    guests: integer("guests").notNull().default(2),
    source: text("source").notNull().default("website"),
    status: text("status").notNull().default("inquiry"),
    paymentStatus: text("payment_status").notNull().default("unpaid"),
    totalAmount: integer("total_amount").notNull().default(0),
    paidAmount: integer("paid_amount").notNull().default(0),
    specialRequest: text("special_request").notNull().default(""),
    adminNotes: text("admin_notes").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("bookings_checkin_idx").on(table.checkin),
    index("bookings_villa_name_idx").on(table.villaName),
    index("bookings_status_idx").on(table.status),
    index("bookings_created_at_idx").on(table.createdAt),
  ],
);
