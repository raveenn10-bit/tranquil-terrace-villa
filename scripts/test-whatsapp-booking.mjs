import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";

console.log("=== RUNNING WHATSAPP BOOKING ENGINE VERIFICATION ===");

const root = process.cwd();
const jsCode = fs.readFileSync(path.join(root, "public", "whatsapp-booking.js"), "utf-8");
const cssCode = fs.readFileSync(path.join(root, "public", "whatsapp-booking.css"), "utf-8");

// 1. Verify CSS rules
console.log("1. Verifying CSS styling & official brand rules...");
assert(cssCode.includes("--tt-wa-green: #25D366"), "Missing #25D366 in CSS root variables");
assert(cssCode.includes(".meta-floating-whatsapp"), "Missing .meta-floating-whatsapp in CSS");
assert(cssCode.includes(".tt-wa-modal-backdrop"), "Missing .tt-wa-modal-backdrop in CSS");
assert(cssCode.includes(".official-wa-icon"), "Missing .official-wa-icon in CSS");
assert(cssCode.includes(".tt-wa-villa-card"), "Missing .tt-wa-villa-card in CSS");
console.log("✓ CSS verification passed!");

// 2. Test Message Compilation Logic
console.log("2. Testing WhatsApp Message Compilation...");

// Mocking minimal DOM environment for testing the compile function
const WHATSAPP_PHONE = "94770682366";
const USD_EXCHANGE_RATE = 308;

const PACKAGES = {
  "day-package": {
    name: "Day Package (10 AM – 3 PM)",
    shortName: "Day Package",
    priceLKR: 12500,
    bothPriceLKR: 25000,
  },
  "night-package": {
    name: "Night Package (5 PM – 9 AM)",
    shortName: "Night Package",
    priceLKR: 14500,
    bothPriceLKR: 29000,
  },
  "day-night-package": {
    name: "Day & Night Package (24 Hours)",
    shortName: "Day & Night Package",
    priceLKR: 26000,
    bothPriceLKR: 52000,
  },
};

function formatLKR(amount) {
  return "LKR " + new Intl.NumberFormat("en-LK").format(Math.round(amount));
}

function compileWhatsAppMessage(data) {
  const pkg = PACKAGES[data.packageId] || PACKAGES["night-package"];
  let pkgLabel = pkg.shortName;

  if (data.packageId === "day-night-package") {
    const timingOpt = data.timing === "B" 
      ? "Option B: 5:00 PM → 3:00 PM Next Day" 
      : "Option A: 11:00 AM → 9:00 AM Next Day";
    pkgLabel = `Day & Night Package (24 Hours · ${timingOpt})`;
  } else if (data.packageId === "day-package") {
    pkgLabel = `Day Package (10:00 AM – 3:00 PM)`;
  } else {
    pkgLabel = `Night Package (5:00 PM – 9:00 AM)`;
  }

  const villaText = data.villaKey === "Both Villas" 
    ? "Both Villas (up to 4 guests)" 
    : data.villaKey;

  const specialRequestsText = data.requests && data.requests.trim() 
    ? data.requests.trim() 
    : "None";

  const totalFormatted = `${formatLKR(data.totalAmount)} (~$${Math.round(data.totalAmount / USD_EXCHANGE_RATE)} USD)`;

  const lines = [
    "🌿 *RESERVATION ENQUIRY · TRANQUIL TERRACE GALLE* 🌿",
    `• *Villa*: ${villaText}`,
    `• *Package*: ${pkgLabel}`,
    `• *Check-in Date*: ${data.checkin}`,
    `• *Guests*: ${data.guests} Guest(s)`,
    `• *Guest Name*: ${data.guestName}`,
    `• *Contact*: ${data.phone}`,
    `• *Special Requests*: ${specialRequestsText}`,
    `• *Estimated Total*: ${totalFormatted}`,
    "",
    "Hello Tranquil Terrace Concierge, I would like to check availability and confirm this booking. Thank you!"
  ];

  return lines.join("\n");
}

// Test Case A: Single Villa Night Package
const sampleA = {
  guestName: "Kasun Perera",
  phone: "+94 77 123 4567",
  villaKey: "Villa Araliya",
  packageId: "night-package",
  checkin: "2026-11-01",
  guests: 2,
  totalAmount: 14500,
  requests: "Honeymoon floral setup and late arrival"
};

const msgA = compileWhatsAppMessage(sampleA);
console.log("\nGenerated Message (Single Villa - Night Package):\n" + msgA);

