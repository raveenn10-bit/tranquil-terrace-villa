import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

console.log("=== APPLYING COMPLETE MOBILE RESPONSIVE & CAROUSEL FIX ===");

// 1. REPAIR & ENHANCE public/index.html (Both Villa Araliya & Villa Olu)
const indexHtmlPath = path.join(root, "public", "index.html");
let indexHtml = fs.readFileSync(indexHtmlPath, "utf-8");

const fullVillasGrid = `
      <div class="meta-villas-grid">
        <!-- VILLA ARALIYA (Original Villa - Daytime Pool & White Villa) -->
        <article class="meta-villa-card" id="villa-araliya">
          <div class="meta-villa-media">
            <div class="villa-gallery-track" aria-label="Villa Araliya Photo Gallery">
              <div class="villa-gallery-slide">
                <img 
                  src="images/villas/araliya/araliya-pool-day.jpg" 
                  alt="Villa Araliya private plunge pool and whitewashed courtyard in Galle" 
                  class="meta-villa-img"
                  loading="lazy"
                  width="1024"
                  height="754"
                />
              </div>
              <div class="villa-gallery-slide">
                <img 
                  src="assets/villa-1.webp" 
                  alt="Villa Araliya king bedroom suite and plush linen" 
                  class="meta-villa-img"
                  loading="lazy"
                  width="1024"
                  height="754"
                />
              </div>
              <div class="villa-gallery-slide">
                <img 
                  src="assets/villa-0.webp" 
                  alt="Villa Araliya garden courtyard and relaxation arch" 
                  class="meta-villa-img"
                  loading="lazy"
                  width="1024"
                  height="754"
                />
              </div>
              <div class="villa-gallery-slide">
                <img 
                  src="assets/villa-4.webp" 
                  alt="Villa Araliya floating breakfast in private plunge pool" 
                  class="meta-villa-img"
                  loading="lazy"
                  width="1024"
                  height="754"
                />
              </div>
            </div>
            <span class="meta-villa-badge">ORIGINAL SANCTUARY</span>
          </div>
          <div class="meta-villa-content">
            <div class="meta-villa-header">
              <h3>Villa Araliya</h3>
              <div class="meta-villa-rates">
                From <strong data-price-lkr="12500">LKR 12,500</strong> <small>/ stay</small>
              </div>
            </div>
            <p class="meta-villa-desc">
              The original courtyard villa framed by whitewashed walls, wooden glass doors, lush tropical greenery, and an illuminated arch-shaped relaxation alcove.
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

        <!-- VILLA OLU (Newly Built Villa - Nighttime Pool & Umbrella) -->
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
      </div>
`.trim();

indexHtml = indexHtml.replace(
  /<div class="meta-villas-grid">[\s\S]*?<\/div>\s*<!-- Single Professional Notice/,
  `${fullVillasGrid}\n\n      <!-- Single Professional Notice`
);
fs.writeFileSync(indexHtmlPath, indexHtml, "utf-8");
console.log("✓ Re-established both Villa Araliya & Villa Olu in public/index.html");

// 2. REPAIR & ENHANCE public/villas.html (Both Araliya & Olu with gallery tracks)
const villasHtmlPath = path.join(root, "public", "villas.html");
let villasHtml = fs.readFileSync(villasHtmlPath, "utf-8");

const fullDualVillasCarousel = `
  <div class="dual-villas-carousel">
    <article class="named-villa" id="araliya">
      <figure class="villa-photo frame reveal">
        <div class="villa-gallery-track" aria-label="Villa Araliya Photo Gallery">
          <div class="villa-gallery-slide">
            <img alt="Villa Araliya private plunge pool and whitewashed courtyard at Tranquil Terrace Galle" loading="lazy" src="images/villas/araliya/araliya-pool-day.jpg"/>
          </div>
          <div class="villa-gallery-slide">
            <img alt="Villa Araliya king bedroom suite and plush linen" loading="lazy" src="assets/villa-1.webp"/>
          </div>
          <div class="villa-gallery-slide">
            <img alt="Villa Araliya garden courtyard and relaxation arch" loading="lazy" src="assets/villa-0.webp"/>
          </div>
          <div class="villa-gallery-slide">
            <img alt="Villa Araliya floating breakfast in private plunge pool" loading="lazy" src="assets/villa-4.webp"/>
          </div>
        </div>
        <figcaption>Villa Araliya · Private plunge pool &amp; courtyard</figcaption>
        <button aria-label="View Villa Araliya photograph" class="photo-open" data-image="2">🔍</button>
      </figure>
      <div class="villa-details reveal">
        <p class="eyebrow">VILLA 01 · ARALIYA (ORIGINAL SANCTUARY)</p>
        <h3>Villa<br/><em>Araliya.</em></h3>
        <p>The original courtyard villa framed by whitewashed walls, wooden glass doors, tropical frangipani greenery, an illuminated arch relaxation nook, and your own private plunge pool.</p>
        <ul class="villa-facts">
          <li><span>01</span> King bedroom suite</li>
          <li><span>01</span> Private en-suite bathroom</li>
          <li><span>02</span> Guests maximum</li>
          <li><span>01</span> Private plunge pool</li>
        </ul>
        <button class="button" data-book="" data-choice="Araliya">Enquire about Araliya <span>↗</span></button>
      </div>
    </article>

    <article class="named-villa reverse" id="olu">
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
        <figcaption>Villa Olu · Night plunge pool &amp; patio umbrella</figcaption>
        <button aria-label="View Villa Olu photograph" class="photo-open" data-image="1">🔍</button>
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
  </div>
`.trim();

