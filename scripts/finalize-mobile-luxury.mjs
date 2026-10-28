import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

console.log("=== APPLYING LUXURY MOBILE RESPONSIVENESS & HORIZONTAL CAROUSEL SUITE ===");

// 1. Universal CSS Overrides for Font-Size >= 16px on Mobile and Carousel Containment
const luxuryMobileCss = `
/* ========================================================
   5-STAR LUXURY MOBILE RESPONSIVENESS & CAROUSEL STANDARDS
   Zero horizontal overflow, 16px iOS zoom prevention, 1.2 cards preview
   ======================================================== */

/* Strict Universal 16px Font Size on Mobile (<= 768px) to prevent iOS auto-zoom */
@media (max-width: 768px) {
  input, select, textarea, button,
  .page-inner .availability input,
  .page-inner .availability select,
  .availability input,
  .availability select,
  .availability textarea,
  #booking-form input,
  #booking-form select,
  #booking-form textarea,
  .form-grid input,
  .form-grid select,
  .form-grid textarea,
  #booking input,
  #booking select,
  #booking textarea,
  .dialog-platforms select {
    font-size: 16px !important;
  }
}

/* Mobile Horizontal Carousels & Grid Display */
@media (max-width: 768px) {
  /* Global Page & Section Containment */
  html, body {
    overflow-x: hidden !important;
    max-width: 100vw !important;
    width: 100% !important;
    position: relative !important;
    margin: 0 !important;
  }

  main, #main,
  section, .section,
  .meta-amenities-section,
  .meta-packages-section,
  .meta-reviews-section,
  .meta-villas-section,
  .dual-villas,
  .villas.section,
  .guest-reviews.section,
  .galle-guide.section,
  .location.section,
  .stay-details.section,
  .stay-calendar.section,
  .faq.section,
  .contact.section,
  .meta-location-section,
  .meta-calendar-section {
    overflow-x: hidden !important;
    max-width: 100vw !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  /* Horizontal Scroll Carousels (~1.2 cards visible per screen) */
  .meta-amenities-grid,
  .meta-packages-list,
  .meta-reviews-grid,
  .meta-villas-grid,
  .dual-villas-carousel {
    display: flex !important;
    flex-direction: row !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scroll-snap-type: x mandatory !important;
    -webkit-overflow-scrolling: touch !important;
    gap: 16px !important;
    padding: 12px 16px 20px !important;
    margin: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    box-sizing: border-box !important;
    scrollbar-width: none !important;
  }

  .meta-amenities-grid::-webkit-scrollbar,
  .meta-packages-list::-webkit-scrollbar,
  .meta-reviews-grid::-webkit-scrollbar,
  .meta-villas-grid::-webkit-scrollbar,
  .dual-villas-carousel::-webkit-scrollbar {
    display: none !important;
  }

  /* 1.2 Card Sizing Preview on Mobile */
  .meta-amenity-card {
    flex: 0 0 82vw !important;
    max-width: 310px !important;
    scroll-snap-align: start !important;
    margin: 0 !important;
    box-sizing: border-box !important;
  }

  .meta-package-card {
    flex: 0 0 84vw !important;
    max-width: 325px !important;
    scroll-snap-align: start !important;
    margin: 0 !important;
    box-sizing: border-box !important;
  }

  .meta-review-card {
    flex: 0 0 84vw !important;
    max-width: 330px !important;
    scroll-snap-align: start !important;
    margin: 0 !important;
    box-sizing: border-box !important;
  }

  .meta-villa-card,
  .dual-villas-carousel .named-villa {
    flex: 0 0 86vw !important;
    max-width: 350px !important;
    scroll-snap-align: start !important;
    margin: 0 !important;
    box-sizing: border-box !important;
  }

  /* Villa Photo Gallery Horizontal Tracks */
  .villa-gallery-track {
    display: flex !important;
    flex-direction: row !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scroll-snap-type: x mandatory !important;
    -webkit-overflow-scrolling: touch !important;
    gap: 12px !important;
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    scrollbar-width: none !important;
  }

  .villa-gallery-track::-webkit-scrollbar {
    display: none !important;
  }

  .villa-gallery-slide {
    flex: 0 0 100% !important;
    width: 100% !important;
    scroll-snap-align: start !important;
    box-sizing: border-box !important;
  }

  .villa-gallery-slide img,
  .villa-photo img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }

  /* Form and Marquee containment */
  form.availability, .availability {
    width: 100% !important;
    max-width: 100% !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    box-sizing: border-box !important;
  }

  .review-marquee-wrap, .review-marquee-strip, .luxury-ticker {
    max-width: 100vw !important;
    overflow: hidden !important;
    width: 100% !important;
  }

  /* Carousel Pagination Indicators (Visible on mobile) */
  .carousel-pagination-dots {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 8px !important;
    margin: 12px auto 24px !important;
    width: 100% !important;
  }

  .carousel-dot {
    width: 6px !important;
    height: 6px !important;
    border-radius: 50% !important;
    background: rgba(200, 164, 93, 0.3) !important;
    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
    cursor: pointer !important;
    border: none !important;
    padding: 0 !important;
  }

  .carousel-dot.active {
    width: 20px !important;
    border-radius: 4px !important;
    background: #C8A45D !important;
    box-shadow: 0 0 8px rgba(200, 164, 93, 0.5) !important;
  }
}

/* Desktop & Tablet View (> 768px): Preserve elegant Multi-Column Grids */
@media (min-width: 769px) {
  .meta-amenities-grid {
    display: grid !important;
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 20px !important;
    overflow: visible !important;
  }

  .meta-reviews-grid {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 24px !important;
    overflow: visible !important;
  }

  .meta-villas-grid {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 32px !important;
    overflow: visible !important;
  }

  .carousel-pagination-dots {
    display: none !important;
  }
}
`;

