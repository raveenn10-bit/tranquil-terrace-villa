import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

// 1. CSS to append to public/meta-redesign.css
const mobileResponsiveAndCarouselCss = `
/* ========================================================
   TRANQUIL TERRACE — MOBILE RESPONSIVENESS & CAROUSEL SUITE
   Verified 5-Star Luxury Standards (Mobile <= 768px)
   ======================================================== */

/* Global Strict Page-Level Overflow Elimination */
html {
  overflow-x: hidden !important;
  width: 100% !important;
  max-width: 100vw !important;
  position: relative !important;
  box-sizing: border-box !important;
}

body {
  overflow-x: hidden !important;
  width: 100% !important;
  max-width: 100vw !important;
  position: relative !important;
  box-sizing: border-box !important;
  margin: 0 !important;
}

*, *::before, *::after {
  box-sizing: border-box;
}

/* Ensure all media and flex containers respect viewport boundaries */
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

/* Footer Channel Cards Containment on Mobile */
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

/* Mobile Sticky Bottom Bar & Floating WhatsApp Containment */
.meta-mobile-sticky-bar {
  max-width: 100vw !important;
  box-sizing: border-box !important;
}

.meta-sticky-bar-inner {
  max-width: 100% !important;
  box-sizing: border-box !important;
}

/* 2. Prevent iOS Safari auto-zoom on form focus: 16px font-size */
@media (max-width: 768px) {
  input,
  select,
  textarea,
  .meta-cal-input,
  .form-grid input,
  .form-grid select,
  .form-grid textarea,
  #booking-form input,
  #booking-form select,
  #booking-form textarea,
  .availability input,
  .availability select,
  .availability textarea,
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

/* 3. Fluid Responsive Typography with clamp() */
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

/* 4. Desktop Protection (> 768px) */
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

/* 5. Mobile Horizontal Scroll Carousels (<= 768px Only) */
@media (max-width: 768px) {
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
    scroll-snap-type: x mandatory !important;
    -webkit-overflow-scrolling: touch !important;
    scroll-padding: 0 16px !important;
    padding: 12px 16px 20px 16px !important;
    margin-left: -16px !important;
    margin-right: -16px !important;
    width: calc(100% + 32px) !important;
    max-width: none !important;
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

  /* 1.15 to 1.25 cards per screen: flex: 0 0 80vw; max-width: 320px */
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

  /* Villa Photo Gallery Track (Mobile Swiping) */
  .meta-villa-media,
  .named-villa .villa-photo {
    position: relative !important;
    overflow: hidden !important;
    border-radius: 16px 16px 0 0 !important;
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

  /* 6. Carousel Pagination Indicators (Dots) */
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

// Append CSS to public/meta-redesign.css and public/cinematic-3d.css
for (const file of ["meta-redesign.css", "cinematic-3d.css"]) {
  const p = path.join(root, "public", file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, "utf-8");
    if (!content.includes("MOBILE RESPONSIVENESS & CAROUSEL SUITE")) {
      content += "\n" + mobileResponsiveAndCarouselCss;
      fs.writeFileSync(p, content, "utf-8");
      console.log(`Appended mobile carousel CSS to ${file}`);
    }
  }
}

// 2. Add Mobile Carousel & Auto-Scroll Interaction to public/meta-redesign.js
const metaJsPath = path.join(root, "public", "meta-redesign.js");
let metaJs = fs.readFileSync(metaJsPath, "utf-8");

const carouselJsCode = `
  /* ========================================================
     MOBILE HORIZONTAL CAROUSEL & AUTO-SCROLL ENGINE
     Smooth left-to-right infinite/looping scroll with 2.5s pause
     ======================================================== */
  function initMobileCarousels() {
    if (typeof window === "undefined") return;

    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Target carousels: Amenities and Reviews auto-scroll; others swipeable
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

      // 1. Create or retrieve pagination dots container
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
        if (resumeTimer) {
          clearTimeout(resumeTimer);
          resumeTimer = null;
        }
      }

      function scheduleResume() {
        if (resumeTimer) clearTimeout(resumeTimer);
        resumeTimer = setTimeout(() => {
          isInteracting = false;
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

      // 4. Auto-Scroll Loop (Reviews & Amenities, <= 768px, respect prefers-reduced-motion)
      if (enableAutoScroll && !isReducedMotion) {
        const speed = 0.55; // Pixels per frame (~33px/sec gentle luxury glide)

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

if (!metaJs.includes("initMobileCarousels")) {
  metaJs = metaJs.replace(
    "initWhatsAppModal();",
    "initWhatsAppModal();\n  initMobileCarousels();"
  );
  metaJs = metaJs.replace(
    "window.openTranquilWhatsAppModal = openWhatsAppModal;",
    `window.openTranquilWhatsAppModal = openWhatsAppModal;\n${carouselJsCode}`
  );
  fs.writeFileSync(metaJsPath, metaJs, "utf-8");
  console.log("Updated public/meta-redesign.js with mobile carousel engine");
}

// 3. Update public/index.html with Villa Photo Galleries
const indexHtmlPath = path.join(root, "public", "index.html");
let indexHtml = fs.readFileSync(indexHtmlPath, "utf-8");

const araliyaGalleryIndex = `
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
`.trim();

const oluGalleryIndex = `
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
`.trim();

// Replace Villa Araliya media block in index.html
indexHtml = indexHtml.replace(
  /<div class="meta-villa-media">[\s\S]*?ORIGINAL SANCTUARY<\/span>\s*<\/div>/,
  araliyaGalleryIndex
);

// Replace Villa Olu media block in index.html
indexHtml = indexHtml.replace(
  /<div class="meta-villa-media">[\s\S]*?NEWLY BUILT RETREAT<\/span>\s*<\/div>/,
  oluGalleryIndex
);

fs.writeFileSync(indexHtmlPath, indexHtml, "utf-8");
console.log("Updated public/index.html with Villa photo galleries");

// 4. Update public/villas.html with dual-villas-carousel wrapper & photo galleries
const villasHtmlPath = path.join(root, "public", "villas.html");
let villasHtml = fs.readFileSync(villasHtmlPath, "utf-8");

const araliyaFigureVillas = `
      <figure class="villa-photo frame reveal">
        <div class="villa-gallery-track" aria-label="Villa Araliya Photo Gallery">
          <div class="villa-gallery-slide">
            <img alt="Villa Araliya private plunge pool and whitewashed courtyard at Tranquil Terrace Galle" loading="lazy" src="images/villas/araliya/araliya-pool-day.jpg"/>
          </div>
          <div class="villa-gallery-slide">
            <img alt="Villa Araliya king bedroom suite" loading="lazy" src="assets/villa-1.webp"/>
          </div>
          <div class="villa-gallery-slide">
            <img alt="Villa Araliya garden courtyard" loading="lazy" src="assets/villa-0.webp"/>
          </div>
          <div class="villa-gallery-slide">
            <img alt="Villa Araliya floating breakfast" loading="lazy" src="assets/villa-4.webp"/>
          </div>
        </div>
        <figcaption>Villa Araliya · Private plunge pool &amp; courtyard</figcaption>
        <button aria-label="View Villa Araliya photograph" class="photo-open" data-image="2">🔍</button>
      </figure>
`.trim();

const oluFigureVillas = `
      <figure class="villa-photo frame reveal">
        <div class="villa-gallery-track" aria-label="Villa Olu Photo Gallery">
          <div class="villa-gallery-slide">
            <img alt="Villa Olu illuminated plunge pool, patio umbrella and rattan furniture at Tranquil Terrace Galle" loading="lazy" src="images/villas/olu/olu-pool-night.jpg"/>
          </div>
          <div class="villa-gallery-slide">
            <img alt="Villa Olu private plunge pool" loading="lazy" src="assets/villa-2.webp"/>
          </div>
          <div class="villa-gallery-slide">
            <img alt="Villa Olu king bedroom suite" loading="lazy" src="assets/villa-1.webp"/>
          </div>
          <div class="villa-gallery-slide">
            <img alt="Villa Olu lush terrace foliage" loading="lazy" src="assets/villa-3.webp"/>
          </div>
        </div>
        <figcaption>Villa Olu · Night plunge pool &amp; patio umbrella</figcaption>
        <button aria-label="View Villa Olu photograph" class="photo-open" data-image="1">🔍</button>
      </figure>
`.trim();

// Replace figures in villas.html
villasHtml = villasHtml.replace(
  /<figure class="villa-photo frame reveal">[\s\S]*?Villa Araliya[^\0]*?<\/figure>/,
  araliyaFigureVillas
);

villasHtml = villasHtml.replace(
  /<figure class="villa-photo frame reveal">[\s\S]*?Villa Olu[^\0]*?<\/figure>/,
  oluFigureVillas
);

// Wrap the two articles in dual-villas-carousel if not wrapped
if (!villasHtml.includes('<div class="dual-villas-carousel">')) {
  villasHtml = villasHtml.replace(
    /(<article class="named-villa" id="araliya">[\s\S]*?<\/article>\s*<\/section>)/,
    '<div class="dual-villas-carousel">\n$1'
  );
  villasHtml = villasHtml.replace(
    /(<\/article>)\s*(<\/section>)/,
    '$1\n    </div>\n  $2'
  );
}

fs.writeFileSync(villasHtmlPath, villasHtml, "utf-8");
console.log("Updated public/villas.html with dual-villas-carousel and photo tracks");
