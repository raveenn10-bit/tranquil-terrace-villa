/**
 * Tranquil Terrace Galle — Meta AI Luxury Redesign Client Logic
 * Handles:
 * - Currency toggling (LKR / USD) across all prices
 * - Interactive stay package selection & timing options (Day, Night, Day & Night)
 * - Booking calculation & prefilled WhatsApp enquiry generation
 * - FAQ accordion interactivity
 * - Video playback toggle & fallback handling
 * - Mobile navigation & sticky booking bar
 */

(function () {
  "use strict";

  // Configuration & State
  const USD_RATE = 308; // Approximate conversion: 1 USD ~ 308 LKR
  let currentCurrency = "LKR";

  const PACKAGES = {
    "day-package": {
      name: "Day Package",
      priceLKR: 12500,
      checkinTime: "10:00 AM",
      checkoutTime: "3:00 PM",
      endNextDay: false,
    },
    "night-package": {
      name: "Night Package",
      priceLKR: 14500,
      checkinTime: "5:00 PM",
      checkoutTime: "9:00 AM (Next Day)",
      endNextDay: true,
    },
    "day-night-package": {
      name: "Day & Night Package",
      priceLKR: 26000,
      timingOptions: {
        A: {
          label: "Option A: 11:00 AM – 9:00 AM (Next Day)",
          checkinTime: "11:00 AM",
          checkoutTime: "9:00 AM (Next Day)",
          endNextDay: true,
        },
        B: {
          label: "Option B: 5:00 PM – 3:00 PM (Next Day)",
          checkinTime: "5:00 PM",
          checkoutTime: "3:00 PM (Next Day)",
          endNextDay: true,
        },
      },
    },
  };

  // Helper Formatters
  function formatMoney(lkrAmount, currency) {
    if (currency === "USD") {
      const usd = Math.round(lkrAmount / USD_RATE);
      return `$${usd} USD`;
    }
    return `LKR ${Number(lkrAmount).toLocaleString()}`;
  }

  function formatConverted(lkrAmount, currency) {
    if (currency === "USD") {
      return `≈ LKR ${Number(lkrAmount).toLocaleString()}`;
    }
    const usd = Math.round(lkrAmount / USD_RATE);
    return `≈ $${usd} USD`;
  }

  // Update All Currency Displays Across The Site
  function updateCurrency(curr) {
    currentCurrency = curr;

    // Update active button state
    document.querySelectorAll(".currency-toggle button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.curr === curr);
    });

    // Update all elements with data-price-lkr
    document.querySelectorAll("[data-price-lkr]").forEach((el) => {
      const lkr = Number(el.getAttribute("data-price-lkr")) || 0;
      el.textContent = formatMoney(lkr, curr);
    });

    // Update converted approximations
    document.querySelectorAll("[data-converted-lkr]").forEach((el) => {
      const lkr = Number(el.getAttribute("data-converted-lkr")) || 0;
      el.textContent = formatConverted(lkr, curr);
    });

    // Recalculate booking card price
    recalculateBooking();
  }

  // Recalculate Booking Card Price
  function recalculateBooking() {
    const pkgSelect = document.getElementById("meta-package-select");
    const priceMain = document.getElementById("meta-price-main");
    const priceConv = document.getElementById("meta-price-converted");
    const timingWrap = document.getElementById("meta-timing-toggle");

    if (!pkgSelect) return;
    const pkgId = pkgSelect.value;
    const pkg = PACKAGES[pkgId] || PACKAGES["day-package"];

    // Toggle timing option selector
    if (timingWrap) {
      timingWrap.classList.toggle("active", pkgId === "day-night-package");
    }

    if (priceMain) {
      priceMain.textContent = formatMoney(pkg.priceLKR, currentCurrency);
    }
    if (priceConv) {
      priceConv.textContent = formatConverted(pkg.priceLKR, currentCurrency);
    }
  }

  // Select Package from Package Cards on the page
  function selectPackage(pkgId, timingOpt) {
    const pkgSelect = document.getElementById("meta-package-select");
    if (pkgSelect) {
      pkgSelect.value = pkgId;
    }

    if (timingOpt) {
      document.querySelectorAll(".meta-timing-toggle button").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.timing === timingOpt);
      });
    }

    // Highlight selected card
    document.querySelectorAll(".meta-package-card").forEach((card) => {
      card.classList.toggle("selected", card.dataset.packageId === pkgId);
    });

    recalculateBooking();

    // Smooth scroll to booking widget
    const bookingWidget = document.getElementById("booking-card");
    if (bookingWidget) {
      bookingWidget.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // Select Villa from Villa Cards
  function selectVilla(villaName) {
    const villaSelect = document.getElementById("meta-villa-select");
    if (villaSelect) {
      villaSelect.value = villaName;
    }
    const bookingWidget = document.getElementById("booking-card");
    if (bookingWidget) {
      bookingWidget.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // Build WhatsApp Booking Message matching Master Prompt
  function buildWhatsAppUrl(details) {
    const message = [
      "Hello Tranquil Terrace Galle,",
      "",
      "I would like to enquire about a booking.",
      "",
      `Villa: ${details.villa}`,
      `Package: ${details.packageName}`,
      `Check-in: ${details.checkin}`,
      `Check-out: ${details.checkout}`,
      "Guests: 2",
      `Total: LKR ${Number(details.priceLKR).toLocaleString()}`,
      "",
      "Please confirm availability.",
    ].join("\n");

    const phone = "94770682366";
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  // Handle Booking Form Submit
  async function handleBookingSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector(".meta-btn-submit-booking");
    const villaSelect = document.getElementById("meta-villa-select");
    const pkgSelect = document.getElementById("meta-package-select");
    const dateInput = document.getElementById("meta-date-input");
    const guestInput = document.getElementById("meta-guest-input");

    const villa = villaSelect ? villaSelect.value : "Villa Araliya";
    const pkgId = pkgSelect ? pkgSelect.value : "day-package";
    const pkg = PACKAGES[pkgId] || PACKAGES["day-package"];
    const date = dateInput && dateInput.value ? dateInput.value : new Date().toISOString().slice(0, 10);
    const guests = guestInput ? guestInput.value : "2";

    // Timing Option if Day & Night
    let timingOpt = "A";
    const activeTimingBtn = document.querySelector(".meta-timing-toggle button.active");
    if (activeTimingBtn) {
      timingOpt = activeTimingBtn.dataset.timing || "A";
    }

    let checkinTime = pkg.checkinTime;
    let checkoutTime = pkg.checkoutTime;
    let packageName = pkg.name;

    if (pkgId === "day-night-package" && pkg.timingOptions) {
      const opt = pkg.timingOptions[timingOpt];
      checkinTime = opt.checkinTime;
      checkoutTime = opt.checkoutTime;
      packageName = `${pkg.name} (${timingOpt === "A" ? "Option A" : "Option B"})`;
    }

    const checkinFormatted = `${date} at ${checkinTime}`;
    let checkoutFormatted = `${date} at ${checkoutTime}`;

    if (pkg.endNextDay || (pkg.timingOptions && pkg.timingOptions[timingOpt]?.endNextDay)) {
      try {
        const d = new Date(`${date}T12:00:00Z`);
        d.setUTCDate(d.getUTCDate() + 1);
        const nextDate = d.toISOString().slice(0, 10);
        checkoutFormatted = `${nextDate} at ${checkoutTime}`;
      } catch {
        // Fallback
      }
    }

    const bookingDetails = {
      villa,
      packageId: pkgId,
      packageName,
      timingOption: timingOpt,
      selectedDate: date,
      checkin: checkinFormatted,
      checkout: checkoutFormatted,
      guests: Number(guests) || 2,
      priceLKR: pkg.priceLKR,
      guestName: "Guest Website Enquiry",
      phone: "+94 77 068 2366",
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Preparing Request...</span>`;
    }

    // Try saving record to backend API (swallows network errors gracefully)
    try {
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingDetails),
      });
    } catch (err) {
      console.warn("Booking pre-save notice:", err);
    }

    // Open WhatsApp
    const waUrl = buildWhatsAppUrl(bookingDetails);
    window.open(waUrl, "_blank", "noopener,noreferrer");

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Enquire on WhatsApp ↗</span>`;
    }
  }

  // Setup Event Listeners
  document.addEventListener("DOMContentLoaded", function () {
    // 1. Currency Switcher Buttons
    document.querySelectorAll(".currency-toggle button").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const curr = this.dataset.curr || "LKR";
        updateCurrency(curr);
      });
    });

    // 2. Package Change in Booking Widget
    const pkgSelect = document.getElementById("meta-package-select");
    if (pkgSelect) {
      pkgSelect.addEventListener("change", recalculateBooking);
    }

    // 3. Timing Toggle Buttons
    document.querySelectorAll(".meta-timing-toggle button").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelectorAll(".meta-timing-toggle button").forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        recalculateBooking();
      });
    });

    // 4. Package Cards Click
    document.querySelectorAll(".meta-package-card").forEach((card) => {
      card.addEventListener("click", function () {
        const pkgId = this.dataset.packageId;
        if (pkgId) selectPackage(pkgId);
      });
    });

    // 5. Villa Explore Buttons
    document.querySelectorAll("[data-select-villa]").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const villa = this.getAttribute("data-select-villa");
        if (villa) selectVilla(villa);
      });
    });

    // 6. Booking Form Submit
    const form = document.getElementById("meta-booking-form");
    if (form) {
      form.addEventListener("submit", handleBookingSubmit);
    }

    // 7. FAQ Accordion
    document.querySelectorAll(".meta-faq-question").forEach((btn) => {
      btn.addEventListener("click", function () {
        const item = this.closest(".meta-faq-item");
        if (!item) return;
        const isOpen = item.classList.contains("open");

        // Close all
        document.querySelectorAll(".meta-faq-item").forEach((i) => i.classList.remove("open"));

        // Toggle clicked
        if (!isOpen) {
          item.classList.add("open");
        }
      });
    });

    // 8. Video Play/Pause Toggle
    const videoCtrl = document.getElementById("meta-video-control");
    const video = document.getElementById("meta-hero-video");
    if (videoCtrl && video) {
      videoCtrl.addEventListener("click", function () {
        if (video.paused) {
          video.play();
          videoCtrl.querySelector("span:last-child").textContent = "Pause Video";
        } else {
          video.pause();
          videoCtrl.querySelector("span:last-child").textContent = "Play Video";
        }
      });
    }

    // 9. Mobile Sticky Booking Button Scroll
    const stickyBtn = document.getElementById("meta-sticky-book-btn");
    if (stickyBtn) {
      stickyBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const widget = document.getElementById("booking-card");
        if (widget) {
          widget.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    // 10. Default Date setup (tomorrow)
    const dateInput = document.getElementById("meta-date-input");
    if (dateInput && !dateInput.value) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.value = tomorrow.toISOString().slice(0, 10);
      dateInput.min = new Date().toISOString().slice(0, 10);
    }

    // Initialize initial calculations
    recalculateBooking();
  });

  // Expose global helpers
  window.selectMetaPackage = selectPackage;
  window.selectMetaVilla = selectVilla;
  window.updateMetaCurrency = updateCurrency;
})();