// Append luxuryMobileCss to public/cinematic-3d.css and public/meta-redesign.css
for (const f of ["public/cinematic-3d.css", "public/meta-redesign.css"]) {
  let content = fs.readFileSync(path.join(root, f), "utf-8");
  if (!content.includes("5-STAR LUXURY MOBILE RESPONSIVENESS & CAROUSEL STANDARDS")) {
    content += "\n" + luxuryMobileCss;
    fs.writeFileSync(path.join(root, f), content, "utf-8");
    console.log(`Appended mobile luxury CSS to ${f}`);
  }
}

// 2. Correct index.html: Both Villa Araliya & Villa Olu cards present
const indexHtmlPath = path.join(root, "public", "index.html");
let indexHtml = fs.readFileSync(indexHtmlPath, "utf-8");

const araliyaAndOluCardsHtml = `
      <div class="meta-villas-grid">
        <!-- VILLA ARALIYA (Original Heritage Villa · Daytime Plunge Pool) -->
        <article class="meta-villa-card" id="villa-araliya">
          <div class="meta-villa-media">
            <div class="villa-gallery-track" aria-label="Villa Araliya Photo Gallery">
              <div class="villa-gallery-slide">
                <img 
                  src="assets/villa-0.webp" 
                  alt="Villa Araliya sun-drenched daytime plunge pool and colonial white facade" 
                  class="meta-villa-img"
                  loading="lazy"
                  width="781"
                  height="1024"
                />
              </div>
              <div class="villa-gallery-slide">
                <img 
                  src="assets/villa-1.webp" 
                  alt="Villa Araliya romantic king canopy suite" 
                  class="meta-villa-img"
                  loading="lazy"
                  width="781"
                  height="1024"
                />
              </div>
              <div class="villa-gallery-slide">
                <img 
                  src="assets/villa-2.webp" 
                  alt="Villa Araliya private sunlit veranda and tropical foliage" 
                  class="meta-villa-img"
                  loading="lazy"
                  width="781"
                  height="1024"
                />
              </div>
              <div class="villa-gallery-slide">
                <img 
                  src="assets/villa-3.webp" 
                  alt="Villa Araliya tranquil garden courtyard" 
                  class="meta-villa-img"
                  loading="lazy"
                  width="781"
                  height="1024"
                />
              </div>
            </div>
            <span class="meta-villa-badge">CLASSIC HERITAGE</span>
          </div>
          <div class="meta-villa-content">
            <div class="meta-villa-header">
              <h3>Villa Araliya</h3>
              <div class="meta-villa-rates">
                From <strong data-price-lkr="12500">LKR 12,500</strong> <small>/ stay</small>
              </div>
            </div>
            <p class="meta-villa-desc">
              The original sanctuary featuring an emerald daytime plunge pool, colonial-inspired architecture, peaceful garden veranda, and lush courtyard.
            </p>

            <div class="meta-villa-specs">
              <div class="meta-villa-spec-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/></svg>
                <span>1 King Bedroom</span>
              </div>
              <div class="meta-villa-spec-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M2 12h20M2 16h20M2 20h20"/></svg>
                <span>Private Plunge Pool</span>
              </div>
              <div class="meta-villa-spec-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/></svg>
                <span>Private En-Suite</span>
              </div>
              <div class="meta-villa-spec-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                <span>Up to 2 Guests</span>
              </div>
            </div>

            <div class="meta-villa-actions">
              <button type="button" class="meta-btn-villa-book" data-select-villa="Villa Araliya">
                <span>Select Villa Araliya</span>
                <span>↗</span>
              </button>
            </div>
          </div>
        </article>

        <!-- VILLA OLU (Newly Built Contemporary Retreat · Illuminated Night Pool) -->
        <article class="meta-villa-card" id="villa-olu">
          <div class="meta-villa-media">
            <div class="villa-gallery-track" aria-label="Villa Olu Photo Gallery">
              <div class="villa-gallery-slide">
                <img 
                  src="images/villas/olu/olu-pool-night.jpg" 
                  alt="Villa Olu illuminated nighttime plunge pool, patio umbrella and rattan chairs in Galle" 
                  class="meta-villa-img"
                  loading="lazy"
                  width="781"
                  height="1024"
                />
              </div>
              <div class="villa-gallery-slide">
                <img 
                  src="assets/villa-2.webp" 
                  alt="Villa Olu emerald private plunge pool and patio" 
                  class="meta-villa-img"
                  loading="lazy"
                  width="781"
                  height="1024"
                />
              </div>
              <div class="villa-gallery-slide">
                <img 
                  src="assets/villa-1.webp" 
                  alt="Villa Olu luxury king bedroom suite" 
                  class="meta-villa-img"
                  loading="lazy"
                  width="781"
                  height="1024"
                />
              </div>
              <div class="villa-gallery-slide">
                <img 
                  src="assets/villa-3.webp" 
                  alt="Villa Olu lush tropical terrace foliage" 
                  class="meta-villa-img"
                  loading="lazy"
                  width="781"
                  height="1024"
                />
              </div>
            </div>
            <span class="meta-villa-badge">NEWLY BUILT RETREAT</span>
          </div>
          <div class="meta-villa-content">
            <div class="meta-villa-header">
              <h3>Villa Olu</h3>
              <div class="meta-villa-rates">
                From <strong data-price-lkr="12500">LKR 12,500</strong> <small>/ stay</small>
              </div>
            </div>
            <p class="meta-villa-desc">
              The newly built contemporary retreat featuring a vibrant illuminated night pool, overhead patio umbrella, woven rattan dining set, and warm string lights.
            </p>

            <div class="meta-villa-specs">
              <div class="meta-villa-spec-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/></svg>
                <span>1 King Bedroom</span>
              </div>
              <div class="meta-villa-spec-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M2 12h20M2 16h20M2 20h20"/></svg>
                <span>Private Plunge Pool</span>
              </div>
              <div class="meta-villa-spec-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/></svg>
                <span>Private En-Suite</span>
              </div>
              <div class="meta-villa-spec-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                <span>Up to 2 Guests</span>
              </div>
            </div>

            <div class="meta-villa-actions">
              <button type="button" class="meta-btn-villa-book" data-select-villa="Villa Olu">
                <span>Select Villa Olu</span>
                <span>↗</span>
              </button>
            </div>
          </div>
        </article>
      </div>`;

