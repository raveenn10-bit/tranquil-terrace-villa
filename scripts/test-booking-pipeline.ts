import {
  STAY_PACKAGES,
  getPackageById,
  calculateStayWindow,
  generateWhatsAppBookingMessage,
  generateWhatsAppLink,
  type StayPackage,
} from "../lib/package-data.ts";
import {
  VILLAS,
  getVillaById,
  getVillaByName,
  normalizeVillaName,
  type VillaDefinition,
} from "../lib/villa-data.ts";
import {
  formatLKR,
  formatUSD,
  convertLkrToUsd,
  convertUsdToLkr,
  getExchangeRates,
  DEFAULT_USD_LKR_RATE,
} from "../lib/currency.ts";
import {
  findBookingConflict,
  resolveCandidateStay,
  parseDateTimeToEpochMs,
} from "../lib/booking-conflict.ts";
import type { BookingRecord } from "../lib/booking-types.ts";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log("\n=======================================================");
console.log("TEST SUITE 1: PACKAGE DATA (lib/package-data.ts)");
console.log("=======================================================");

assert(STAY_PACKAGES.length === 3, "Exactly 3 official stay packages are defined");

// Package 1: Day Package
const dayPkg = getPackageById("day-package")!;
assert(Boolean(dayPkg), "Package 1: 'day-package' exists");
assert(dayPkg.name === "Day Package", "Package 1 name is 'Day Package'");
assert(dayPkg.priceLKR === 12500, "Package 1 price is 12,500 LKR");
assert(dayPkg.guests === 2, "Package 1 accommodates 2 guests");
assert(dayPkg.checkinTime === "10:00 AM", "Package 1 checkin is 10:00 AM");
assert(dayPkg.checkoutTime === "3:00 PM", "Package 1 checkout is 3:00 PM");
assert(dayPkg.duration.includes("5 hours"), "Package 1 duration is 5 hours");
assert(dayPkg.meals.includes("Lunch") && dayPkg.meals.includes("Welcome Drink"), "Package 1 meals include Lunch and Welcome Drink");
assert(dayPkg.amenities.includes("Private Swimming Pool"), "Package 1 includes Private Swimming Pool");

// Package 2: Night Package
const nightPkg = getPackageById("night-package")!;
assert(Boolean(nightPkg), "Package 2: 'night-package' exists");
assert(nightPkg.name === "Night Package", "Package 2 name is 'Night Package'");
assert(nightPkg.priceLKR === 14500, "Package 2 price is 14,500 LKR");
assert(nightPkg.guests === 2, "Package 2 accommodates 2 guests");
assert(nightPkg.checkinTime === "5:00 PM", "Package 2 checkin is 5:00 PM");
assert(Boolean(nightPkg.checkoutTime?.includes("9:00 AM")), "Package 2 checkout is 9:00 AM");
assert(nightPkg.meals.includes("Floating Breakfast") && nightPkg.meals.includes("Dinner"), "Package 2 includes Floating Breakfast & Dinner");

// Package 3: Day & Night Package
const dayNightPkg = getPackageById("day-night-package")!;
assert(Boolean(dayNightPkg), "Package 3: 'day-night-package' exists");
assert(dayNightPkg.name === "Day & Night Package", "Package 3 name is 'Day & Night Package'");
assert(dayNightPkg.priceLKR === 26000, "Package 3 price is 26,000 LKR");
assert(dayNightPkg.guests === 2, "Package 3 accommodates 2 guests");
assert(Boolean(dayNightPkg.timingOptions && dayNightPkg.timingOptions.length === 2), "Package 3 has 2 timing options (A and B)");
const optA = dayNightPkg.timingOptions?.find(o => o.id === "A")!;
const optB = dayNightPkg.timingOptions?.find(o => o.id === "B")!;
assert(optA.checkinTime === "11:00 AM" && optA.checkoutTime.includes("9:00 AM"), "Option A: 11:00 AM - 9:00 AM next day");
assert(optB.checkinTime === "5:00 PM" && optB.checkoutTime.includes("3:00 PM"), "Option B: 5:00 PM - 3:00 PM next day");
assert(dayNightPkg.meals.includes("Floating Breakfast") && dayNightPkg.meals.includes("Dinner") && dayNightPkg.meals.includes("Lunch"), "Package 3 includes Floating Breakfast, Dinner, and Lunch");

// Stay Window Calculation
const dayWindow = calculateStayWindow("2026-11-15", "day-package");
assert(dayWindow.checkinDateTime === "2026-11-15 10:00 AM", "Day package checkin string is exact");
assert(dayWindow.checkoutDateTime === "2026-11-15 3:00 PM", "Day package checkout string is exact");
assert(dayWindow.checkoutEpochMs > dayWindow.checkinEpochMs, "Day package checkout > checkin");