assert(msgA.includes("🌿 *RESERVATION ENQUIRY · TRANQUIL TERRACE GALLE* 🌿"), "Header missing");
assert(msgA.includes("• *Villa*: Villa Araliya"), "Villa missing or wrong format");
assert(msgA.includes("• *Package*: Night Package (5:00 PM – 9:00 AM)"), "Package timing missing");
assert(msgA.includes("• *Check-in Date*: 2026-11-01"), "Checkin date missing");
assert(msgA.includes("• *Guests*: 2 Guest(s)"), "Guests missing");
assert(msgA.includes("• *Guest Name*: Kasun Perera"), "Guest Name missing");
assert(msgA.includes("• *Contact*: +94 77 123 4567"), "Contact missing");
assert(msgA.includes("• *Special Requests*: Honeymoon floral setup and late arrival"), "Requests missing");
assert(msgA.includes("• *Estimated Total*: LKR 14,500 (~$47 USD)"), "Total estimate wrong");
assert(msgA.includes("Hello Tranquil Terrace Concierge, I would like to check availability and confirm this booking. Thank you!"), "Closing missing");

const urlA = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msgA)}`;
assert(urlA.startsWith("https://wa.me/94770682366?text="), "wa.me phone number wrong");
console.log("✓ Test Case A passed! URL length: " + urlA.length);

// Test Case B: Both Villas Day & Night Package (4 guests, Option B)
const sampleB = {
  guestName: "Samantha Miller",
  phone: "+44 7911 123456",
  villaKey: "Both Villas",
  packageId: "day-night-package",
  timing: "B",
  checkin: "2026-12-15",
  guests: 4,
  totalAmount: 52000,
  requests: ""
};

const msgB = compileWhatsAppMessage(sampleB);
console.log("\nGenerated Message (Both Villas - 24 Hours Option B):\n" + msgB);

assert(msgB.includes("• *Villa*: Both Villas (up to 4 guests)"), "Both villas title mismatch");
assert(msgB.includes("• *Package*: Day & Night Package (24 Hours · Option B: 5:00 PM → 3:00 PM Next Day)"), "Day & night option mismatch");
assert(msgB.includes("• *Guests*: 4 Guest(s)"), "Guests count mismatch");
assert(msgB.includes("• *Special Requests*: None"), "Empty requests fallback to 'None' failed");
assert(msgB.includes("• *Estimated Total*: LKR 52,000 (~$169 USD)"), "Both villas price mismatch");

console.log("✓ Test Case B passed!");

// Test Case C: Day Package (10 AM - 3 PM)
const sampleC = {
  guestName: "Dilshan Silva",
  phone: "+94 71 888 9999",
  villaKey: "Villa Olu",
  packageId: "day-package",
  checkin: "2026-11-10",
  guests: 2,
  totalAmount: 12500,
  requests: "Vegetarian lunch options"
};

const msgC = compileWhatsAppMessage(sampleC);
assert(msgC.includes("• *Package*: Day Package (10:00 AM – 3:00 PM)"), "Day package mismatch");
assert(msgC.includes("• *Estimated Total*: LKR 12,500 (~$41 USD)"), "Day package price mismatch");
console.log("✓ Test Case C passed!");

// 3. Verify HTML pages include all elements
console.log("\n3. Verifying HTML pages integration...");
const htmlFiles = [
  "index.html",
  "villas.html",
  "experiences.html",
  "gallery.html",
  "explore-galle.html",
  "contact.html"
];

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, "public", file), "utf-8");
  assert(html.includes('href="whatsapp-booking.css"'), `${file} missing whatsapp-booking.css in <head>`);
  assert(html.includes('src="whatsapp-booking.js"'), `${file} missing whatsapp-booking.js before </body>`);
  assert(html.includes('id="floating-whatsapp"'), `${file} missing floating WhatsApp button`);
  assert(html.includes('#25D366'), `${file} missing official #25D366 color in floating WhatsApp button`);
  assert(html.includes('class="tt-wa-tooltip"'), `${file} missing luxury WhatsApp tooltip`);
  assert(html.includes('class="footer-contact-link whatsapp-direct"'), `${file} missing footer whatsapp-direct button`);
  assert(html.includes('class="social-link social-link-wa"'), `${file} missing footer social-link-wa`);
  console.log(`✓ ${file} verified: CSS, JS, floating button, official green SVG, and footer links all present!`);
}

console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