indexHtml = indexHtml.replace(/<div class="meta-villas-grid">[\s\S]*?<\/div>\s*<!-- Single Professional Notice/i, `${araliyaAndOluCardsHtml}\n\n      <!-- Single Professional Notice`);
fs.writeFileSync(indexHtmlPath, indexHtml, "utf-8");
console.log("Restored distinct Villa Araliya & Villa Olu cards on index.html");

// 3. Correct villas.html: Dual Villas Carousel with both Araliya and Olu
const villasHtmlPath = path.join(root, "public", "villas.html");
let villasHtml = fs.readFileSync(villasHtmlPath, "utf-8");

const dualVillasHtml = `
<div class="dual-villas-carousel">
  <!-- VILLA 01 · ARALIYA -->
  <article class="named-villa" id="araliya">
    <figure class="villa-photo frame reveal">
      <div class="villa-gallery-track" aria-label="Villa Araliya Photo Gallery">
        <div class="villa-gallery-slide">
          <img alt="Villa Araliya sun-drenched plunge pool at Tranquil Terrace Galle" loading="lazy" src="assets/villa-0.webp"/>
        </div>
        <div class="villa-gallery-slide">
          <img alt="Villa Araliya king suite bedroom" loading="lazy" src="assets/villa-1.webp"/>
        </div>
        <div class="villa-gallery-slide">
          <img alt="Villa Araliya private veranda" loading="lazy" src="assets/villa-2.webp"/>
        </div>
        <div class="villa-gallery-slide">
          <img alt="Villa Araliya garden foliage" loading="lazy" src="assets/villa-3.webp"/>
        </div>
      </div>
    </figure>
    <div class="villa-details reveal">
      <p class="eyebrow">VILLA 01 · ARALIYA (CLASSIC HERITAGE)</p>
      <h3>Villa<br/><em>Araliya.</em></h3>
      <p>The original heritage sanctuary featuring an emerald daytime plunge pool, colonial-inspired architecture, peaceful garden veranda, and lush courtyard.</p>
      <ul class="villa-facts">
        <li><span>01</span> King bedroom suite</li>
        <li><span>01</span> Private en-suite bathroom</li>
        <li><span>02</span> Guests maximum</li>
        <li><span>01</span> Private plunge pool</li>
      </ul>
      <button class="button" data-book="" data-choice="Araliya">Enquire about Araliya <span>↗</span></button>
    </div>
  </article>

  <!-- VILLA 02 · OLU -->
  <article class="named-villa" id="olu">
    <figure class="villa-photo frame reveal">
      <div class="villa-gallery-track" aria-label="Villa Olu Photo Gallery">
        <div class="villa-gallery-slide">
          <img alt="Villa Olu illuminated plunge pool, patio umbrella and rattan furniture at Tranquil Terrace Galle" loading="lazy" src="images/villas/olu/olu-pool-night.jpg"/>
        </div>
        <div class="villa-gallery-slide">
          <img alt="Villa Olu emerald private plunge pool and patio" loading="lazy" src="assets/villa-2.webp"/>
        </div>
        <div class="villa-gallery-slide">
          <img alt="Villa Olu luxury king bedroom suite" loading="lazy" src="assets/villa-1.webp"/>
        </div>
        <div class="villa-gallery-slide">
          <img alt="Villa Olu lush tropical terrace foliage" loading="lazy" src="assets/villa-3.webp"/>
        </div>
      </div>
    </figure>
    <div class="villa-details reveal">
      <p class="eyebrow">VILLA 02 · OLU (NEWLY BUILT RETREAT)</p>
      <h3>Villa<br/><em>Olu.</em></h3>
      <p>The newly built contemporary retreat featuring a vibrant illuminated night pool, overhead patio umbrella, woven rattan dining set, and ambient string lights for unhurried evenings.</p>
      <ul class="villa-facts">
        <li><span>01</span> King bedroom suite</li>
        <li><span>01</span> Private en-suite bathroom</li>
        <li><span>02</span> Guests maximum</li>
        <li><span>01</span> Private plunge pool</li>
      </ul>
      <button class="button" data-book="" data-choice="Olu">Enquire about Olu <span>↗</span></button>
    </div>
  </article>
</div>`;