// ==========================================
// TRANQUIL TERRACE LUXURY NAVIGATION CONTROLLER
// Handles Centered Logo Header, Drawer, Scroll Compaction & Currency
// ==========================================
(function() {
  function initLuxuryNav() {
    const burger = document.getElementById("luxury-burger-btn") || document.querySelector(".luxury-burger-btn");
    const drawer = document.getElementById("luxury-mobile-drawer") || document.querySelector(".luxury-mobile-drawer");
    const closeBtn = document.getElementById("luxury-drawer-close") || document.querySelector(".drawer-close-btn");
    const header = document.getElementById("site-header") || document.querySelector("header.taru-header");

    function openDrawer() {
      if (!drawer) return;
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      if (burger) {
        burger.classList.add("is-active");
        burger.setAttribute("aria-expanded", "true");
      }
      document.body.classList.add("luxury-drawer-open");
      document.documentElement.classList.add("luxury-drawer-open");
      if (closeBtn) closeBtn.focus();
    }

    function closeDrawer() {
      if (!drawer) return;
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      if (burger) {
        burger.classList.remove("is-active");
        burger.setAttribute("aria-expanded", "false");
        burger.focus();
      }
      document.body.classList.remove("luxury-drawer-open");
      document.documentElement.classList.remove("luxury-drawer-open");
    }

    if (burger) {
      burger.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (drawer && drawer.classList.contains("is-open")) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", function(e) {
        e.preventDefault();
        closeDrawer();
      });
    }

    // Close on link click inside drawer
    if (drawer) {
      drawer.querySelectorAll(".drawer-nav-link, .drawer-book-cta, .drawer-contact-tel, .drawer-contact-wa").forEach(function(link) {
        link.addEventListener("click", function() {
          closeDrawer();
        });
      });

      // Close on backdrop click
      drawer.addEventListener("click", function(e) {
        if (e.target === drawer) {
          closeDrawer();
        }
      });
    }

    // Escape key listener
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && drawer && drawer.classList.contains("is-open")) {
        closeDrawer();
      }
    });

    // Scroll compaction listener (> 50px)
    let lastScrollY = window.scrollY;
    let scrollTicking = false;
    function handleScroll() {
      const y = window.scrollY;
      if (header) {
        const shouldCompact = y > 50;
        header.classList.toggle("compact", shouldCompact);
        header.classList.toggle("scrolled", shouldCompact);
      }
      scrollTicking = false;
    }

    window.addEventListener("scroll", function() {
      if (!scrollTicking) {
        window.requestAnimationFrame(handleScroll);
        scrollTicking = true;
      }
    }, { passive: true });
    handleScroll();

    // Currency toggle handling
    document.querySelectorAll(".luxury-currency-toggle, .currency-toggle").forEach(function(toggle) {
      toggle.querySelectorAll(".luxury-curr-btn, button[data-curr]").forEach(function(btn) {
        btn.addEventListener("click", function(e) {
          e.preventDefault();
          const curr = this.dataset.curr;
          if (curr) {
            document.querySelectorAll("[data-curr]").forEach(function(b) {
              const active = b.dataset.curr === curr;
              b.classList.toggle("active", active);
              b.setAttribute("aria-pressed", active ? "true" : "false");
            });
            if (typeof window.updateMetaCurrency === "function") {
              window.updateMetaCurrency(curr);
            }
          }
        });
      });
    });

    // Booking buttons smooth scroll / modal handler
    document.querySelectorAll(".luxury-book-link, .luxury-mobile-book-btn, .drawer-book-cta").forEach(function(btn) {
      btn.addEventListener("click", function(e) {
        const bookingCard = document.getElementById("booking-card");
        if (bookingCard) {
          e.preventDefault();
          bookingCard.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLuxuryNav);
  } else {
    initLuxuryNav();
  }

  // ==========================================================================
  // REAL-TIME AVAILABILITY CALENDAR & WHATSAPP BOOKING CONTROLLERS
  // ==========================================================================

  // State for Homepage Calendar
  let calActiveVilla = "Araliya";
  let calMonthOffset = 0;
  let calBlockedDates = new Set();
  let calBookedRanges = [];
  let calStart = "";
  let calEnd = "";
  let calIsSyncing = false;

  function getLocalIsoDate(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDisplayDate(dateStr) {
    if (!dateStr) return "Select Date";
    try {
      const parts = dateStr.split("-");
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  }

  // Fetch Live Blocked Dates from Next.js Calendar Availability API
  async function fetchCalendarAvailability(villaName) {
    calIsSyncing = true;
    const syncTimeEl = document.getElementById("calendar-sync-time");
    if (syncTimeEl) syncTimeEl.textContent = "Syncing live OTA feeds...";

    try {
      const res = await fetch(`/api/calendar/availability?villa=${encodeURIComponent(villaName)}`);
      if (res.ok) {
        const data = await res.json();
        calBlockedDates = new Set(data.blockedDates || []);
        calBookedRanges = data.bookedRanges || [];
        if (syncTimeEl) {
          syncTimeEl.textContent = `Synced with OTAs ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        }
      }
    } catch (err) {
      console.warn("Availability API error:", err);
      if (syncTimeEl) syncTimeEl.textContent = "Live Synced (Cache)";
    } finally {
      calIsSyncing = false;
      renderHomeCalendar();
    }
  }

  function generateMonthMarkup(year, monthIndex) {
    const todayStr = getLocalIsoDate();
    const firstDay = new Date(year, monthIndex, 1);
    const monthName = firstDay.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    // Monday as first day of week: (firstDay.getDay() + 6) % 7
    const leadingEmpty = (firstDay.getDay() + 6) % 7;

    let daysHtml = "";
    for (let i = 0; i < leadingEmpty; i++) {
      daysHtml += '<span class="meta-cal-empty-slot" aria-hidden="true"></span>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isPast = dateStr < todayStr;
      const isBooked = calBlockedDates.has(dateStr);
      const isToday = dateStr === todayStr;
      const isStart = dateStr === calStart;
      const isEnd = dateStr === calEnd;
      const isChosen = isStart || isEnd;
      const isInRange = calStart && calEnd && dateStr > calStart && dateStr < calEnd;

      const rangeMatch = isBooked ? calBookedRanges.find(r => r.start <= dateStr && dateStr < r.end) : null;
      const sourceName = rangeMatch ? rangeMatch.source : "OTA Channels";
      const titleAttr = isBooked ? `Reserved via ${sourceName}` : formatDisplayDate(dateStr);

      let classes = "meta-cal-day-cell";
      if (isPast) classes += " past";
      if (isBooked) classes += " booked";
      if (isToday) classes += " today";
      if (isChosen) classes += " chosen";
      if (isInRange) classes += " in-range";

      const disabledAttr = (isPast || isBooked) ? "disabled" : "";

      daysHtml += `
        <button type="button" 
          class="${classes}" 
          data-date="${dateStr}" 
          ${disabledAttr} 
          title="${titleAttr}" 
          aria-label="${titleAttr}">
          <span>${day}</span>
        </button>
      `;
    }

    return `
      <div class="meta-cal-month-card" role="group" aria-label="${monthName}">
        <h3 class="meta-cal-month-title">${monthName}</h3>
        <div class="meta-cal-weekdays" aria-hidden="true">
          <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
        </div>
        <div class="meta-cal-days-grid">
          ${daysHtml}
        </div>
      </div>
    `;
  }

  function renderHomeCalendar() {
    const container = document.getElementById("home-calendar-months");
    if (!container) return;

    const baseDate = new Date();
    const m1Date = new Date(baseDate.getFullYear(), baseDate.getMonth() + calMonthOffset, 1);
    const m2Date = new Date(baseDate.getFullYear(), baseDate.getMonth() + calMonthOffset + 1, 1);

    container.innerHTML = generateMonthMarkup(m1Date.getFullYear(), m1Date.getMonth()) +
                          generateMonthMarkup(m2Date.getFullYear(), m2Date.getMonth());

    // Update navigation button states
    const prevBtn = document.getElementById("home-cal-prev");
    const nextBtn = document.getElementById("home-cal-next");
    if (prevBtn) prevBtn.disabled = calMonthOffset === 0;
    if (nextBtn) nextBtn.disabled = calMonthOffset >= 11;

    updateCalendarSelectionBar();
  }

  function updateCalendarSelectionBar() {
    const inEl = document.getElementById("home-cal-in");
    const outEl = document.getElementById("home-cal-out");
    const rateEl = document.getElementById("home-cal-rate");

    if (inEl) inEl.textContent = calStart ? formatDisplayDate(calStart) : "Select Check-in";
    if (outEl) outEl.textContent = calEnd ? formatDisplayDate(calEnd) : (calStart ? "Select Check-out" : "Select Check-out");

    let nights = 1;
    if (calStart && calEnd) {
      const d1 = new Date(calStart + "T12:00:00Z");
      const d2 = new Date(calEnd + "T12:00:00Z");
      nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
    }

    const pricePerNight = PACKAGES["day-night-package"].priceLKR; // LKR 37,500
    const totalLKR = pricePerNight * nights;

    if (rateEl) {
      rateEl.setAttribute("data-price-lkr", totalLKR);
      const formattedMain = formatMoney(totalLKR, currentCurrency);
      const usdApprox = Math.round(totalLKR / USD_RATE);
      rateEl.innerHTML = `${formattedMain} <small>(${nights} night${nights > 1 ? "s" : ""} · ≈ $${usdApprox} USD)</small>`;
    }
  }

  function handleCalendarDateClick(dateStr) {
    if (calBlockedDates.has(dateStr)) return;

    if (!calStart || calEnd || dateStr <= calStart) {
      calStart = dateStr;
      calEnd = "";
    } else {
      // Verify no blocked dates in between
      let overlap = false;
      const cur = new Date(calStart + "T12:00:00Z");
      const endD = new Date(dateStr + "T12:00:00Z");
      while (cur < endD) {
        cur.setUTCDate(cur.getUTCDate() + 1);
        const iso = cur.toISOString().slice(0, 10);
        if (iso < dateStr && calBlockedDates.has(iso)) {
          overlap = true;
          break;
        }
      }

      if (overlap) {
        alert("The selected range covers reserved dates. Please select available dates.");
        calStart = dateStr;
        calEnd = "";
      } else {
        calEnd = dateStr;
      }
    }

    renderHomeCalendar();
  }

  // Init Homepage Calendar Events
  function initHomepageCalendar() {
    const calendarSection = document.getElementById("calendar");
    if (!calendarSection) return;

    // Villa switcher tabs
    document.querySelectorAll(".meta-villa-tab").forEach(tab => {
      tab.addEventListener("click", function() {
        const villa = this.dataset.villa;
        if (!villa || villa === calActiveVilla) return;

        document.querySelectorAll(".meta-villa-tab").forEach(t => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        this.classList.add("active");
        this.setAttribute("aria-selected", "true");

        calActiveVilla = villa;
        calStart = "";
        calEnd = "";
        fetchCalendarAvailability(villa);
      });
    });

    // Month Navigation
    const prevBtn = document.getElementById("home-cal-prev");
    const nextBtn = document.getElementById("home-cal-next");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (calMonthOffset > 0) {
          calMonthOffset--;
          renderHomeCalendar();
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (calMonthOffset < 11) {
          calMonthOffset++;
          renderHomeCalendar();
        }
      });
    }

    // Grid Click Delegation
    const monthsContainer = document.getElementById("home-calendar-months");
    if (monthsContainer) {
      monthsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".meta-cal-day-cell");
        if (!btn || btn.disabled) return;
        const dateStr = btn.dataset.date;
        if (dateStr) handleCalendarDateClick(dateStr);
      });
    }

    // Clear Dates button
    const clearBtn = document.getElementById("home-cal-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        calStart = "";
        calEnd = "";
        renderHomeCalendar();
      });
    }

    // Enquire via WhatsApp CTA from Calendar
    const enquireBtn = document.getElementById("home-cal-enquire-btn");
    if (enquireBtn) {
      enquireBtn.addEventListener("click", () => {
        openWhatsAppModal({
          villa: calActiveVilla === "Olu" ? "Villa Olu" : "Villa Araliya",
          checkin: calStart || getLocalIsoDate(),
          checkout: calEnd || "",
          packageId: "day-night-package"
        });
      });
    }

    // Initial Fetch
    fetchCalendarAvailability(calActiveVilla);
  }

  // ==========================================================================
  // HORIZONTAL SEARCH STRIP CONTROLLER
  // ==========================================================================
  function initSearchStrip() {
    const searchForm = document.getElementById("meta-horizontal-search-form");
    const dateInput = document.getElementById("strip-date-input");
    const pkgSelect = document.getElementById("strip-package-select");
    if (dateInput) {
      const today = getLocalIsoDate();
      dateInput.min = today;
      if (!dateInput.value) dateInput.value = today;
    }

    if (pkgSelect) {
      pkgSelect.addEventListener("change", function() {
        if (this.value === "custom-dates") {
          const calEl = document.getElementById("calendar");
          if (calEl) {
            calEl.scrollIntoView({ behavior: "smooth" });
            const villaSelect = document.getElementById("strip-villa-select");
            const v = villaSelect ? villaSelect.value : "Villa Araliya";
            const villaKey = v.includes("Olu") ? "Olu" : "Araliya";
            const tabBtn = document.getElementById(`tab-${villaKey.toLowerCase()}`);
            if (tabBtn) tabBtn.click();
          }
        }
      });
    }

    if (searchForm) {
      searchForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const villaSelect = document.getElementById("strip-villa-select");
        const guestSelect = document.getElementById("strip-guest-select");

        const villa = villaSelect ? villaSelect.value : "Villa Araliya";
        const pkgId = pkgSelect ? pkgSelect.value : "day-night-package";
        const checkin = dateInput && dateInput.value ? dateInput.value : getLocalIsoDate();
        const guests = guestSelect ? guestSelect.value : "2";

        if (pkgId === "custom-dates") {
          const calEl = document.getElementById("calendar");
          if (calEl) {
            calEl.scrollIntoView({ behavior: "smooth" });
            const villaKey = villa.includes("Olu") ? "Olu" : "Araliya";
            const tabBtn = document.getElementById(`tab-${villaKey.toLowerCase()}`);
            if (tabBtn) tabBtn.click();
            return;
          }
        }

        openWhatsAppModal({
          villa,
          checkin,
          packageId: pkgId,
          guests
        });
      });
    }
  }

  // ==========================================================================
  // LUXURY WHATSAPP BOOKING MODAL CONTROLLER
  // ==========================================================================
  function openWhatsAppModal(preset = {}) {
    if (window.ttWhatsAppBooking) {
      window.ttWhatsAppBooking.openModal(preset);
      return;
    }

    const modal = document.getElementById("whatsapp-booking-dialog");
    if (!modal) {
      // Fallback direct WhatsApp if modal missing
      window.open("https://wa.me/94770682366", "_blank");
      return;
    }

    const villaSelect = document.getElementById("wa-select-villa");
    const pkgSelect = document.getElementById("wa-select-package");
    const checkinInput = document.getElementById("wa-input-checkin");
    const checkoutInput = document.getElementById("wa-input-checkout");
    const guestSelect = document.getElementById("wa-select-guests");

    const todayStr = getLocalIsoDate();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getLocalIsoDate(tomorrow);

    if (villaSelect && preset.villa) {
      villaSelect.value = preset.villa.includes("Olu") ? "Villa Olu" : "Villa Araliya";
    }

    if (pkgSelect && preset.packageId) {
      pkgSelect.value = preset.packageId;
    }

    if (checkinInput) {
      checkinInput.min = todayStr;
      checkinInput.value = preset.checkin || todayStr;
    }

    if (checkoutInput) {
      checkoutInput.min = checkinInput && checkinInput.value ? checkinInput.value : todayStr;
      checkoutInput.value = preset.checkout || tomorrowStr;
    }

    if (guestSelect && preset.guests) {
      guestSelect.value = String(preset.guests);
    }

    updateModalPricing();

    try {
      modal.showModal();
    } catch {
      modal.setAttribute("open", "true");
    }
  }

  function closeWhatsAppModal() {
    const modal = document.getElementById("whatsapp-booking-dialog");
    if (modal) {
      try {
        modal.close();
      } catch {
        modal.removeAttribute("open");
      }
    }
  }

  function updateModalPricing() {
    const pkgSelect = document.getElementById("wa-select-package");
    const checkinInput = document.getElementById("wa-input-checkin");
    const checkoutInput = document.getElementById("wa-input-checkout");
    const timingField = document.getElementById("wa-timing-field");
    const totalLkrEl = document.getElementById("wa-total-lkr");
    const totalUsdEl = document.getElementById("wa-total-usd");

    if (!pkgSelect) return;
    const pkgId = pkgSelect.value;
    const pkg = PACKAGES[pkgId] || PACKAGES["day-night-package"];

    // Toggle timing radio field visibility
    if (timingField) {
      timingField.style.display = pkgId === "day-night-package" ? "block" : "none";
    }

    let nights = 1;
    if (checkinInput && checkoutInput && checkinInput.value && checkoutInput.value) {
      const d1 = new Date(checkinInput.value + "T12:00:00Z");
      const d2 = new Date(checkoutInput.value + "T12:00:00Z");
      if (d2 > d1) {
        nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
      }
    }

    // For Day package, it's daytime hours. For overnight/day-night, multiply by nights if > 1
    const totalLKR = pkgId === "day-package" ? pkg.priceLKR : (pkg.priceLKR * nights);
    const totalUSD = Math.round(totalLKR / USD_RATE);

    if (totalLkrEl) totalLkrEl.textContent = formatMoney(totalLKR, currentCurrency);
    if (totalUsdEl) totalUsdEl.textContent = `≈ $${totalUSD} USD`;
  }

  function initWhatsAppModal() {
    const modal = document.getElementById("whatsapp-booking-dialog");
    const closeBtn = document.getElementById("wa-modal-close");
    const form = document.getElementById("wa-booking-form");
    const pkgSelect = document.getElementById("wa-select-package");
    const checkinInput = document.getElementById("wa-input-checkin");
    const checkoutInput = document.getElementById("wa-input-checkout");

    if (closeBtn) {
      closeBtn.addEventListener("click", closeWhatsAppModal);
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeWhatsAppModal();
      });
      modal.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeWhatsAppModal();
      });
    }

    if (pkgSelect) {
      pkgSelect.addEventListener("change", updateModalPricing);
    }

    if (checkinInput) {
      checkinInput.addEventListener("change", () => {
        if (checkoutInput) {
          checkoutInput.min = checkinInput.value;
          if (checkoutInput.value <= checkinInput.value) {
            const next = new Date(checkinInput.value + "T12:00:00Z");
            next.setUTCDate(next.getUTCDate() + 1);
            checkoutInput.value = next.toISOString().slice(0, 10);
          }
        }
        updateModalPricing();
      });
    }

    if (checkoutInput) {
      checkoutInput.addEventListener("change", updateModalPricing);
    }

    if (form) {
      form.addEventListener("submit", async function(e) {
        e.preventDefault();
        const submitBtn = document.getElementById("wa-submit-btn");

        const name = document.getElementById("wa-input-name")?.value.trim() || "Guest";
        const phone = document.getElementById("wa-input-phone")?.value.trim() || "";
        const villa = document.getElementById("wa-select-villa")?.value || "Villa Araliya";
        const pkgId = document.getElementById("wa-select-package")?.value || "day-night-package";
        const pkg = PACKAGES[pkgId] || PACKAGES["day-night-package"];
        const checkin = document.getElementById("wa-input-checkin")?.value || getLocalIsoDate();
        const checkout = document.getElementById("wa-input-checkout")?.value || "";
        const guests = document.getElementById("wa-select-guests")?.value || "2";
        const requests = document.getElementById("wa-input-requests")?.value.trim() || "";

        let timingChoice = "";
        if (pkgId === "day-night-package") {
          const checkedRadio = document.querySelector('input[name="timing"]:checked');
          timingChoice = checkedRadio ? checkedRadio.value : "A";
        }

        const pkgLabel = timingChoice 
          ? `${pkg.name} (${timingChoice === "A" ? "Option A: 11 AM - 9 AM" : "Option B: 5 PM - 3 PM"})`
          : pkg.name;

        // Calculate nights
        let nights = 1;
        if (checkin && checkout) {
          const d1 = new Date(checkin + "T12:00:00Z");
          const d2 = new Date(checkout + "T12:00:00Z");
          if (d2 > d1) nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
        }
        const totalLKR = pkgId === "day-package" ? pkg.priceLKR : (pkg.priceLKR * nights);
        const totalUSD = Math.round(totalLKR / USD_RATE);

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Opening WhatsApp...</span>';
        }

        // Save booking in background to API
        try {
          fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              guestName: name,
              phone: phone,
              villaName: villa,
              checkin: `${checkin} ${pkg.checkinTime}`,
              checkout: checkout ? `${checkout} ${pkg.checkoutTime}` : `${checkin} ${pkg.checkoutTime}`,
              guests: Number(guests) || 2,
              specialRequest: requests,
              packageId: pkgId,
              source: "WhatsApp Modal"
            })
          }).catch(() => {});
        } catch {}

        // Build WhatsApp message
        const message = [
          "✨ *NEW BOOKING ENQUIRY — TRANQUIL TERRACE GALLE* ✨",
          "",
          `👤 *Guest Name:* ${name}`,
          `📞 *Phone / WhatsApp:* ${phone}`,
          `🏡 *Villa:* ${villa}`,
          `📦 *Stay Package:* ${pkgLabel}`,
          `📅 *Check-in Date:* ${checkin}`,
          checkout ? `📆 *Check-out Date:* ${checkout} (${nights} night${nights > 1 ? "s" : ""})` : "",
          `👥 *Occupancy:* ${guests} Guests (1 King Bed)`,
          `💰 *Estimated Total:* LKR ${Number(totalLKR).toLocaleString()} (≈ $${totalUSD} USD)`,
          requests ? `📝 *Special Requests:* ${requests}` : "",
          "",
          "Please confirm availability and share payment terms for direct reservation. Thank you!"
        ].filter(Boolean).join("\n");

        const waUrl = `https://wa.me/94770682366?text=${encodeURIComponent(message)}`;

        setTimeout(() => {
          window.open(waUrl, "_blank");
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" class="wa-icon-svg">
                <path fill="#25D366" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z"/>
                <path fill="#FFFFFF" fill-rule="evenodd" d="M17.51 14.38C17.21 14.23 15.74 13.51 15.47 13.41C15.19 13.31 15 13.26 14.8 13.56C14.6 13.86 14.04 14.52 13.86 14.72C13.69 14.92 13.52 14.94 13.22 14.79C12.92 14.64 11.96 14.33 10.82 13.31C9.94 12.52 9.34 11.55 9.17 11.25C9 10.95 9.15 10.79 9.3 10.64C9.43 10.51 9.6 10.29 9.75 10.12C9.9 9.94 9.95 9.82 10.05 9.62C10.15 9.42 10.1 9.24 10.02 9.09C9.95 8.94 9.35 7.47 9.1 6.86C8.86 6.27 8.61 6.35 8.43 6.34C8.26 6.33 8.06 6.33 7.86 6.33C7.66 6.33 7.34 6.41 7.06 6.71C6.79 7.01 6.02 7.73 6.02 9.19C6.02 10.65 7.08 12.06 7.23 12.26C7.38 12.46 9.32 15.46 12.3 16.74C13.01 17.05 13.57 17.23 14 17.37C14.71 17.6 15.36 17.57 15.87 17.49C16.44 17.4 17.63 16.77 17.88 16.06C18.13 15.36 18.13 14.75 18.05 14.63C17.98 14.5 17.81 14.43 17.51 14.28V14.38Z"/>
              </svg>
              <span>Book via WhatsApp Concierge ↗</span>
            `;
            closeWhatsAppModal();
          }
        }, 300);
      });
    }

    // Bind any element with [data-book] or #meta-sticky-book-btn to open modal
    document.querySelectorAll("[data-book], #meta-sticky-book-btn, .meta-btn-sticky-book").forEach(el => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        openWhatsAppModal();
      });
    });

    // Make selectPackage also open the WhatsApp modal with that package preselected
    window.selectMetaPackage = function(pkgId) {
      openWhatsAppModal({ packageId: pkgId });
    };
  }

  // Expose global modal opener
  window.openTranquilWhatsAppModal = openWhatsAppModal;

  
  /* ========================================================
     DEFINITIVE MOBILE HORIZONTAL CAROUSEL & AUTO-SCROLL ENGINE
     - Reviews and Amenities auto-scroll smoothly (left-to-right)
     - Infinite looping
     - Pauses immediately on interaction (touch / pointer / hover)
     - Resumes gently 2.5s after interaction ends
     - Seamless snap-toggle: smooth glide during auto-scroll,
       instant native snap during manual touch swipe
     - Pagination dots showing active position
     - Honors prefers-reduced-motion: reduce
     ======================================================== */
  function initMobileCarousels() {
    if (typeof window === "undefined") return;

    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const carouselConfigs = [
      { selector: ".meta-amenities-grid", autoScroll: true, label: "Amenities" },
      { selector: ".meta-reviews-grid", autoScroll: true, label: "Reviews" },
      { selector: ".meta-packages-list", autoScroll: false, label: "Packages" },
      { selector: ".meta-villas-grid", autoScroll: false, label: "Villas" },
      { selector: ".dual-villas-carousel", autoScroll: false, label: "Dual Villas" },
      { selector: ".villa-gallery-track", autoScroll: false, label: "Villa Photos" }
    ];

    carouselConfigs.forEach(({ selector, autoScroll }) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(carousel => setupCarouselInstance(carousel, autoScroll));
    });

    function setupCarouselInstance(carousel, enableAutoScroll) {
      if (!carousel || carousel.dataset.carouselInitialized === "true") return;
      carousel.dataset.carouselInitialized = "true";

      const cards = Array.from(carousel.children).filter(
        child => !child.classList.contains("carousel-pagination-dots")
      );
      if (cards.length <= 1) return;

      // 1. Pagination dots
      let dotsWrap = carousel.nextElementSibling;
      if (!dotsWrap || !dotsWrap.classList.contains("carousel-pagination-dots")) {
        dotsWrap = document.createElement("div");
        dotsWrap.className = "carousel-pagination-dots";
        dotsWrap.setAttribute("role", "tablist");
        dotsWrap.setAttribute("aria-label", "Carousel pagination");
        carousel.parentNode.insertBefore(dotsWrap, carousel.nextSibling);
      } else {
        dotsWrap.innerHTML = "";
      }

      const dots = [];
      cards.forEach((card, idx) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot" + (idx === 0 ? " active" : "");
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", "Slide " + (idx + 1) + " of " + cards.length);
        dot.setAttribute("aria-selected", idx === 0 ? "true" : "false");

        dot.addEventListener("click", () => {
          pauseAutoScroll();
          const targetLeft = card.offsetLeft - carousel.offsetLeft;
          carousel.scrollTo({ left: targetLeft, behavior: "smooth" });
          updateActiveDot(idx);
          scheduleResume();
        });

        dotsWrap.appendChild(dot);
        dots.push(dot);
      });

      function updateActiveDot(activeIdx) {
        dots.forEach((dot, i) => {
          const isActive = i === activeIdx;
          dot.classList.toggle("active", isActive);
          dot.setAttribute("aria-selected", isActive ? "true" : "false");
        });
      }

      // 2. Active Dot Calculation on Scroll
      let rafScroll = null;
      carousel.addEventListener("scroll", () => {
        if (rafScroll) cancelAnimationFrame(rafScroll);
        rafScroll = requestAnimationFrame(() => {
          const currentLeft = carousel.scrollLeft;
          let closestIdx = 0;
          let minDiff = Infinity;

          cards.forEach((card, i) => {
            const cardLeft = card.offsetLeft - carousel.offsetLeft;
            const diff = Math.abs(cardLeft - currentLeft);
            if (diff < minDiff) {
              minDiff = diff;
              closestIdx = i;
            }
          });

          updateActiveDot(closestIdx);
        });
      }, { passive: true });

      // 3. User Interaction Handling (Pause immediately, resume 2.5s after touch/hover ends)
      let isInteracting = false;
      let resumeTimer = null;

      function pauseAutoScroll() {
        isInteracting = true;
        // Re-enable mandatory scroll snap for manual touch gestures
        carousel.style.setProperty("scroll-snap-type", "x mandatory", "important");
        if (resumeTimer) {
          clearTimeout(resumeTimer);
          resumeTimer = null;
        }
      }

      function scheduleResume() {
        if (resumeTimer) clearTimeout(resumeTimer);
        resumeTimer = setTimeout(() => {
          isInteracting = false;
          if (enableAutoScroll && window.innerWidth <= 768 && !isReducedMotion) {
            // Remove scroll-snap during gentle auto-glide
            carousel.style.setProperty("scroll-snap-type", "none", "important");
          }
        }, 2500);
      }

      // Touch & Pointer Listeners
      carousel.addEventListener("touchstart", pauseAutoScroll, { passive: true });
      carousel.addEventListener("touchmove", pauseAutoScroll, { passive: true });
      carousel.addEventListener("touchend", scheduleResume, { passive: true });
      carousel.addEventListener("touchcancel", scheduleResume, { passive: true });

      carousel.addEventListener("pointerdown", pauseAutoScroll, { passive: true });
      carousel.addEventListener("pointerup", scheduleResume, { passive: true });
      carousel.addEventListener("pointercancel", scheduleResume, { passive: true });

      carousel.addEventListener("mouseenter", pauseAutoScroll);
      carousel.addEventListener("mouseleave", scheduleResume);

      // 4. Auto-Scroll Loop (Amenities & Reviews)
      if (enableAutoScroll && !isReducedMotion) {
        // Initial glide mode
        if (window.innerWidth <= 768) {
          carousel.style.setProperty("scroll-snap-type", "none", "important");
        }

        const speed = 1; // 1px per tick

        function tick() {
          if (window.innerWidth <= 768 && !isInteracting) {
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            if (maxScroll > 5) {
              if (carousel.scrollLeft >= maxScroll - 1) {
                carousel.scrollLeft = 0;
              } else {
                carousel.scrollLeft += speed;
              }
            }
          }
        }

        setInterval(tick, 20);
      }
    }
  }


  initHomepageCalendar();
  initSearchStrip();
  initWhatsAppModal();
  initMobileCarousels();
})();