const nightWindow = calculateStayWindow("2026-11-15", "night-package");
assert(nightWindow.checkinDateTime === "2026-11-15 5:00 PM", "Night package checkin string is exact");
assert(nightWindow.checkoutDateTime === "2026-11-16 9:00 AM (Following Day)", "Night package checkout string is next day");

const dayNightWindowA = calculateStayWindow("2026-11-15", "day-night-package", "A");
assert(dayNightWindowA.checkinDateTime === "2026-11-15 11:00 AM", "Day & Night Option A checkin is 11:00 AM");
assert(dayNightWindowA.checkoutDateTime === "2026-11-16 9:00 AM (Next Day)", "Day & Night Option A checkout is 9:00 AM next day");

const dayNightWindowB = calculateStayWindow("2026-11-15", "day-night-package", "B");
assert(dayNightWindowB.checkinDateTime === "2026-11-15 5:00 PM", "Day & Night Option B checkin is 5:00 PM");
assert(dayNightWindowB.checkoutDateTime === "2026-11-16 3:00 PM (Next Day)", "Day & Night Option B checkout is 3:00 PM next day");

// WhatsApp Message Format Validation
const sampleMsg = generateWhatsAppBookingMessage({
  villaName: "Villa Araliya",
  packageName: "Day Package",
  checkin: "2026-11-15 10:00 AM",
  checkout: "2026-11-15 3:00 PM",
  guests: 2,
  priceLKR: 12500,
});

const expectedMsg =
  "Hello Tranquil Terrace Galle,\n\n" +
  "I would like to enquire about a booking.\n\n" +
  "Villa: Villa Araliya\n" +
  "Package: Day Package\n" +
  "Check-in: 2026-11-15 10:00 AM\n" +
  "Check-out: 2026-11-15 3:00 PM\n" +
  "Guests: 2\n" +
  "Total: LKR 12,500\n\n" +
  "Please confirm availability.";

assert(sampleMsg === expectedMsg, "WhatsApp message format matches exact required template");

const waLink = generateWhatsAppLink({
  villaName: "Villa Araliya",
  packageName: "Day Package",
  checkin: "2026-11-15 10:00 AM",
  checkout: "2026-11-15 3:00 PM",
  guests: 2,
  priceLKR: 12500,
});
assert(waLink.startsWith("https://wa.me/94770682366?text="), "WhatsApp link targets +94 77 068 2366");

console.log("\n=======================================================");
console.log("TEST SUITE 2: VILLA DATA (lib/villa-data.ts)");
console.log("=======================================================");

assert(VILLAS.length === 2, "Exactly 2 villas defined (Villa Araliya and Villa Olu)");

const araliya = getVillaById("araliya")!;
assert(Boolean(araliya), "Villa Araliya found by id");
assert(araliya.canonicalName === "Araliya", "Villa Araliya canonical name is Araliya");
assert(araliya.name === "Villa Araliya", "Villa Araliya display name is Villa Araliya");
assert(araliya.subtitle === "Original Sanctuary", "Villa Araliya subtitle is 'Original Sanctuary'");
assert(araliya.bedroom === "1 King Bedroom", "Villa Araliya bedroom is '1 King Bedroom'");
assert(araliya.bathroom === "1 Private Bathroom", "Villa Araliya bathroom is '1 Private Bathroom'");
assert(araliya.pool === "Private Plunge Pool", "Villa Araliya pool is 'Private Plunge Pool'");
assert(araliya.image === "/images/villas/araliya/araliya-pool-day.jpg", "Villa Araliya image path is exact");
assert(araliya.fallbackImage === "/assets/villa-0.webp", "Villa Araliya fallback image is exact");

const olu = getVillaById("olu")!;
assert(Boolean(olu), "Villa Olu found by id");
assert(olu.canonicalName === "Olu", "Villa Olu canonical name is Olu");
assert(olu.name === "Villa Olu", "Villa Olu display name is Villa Olu");
assert(olu.subtitle === "Newly Built Villa", "Villa Olu subtitle is 'Newly Built Villa'");
assert(olu.bedroom === "1 King Bedroom", "Villa Olu bedroom is '1 King Bedroom'");
assert(olu.bathroom === "1 Private Bathroom", "Villa Olu bathroom is '1 Private Bathroom'");
assert(olu.pool === "Private Plunge Pool", "Villa Olu pool is 'Private Plunge Pool'");
assert(olu.image === "/images/villas/olu/olu-pool-night.jpg", "Villa Olu image path is exact");
assert(olu.fallbackImage === "/assets/villa-1.webp", "Villa Olu fallback image is exact");

assert(normalizeVillaName("araliya") === "Araliya", "Normalizes 'araliya' to 'Araliya'");
assert(normalizeVillaName("Villa Olu") === "Olu", "Normalizes 'Villa Olu' to 'Olu'");

console.log("\n=======================================================");
console.log("TEST SUITE 3: CURRENCY (lib/currency.ts)");
console.log("=======================================================");

