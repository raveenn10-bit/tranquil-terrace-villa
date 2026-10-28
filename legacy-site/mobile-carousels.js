/**
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
