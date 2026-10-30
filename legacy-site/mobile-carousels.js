/**
 * TRANQUIL TERRACE GALLE — LUXURY 5-STAR MOBILE CAROUSEL & AUTO-SCROLL ENGINE
 * Fluid Native Touch Swiping + Gentle Left-to-Right Auto-Scroll + Center Snapping
 * Breakpoint: <= 767px (Disabled on Tablet & Desktop)
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

      // Auto-scroll state
      this.autoScrollRaf = null;
      this.isInteracting = false;
      this.isHovered = false;
      this.isRewinding = false;
      this.isVisible = false;
      this.resumeTimer = null;
      this.rewindTimer = null;
      this.subPixelAccumulator = 0;
      this.speed = 0.6; // ~36px/sec at 60fps — gentle luxury pace

      // Performance & Battery Optimization
      this.observer = null;

      this.init();
    }

    getItems() {
      if (this.itemSelector) {
        return Array.from(this.container.querySelectorAll(this.itemSelector)).filter(el => {
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
        this.destroy();
        return;
      }

      this.buildDots();
      this.setupTouchAndPointerListeners();
      this.setupIntersectionObserver();
      this.startAutoScroll();
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
          this.pauseAutoScroll();
          this.scrollToIndex(idx);
          this.scheduleResume(3500);
        });

        this.dotsContainer.appendChild(dot);
        this.dots.push(dot);
      });

      // Insert dots right after the carousel container (or its wrapper if marquee)
      const insertTarget = this.container.closest(".experience-marquee-wrap") ||
                           this.container.closest(".packages-container") ||
                           this.container;
      insertTarget.parentNode.insertBefore(this.dotsContainer, insertTarget.nextSibling);

      this.updateActiveDot();
    }

    destroyDots() {
      if (this.dotsContainer && this.dotsContainer.parentNode) {
        this.dotsContainer.parentNode.removeChild(this.dotsContainer);
      }
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
      const target = cardOffset - (this.container.clientWidth - item.clientWidth) / 2;

      this.container.scrollTo({
        left: Math.max(0, target),
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });

      this.updateActiveDot(idx);
    }

    updateActiveDot(forcedIdx = null) {
      if (!this.dots.length) return;
      const items = this.getItems();
      if (!items.length) return;

      let activeIdx = forcedIdx;
      if (activeIdx === null) {
        const containerCenter = this.container.scrollLeft + (this.container.clientWidth / 2);
        let minDiff = Infinity;
        activeIdx = 0;

        items.forEach((item, idx) => {
          const itemCenter = (item.offsetLeft - this.container.offsetLeft) + (item.offsetWidth / 2);
          const diff = Math.abs(containerCenter - itemCenter);
          if (diff < minDiff) {
            minDiff = diff;
            activeIdx = idx;
          }
        });
      }

      this.dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === activeIdx);
      });
    }

    // Touch & Pointer gesture handling (Zero scroll freezing, pause on touch, resume on release)
    setupTouchAndPointerListeners() {
      const onInteractionStart = () => {
        this.pauseAutoScroll();
        // Allow magnetic snapping when user is actively swiping with finger
        this.container.style.setProperty("scroll-snap-type", "x proximity", "important");
      };

      const onInteractionEnd = () => {
        this.scheduleResume(2500);
      };

      // Native touch events
      this.container.addEventListener("touchstart", onInteractionStart, { passive: true });
      this.container.addEventListener("touchmove", onInteractionStart, { passive: true });
      this.container.addEventListener("touchend", onInteractionEnd, { passive: true });
      this.container.addEventListener("touchcancel", onInteractionEnd, { passive: true });

      // Pointer events
      this.container.addEventListener("pointerdown", onInteractionStart, { passive: true });
      this.container.addEventListener("pointerup", onInteractionEnd, { passive: true });
      this.container.addEventListener("pointercancel", onInteractionEnd, { passive: true });

      // Mouse hover (for desktop emulator testing)
      this.container.addEventListener("mouseenter", () => {
        this.isHovered = true;
        this.pauseAutoScroll();
      });
      this.container.addEventListener("mouseleave", () => {
        this.isHovered = false;
        this.scheduleResume(1500);
      });

      // Update active dot during manual user scroll
      this.container.addEventListener("scroll", () => {
        if (this.scrollRaf) cancelAnimationFrame(this.scrollRaf);
        this.scrollRaf = requestAnimationFrame(() => {
          this.updateActiveDot();
        });
      }, { passive: true });
    }

    pauseAutoScroll() {
      this.isInteracting = true;
      this.isRewinding = false;
      if (this.resumeTimer) {
        clearTimeout(this.resumeTimer);
        this.resumeTimer = null;
      }
      if (this.rewindTimer) {
        clearTimeout(this.rewindTimer);
        this.rewindTimer = null;
      }
      if (this.autoScrollRaf) {
        cancelAnimationFrame(this.autoScrollRaf);
        this.autoScrollRaf = null;
      }
    }

    scheduleResume(delayMs = 2500) {
      if (this.resumeTimer) clearTimeout(this.resumeTimer);
      this.resumeTimer = setTimeout(() => {
        this.isInteracting = false;
        if (!this.isHovered && window.innerWidth <= 767 && !prefersReducedMotion) {
          // Temporarily disable snap-type during smooth programmatic glide
          this.container.style.setProperty("scroll-snap-type", "none", "important");
          this.startAutoScroll();
        }
      }, delayMs);
    }

    // Viewport intersection observer: only animate when visible on screen
    setupIntersectionObserver() {
      if ("IntersectionObserver" in window) {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            this.isVisible = entry.isIntersecting;
            if (this.isVisible) {
              if (!this.isInteracting && !this.isHovered && window.innerWidth <= 767) {
                this.startAutoScroll();
              }
            } else {
              if (this.autoScrollRaf) {
                cancelAnimationFrame(this.autoScrollRaf);
                this.autoScrollRaf = null;
              }
            }
          });
        }, { threshold: 0.1 });

        this.observer.observe(this.container);
      } else {
        this.isVisible = true;
      }
    }

    // High-performance RAF Auto-Scroll Engine (Left to Right)
    startAutoScroll() {
      if (prefersReducedMotion || window.innerWidth > 767) return;
      if (this.autoScrollRaf) cancelAnimationFrame(this.autoScrollRaf);

      // Disable snap during smooth programmatic glide so browser doesn't snap fight
      this.container.style.setProperty("scroll-snap-type", "none", "important");

      this.subPixelAccumulator = 0;

      const step = () => {
        if (window.innerWidth > 767) {
          this.destroy();
          return;
        }

        if (this.isInteracting || this.isHovered || !this.isVisible || this.isRewinding) {
          return;
        }

        const maxScroll = this.container.scrollWidth - this.container.clientWidth;
        if (maxScroll > 15) {
          // Reached the end: pause, then smooth rewind to start
          if (this.container.scrollLeft >= maxScroll - 2) {
            this.isRewinding = true;
            this.rewindTimer = setTimeout(() => {
              if (this.isInteracting) {
                this.isRewinding = false;
                return;
              }
              this.container.scrollTo({ left: 0, behavior: "smooth" });
              this.rewindTimer = setTimeout(() => {
                this.isRewinding = false;
                if (!this.isInteracting && !this.isHovered && this.isVisible) {
                  this.startAutoScroll();
                }
              }, 1200);
            }, 1600);
            return;
          }

          // Advance left-to-right (incrementing scrollLeft)
          this.subPixelAccumulator += this.speed;
          if (this.subPixelAccumulator >= 1) {
            const pixelsToScroll = Math.floor(this.subPixelAccumulator);
            this.container.scrollLeft += pixelsToScroll;
            this.subPixelAccumulator -= pixelsToScroll;
          }
        }

        this.autoScrollRaf = requestAnimationFrame(step);
      };

      this.autoScrollRaf = requestAnimationFrame(step);
    }

    destroy() {
      if (this.autoScrollRaf) {
        cancelAnimationFrame(this.autoScrollRaf);
        this.autoScrollRaf = null;
      }
      if (this.scrollRaf) {
        cancelAnimationFrame(this.scrollRaf);
        this.scrollRaf = null;
      }
      if (this.resumeTimer) {
        clearTimeout(this.resumeTimer);
        this.resumeTimer = null;
      }
      if (this.rewindTimer) {
        clearTimeout(this.rewindTimer);
        this.rewindTimer = null;
      }
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      this.container.style.removeProperty("scroll-snap-type");
      this.destroyDots();
    }

    refresh() {
      if (window.innerWidth <= 767) {
        this.buildDots();
        this.startAutoScroll();
      } else {
        this.destroy();
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
    { sel: ".review-marquee-track", itemSel: ".review-marquee-card:not(:nth-child(n+9))" },
    { sel: ".guide-grid", itemSel: "article" },
    { sel: ".meta-instagram-grid", itemSel: ".meta-insta-card" }
  ];

  function initAllMobileCarousels() {
    activeCarousels.forEach(c => c.destroy());
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