const rates = getExchangeRates();
assert(rates.base === "LKR", "Base currency is LKR");
assert(rates.USD === 308, "Default benchmark USD rate is 308");

assert(formatLKR(12500) === "LKR 12,500", "formatLKR(12500) returns 'LKR 12,500'");
assert(formatLKR(14500) === "LKR 14,500", "formatLKR(14500) returns 'LKR 14,500'");
assert(formatLKR(26000) === "LKR 26,000", "formatLKR(26000) returns 'LKR 26,000'");

assert(formatUSD(12500, 308) === "$41", "formatUSD(12500, 308) returns '$41'");
assert(formatUSD(14500, 308) === "$47", "formatUSD(14500, 308) returns '$47'");
assert(formatUSD(26000, 308) === "$84", "formatUSD(26000, 308) returns '$84'");

const converted = convertLkrToUsd(12500, 308);
assert(Math.round(converted) === 41, "convertLkrToUsd computes correct decimal USD value");
assert(convertUsdToLkr(41, 308) === 12628, "convertUsdToLkr converts back to LKR");

console.log("\n=======================================================");
console.log("TEST SUITE 4: BOOKING CONFLICT & TIME-SLOT OVERLAP");
console.log("=======================================================");

// Mock existing booking in Villa Araliya: Day Package on 2026-11-20 (10:00 AM - 3:00 PM)
const existingDayBooking: BookingRecord = {
  id: "bk-1",
  reference: "TTG-20261120-EX1",
  guestName: "Alice Smith",
  email: "alice@example.com",
  phone: "+94 77 111 2233",
  villaName: "Araliya",
  checkin: "2026-11-20 10:00 AM",
  checkout: "2026-11-20 3:00 PM",
  guests: 2,
  source: "website",
  status: "confirmed",
  paymentStatus: "paid",
  totalAmount: 12500,
  paidAmount: 12500,
  specialRequest: "",
  adminNotes: "",
  packageId: "day-package",
  timingOption: "",
  createdAt: "2026-10-20T10:00:00Z",
  updatedAt: "2026-10-20T10:00:00Z",
};

// Scenario 1: Same day (2026-11-20), same villa (Araliya), Night Package (5:00 PM to 9:00 AM next day)
// Day Package ends at 3:00 PM, Night Package starts at 5:00 PM -> Should NOT conflict!
const nightCandidate = resolveCandidateStay({
  villaName: "Araliya",
  packageId: "night-package",
  selectedDate: "2026-11-20",
}) as any;

const conflictCheck1 = findBookingConflict(nightCandidate, [existingDayBooking]);
assert(conflictCheck1.hasConflict === false, "Day Package (10 AM-3 PM) and Night Package (5 PM-9 AM) do NOT conflict on the same day");

// Scenario 2: Same day (2026-11-20), same villa (Araliya), another Day Package
const dayCandidateConflict = resolveCandidateStay({
  villaName: "Araliya",
  packageId: "day-package",
  selectedDate: "2026-11-20",
}) as any;

const conflictCheck2 = findBookingConflict(dayCandidateConflict, [existingDayBooking]);
assert(conflictCheck2.hasConflict === true, "Two Day Packages on the same date for the same villa CONFLICT");

// Scenario 3: Same day (2026-11-20), same villa (Araliya), Day & Night Option A (11:00 AM to 9:00 AM next day)
const dayNightCandidateConflict = resolveCandidateStay({
  villaName: "Araliya",
  packageId: "day-night-package",
  timingOption: "A",
  selectedDate: "2026-11-20",
}) as any;

const conflictCheck3 = findBookingConflict(dayNightCandidateConflict, [existingDayBooking]);
assert(conflictCheck3.hasConflict === true, "Day Package and Day & Night Option A CONFLICT due to overlapping hours (10-15 vs 11-09)");

// Scenario 4: Same day (2026-11-20), DIFFERENT villa (Villa Olu), Day Package
const diffVillaCandidate = resolveCandidateStay({
  villaName: "Olu",
  packageId: "day-package",
  selectedDate: "2026-11-20",
}) as any;

const conflictCheck4 = findBookingConflict(diffVillaCandidate, [existingDayBooking]);
assert(conflictCheck4.hasConflict === false, "Bookings on different villas (Araliya vs Olu) do NOT conflict");

// Scenario 5: Existing booking was cancelled
const cancelledBooking: BookingRecord = {
  ...existingDayBooking,
  id: "bk-cancelled",
  status: "cancelled",
};
const conflictCheck5 = findBookingConflict(dayCandidateConflict, [cancelledBooking]);
assert(conflictCheck5.hasConflict === false, "Cancelled bookings are ignored and do NOT trigger conflict");

console.log("\n=======================================================");
console.log("ALL UNIT TESTS PASSED SUCCESSFULLY! 🚀");
console.log("=======================================================\n");
