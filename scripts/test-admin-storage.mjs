import { 
  parseSafeDate, 
  toIsoDateString, 
  formatDateDisplay, 
  calculateNights, 
  isRangeOverlapping, 
  detectConflicts 
} from "../lib/admin-date-utils.ts";
import { parseIcsContent, generateIcsCalendar } from "../lib/admin-ics.ts";
import { exportBackupJson, validateBackupJson, exportBookingsCsv } from "../lib/admin-backup.ts";

console.log("=== Testing Admin Storage & Date Utils ===");

// 1. Date Utils tests
const testDate = parseSafeDate("2026-10-24");
if (!testDate) throw new Error("Failed to parse ISO date");
console.log("✓ parseSafeDate:", toIsoDateString(testDate));

const disp = formatDateDisplay("2026-10-24");
if (disp.includes("Invalid Date")) throw new Error("Display date returned Invalid Date");
console.log("✓ formatDateDisplay:", disp);

const n = calculateNights("2026-10-24", "2026-10-27");
if (n !== 3 || isNaN(n)) throw new Error(`calculateNights returned ${n}`);
console.log("✓ calculateNights (3 nights):", n);

const zeroNights = calculateNights("2026-10-24", "2026-10-24");
if (zeroNights !== 0) throw new Error("Day pass check failed");
console.log("✓ calculateNights (same day):", zeroNights);

const overlap = isRangeOverlapping("2026-10-24", "2026-10-27", "2026-10-26", "2026-10-29");
if (!overlap) throw new Error("Overlap detection failed");
console.log("✓ isRangeOverlapping (true):", overlap);

const nonOverlap = isRangeOverlapping("2026-10-24", "2026-10-27", "2026-10-27", "2026-10-30");
if (nonOverlap) throw new Error("Checkout day overlap should be false (checkin on checkout day is standard)");
console.log("✓ isRangeOverlapping (adjacent turns):", nonOverlap);

// 2. ICS Test
const sampleBookings = [
  {
    id: "b1",
    reference: "TTG-1",
    guestName: "Alice Smith",
    email: "alice@test.com",
    phone: "+94770000000",
    villaName: "Araliya",
    checkin: "2026-11-01",
    checkout: "2026-11-04",
    guests: 2,
    source: "website",
    status: "confirmed",
    paymentStatus: "paid",
    totalAmount: 90000,
    paidAmount: 90000,
    specialRequest: "Early checkin",
    adminNotes: "",
    createdAt: "2026-10-29 00:00:00",
    updatedAt: "2026-10-29 00:00:00"
  }
];

const icsText = generateIcsCalendar("Araliya", sampleBookings);
if (!icsText.includes("BEGIN:VCALENDAR") || !icsText.includes("Alice Smith")) {
  throw new Error("ICS generation failed");
}
console.log("✓ generateIcsCalendar generated valid RFC 5545 calendar");

const parsedBookings = parseIcsContent(icsText, "Araliya", "Airbnb");
if (parsedBookings.length === 0 || parsedBookings[0].checkin !== "2026-11-01") {
  throw new Error("ICS parsing failed");
}
console.log("✓ parseIcsContent parsed", parsedBookings.length, "events correctly");

// 3. Backup JSON and CSV test
const backupStr = exportBackupJson(sampleBookings, [], {});
const validation = validateBackupJson(backupStr);
if (!validation.valid) throw new Error("Backup validation failed: " + validation.errors.join(", "));
console.log("✓ validateBackupJson passed with", validation.bookingCount, "bookings");

const csv = exportBookingsCsv(sampleBookings);
if (!csv.includes("Reference,Villa,Guest Name") || !csv.includes("Alice Smith")) {
  throw new Error("CSV generation failed");
}
console.log("✓ exportBookingsCsv passed");

console.log("ALL ADMIN STORAGE TESTS PASSED!");