villasHtml = villasHtml.replace(/<div class="dual-villas-carousel">[\s\S]*?<\/article>\s*<\/div>/i, dualVillasHtml.trim());
fs.writeFileSync(villasHtmlPath, villasHtml, "utf-8");
console.log("Restored dual villa cards and 2 photo tracks on villas.html");

// 4. Update mobile-carousels.js with continuous 60fps crawl + 2.5s pause/resume
const carouselScript = `/**
 * TRANQUIL TERRACE GALLE — 5-STAR LUXURY MOBILE CAROUSEL ENGINE
 * Continuous 60fps auto-scroll, native touch swipe, snap, pagination dots, 2.5s pause on interaction
 */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  class LuxuryMobileCarousel {
    constructor(container, options = {}) {
      this.container = container;
      this.options = Object.assign(
        {
          itemSelector: null,
          resumeDelay: 2500, // exact 2.5s resume delay
          scrollSpeed: 1,    // 1px per tick
        },
        options
      );

      this.items = this.options.itemSelector
        ? Array.from(this.container.querySelectorAll(this.options.itemSelector))
        : Array.from(this.container.children);

      if (this.items.length <= 1) return;

      this.isInteracting = false;
      this.resumeTimeout = null;
      this.dots = [];

      this.init();
    }

    init() {
      // 1. Build pagination dots
      this.buildDots();

      // 2. Attach touch & pointer listeners for pause/resume
      this.attachListeners();

      // 3. Start auto-scroll if mobile & motion allowed
      this.startContinuousAutoScroll();
    }

    buildDots() {
      // Remove any existing dots
      let existingDots = this.container.nextElementSibling;
      if (existingDots && existingDots.classList.contains("carousel-pagination-dots")) {
        existingDots.remove();
      }

      const dotsContainer = document.createElement("div");
      dotsContainer.className = "carousel-pagination-dots";
      dotsContainer.setAttribute("aria-hidden", "true");

      this.items.forEach((_, idx) => {
        const dot = document.createElement("button");
        dot.className = "carousel-dot" + (idx === 0 ? " active" : "");
        dot.setAttribute("type", "button");
        dot.setAttribute("aria-label", "Go to slide " + (idx + 1));
        dot.addEventListener("click", () => {
          this.pause();
          this.scrollToIndex(idx);
          this.resume();
        });
        dotsContainer.appendChild(dot);
        this.dots.push(dot);
      });

      this.container.parentNode.insertBefore(dotsContainer, this.container.nextSibling);
    }

    attachListeners() {
      const pause = () => this.pause();
      const resume = () => this.resume();

      this.container.addEventListener("touchstart", pause, { passive: true });
      this.container.addEventListener("pointerdown", pause, { passive: true });
      this.container.addEventListener("mouseenter", pause);

      this.container.addEventListener("touchend", resume, { passive: true });
      this.container.addEventListener("pointerup", resume, { passive: true });
      this.container.addEventListener("mouseleave", resume);

      // Track active dot on manual scroll
      let scrollTimer = null;
      this.container.addEventListener("scroll", () => {
        if (scrollTimer) cancelAnimationFrame(scrollTimer);
        scrollTimer = requestAnimationFrame(() => this.updateActiveDot());
      }, { passive: true });
    }

    pause() {
      this.isInteracting = true;
      if (this.resumeTimeout) clearTimeout(this.resumeTimeout);
    }

    resume() {
      if (this.resumeTimeout) clearTimeout(this.resumeTimeout);
      this.resumeTimeout = setTimeout(() => {
        this.isInteracting = false;
      }, this.options.resumeDelay);
    }

    scrollToIndex(idx) {
      if (!this.items[idx]) return;
      const targetLeft = this.items[idx].offsetLeft - this.container.offsetLeft;
      this.container.scrollTo({ left: targetLeft, behavior: "smooth" });
    }

    updateActiveDot() {
      if (!this.dots.length) return;
      const scrollPos = this.container.scrollLeft + (this.container.clientWidth / 2);
      let closestIdx = 0;
      let minDiff = Infinity;

      this.items.forEach((item, idx) => {
        const itemCenter = (item.offsetLeft - this.container.offsetLeft) + (item.offsetWidth / 2);
        const diff = Math.abs(scrollPos - itemCenter);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });

      this.dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === closestIdx);
      });
    }

    startContinuousAutoScroll() {
      let lastTime = performance.now();

      const step = (now) => {
        const delta = now - lastTime;
        lastTime = now;

        if (!this.isInteracting && window.innerWidth <= 768 && !prefersReducedMotion) {
          // Smooth progressive crawl
          this.container.scrollLeft += this.options.scrollSpeed;

          // Seamless loop when reaching end
          if (this.container.scrollLeft >= this.container.scrollWidth - this.container.clientWidth - 2) {
            this.container.scrollLeft = 0;
          }
        }

        requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    }
  }

  function initAllMobileCarousels() {
    const targets = [
      { sel: ".meta-amenities-grid", itemSel: ".meta-amenity-card" },
      { sel: ".meta-packages-list", itemSel: ".meta-package-card" },
      { sel: ".meta-reviews-grid", itemSel: ".meta-review-card" },
      { sel: ".meta-villas-grid", itemSel: ".meta-villa-card" },
      { sel: ".dual-villas-carousel", itemSel: ".named-villa" },
      { sel: ".villa-gallery-track", itemSel: ".villa-gallery-slide" }
    ];

    targets.forEach(t => {
      document.querySelectorAll(t.sel).forEach(el => {
        new LuxuryMobileCarousel(el, { itemSelector: t.itemSel });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllMobileCarousels);
  } else {
    initAllMobileCarousels();
  }
})();
`;

fs.writeFileSync(path.join(root, "public", "mobile-carousels.js"), carouselScript, "utf-8");

// Also append this script to meta-redesign.js so it runs without extra tags
let metaJs = fs.readFileSync(path.join(root, "public", "meta-redesign.js"), "utf-8");
if (!metaJs.includes("TRANQUIL TERRACE GALLE — 5-STAR LUXURY MOBILE CAROUSEL ENGINE")) {
  metaJs += "\n\n" + carouselScript;
  fs.writeFileSync(path.join(root, "public", "meta-redesign.js"), metaJs, "utf-8");
}

console.log("Updated mobile-carousels.js and meta-redesign.js");