villasHtml = villasHtml.replace(
  /(<div class="title-row reveal">[\s\S]*?<\/div>)\s*([\s\S]*?)(<\/section>\s*<section class="stay-details)/,
  `$1\n  ${fullDualVillasCarousel}\n  $3`
);
fs.writeFileSync(villasHtmlPath, villasHtml, "utf-8");
console.log("✓ Re-established both Araliya & Olu with photo tracks in public/villas.html");

// 3. BULLETPROOF CSS UPDATES: 16px INPUTS ON ALL PAGES & CAROUSEL ENGINE
const definitiveCssRules = `
/* ========================================================
   TRANQUIL TERRACE DEFINITIVE RESPONSIVE & CAROUSEL RULES
   ======================================================== */

/* Universal Strict Page-Level Overflow Elimination */
html, body {
  overflow-x: hidden !important;
  width: 100% !important;
  max-width: 100vw !important;
  position: relative !important;
  box-sizing: border-box !important;
  margin: 0 !important;
}

main, #main, .page-wrapper {
  overflow-x: hidden !important;
  width: 100% !important;
  max-width: 100% !important;
  position: relative !important;
}

/* Media Max-Width Containment */
img, video, iframe, canvas, picture {
  max-width: 100% !important;
  box-sizing: border-box !important;
}

.meta-hero-video {
  width: 100% !important;
  max-width: 100% !important;
  object-fit: cover !important;
}

.brand.brand-logo, .brand.brand-logo img,
.footer-logo, .footer-logo img,
.brand-icon {
  max-width: 100% !important;
  height: auto !important;
}

/* Footer Channel Cards Full Mobile Containment */
.footer-channel-cards {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

.footer-channel-card {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  min-width: 0 !important;
  overflow: hidden !important;
}

.channel-card-brand {
  min-width: 0 !important;
  max-width: calc(100% - 24px) !important;
  overflow: hidden !important;
}

.channel-card-left {
  min-width: 0 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.channel-card-name, .channel-card-sub {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  display: block !important;
}

/* Availability Form & Badge Containment */
form.availability, .availability {
  width: 100% !important;
  max-width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  box-sizing: border-box !important;
}

.meta-google-badge,
.meta-reviews-summary-badge,
.google-score,
.verified-property-facts {
  max-width: 100% !important;
  box-sizing: border-box !important;
}

.review-marquee-wrap {
  overflow: hidden !important;
  width: 100% !important;
  max-width: 100vw !important;
  position: relative !important;
}

/* Tables, Comparisons, Maps */
.comparison, .page-inner .comparison {
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch !important;
  box-sizing: border-box !important;
}

.comparison table, .page-inner .comparison table {
  width: 100% !important;
  min-width: 280px !important;
  box-sizing: border-box !important;
}

.map-frame, .meta-map-frame {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

.map-frame iframe, .meta-map-frame iframe {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  border: 0 !important;
}

/* STRICT 16PX FONT SIZE ON ALL MOBILE FORM INPUTS (No iOS Safari auto-zoom) */
@media (max-width: 768px) {
  input,
  select,
  textarea,
  .page-inner input,
  .page-inner select,
  .page-inner textarea,
  .availability input,
  .availability select,
  .availability textarea,
  .page-inner .availability input,
  .page-inner .availability select,
  .page-inner .availability textarea,
  .meta-cal-input,
  .form-grid input,
  .form-grid select,
  .form-grid textarea,
  #booking-form input,
  #booking-form select,
  #booking-form textarea,
  .dialog-platforms input,
  .dialog-platforms select,
  #booking input,
  #booking select,
  #booking textarea {
    font-size: 16px !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
}

/* FLUID RESPONSIVE TYPOGRAPHY (clamp for 320px - 768px screens) */
@media (max-width: 768px) {
  h1, .hero h1, .inner-hero h1, .meta-hero-title {
    font-size: clamp(2rem, 7.5vw, 3.4rem) !important;
    line-height: 1.08 !important;
    word-break: break-word !important;
    overflow-wrap: break-word !important;
  }

  h2, .meta-section-title, .meta-calendar-title, .review-heading h2, .villas h2, .title-row h2, .stay-details h2, .contact h2, .faq h2, .footer-invite h2 {
    font-size: clamp(1.75rem, 6.2vw, 2.6rem) !important;
    line-height: 1.14 !important;
    word-break: break-word !important;
    overflow-wrap: break-word !important;
  }

  h3, .card-heading h3, .villa-details h3, .booking-heading h2 {
    font-size: clamp(1.4rem, 5vw, 2rem) !important;
    line-height: 1.2 !important;
    word-break: break-word !important;
    overflow-wrap: break-word !important;
  }

  .footer-word {
    font-size: clamp(34px, 12vw, 110px) !important;
    line-height: 1 !important;
    white-space: normal !important;
    word-break: break-word !important;
  }

  .meta-section-sub, .hero-copy, .body-copy {
    font-size: clamp(0.95rem, 3.8vw, 1.1rem) !important;
    line-height: 1.65 !important;
  }
}

/* DESKTOP INTEGRITY (> 768px) */
@media (min-width: 769px) {
  .meta-amenities-grid {
    display: grid !important;
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 1.5rem !important;
    overflow-x: visible !important;
  }

  .meta-packages-list {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.25rem !important;
    overflow-x: visible !important;
  }

  .meta-reviews-grid {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 1.75rem !important;
    overflow-x: visible !important;
  }

  .meta-villas-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 2.25rem !important;
    overflow-x: visible !important;
  }

  .dual-villas-carousel {
    display: block !important;
  }

  .carousel-pagination-dots {
    display: none !important;
  }

  .villa-gallery-track {
    display: block !important;
    position: relative !important;
    width: 100% !important;
    height: 100% !important;
  }
  .villa-gallery-slide {
    display: block !important;
    width: 100% !important;
    height: 100% !important;
  }
  .villa-gallery-slide:not(:first-child) {
    display: none !important;
  }
}

/* MOBILE HORIZONTAL CAROUSEL ENGINE (<= 768px) */
@media (max-width: 768px) {
  /* Section & Container overflow containment */
  section, .section,
  .meta-amenities-section,
  .meta-packages-section,
  .meta-reviews-section,
  .meta-villas-section,
  .dual-villas,
  .guest-reviews.section {
    overflow-x: hidden !important;
    max-width: 100vw !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .meta-amenities-grid,
  .meta-packages-list,
  .meta-reviews-grid,
  .meta-villas-grid,
  .dual-villas-carousel {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch !important;
    scroll-padding: 0 16px !important;
    padding: 12px 16px 20px 16px !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    box-sizing: border-box !important;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
    gap: 16px !important;
  }

  .meta-amenities-grid::-webkit-scrollbar,
  .meta-packages-list::-webkit-scrollbar,
  .meta-reviews-grid::-webkit-scrollbar,
  .meta-villas-grid::-webkit-scrollbar,
  .dual-villas-carousel::-webkit-scrollbar,
  .villa-gallery-track::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }

  /* 1.15 to 1.25 cards preview per screen */
  .meta-amenities-grid > .meta-amenity-card {
    flex: 0 0 78vw !important;
    max-width: 300px !important;
    min-width: 250px !important;
    scroll-snap-align: start !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    background: #FFFFFF !important;
    border-radius: 16px !important;
    border: 1px solid rgba(200, 164, 93, 0.22) !important;
    padding: 24px 20px !important;
    box-shadow: 0 8px 24px rgba(20, 22, 21, 0.05) !important;
  }

  .meta-packages-list > .meta-package-card {
    flex: 0 0 82vw !important;
    max-width: 320px !important;
    min-width: 270px !important;
    scroll-snap-align: start !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    background: #FFFFFF !important;
    border-radius: 18px !important;
    border: 1px solid rgba(200, 164, 93, 0.24) !important;
    padding: 22px 20px !important;
    box-shadow: 0 10px 28px rgba(20, 22, 21, 0.06) !important;
  }

  .meta-reviews-grid > .meta-review-card {
    flex: 0 0 82vw !important;
    max-width: 320px !important;
    min-width: 270px !important;
    scroll-snap-align: start !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    background: #1C1E1D !important;
    border-radius: 18px !important;
    border: 1px solid rgba(200, 164, 93, 0.26) !important;
    padding: 24px 20px !important;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35) !important;
  }

  .meta-villas-grid > .meta-villa-card,
  .dual-villas-carousel > .named-villa {
    flex: 0 0 85vw !important;
    max-width: 340px !important;
    min-width: 280px !important;
    scroll-snap-align: start !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    background: #FFFFFF !important;
    border-radius: 20px !important;
    border: 1px solid rgba(200, 164, 93, 0.22) !important;
    box-shadow: 0 12px 36px rgba(20, 22, 21, 0.07) !important;
    overflow: hidden !important;
  }

  /* Villa Photo Gallery Tracks (Mobile Swiping) */
  .meta-villa-media,
  .named-villa .villa-photo {
    position: relative !important;
    overflow: hidden !important;
    border-radius: 16px 16px 0 0 !important;
    height: 250px !important;
  }

  .villa-gallery-track {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scroll-snap-type: x mandatory !important;
    -webkit-overflow-scrolling: touch !important;
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    scrollbar-width: none !important;
  }

  .villa-gallery-slide {
    flex: 0 0 100% !important;
    width: 100% !important;
    height: 100% !important;
    scroll-snap-align: start !important;
    position: relative !important;
    overflow: hidden !important;
  }

  .villa-gallery-slide img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    display: block !important;
  }

  /* Pagination Dots */
  .carousel-pagination-dots {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 8px !important;
    margin: 14px auto 8px auto !important;
    width: 100% !important;
    padding: 0 !important;
    z-index: 5 !important;
  }

  .carousel-dot {
    width: 8px !important;
    height: 8px !important;
    border-radius: 50% !important;
    background: rgba(183, 146, 88, 0.3) !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    cursor: pointer !important;
    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
  }

  .carousel-dot.active {
    width: 24px !important;
    border-radius: 4px !important;
    background: #B79258 !important;
    box-shadow: 0 0 8px rgba(183, 146, 88, 0.5) !important;
  }

  .meta-reviews-section .carousel-dot {
    background: rgba(255, 255, 255, 0.25) !important;
  }

  .meta-reviews-section .carousel-dot.active {
    background: #E2CA92 !important;
    box-shadow: 0 0 8px rgba(226, 202, 146, 0.6) !important;
  }
}
`;

// Append to both CSS files
for (const f of ["meta-redesign.css", "cinematic-3d.css"]) {
  const p = path.join(root, "public", f);
  let content = fs.readFileSync(p, "utf-8");
  if (!content.includes("TRANQUIL TERRACE DEFINITIVE RESPONSIVE")) {
    content += "\n" + definitiveCssRules;
  } else {
    content = content.replace(
      /\/\* ========================================================\s*TRANQUIL TERRACE DEFINITIVE RESPONSIVE[\s\S]*$/,
      definitiveCssRules.trim()
    );
  }
  fs.writeFileSync(p, content, "utf-8");
  console.log(`✓ Updated definitive rules in public/${f}`);
}

// 4. JS AUTO-SCROLL ENGINE with SNAP TOGGLE & 2.5s RESUME DELAY
const metaJsPath = path.join(root, "public", "meta-redesign.js");
let metaJs = fs.readFileSync(metaJsPath, "utf-8");

const definitiveJsCode = `
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
        carousel.style.scrollSnapType = "x mandatory";
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
            carousel.style.scrollSnapType = "none";
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
          carousel.style.scrollSnapType = "none";
        }

        const speed = 0.8; // px per tick for gentle luxury glide (~48px/sec at 60Hz)

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
          requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      }
    }
  }
`;

// Replace old carousel code in meta-redesign.js
if (metaJs.includes("function initMobileCarousels()")) {
  metaJs = metaJs.replace(
    /\/\* ========================================================\s*MOBILE HORIZONTAL CAROUSEL[\s\S]*function initMobileCarousels\(\) \{[\s\S]*?\n  \}\n/,
    definitiveJsCode
  );
} else {
  metaJs = metaJs.replace(
    "initWhatsAppModal();",
    "initWhatsAppModal();\n  initMobileCarousels();"
  );
  metaJs = metaJs.replace(
    "window.openTranquilWhatsAppModal = openWhatsAppModal;",
    `window.openTranquilWhatsAppModal = openWhatsAppModal;\n${definitiveJsCode}`
  );
}

fs.writeFileSync(metaJsPath, metaJs, "utf-8");
console.log("✓ Updated definitive JS in public/meta-redesign.js");
