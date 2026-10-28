/**
 * TRANQUIL TERRACE GALLE — OFFICIAL WHATSAPP BOOKING ENGINE & MODAL
 * Official brand WhatsApp integration (#25D366) & bespoke luxury reservation engine
 * Concierge Direct Line: +94 77 068 2366
 */

(function () {
  "use strict";

  const WHATSAPP_PHONE = "94770682366";
  const USD_EXCHANGE_RATE = 308; // 1 USD ~ 308 LKR

  // Official Stay Package Definitions
  const PACKAGES = {
    "day-package": {
      name: "Day Package (10 AM – 3 PM)",
      shortName: "Day Package",
      timing: "10:00 AM – 3:00 PM (5 Hours)",
      priceLKR: 12500,
      bothPriceLKR: 25000,
      description: "Day escape • Lunch & Welcome Drink included",
      hasFloatingBreakfast: false,
      isDayUse: true,
    },
    "night-package": {
      name: "Night Package (5 PM – 9 AM)",
      shortName: "Night Package",
      timing: "5:00 PM – 9:00 AM (Next Day)",
      priceLKR: 14500,
      bothPriceLKR: 29000,
      description: "Overnight retreat • Signature Floating Breakfast & Dinner included",
      hasFloatingBreakfast: true,
      isDayUse: false,
    },
    "day-night-package": {
      name: "Day & Night Package (24 Hours)",
      shortName: "Day & Night Package",
      timing: "Full 24-Hour Escape",
      priceLKR: 26000,
      bothPriceLKR: 52000,
      description: "Full 24-hour escape • All Meals & Floating Breakfast included",
      hasFloatingBreakfast: true,
      isDayUse: false,
      options: {
        A: "Option A: 11:00 AM → 9:00 AM Next Day",
        B: "Option B: 5:00 PM → 3:00 PM Next Day",
      },
    },
  };

  // Official Villa Definitions
  const VILLAS = {
    "Villa Araliya": {
      name: "Villa Araliya",
      label: "Villa Araliya",
      features: "Private King Suite • Plunge Pool • Garden Vista",
      multiplier: 1,
      maxGuests: 2,
    },
    "Villa Olu": {
      name: "Villa Olu",
      label: "Villa Olu",
      features: "Private King Suite • Plunge Pool • Cinnamon Grove",
      multiplier: 1,
      maxGuests: 2,
    },
    "Both Villas": {
      name: "Both Villas (up to 4 guests)",
      label: "Both Villas (Entire Estate)",
      features: "Entire Private Estate • 2 King Suites • 2 Pools • Up to 4 Guests",
      multiplier: 2,
      maxGuests: 4,
    },
  };

  // Official WhatsApp Brand SVG (#25D366 + White Handset & Bubble)
  const OFFICIAL_WA_BADGE_SVG = `
<svg viewBox="0 0 36 36" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect width="36" height="36" rx="18" fill="#25D366"/>
  <path d="M18 8.5C12.8 8.5 8.5 12.8 8.5 18C8.5 19.7 9 21.4 9.9 22.8L8.5 27.5L13.4 26.2C14.8 27 16.4 27.5 18 27.5C23.2 27.5 27.5 23.2 27.5 18C27.5 12.8 23.2 8.5 18 8.5ZM22.8 21.9C22.6 22.4 21.8 22.9 21.2 23C20.8 23.1 20.2 23.1 18.2 22.3C15.7 21.3 14 18.7 13.9 18.5C13.8 18.3 12.9 17.1 12.9 15.9C12.9 14.7 13.5 14.1 13.7 13.8C13.9 13.6 14.2 13.5 14.5 13.5C14.6 13.5 14.7 13.5 14.8 13.5C15.1 13.5 15.2 13.5 15.4 13.9C15.6 14.4 16.1 15.7 16.2 15.8C16.3 16 16.3 16.1 16.2 16.3C16.1 16.5 16 16.6 15.9 16.7C15.8 16.9 15.6 17 15.5 17.2C15.3 17.3 15.2 17.5 15.4 17.8C15.6 18.1 16.2 19.1 17.1 19.9C18.2 20.9 19.1 21.2 19.4 21.4C19.7 21.5 19.9 21.5 20.1 21.3C20.3 21 20.8 20.4 21 20.1C21.2 19.8 21.4 19.9 21.7 20C22 20.1 23.6 20.9 23.9 21.1C24.2 21.2 24.4 21.3 24.5 21.5C24.6 21.8 24.6 22.3 22.8 21.9Z" fill="#FFFFFF"/>
</svg>`.trim();

  // Inline 24x24 Official WhatsApp Icon
  const OFFICIAL_WA_ICON_SVG = `
<svg class="official-wa-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path fill="#25D366" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z"/>
  <path fill="#FFFFFF" fill-rule="evenodd" d="M17.51 14.38C17.21 14.23 15.74 13.51 15.47 13.41C15.19 13.31 15 13.26 14.8 13.56C14.6 13.86 14.04 14.52 13.86 14.72C13.69 14.92 13.52 14.94 13.22 14.79C12.92 14.64 11.96 14.33 10.82 13.31C9.94 12.52 9.34 11.55 9.17 11.25C9 10.95 9.15 10.79 9.3 10.64C9.43 10.51 9.6 10.29 9.75 10.12C9.9 9.94 9.95 9.82 10.05 9.62C10.15 9.42 10.1 9.24 10.02 9.09C9.95 8.94 9.35 7.47 9.1 6.86C8.86 6.27 8.61 6.35 8.43 6.34C8.26 6.33 8.06 6.33 7.86 6.33C7.66 6.33 7.34 6.41 7.06 6.71C6.79 7.01 6.02 7.73 6.02 9.19C6.02 10.65 7.08 12.06 7.23 12.26C7.38 12.46 9.32 15.46 12.3 16.74C13.01 17.05 13.57 17.23 14 17.37C14.71 17.6 15.36 17.57 15.87 17.49C16.44 17.4 17.63 16.77 17.88 16.06C18.13 15.36 18.13 14.75 18.05 14.63C17.98 14.5 17.81 14.43 17.51 14.28V14.38Z"/>
</svg>`.trim();

  // Luxury Modal HTML Template
  const MODAL_HTML = `
<div class="tt-wa-modal-backdrop" id="tt-wa-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="tt-wa-modal-title" aria-hidden="true">
  <div class="tt-wa-modal">
    <div class="tt-wa-sheet-pill"></div>
    
    <!-- Modal Header -->
    <div class="tt-wa-modal-header">
      <div class="tt-wa-modal-eyebrow">
        <span>🌿 TRANQUIL TERRACE CONCIERGE</span>
      </div>
      <h2 class="tt-wa-modal-title" id="tt-wa-modal-title">Reserve Your Private Escape</h2>
      <p class="tt-wa-modal-desc">Select your dates, private villa &amp; package. We compile your personalized reservation directly to WhatsApp for instant confirmation.</p>
      
      <button type="button" class="tt-wa-modal-close" id="tt-wa-modal-close" aria-label="Close reservation modal">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- Modal Form Body -->
    <form class="tt-wa-modal-body" id="tt-wa-booking-form">
      
      <!-- 1. Guest Information -->
      <div class="tt-wa-section">
        <label class="tt-wa-label">
          <span>1. Guest Details</span>
          <span class="tt-wa-label-helper">Direct Concierge Coordination</span>
        </label>
        <div class="tt-wa-grid-2">
          <div>
            <input type="text" class="tt-wa-input" id="tt-wa-name" name="guestName" placeholder="Full Name *" required autocomplete="name" />
          </div>
          <div>
            <input type="tel" class="tt-wa-input" id="tt-wa-phone" name="phone" placeholder="WhatsApp / Mobile Number *" required autocomplete="tel" />
          </div>
        </div>
      </div>

      <!-- 2. Villa Selector: Villa Araliya / Villa Olu / Both Villas -->
      <div class="tt-wa-section">
        <label class="tt-wa-label">
          <span>2. Select Private Villa</span>
          <span class="tt-wa-label-helper" id="tt-wa-villa-helper">Max 2 Guests per Villa • Up to 4 for Both</span>
        </label>
        <div class="tt-wa-villa-grid">
          <!-- Villa Araliya -->
          <div class="tt-wa-villa-card selected" data-villa="Villa Araliya">
            <div class="tt-wa-villa-card-header">
              <span class="tt-wa-villa-name">Villa Araliya</span>
              <span class="tt-wa-check-circle">✓</span>
            </div>
            <div class="tt-wa-villa-features">Private King Suite • Plunge Pool • Garden Vista</div>
          </div>

          <!-- Villa Olu -->
          <div class="tt-wa-villa-card" data-villa="Villa Olu">
            <div class="tt-wa-villa-card-header">
              <span class="tt-wa-villa-name">Villa Olu</span>
              <span class="tt-wa-check-circle">✓</span>
            </div>
            <div class="tt-wa-villa-features">Private King Suite • Plunge Pool • Cinnamon Grove</div>
          </div>

          <!-- Both Villas (up to 4 guests) -->
          <div class="tt-wa-villa-card" data-villa="Both Villas">
            <div class="tt-wa-villa-card-header">
              <span class="tt-wa-villa-name">Both Villas (up to 4 guests)</span>
              <span class="tt-wa-check-circle">✓</span>
            </div>
            <div class="tt-wa-villa-features">Entire Private Estate • 2 King Suites • 2 Pools • Up to 4 Guests</div>
          </div>
        </div>
        <input type="hidden" id="tt-wa-selected-villa" name="villa" value="Villa Araliya" />
      </div>

      <!-- 3. Package Selector -->
      <div class="tt-wa-section">
        <label class="tt-wa-label">
          <span>3. Stay Package</span>
          <span class="tt-wa-label-helper">Guaranteed Best Rates</span>
        </label>
        <div class="tt-wa-pkg-list">
          
          <!-- Day Package (10 AM – 3 PM) · LKR 12,500 -->
          <div class="tt-wa-pkg-tile" data-pkg="day-package">
            <div class="tt-wa-pkg-radio"></div>
            <div class="tt-wa-pkg-info">
              <div class="tt-wa-pkg-name-wrap">
                <span class="tt-wa-pkg-name">Day Package</span>
              </div>
              <div class="tt-wa-pkg-meta">10:00 AM – 3:00 PM • Prepared Lunch &amp; Welcome Drink</div>
            </div>
            <div class="tt-wa-pkg-price-col">
              <div class="tt-wa-pkg-price-lkr" id="tt-wa-price-day-lkr">LKR 12,500</div>
              <div class="tt-wa-pkg-price-usd" id="tt-wa-price-day-usd">approx. $41 USD</div>
            </div>
          </div>

          <!-- Night Package (5 PM – 9 AM) · LKR 14,500 (Default) -->
          <div class="tt-wa-pkg-tile selected" data-pkg="night-package">
            <div class="tt-wa-pkg-radio"></div>
            <div class="tt-wa-pkg-info">
              <div class="tt-wa-pkg-name-wrap">
                <span class="tt-wa-pkg-name">Night Package</span>
                <span class="tt-wa-pkg-badge">POPULAR</span>
              </div>
              <div class="tt-wa-pkg-meta">5:00 PM – 9:00 AM Next Day • Floating Breakfast &amp; Dinner</div>
            </div>
            <div class="tt-wa-pkg-price-col">
              <div class="tt-wa-pkg-price-lkr" id="tt-wa-price-night-lkr">LKR 14,500</div>
              <div class="tt-wa-pkg-price-usd" id="tt-wa-price-night-usd">approx. $47 USD</div>
            </div>
          </div>

          <!-- Day & Night Package (24 Hours) · LKR 26,000 -->
          <div class="tt-wa-pkg-tile" data-pkg="day-night-package">
            <div class="tt-wa-pkg-radio"></div>
            <div class="tt-wa-pkg-info">
              <div class="tt-wa-pkg-name-wrap">
                <span class="tt-wa-pkg-name">Day &amp; Night Package</span>
                <span class="tt-wa-pkg-badge">24 HOURS</span>
              </div>
              <div class="tt-wa-pkg-meta">Full 24-Hour Stay • All Meals &amp; Floating Breakfast</div>
            </div>
            <div class="tt-wa-pkg-price-col">
              <div class="tt-wa-pkg-price-lkr" id="tt-wa-price-daynight-lkr">LKR 26,000</div>
              <div class="tt-wa-pkg-price-usd" id="tt-wa-price-daynight-usd">approx. $84 USD</div>
            </div>
          </div>

        </div>

        <!-- Timing Option Pills for Day & Night Package -->
        <div class="tt-wa-timing-box" id="tt-wa-timing-box">
          <span style="font-size: 11.5px; font-weight: 600; color: #5B615A;">Select 24-Hour Timing Window:</span>
          <div class="tt-wa-timing-pills">
            <button type="button" class="tt-wa-timing-pill selected" data-timing="A">Option A: 11:00 AM → 9:00 AM Next Day</button>
            <button type="button" class="tt-wa-timing-pill" data-timing="B">Option B: 5:00 PM → 3:00 PM Next Day</button>
          </div>
        </div>

        <input type="hidden" id="tt-wa-selected-pkg" name="package" value="night-package" />
        <input type="hidden" id="tt-wa-selected-timing" name="timing" value="A" />
      </div>

      <!-- 4. Check-in Date & Guests -->
      <div class="tt-wa-section">
        <label class="tt-wa-label">
          <span>4. Dates &amp; Guests</span>
          <span class="tt-wa-label-helper" id="tt-wa-dates-helper">Check-in from today onwards</span>
        </label>
        <div class="tt-wa-grid-2">
          <div>
            <span style="font-size: 11px; color: #666; display: block; margin-bottom: 4px;">Check-In Date *</span>
            <input type="date" class="tt-wa-input" id="tt-wa-checkin" name="checkin" required />
          </div>
          <div>
            <span style="font-size: 11px; color: #666; display: block; margin-bottom: 4px;">Check-Out Date *</span>
            <input type="date" class="tt-wa-input" id="tt-wa-checkout" name="checkout" required />
          </div>
        </div>
        <div style="margin-top: 10px;">
          <span style="font-size: 11px; color: #666; display: block; margin-bottom: 4px;">Number of Guests *</span>
          <select class="tt-wa-select" id="tt-wa-guests" name="guests">
            <option value="2" selected>2 Guests (Full Villa Capacity)</option>
            <option value="1">1 Guest (Single Occupancy)</option>
          </select>
        </div>
      </div>

      <!-- 5. Special Requests -->
      <div class="tt-wa-section" id="tt-wa-requests-section">
        <label class="tt-wa-label">
          <span>5. Special Requests</span>
          <span class="tt-wa-label-helper">Custom Arrangements</span>
        </label>
        <div>
          <textarea class="tt-wa-textarea" id="tt-wa-requests" name="requests" rows="3" placeholder="Special requests (floating breakfast, late check-in, honeymoon setup, airport transfer, dietary notes)..."></textarea>
        </div>
      </div>

      <!-- 6. Live Price Summary Box -->
      <div class="tt-wa-rate-box">
        <div class="tt-wa-rate-top">
          <div>
            <div class="tt-wa-rate-desc" id="tt-wa-rate-summary">Villa Araliya • Night Package</div>
            <div style="font-size: 11.5px; color: #737A72;" id="tt-wa-rate-dates">Check-in: 5:00 PM | Check-out: 9:00 AM Next Day</div>
          </div>
          <div class="tt-wa-rate-numbers">
            <div class="tt-wa-rate-main" id="tt-wa-rate-lkr">LKR 14,500</div>
            <div class="tt-wa-rate-sub" id="tt-wa-rate-usd">approx. $47 USD</div>
          </div>
        </div>
        <div class="tt-wa-rate-perks">
          <span class="tt-wa-perk-item">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            Private Plunge Pool
          </span>
          <span class="tt-wa-perk-item">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            Signature Floating Breakfast Included
          </span>
          <span class="tt-wa-perk-item">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            Zero Commission &amp; Direct Host Confirmation
          </span>
        </div>
      </div>

      <!-- 7. Primary Submit Action Button -->
      <button type="submit" class="tt-wa-submit-btn" id="tt-wa-submit-btn">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" class="wa-btn-icon" xmlns="http://www.w3.org/2000/svg">
          <path fill="#25D366" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z"/>
          <path fill="#FFFFFF" fill-rule="evenodd" d="M17.51 14.38C17.21 14.23 15.74 13.51 15.47 13.41C15.19 13.31 15 13.26 14.8 13.56C14.6 13.86 14.04 14.52 13.86 14.72C13.69 14.92 13.52 14.94 13.22 14.79C12.92 14.64 11.96 14.33 10.82 13.31C9.94 12.52 9.34 11.55 9.17 11.25C9 10.95 9.15 10.79 9.3 10.64C9.43 10.51 9.6 10.29 9.75 10.12C9.9 9.94 9.95 9.82 10.05 9.62C10.15 9.42 10.1 9.24 10.02 9.09C9.95 8.94 9.35 7.47 9.1 6.86C8.86 6.27 8.61 6.35 8.43 6.34C8.26 6.33 8.06 6.33 7.86 6.33C7.66 6.33 7.34 6.41 7.06 6.71C6.79 7.01 6.02 7.73 6.02 9.19C6.02 10.65 7.08 12.06 7.23 12.26C7.38 12.46 9.32 15.46 12.3 16.74C13.01 17.05 13.57 17.23 14 17.37C14.71 17.6 15.36 17.57 15.87 17.49C16.44 17.4 17.63 16.77 17.88 16.06C18.13 15.36 18.13 14.75 18.05 14.63C17.98 14.5 17.81 14.43 17.51 14.28V14.38Z"/>
        </svg>
        <span>Send Reservation via WhatsApp ↗</span>
      </button>

      <!-- Secondary Direct Fallback Link -->
      <a href="https://wa.me/94770682366?text=Hello%20Tranquil%20Terrace%20Concierge%2C%20I%20have%20a%20quick%20question%20about%20your%20villas." target="_blank" rel="noopener" class="tt-wa-direct-link">
        Quick Chat on WhatsApp ↗
      </a>

    </form>
  </div>
</div>
`.trim();

  // Helper date formatter: YYYY-MM-DD in local time
  function toISODate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Format currency
  function formatLKR(amount) {
    return "LKR " + new Intl.NumberFormat("en-LK").format(Math.round(amount));
  }

  function formatUSD(lkrAmount) {
    const usd = Math.round(lkrAmount / USD_EXCHANGE_RATE);
    return `approx. $${usd} USD`;
  }

  // Main WhatsApp Booking Engine
  class WhatsAppBookingEngine {
    constructor() {
      this.initModal();
      this.upgradeExistingIcons();
      this.attachGlobalTriggers();
      this.bindModalEvents();
      this.setDefaultDates();
      this.recalculate();
    }

    // 1. Inject modal markup if not already present
    initModal() {
      if (document.getElementById("tt-wa-modal-backdrop")) return;
      const wrap = document.createElement("div");
      wrap.innerHTML = MODAL_HTML;
      document.body.appendChild(wrap.firstElementChild);
    }

    // 2. Upgrade all WhatsApp buttons & icons with the official green logo
    upgradeExistingIcons() {
      // Upgrade floating WhatsApp button
      const floatingBtns = document.querySelectorAll(
        ".meta-floating-whatsapp, #floating-whatsapp, .tt-floating-wa, #tt-floating-wa"
      );
      floatingBtns.forEach((btn) => {
        btn.innerHTML = OFFICIAL_WA_BADGE_SVG;
        btn.setAttribute("aria-label", "Chat or Book on WhatsApp");
        btn.setAttribute("data-whatsapp-book", "");

        // Ensure tooltip is next to floating button
        if (!document.getElementById("tt-wa-tooltip") && btn.parentNode) {
          const tooltip = document.createElement("div");
          tooltip.className = "tt-wa-tooltip";
          tooltip.id = "tt-wa-tooltip";
          tooltip.setAttribute("aria-hidden", "true");
          tooltip.innerHTML = `<span class="tt-wa-pulse-dot"></span><span>Chat or Book on WhatsApp</span>`;
          btn.parentNode.insertBefore(tooltip, btn.nextSibling);

          // Subtle pulse hint
          setTimeout(() => tooltip.classList.add("visible"), 1200);
          setTimeout(() => tooltip.classList.remove("visible"), 6500);
        }
      });

      // Upgrade generic stroke icons on WhatsApp buttons across page
      document.querySelectorAll(".whatsapp-direct, .drawer-contact-wa, #home-cal-enquire-btn").forEach((el) => {
        const svg = el.querySelector("svg");
        if (svg && !svg.classList.contains("official-wa-icon")) {
          svg.outerHTML = OFFICIAL_WA_ICON_SVG;
        }
        el.setAttribute("data-whatsapp-book", "");
      });

      // Ensure footer social link has data-whatsapp-book
      document.querySelectorAll(".social-link-wa, .social-link[href*='wa.me']").forEach((el) => {
        el.setAttribute("data-whatsapp-book", "");
      });
    }

    // 3. Attach global click triggers
    attachGlobalTriggers() {
      document.addEventListener("click", (e) => {
        const target = e.target;
        if (!target) return;

        // Any trigger with data-whatsapp-book, .meta-floating-whatsapp, .whatsapp-direct, or sticky book
        const trigger = target.closest(
          "[data-whatsapp-book], .meta-floating-whatsapp, #floating-whatsapp, .tt-floating-wa, #tt-floating-wa, .whatsapp-direct, .drawer-contact-wa, #home-cal-enquire-btn, .meta-btn-sticky-book"
        );

        if (trigger) {
          // If it's the direct quick-chat link inside the modal itself, don't intercept
          if (trigger.classList.contains("tt-wa-direct-link")) {
            return;
          }

          e.preventDefault();

          // Check if trigger carries preset values
          const presetVilla = trigger.getAttribute("data-villa");
          const presetPkg = trigger.getAttribute("data-package");
          const presetGuests = trigger.getAttribute("data-guests");
          const presetCheckin = trigger.getAttribute("data-checkin");

          const preset = {};
          if (presetVilla) preset.villa = presetVilla;
          if (presetPkg) preset.packageId = presetPkg;
          if (presetGuests) preset.guests = presetGuests;
          if (presetCheckin) preset.checkin = presetCheckin;

          this.openModal(preset);
        }
      });
    }

    // 4. Bind events inside modal
    bindModalEvents() {
      const backdrop = document.getElementById("tt-wa-modal-backdrop");
      const closeBtn = document.getElementById("tt-wa-modal-close");
      const form = document.getElementById("tt-wa-booking-form");

      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.closeModal());
      }

      if (backdrop) {
        backdrop.addEventListener("click", (e) => {
          if (e.target === backdrop) this.closeModal();
        });
      }

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && backdrop && backdrop.classList.contains("open")) {
          this.closeModal();
        }
      });

      // Villa Cards Selection
      document.querySelectorAll(".tt-wa-villa-card").forEach((card) => {
        card.addEventListener("click", () => {
          this.selectVilla(card.dataset.villa);
        });
      });

      // Package Tiles Selection
      document.querySelectorAll(".tt-wa-pkg-tile").forEach((tile) => {
        tile.addEventListener("click", () => {
          this.selectPackage(tile.dataset.pkg);
        });
      });

      // Day & Night Timing Options
      document.querySelectorAll(".tt-wa-timing-pill").forEach((pill) => {
        pill.addEventListener("click", () => {
          document.querySelectorAll(".tt-wa-timing-pill").forEach((p) => p.classList.remove("selected"));
          pill.classList.add("selected");
          const timingInput = document.getElementById("tt-wa-selected-timing");
          if (timingInput) timingInput.value = pill.dataset.timing;
          this.recalculate();
        });
      });

      // Date Changes
      const checkinInput = document.getElementById("tt-wa-checkin");
      const checkoutInput = document.getElementById("tt-wa-checkout");

      if (checkinInput) {
        checkinInput.addEventListener("change", () => {
          this.adjustDatesOnCheckinChange();
          this.recalculate();
        });
      }

      if (checkoutInput) {
        checkoutInput.addEventListener("change", () => this.recalculate());
      }

      // Guest Count Changes
      const guestsSelect = document.getElementById("tt-wa-guests");
      if (guestsSelect) {
        guestsSelect.addEventListener("change", () => this.recalculate());
      }

      // Form Submission
      if (form) {
        form.addEventListener("submit", (e) => this.handleSubmit(e));
      }
    }

    // Set Default Dates: Today -> Tomorrow (or today for day package)
    setDefaultDates() {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const checkin = document.getElementById("tt-wa-checkin");
      const checkout = document.getElementById("tt-wa-checkout");

      const todayStr = toISODate(today);
      const tomorrowStr = toISODate(tomorrow);

      if (checkin) {
        checkin.min = todayStr;
        if (!checkin.value) checkin.value = todayStr;
      }
      if (checkout) {
        checkout.min = todayStr;
        if (!checkout.value) checkout.value = tomorrowStr;
      }
    }

    // Auto adjust checkout date when checkin date or package changes
    adjustDatesOnCheckinChange() {
      const checkin = document.getElementById("tt-wa-checkin");
      const checkout = document.getElementById("tt-wa-checkout");
      const pkgId = document.getElementById("tt-wa-selected-pkg")?.value || "night-package";
      if (!checkin || !checkout || !checkin.value) return;

      const inDate = new Date(checkin.value);
      if (isNaN(inDate.getTime())) return;

      if (pkgId === "day-package") {
        // Day package: check-out is same date (10 AM to 3 PM)
        checkout.value = checkin.value;
        checkout.min = checkin.value;
      } else {
        // Night or Day & Night: checkout is following day
        const outDate = new Date(inDate);
        outDate.setDate(inDate.getDate() + 1);
        checkout.value = toISODate(outDate);
        checkout.min = toISODate(outDate);
      }
    }

    // Select Villa & Update Options / Pricing
    selectVilla(villaKey) {
      // Normalize key
      let key = "Villa Araliya";
      if (villaKey.includes("Both")) key = "Both Villas";
      else if (villaKey.includes("Olu")) key = "Villa Olu";

      document.querySelectorAll(".tt-wa-villa-card").forEach((card) => {
        card.classList.toggle("selected", card.dataset.villa === key);
      });

      const input = document.getElementById("tt-wa-selected-villa");
      if (input) input.value = key;

      // Update Guest capacity dropdown based on villa
      const guestsSelect = document.getElementById("tt-wa-guests");
      if (guestsSelect) {
        const currentVal = guestsSelect.value;
        if (key === "Both Villas") {
          guestsSelect.innerHTML = `
            <option value="4" selected>4 Guests (Both Villas · Full Capacity)</option>
            <option value="3">3 Guests</option>
            <option value="2">2 Guests</option>
            <option value="1">1 Guest</option>
          `;
          if (["1", "2", "3", "4"].includes(currentVal)) {
            guestsSelect.value = currentVal === "1" ? "2" : currentVal;
          }
        } else {
          guestsSelect.innerHTML = `
            <option value="2" selected>2 Guests (Full Villa Capacity)</option>
            <option value="1">1 Guest (Single Occupancy)</option>
          `;
          if (currentVal === "1") {
            guestsSelect.value = "1";
          } else {
            guestsSelect.value = "2";
          }
        }
      }

      // Update Package Tile Prices for single villa vs both villas
      const isBoth = key === "Both Villas";
      const pDayLkr = document.getElementById("tt-wa-price-day-lkr");
      const pDayUsd = document.getElementById("tt-wa-price-day-usd");
      const pNightLkr = document.getElementById("tt-wa-price-night-lkr");
      const pNightUsd = document.getElementById("tt-wa-price-night-usd");
      const pDayNightLkr = document.getElementById("tt-wa-price-daynight-lkr");
      const pDayNightUsd = document.getElementById("tt-wa-price-daynight-usd");

      if (pDayLkr) pDayLkr.textContent = formatLKR(isBoth ? 25000 : 12500);
      if (pDayUsd) pDayUsd.textContent = formatUSD(isBoth ? 25000 : 12500);
      if (pNightLkr) pNightLkr.textContent = formatLKR(isBoth ? 29000 : 14500);
      if (pNightUsd) pNightUsd.textContent = formatUSD(isBoth ? 29000 : 14500);
      if (pDayNightLkr) pDayNightLkr.textContent = formatLKR(isBoth ? 52000 : 26000);
      if (pDayNightUsd) pDayNightUsd.textContent = formatUSD(isBoth ? 52000 : 26000);

      this.recalculate();
    }

    // Select Package
    selectPackage(pkgId) {
      const validId = PACKAGES[pkgId] ? pkgId : "night-package";

      document.querySelectorAll(".tt-wa-pkg-tile").forEach((tile) => {
        tile.classList.toggle("selected", tile.dataset.pkg === validId);
      });

      const input = document.getElementById("tt-wa-selected-pkg");
      if (input) input.value = validId;

      // Toggle Day & Night timing pill box
      const timingBox = document.getElementById("tt-wa-timing-box");
      if (timingBox) {
        timingBox.classList.toggle("active", validId === "day-night-package");
      }

      this.adjustDatesOnCheckinChange();
      this.recalculate();
    }

    // Recalculate Live Rate Summary Box
    recalculate() {
      const villaKey = document.getElementById("tt-wa-selected-villa")?.value || "Villa Araliya";
      const pkgId = document.getElementById("tt-wa-selected-pkg")?.value || "night-package";
      const timingOpt = document.getElementById("tt-wa-selected-timing")?.value || "A";
      const pkg = PACKAGES[pkgId] || PACKAGES["night-package"];
      const isBoth = villaKey === "Both Villas";

      const checkin = document.getElementById("tt-wa-checkin")?.value;
      const checkout = document.getElementById("tt-wa-checkout")?.value;

      let nights = 1;
      if (checkin && checkout && pkgId !== "day-package") {
        const dIn = new Date(checkin);
        const dOut = new Date(checkout);
        const diffTime = dOut.getTime() - dIn.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) nights = diffDays;
      }

      const baseRate = isBoth ? pkg.bothPriceLKR : pkg.priceLKR;
      const totalLKR = baseRate * nights;

      // Update elements
      const rateLkrElem = document.getElementById("tt-wa-rate-lkr");
      const rateUsdElem = document.getElementById("tt-wa-rate-usd");
      const rateSumElem = document.getElementById("tt-wa-rate-summary");
      const rateDatesElem = document.getElementById("tt-wa-rate-dates");

      if (rateLkrElem) rateLkrElem.textContent = formatLKR(totalLKR);
      if (rateUsdElem) rateUsdElem.textContent = formatUSD(totalLKR);

      if (rateSumElem) {
        const villaTitle = isBoth ? "Both Villas (Entire Estate)" : villaKey;
        const durationText = pkgId === "day-package" ? "Day Use" : (nights > 1 ? `${nights} Nights` : "1 Night");
        rateSumElem.textContent = `${villaTitle} • ${pkg.shortName} (${durationText})`;
      }

      if (rateDatesElem) {
        if (pkgId === "day-night-package") {
          const timingLabel = timingOpt === "B" ? "Option B (5:00 PM → 3:00 PM Next Day)" : "Option A (11:00 AM → 9:00 AM Next Day)";
          rateDatesElem.textContent = `${timingLabel} • Signature Floating Breakfast Included`;
        } else if (pkgId === "day-package") {
          rateDatesElem.textContent = "10:00 AM – 3:00 PM (Same Day) • Prepared Lunch Included";
        } else {
          rateDatesElem.textContent = "5:00 PM – 9:00 AM Next Day • Floating Breakfast & Dinner Included";
        }
      }
    }

    // Open Modal
    openModal(preset = {}) {
      const backdrop = document.getElementById("tt-wa-modal-backdrop");
      if (!backdrop) return;

      if (preset.villa) this.selectVilla(preset.villa);
      if (preset.packageId) this.selectPackage(preset.packageId);

      if (preset.checkin) {
        const checkinInput = document.getElementById("tt-wa-checkin");
        if (checkinInput) {
          checkinInput.value = preset.checkin;
          this.adjustDatesOnCheckinChange();
        }
      }

      if (preset.guests) {
        const guestsSelect = document.getElementById("tt-wa-guests");
        if (guestsSelect) guestsSelect.value = String(preset.guests);
      }

      this.recalculate();

      backdrop.classList.add("open");
      backdrop.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      setTimeout(() => {
        const nameInput = document.getElementById("tt-wa-name");
        if (nameInput) nameInput.focus();
      }, 150);
    }

    // Close Modal
    closeModal() {
      const backdrop = document.getElementById("tt-wa-modal-backdrop");
      if (backdrop) {
        backdrop.classList.remove("open");
        backdrop.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }
    }

    // Compiles luxury formatted WhatsApp message strictly matching specification
    compileWhatsAppMessage(data) {
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

    // Handle Form Submit
    async handleSubmit(e) {
      e.preventDefault();

      const guestName = document.getElementById("tt-wa-name")?.value.trim();
      const phone = document.getElementById("tt-wa-phone")?.value.trim();
      const villaKey = document.getElementById("tt-wa-selected-villa")?.value || "Villa Araliya";
      const packageId = document.getElementById("tt-wa-selected-pkg")?.value || "night-package";
      const timing = document.getElementById("tt-wa-selected-timing")?.value || "A";
      const checkin = document.getElementById("tt-wa-checkin")?.value;
      const checkout = document.getElementById("tt-wa-checkout")?.value;
      const guests = Number(document.getElementById("tt-wa-guests")?.value || 2);
      const requests = document.getElementById("tt-wa-requests")?.value;

      if (!guestName) {
        alert("Please enter your name.");
        return;
      }
      if (!phone) {
        alert("Please enter your WhatsApp / mobile number.");
        return;
      }

      // Calculate nights & total
      const pkg = PACKAGES[packageId] || PACKAGES["night-package"];
      const isBoth = villaKey === "Both Villas";
      let nights = 1;
      if (checkin && checkout && packageId !== "day-package") {
        const diff = new Date(checkout).getTime() - new Date(checkin).getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days > 0) nights = days;
      }
      const baseRate = isBoth ? pkg.bothPriceLKR : pkg.priceLKR;
      const totalAmount = baseRate * nights;

      const payload = {
        guestName,
        phone,
        villaKey,
        packageId,
        timing,
        checkin,
        checkout,
        guests,
        totalAmount,
        requests,
      };

      // Button UI Loading State
      const submitBtn = document.getElementById("tt-wa-submit-btn");
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Opening WhatsApp Concierge...</span>`;
      }

      // 1. Fire background lead save to /api/bookings (never blocks user)
      try {
        fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guestName,
            phone,
            villaName: isBoth ? "Villa Araliya" : villaKey,
            packageId,
            timingOption: timing,
            checkin,
            checkout,
            guests: isBoth ? 2 : Math.min(2, guests),
            specialRequest: requests ? requests.trim() : `Enquiry for ${villaKey}`,
            source: "WhatsApp Booking Modal",
          }),
        }).catch(() => {});
      } catch (err) {}

      // 2. Build luxury WhatsApp message
      const message = this.compileWhatsAppMessage(payload);
      const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

      // 3. Open WhatsApp in new tab
      window.open(waUrl, "_blank");

      // 4. Reset button and close modal after brief delay
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
        this.closeModal();
      }, 1200);
    }
  }

  // Helper initialization
  function initEngine() {
    window.ttWhatsAppBooking = new WhatsAppBookingEngine();
    // Expose convenient global openers for other scripts
    window.openTranquilWhatsAppModal = function (preset) {
      window.ttWhatsAppBooking.openModal(preset);
    };
    window.openWhatsAppModal = function (preset) {
      window.ttWhatsAppBooking.openModal(preset);
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEngine);
  } else {
    initEngine();
  }
})();
