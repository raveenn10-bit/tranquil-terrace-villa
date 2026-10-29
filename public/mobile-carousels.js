/**
 * TRANQUIL TERRACE GALLE — LUXURY 5-STAR MOBILE CAROUSEL ENGINE
 * Native Touch Swiping, Center Snapping & Subtle Pagination Dots
 * Breakpoint: <= 767px
 */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  class LuxuryMobileCarousel {
    constructor(container, options = {}) {
      this.container = container;
      this.itemSelector = options.itemSelector || null;
      this.dotsContainer = null;
      this.dots = [];
      this.scrollRaf = null;

      this.init();
    }

    getItems() {
      if (this.itemSelector) {
        return Array.from(this.container.querySelectorAll(this.itemSelector)).filter(el => {
          // Only visible items (for gallery filter support)
          return window.getComputedStyle(el).display !== "none";
        });
      }
      return Array.from(this.container.children).filter(el => {
        return !el.classList.contains("carousel-pagination-dots") &&
               window.getComputedStyle(el).display !== "none";
      });
    }

    init() {
      if (window.innerWidth > 767) {
        this.destroyDots();
        return;
      }

      this.buildDots();
      this.attachScrollListener();
    }

    buildDots() {
      this.destroyDots();

      const items = this.getItems();
      if (items.length <= 1) return;

      this.dotsContainer = document.createElement("div");
      this.dotsContainer.className = "carousel-pagination-dots";
      this.dotsContainer.setAttribute("aria-hidden", "true");

      this.dots = [];
      items.forEach((_, idx) => {
        const dot = document.createElement("button");
        dot.className = "carousel-dot" + (idx === 0 ? " active" : "");
        dot.setAttribute("type", "button");
        dot.setAttribute("aria-label", "Go to slide " + (idx + 1));
        
        dot.addEventListener("click", (e) => {
          e.preventDefault();
          this.scrollToIndex(idx);
        });

        this.dotsContainer.appendChild(dot);
        this.dots.push(dot);
      });

      // Insert dots right after the carousel container (or its wrapper if marquee)
      const insertTarget = this.container.closest(".experience-marquee-wrap") ||
                           this.container.closest(".packages-container") ||
                           this.container;
      insertTarget.parentNode.insertBefore(this.dotsContainer, insertTarget.nextSibling);

      // Initial active dot update
      this.updateActiveDot();
    }

    destroyDots() {
      if (this.dotsContainer && this.dotsContainer.parentNode) {
        this.dotsContainer.parentNode.removeChild(this.dotsContainer);
      }
      // Also look for any existing orphaned dots
      const next = this.container.nextElementSibling;
      if (next && next.classList.contains("carousel-pagination-dots")) {
        next.remove();
      }
      this.dots = [];
      this.dotsContainer = null;
    }

    scrollToIndex(idx) {
      const items = this.getItems();
      if (!items[idx]) return;

      const item = items[idx];
      const cardOffset = item.offsetLeft - this.container.offsetLeft;
      // Center card in container viewport
      const target = cardOffset - (this.container.clientWidth - item.clientWidth) / 2;

      this.container.scrollTo({
        left: Math.max(0, target),
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    }

    updateActiveDot() {
      if (!this.dots.length) return;
      const items = this.getItems();
      if (!items.length) return;

      const containerCenter = this.container.scrollLeft + (this.container.clientWidth / 2);
      let closestIdx = 0;
      let minDiff = Infinity;

      items.forEach((item, idx) => {
        const itemCenter = (item.offsetLeft - this.container.offsetLeft) + (item.offsetWidth / 2);
        const diff = Math.abs(containerCenter - itemCenter);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });

      this.dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === closestIdx);
      });
    }

    attachScrollListener() {
      this.container.addEventListener(
        "scroll",
        () => {
          if (this.scrollRaf) cancelAnimationFrame(this.scrollRaf);
          this.scrollRaf = requestAnimationFrame(() => this.updateActiveDot());
        },
        { passive: true }
      );
    }

    refresh() {
      if (window.innerWidth <= 767) {
        this.buildDots();
      } else {
        this.destroyDots();
      }
    }
  }

  // Registry of all carousel instances
  const activeCarousels = [];

  const CAROUSEL_TARGETS = [
    { sel: ".meta-villas-grid", itemSel: ".meta-villa-card" },
    { sel: ".dual-villas-carousel", itemSel: ".named-villa" },
    { sel: ".booking-amenities-container", itemSel: ".booking-amenity-cat" },
    { sel: ".meta-amenities-grid", itemSel: ".meta-amenity-card" },
    { sel: ".luxury-packages-grid", itemSel: ".luxury-package-card" },
    { sel: ".special-offers-grid", itemSel: ".special-offer-card" },
    { sel: ".experience-marquee-track", itemSel: ".experience-marquee-card:not(:nth-child(n+5))" },
    { sel: ".gallery-grid", itemSel: ".gallery-item" },
    { sel: ".meta-reviews-grid", itemSel: ".meta-review-card" },
    { sel: ".review-marquee-track", itemSel: ".review-marquee-card:not(:nth-child(n+5))" },
    { sel: ".guide-grid", itemSel: "article" },
    { sel: ".meta-instagram-grid", itemSel: ".meta-insta-card" }
  ];

  function initAllMobileCarousels() {
    activeCarousels.length = 0;

    CAROUSEL_TARGETS.forEach(target => {
      document.querySelectorAll(target.sel).forEach(el => {
        const instance = new LuxuryMobileCarousel(el, { itemSelector: target.itemSel });
        activeCarousels.push(instance);
      });
    });

    // Support gallery filter tab clicks (rebuild dots for filtered gallery items)
    document.querySelectorAll("[data-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        setTimeout(() => {
          activeCarousels.forEach(c => {
            if (c.container.classList.contains("gallery-grid")) {
              c.refresh();
              c.container.scrollTo({ left: 0, behavior: "smooth" });
            }
          });
        }, 150);
      });
    });
  }

  // Resize handler (debounced)
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      activeCarousels.forEach(c => c.refresh());
    }, 150);
  }, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllMobileCarousels);
  } else {
    initAllMobileCarousels();
  }
})();
