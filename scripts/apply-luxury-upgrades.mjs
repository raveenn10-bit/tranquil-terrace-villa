import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

// --- 1. SVGs for the 8 Curated Amenities ---
const snowflakeSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true">
  <line x1="12" y1="2" x2="12" y2="22"></line>
  <line x1="2" y1="12" x2="22" y2="12"></line>
  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
  <line x1="19.07" y1="4.93" x2="4.93" y2="19.07"></line>
  <polyline points="10 4 12 2 14 4"></polyline>
  <polyline points="10 20 12 22 14 20"></polyline>
  <polyline points="4 10 2 12 4 14"></polyline>
  <polyline points="20 10 22 12 20 14"></polyline>
  <polyline points="5.5 8 7.07 7.07 8 5.5"></polyline>
  <polyline points="18.5 16 16.93 16.93 16 18.5"></polyline>
  <polyline points="18.5 8 16.93 7.07 16 5.5"></polyline>
  <polyline points="5.5 16 7.07 16.93 8 18.5"></polyline>
</svg>`;

const wifiSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true">
  <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
  <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
  <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
  <circle cx="12" cy="20" r="1.3" fill="currentColor"></circle>
</svg>`;

const kitchenSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true">
  <path d="M18 2v8a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V2"></path>
  <line x1="15" y1="12" x2="15" y2="22"></line>
  <line x1="15" y1="2" x2="15" y2="7"></line>
  <path d="M7 2v10a3 3 0 0 0 3 3h0V2z"></path>
  <line x1="7" y1="15" x2="7" y2="22"></line>
</svg>`;

const poolSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true">
  <path d="M5 3v8"></path>
  <path d="M9 3v8"></path>
  <line x1="5" y1="6" x2="9" y2="6"></line>
  <line x1="5" y1="9" x2="9" y2="9"></line>
  <path d="M2 15c2-1 4-1 6 0s4 1 6 0 4-1 6 0 2 .5 2 .5"></path>
  <path d="M2 19c2-1 4-1 6 0s4 1 6 0 4-1 6 0 2 .5 2 .5"></path>
</svg>`;

const bedSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true">
  <path d="M3 19V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v13"></path>
  <path d="M3 14h18"></path>
  <path d="M3 19h18"></path>
  <rect x="6" y="8" width="5" height="4" rx="1"></rect>
  <rect x="13" y="8" width="5" height="4" rx="1"></rect>
</svg>`;

const bathSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true">
  <path d="M4 4h7a4 4 0 0 1 4 4v2"></path>
  <path d="M11 10h8l-1.5 3h-5z"></path>
  <line x1="13" y1="16" x2="13" y2="17"></line>
  <line x1="15" y1="15" x2="15" y2="18"></line>
  <line x1="17" y1="16" x2="17" y2="17"></line>
  <path d="M3 19h18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
</svg>`;

const foliageSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true">
  <path d="M12 22C12 12 19 4 19 4S11 6 7 13c-2.5 4.5-.5 8.5 5 9z"></path>
  <path d="M12 22c-1-5 2-10 6-14"></path>
  <path d="M9 11c3 0 5-2 6-4"></path>
  <path d="M7 16c2.5-.5 4.5-2.5 5-5"></path>
</svg>`;

const conciergeSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true">
  <circle cx="7.5" cy="15.5" r="4.5"></circle>
  <circle cx="7.5" cy="15.5" r="1.5"></circle>
  <path d="m10.7 12.3 8.8-8.8"></path>
  <path d="m16.5 6.5 2 2"></path>
  <path d="m18.5 4.5 2 2"></path>
  <path d="M18 16v4M16 18h4" stroke-width="1.4"></path>
</svg>`;

// Complete Luxury Amenities HTML Block
export const amenitiesSectionHtml = `
    <!-- Curated Amenities Section (8 Luxury Amenities with Bespoke SVG Icons) -->
    <section class="meta-amenities-section" id="amenities">
      <div class="meta-section-header-row">
        <div>
          <span class="meta-eyebrow">CURATED HOSPITALITY</span>
          <h2 class="meta-section-title">
            Thoughtful, not excessive.<br/>
            <em>Built for slow mornings.</em>
          </h2>
        </div>
        <p class="meta-section-sub">
          Every villa is engineered for deep stillness, privacy, and tropical ease. Two private worlds with separate entrances, plunge pools, and curated luxury amenities.
        </p>
      </div>

      <div class="meta-amenities-grid">
        <!-- 1. Air Conditioning (Snowflake SVG) -->
        <article class="meta-amenity-card">
          <div class="meta-amenity-icon-wrap" aria-hidden="true">
            ${snowflakeSvg}
          </div>
          <h4>Air Conditioning</h4>
          <p>Whisper-quiet inverter AC &amp; ceiling fans for serene climate control day and night.</p>
        </article>

        <!-- 2. Free High-Speed Wi-Fi (WiFi SVG) -->
        <article class="meta-amenity-card">
          <div class="meta-amenity-icon-wrap" aria-hidden="true">
            ${wifiSvg}
          </div>
          <h4>Free High-Speed Wi-Fi</h4>
          <p>Seamless optical fibre internet throughout suites, private verandas, and poolside.</p>
        </article>

        <!-- 3. Kitchenette & Dining (Cooking/Chef Knife & Fork SVG) -->
        <article class="meta-amenity-card">
          <div class="meta-amenity-icon-wrap" aria-hidden="true">
            ${kitchenSvg}
          </div>
          <h4>Kitchenette &amp; Dining</h4>
          <p>Equipped private kitchenette, minibar, tea/coffee station, and intimate dining area.</p>
        </article>

        <!-- 4. Private Plunge Pool (Waves / Pool Water SVG) -->
        <article class="meta-amenity-card">
          <div class="meta-amenity-icon-wrap" aria-hidden="true">
            ${poolSvg}
          </div>
          <h4>Private Plunge Pool</h4>
          <p>Completely secluded private pool exclusive to your villa for morning and evening dips.</p>
        </article>

        <!-- 5. King Bedroom (Bed SVG) -->
        <article class="meta-amenity-card">
          <div class="meta-amenity-icon-wrap" aria-hidden="true">
            ${bedSvg}
          </div>
          <h4>King Bedroom</h4>
          <p>Bespoke king-size mattress dressed in 400-thread-count Egyptian cotton linens.</p>
        </article>

        <!-- 6. En-suite Bathroom (Shower / Bath SVG) -->
        <article class="meta-amenity-card">
          <div class="meta-amenity-icon-wrap" aria-hidden="true">
            ${bathSvg}
          </div>
          <h4>En-suite Bathroom</h4>
          <p>Spacious private en-suite with rainfall shower and organic botanical amenities.</p>
        </article>

        <!-- 7. Tropical Garden Terrace (Foliage / Palm Leaf SVG) -->
        <article class="meta-amenity-card">
          <div class="meta-amenity-icon-wrap" aria-hidden="true">
            ${foliageSvg}
          </div>
          <h4>Tropical Garden Terrace</h4>
          <p>Sun-dappled private outdoor terrace bordered by lush cinnamon groves and flora.</p>
        </article>

        <!-- 8. Dedicated Concierge (Sparkle / Concierge Key SVG) -->
        <article class="meta-amenity-card">
          <div class="meta-amenity-icon-wrap" aria-hidden="true">
            ${conciergeSvg}
          </div>
          <h4>Dedicated Concierge</h4>
          <p>Personalized 24/7 WhatsApp concierge to curate transfers, dining, and excursions.</p>
        </article>
      </div>
    </section>
`.trim();

// Complete Instagram Social Proof HTML Block
export const instagramSectionHtml = `
    <!-- Instagram Social Proof Section -->
    <section class="meta-instagram-section" id="moments">
      <div class="meta-instagram-container">
        <div class="meta-instagram-header">
          <div class="meta-instagram-header-left">
            <span class="meta-eyebrow">MOMENTS AT TRANQUIL TERRACE</span>
            <h2 class="meta-section-title">Moments at Tranquil Terrace</h2>
            <p class="meta-section-sub">Follow our journey on Instagram <a href="https://www.instagram.com/tranquil_terrace_galle/" target="_blank" rel="noopener" class="ig-handle-link">@tranquil_terrace_galle</a></p>
          </div>
          <div class="meta-instagram-header-right">
            <a href="https://www.instagram.com/tranquil_terrace_galle/" target="_blank" rel="noopener" class="meta-btn-gold-instagram" aria-label="Follow Tranquil Terrace Galle on Instagram">
              <svg class="ig-btn-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>Follow on Instagram ↗</span>
            </a>
          </div>
        </div>

        <div class="meta-instagram-grid" id="instagram-cards-track">
          <!-- Card 1 -->
          <a href="https://www.instagram.com/tranquil_terrace_galle/" target="_blank" rel="noopener" class="meta-insta-card" aria-label="View on Instagram: Emerald Plunge Pool">
            <div class="insta-img-wrapper">
              <img src="assets/villa-0.webp" alt="Tranquil Terrace Galle - Emerald Plunge Pool" loading="lazy" width="600" height="600" />
              <div class="insta-overlay">
                <div class="insta-overlay-badge">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <span class="insta-overlay-handle">@tranquil_terrace_galle</span>
              </div>
            </div>
          </a>

          <!-- Card 2 -->
          <a href="https://www.instagram.com/tranquil_terrace_galle/" target="_blank" rel="noopener" class="meta-insta-card" aria-label="View on Instagram: King Bedroom Suite">
            <div class="insta-img-wrapper">
              <img src="assets/villa-1.webp" alt="Tranquil Terrace Galle - King Bedroom Suite" loading="lazy" width="600" height="600" />
              <div class="insta-overlay">
                <div class="insta-overlay-badge">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <span class="insta-overlay-handle">@tranquil_terrace_galle</span>
              </div>
            </div>
          </a>

          <!-- Card 3 -->
          <a href="https://www.instagram.com/tranquil_terrace_galle/" target="_blank" rel="noopener" class="meta-insta-card" aria-label="View on Instagram: Private Veranda & Lounge">
            <div class="insta-img-wrapper">
              <img src="assets/villa-2.webp" alt="Tranquil Terrace Galle - Private Garden Veranda" loading="lazy" width="600" height="600" />
              <div class="insta-overlay">
                <div class="insta-overlay-badge">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <span class="insta-overlay-handle">@tranquil_terrace_galle</span>
              </div>
            </div>
          </a>

          <!-- Card 4 -->
          <a href="https://www.instagram.com/tranquil_terrace_galle/" target="_blank" rel="noopener" class="meta-insta-card" aria-label="View on Instagram: Cinnamon Grove Courtyard">
            <div class="insta-img-wrapper">
              <img src="assets/villa-3.webp" alt="Tranquil Terrace Galle - Cinnamon Grove Courtyard" loading="lazy" width="600" height="600" />
              <div class="insta-overlay">
                <div class="insta-overlay-badge">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <span class="insta-overlay-handle">@tranquil_terrace_galle</span>
              </div>
            </div>
          </a>

          <!-- Card 5 -->
          <a href="https://www.instagram.com/tranquil_terrace_galle/" target="_blank" rel="noopener" class="meta-insta-card" aria-label="View on Instagram: Tropical Villa Architecture">
            <div class="insta-img-wrapper">
              <img src="assets/villa-4.webp" alt="Tranquil Terrace Galle - Modern Tropical Architecture" loading="lazy" width="600" height="600" />
              <div class="insta-overlay">
                <div class="insta-overlay-badge">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <span class="insta-overlay-handle">@tranquil_terrace_galle</span>
              </div>
            </div>
          </a>

          <!-- Card 6 -->
          <a href="https://www.instagram.com/tranquil_terrace_galle/" target="_blank" rel="noopener" class="meta-insta-card" aria-label="View on Instagram: Villa Olu Illuminated Night Pool">
            <div class="insta-img-wrapper">
              <img src="assets/villa-5.webp" alt="Tranquil Terrace Galle - Villa Olu Illuminated Night Pool" loading="lazy" width="600" height="600" />
              <div class="insta-overlay">
                <div class="insta-overlay-badge">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <span class="insta-overlay-handle">@tranquil_terrace_galle</span>
              </div>
            </div>
          </a>
        </div>

        <div class="meta-instagram-mobile-action">
          <a href="https://www.instagram.com/tranquil_terrace_galle/" target="_blank" rel="noopener" class="meta-btn-gold-instagram full-width" aria-label="Follow Tranquil Terrace Galle on Instagram">
            <svg class="ig-btn-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span>Follow on Instagram ↗</span>
          </a>
        </div>
      </div>
    </section>
`.trim();

// Complete 9-Question FAQ Section HTML Block
export const faqSectionHtml = `
    <!-- Professional FAQ Section (9 Verified Questions & Answers) -->
    <section class="meta-faq-section" id="faq">
      <div class="meta-faq-container">
        <div style="text-align: center;">
          <span class="meta-eyebrow">ESSENTIAL INFORMATION</span>
          <h2 class="meta-section-title">
            Frequently Asked Questions
          </h2>
          <p class="meta-section-sub" style="margin: 0.75rem auto 0; text-align: center;">
            Everything you need to know about your private sanctuary in Galle
          </p>
        </div>

        <div class="meta-faq-accordion" id="luxury-faq-accordion">
          <!-- Q1 -->
          <div class="meta-faq-item open">
            <button type="button" class="meta-faq-question" aria-expanded="true">
              <span>What time is check-in and check-out?</span>
              <span class="faq-icon" aria-hidden="true">+</span>
            </button>
            <div class="meta-faq-answer">
              <p>Check-in is from 1:00 PM (13:00) and check-out is by 10:00 AM. Early check-in or late check-out can be requested via WhatsApp subject to villa availability.</p>
            </div>
          </div>

          <!-- Q2 -->
          <div class="meta-faq-item">
            <button type="button" class="meta-faq-question" aria-expanded="false">
              <span>What is the cancellation policy?</span>
              <span class="faq-icon" aria-hidden="true">+</span>
            </button>
            <div class="meta-faq-answer">
              <p>Direct bookings enjoy flexible cancellation up to 7 days before arrival. For special holiday dates or partner channel bookings (Booking.com/Airbnb/Agoda), channel terms apply. Contact our concierge via WhatsApp for assistance.</p>
            </div>
          </div>

          <!-- Q3 -->
          <div class="meta-faq-item">
            <button type="button" class="meta-faq-question" aria-expanded="false">
              <span>Is breakfast included?</span>
              <span class="faq-icon" aria-hidden="true">+</span>
            </button>
            <div class="meta-faq-answer">
              <p>We offer signature floating breakfasts served directly in your private plunge pool, as well as traditional Sri Lankan and continental morning spreads, available with our curated stay packages or as an à la carte upgrade.</p>
            </div>
          </div>

          <!-- Q4 -->
          <div class="meta-faq-item">
            <button type="button" class="meta-faq-question" aria-expanded="false">
              <span>How far is Galle Fort from Tranquil Terrace?</span>
              <span class="faq-icon" aria-hidden="true">+</span>
            </button>
            <div class="meta-faq-answer">
              <p>Tranquil Terrace is situated in a tranquil cinnamon grove setting in Galle, approximately 4.5 km (a picturesque 12-minute tuk-tuk or car ride) from the historic UNESCO World Heritage Galle Fort and pristine southern beaches.</p>
            </div>
          </div>

          <!-- Q5 -->
          <div class="meta-faq-item">
            <button type="button" class="meta-faq-question" aria-expanded="false">
              <span>Do both villas have private plunge pools?</span>
              <span class="faq-icon" aria-hidden="true">+</span>
            </button>
            <div class="meta-faq-answer">
              <p>Yes, both Villa Araliya and Villa Olu each have their own completely private plunge pool exclusively for your use.</p>
            </div>
          </div>

          <!-- Q6 -->
          <div class="meta-faq-item">
            <button type="button" class="meta-faq-question" aria-expanded="false">
              <span>How many guests can stay in each villa?</span>
              <span class="faq-icon" aria-hidden="true">+</span>
            </button>
            <div class="meta-faq-answer">
              <p>Each villa is designed for intimate luxury accommodating up to 2 adult guests in 1 king bedroom. For groups of up to 4 adults, you can book both Villa Araliya and Villa Olu together for an exclusive private property buyout.</p>
            </div>
          </div>

          <!-- Q7 -->
          <div class="meta-faq-item">
            <button type="button" class="meta-faq-question" aria-expanded="false">
              <span>How can I make a reservation?</span>
              <span class="faq-icon" aria-hidden="true">+</span>
            </button>
            <div class="meta-faq-answer">
              <p>You can book directly through our WhatsApp concierge (+94 77 068 2366) for guaranteed best rates, use the online booking form on our website, or book via our official partner channels on Booking.com, Airbnb, and Agoda.</p>
            </div>
          </div>

          <!-- Q8 -->
          <div class="meta-faq-item">
            <button type="button" class="meta-faq-question" aria-expanded="false">
              <span>Is parking available?</span>
              <span class="faq-icon" aria-hidden="true">+</span>
            </button>
            <div class="meta-faq-answer">
              <p>Yes, complimentary, secure on-site private parking is available for cars, vans, and scooters.</p>
            </div>
          </div>

          <!-- Q9 -->
          <div class="meta-faq-item">
            <button type="button" class="meta-faq-question" aria-expanded="false">
              <span>Can I contact the property through WhatsApp?</span>
              <span class="faq-icon" aria-hidden="true">+</span>
            </button>
            <div class="meta-faq-answer">
              <p>Absolutely. Our direct WhatsApp concierge is available 24/7 at +94 77 068 2366 to assist with directions, airport transfers, floating breakfast orders, and local recommendations.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
`.trim();

// FAQPage Schema.org JSON-LD
export const faqSchemaJson = `  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What time is check-in and check-out?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Check-in is from 1:00 PM (13:00) and check-out is by 10:00 AM. Early check-in or late check-out can be requested via WhatsApp subject to villa availability."
        }
      },
      {
        "@type": "Question",
        "name": "What is the cancellation policy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Direct bookings enjoy flexible cancellation up to 7 days before arrival. For special holiday dates or partner channel bookings (Booking.com/Airbnb/Agoda), channel terms apply. Contact our concierge via WhatsApp for assistance."
        }
      },
      {
        "@type": "Question",
        "name": "Is breakfast included?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer signature floating breakfasts served directly in your private plunge pool, as well as traditional Sri Lankan and continental morning spreads, available with our curated stay packages or as an à la carte upgrade."
        }
      },
      {
        "@type": "Question",
        "name": "How far is Galle Fort from Tranquil Terrace?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tranquil Terrace is situated in a tranquil cinnamon grove setting in Galle, approximately 4.5 km (a picturesque 12-minute tuk-tuk or car ride) from the historic UNESCO World Heritage Galle Fort and pristine southern beaches."
        }
      },
      {
        "@type": "Question",
        "name": "Do both villas have private plunge pools?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, both Villa Araliya and Villa Olu each have their own completely private plunge pool exclusively for your use."
        }
      },
      {
        "@type": "Question",
        "name": "How many guests can stay in each villa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Each villa is designed for intimate luxury accommodating up to 2 adult guests in 1 king bedroom. For groups of up to 4 adults, you can book both Villa Araliya and Villa Olu together for an exclusive private property buyout."
        }
      },
      {
        "@type": "Question",
        "name": "How can I make a reservation?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can book directly through our WhatsApp concierge (+94 77 068 2366) for guaranteed best rates, use the online booking form on our website, or book via our official partner channels on Booking.com, Airbnb, and Agoda."
        }
      },
      {
        "@type": "Question",
        "name": "Is parking available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, complimentary, secure on-site private parking is available for cars, vans, and scooters."
        }
      },
      {
        "@type": "Question",
        "name": "Can I contact the property through WhatsApp?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. Our direct WhatsApp concierge is available 24/7 at +94 77 068 2366 to assist with directions, airport transfers, floating breakfast orders, and local recommendations."
        }
      }
    ]
  }
  </script>`;

// Master CSS Additions
export const masterLuxuryCss = `
/* ==========================================================================
   TRANQUIL TERRACE GALLE — MASTER LUXURY UPGRADES (2026/27)
   1. Amenities Section (2-col mobile, 4-col desktop, #17392F, #FAF7F2, #C8A45D)
   2. Instagram Social Proof (Moments at Tranquil Terrace)
   3. Professional FAQ Accordion UI (Single-open)
   4. Mobile 2x2 Grids for Footer Channels & Socials, Packages Visual Scaling Fix
   ========================================================================== */

/* 1. AMENITIES SECTION LUXURY THEMING */
.meta-amenities-section {
  background-color: #FAF7F2 !important;
  background: #FAF7F2 !important;
  padding: 6.5rem 1.5rem 6rem !important;
  border-top: 1px solid rgba(200, 164, 93, 0.22) !important;
  border-bottom: 1px solid rgba(200, 164, 93, 0.22) !important;
}

.meta-amenities-grid {
  max-width: 1360px !important;
  margin: 0 auto !important;
  display: grid !important;
  grid-template-columns: repeat(4, 1fr) !important;
  gap: 20px !important;
  overflow: visible !important;
}

.meta-amenity-card {
  background: #FFFFFF !important;
  border-radius: 16px !important;
  padding: 2rem 1.6rem !important;
  border: 1px solid rgba(200, 164, 93, 0.25) !important;
  box-shadow: 0 4px 20px rgba(23, 57, 47, 0.04) !important;
  transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.35s ease, box-shadow 0.35s ease !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
  position: relative !important;
}

.meta-amenity-card:hover {
  transform: translateY(-5px) !important;
  border-color: #C8A45D !important;
  box-shadow: 0 14px 32px rgba(23, 57, 47, 0.09) !important;
}

.meta-amenity-icon-wrap {
  width: 48px !important;
  height: 48px !important;
  border-radius: 12px !important;
  background: #17392F !important;
  color: #C8A45D !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-bottom: 1.25rem !important;
  border: 1px solid rgba(200, 164, 93, 0.35) !important;
  box-shadow: 0 4px 12px rgba(23, 57, 47, 0.2) !important;
  transition: transform 0.3s ease, background-color 0.3s ease !important;
}

.meta-amenity-card:hover .meta-amenity-icon-wrap {
  transform: scale(1.06) !important;
  background: #102922 !important;
}

.meta-amenity-card h4 {
  font-family: 'Cormorant Garamond', Georgia, serif !important;
  font-size: 1.35rem !important;
  font-weight: 600 !important;
  color: #17392F !important;
  margin: 0 0 0.5rem 0 !important;
  letter-spacing: -0.01em !important;
  line-height: 1.25 !important;
}

.meta-amenity-card p {
  font-family: 'Manrope', -apple-system, sans-serif !important;
  font-size: 0.86rem !important;
  line-height: 1.6 !important;
  color: #556157 !important;
  margin: 0 !important;
}

/* 2. INSTAGRAM SOCIAL PROOF SECTION */
.meta-instagram-section {
  background-color: #FAF7F2 !important;
  background: #FAF7F2 !important;
  padding: 6rem 1.5rem 6.5rem !important;
  border-top: 1px solid rgba(200, 164, 93, 0.22) !important;
  position: relative !important;
}

.meta-instagram-container {
  max-width: 1360px !important;
  margin: 0 auto !important;
}

.meta-instagram-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: flex-end !important;
  margin-bottom: 2.75rem !important;
  gap: 2rem !important;
}

.meta-instagram-header-left h2 {
  font-family: 'Cormorant Garamond', Georgia, serif !important;
  font-size: clamp(2.2rem, 3.8vw, 3.2rem) !important;
  font-weight: 500 !important;
  color: #17392F !important;
  line-height: 1.15 !important;
  margin: 0.35rem 0 0.6rem !important;
}

.ig-handle-link {
  color: #C8A45D !important;
  font-weight: 600 !important;
  text-decoration: none !important;
  transition: color 0.2s ease !important;
}

.ig-handle-link:hover {
  color: #17392F !important;
  text-decoration: underline !important;
}

.meta-btn-gold-instagram {
  display: inline-flex !important;
  align-items: center !important;
  gap: 9px !important;
  background: linear-gradient(135deg, #C8A45D 0%, #B89248 100%) !important;
  color: #17392F !important;
  font-family: 'Manrope', -apple-system, sans-serif !important;
  font-size: 0.88rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.04em !important;
  padding: 13px 26px !important;
  border-radius: 40px !important;
  text-decoration: none !important;
  box-shadow: 0 6px 18px rgba(200, 164, 93, 0.32) !important;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
}

.meta-btn-gold-instagram:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 24px rgba(200, 164, 93, 0.45) !important;
  background: linear-gradient(135deg, #D4B26C 0%, #C49E52 100%) !important;
  color: #0F251F !important;
}

.ig-btn-icon {
  width: 18px !important;
  height: 18px !important;
  flex-shrink: 0 !important;
}

.meta-instagram-grid {
  display: grid !important;
  grid-template-columns: repeat(6, 1fr) !important;
  gap: 16px !important;
}

.meta-insta-card {
  display: block !important;
  border-radius: 14px !important;
  overflow: hidden !important;
  position: relative !important;
  aspect-ratio: 1 / 1 !important;
  box-shadow: 0 6px 18px rgba(23, 57, 47, 0.08) !important;
  border: 1px solid rgba(200, 164, 93, 0.25) !important;
  background: #17392F !important;
}

.insta-img-wrapper {
  position: relative !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
}

.insta-img-wrapper img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
  transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
}

.meta-insta-card:hover .insta-img-wrapper img {
  transform: scale(1.08) !important;
}

.insta-overlay {
  position: absolute !important;
  inset: 0 !important;
  background: linear-gradient(135deg, rgba(23, 57, 47, 0.72) 0%, rgba(200, 164, 93, 0.65) 100%) !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  opacity: 0 !important;
  transition: opacity 0.3s ease !important;
  padding: 12px !important;
  text-align: center !important;
}

.meta-insta-card:hover .insta-overlay {
  opacity: 1 !important;
}

.insta-overlay-badge {
  width: 44px !important;
  height: 44px !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.22) !important;
  backdrop-filter: blur(4px) !important;
  -webkit-backdrop-filter: blur(4px) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
}

.insta-overlay-handle {
  color: #FFFFFF !important;
  font-family: 'Manrope', -apple-system, sans-serif !important;
  font-size: 0.72rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.03em !important;
}

.meta-instagram-mobile-action {
  display: none !important;
}

/* 3. PROFESSIONAL FAQ ACCORDION UI */
.meta-faq-section {
  background-color: #FAF7F2 !important;
  background: #FAF7F2 !important;
  padding: 6.5rem 1.5rem 6.5rem !important;
  border-top: 1px solid rgba(200, 164, 93, 0.22) !important;
}

.meta-faq-container {
  max-width: 920px !important;
  margin: 0 auto !important;
}

.meta-faq-container h2 {
  font-family: 'Cormorant Garamond', Georgia, serif !important;
  font-size: clamp(2.2rem, 3.8vw, 3.2rem) !important;
  font-weight: 500 !important;
  color: #17392F !important;
  line-height: 1.15 !important;
}

.meta-faq-accordion {
  margin-top: 3rem !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 1rem !important;
}

.meta-faq-item {
  background: #FFFFFF !important;
  border-radius: 14px !important;
  border: 1px solid rgba(200, 164, 93, 0.25) !important;
  box-shadow: 0 4px 16px rgba(23, 57, 47, 0.03) !important;
  overflow: hidden !important;
  transition: border-color 0.3s ease, box-shadow 0.3s ease !important;
}

.meta-faq-item:hover {
  border-color: rgba(200, 164, 93, 0.5) !important;
  box-shadow: 0 6px 20px rgba(23, 57, 47, 0.06) !important;
}

.meta-faq-item.open {
  border-color: #C8A45D !important;
  box-shadow: 0 8px 26px rgba(200, 164, 93, 0.12) !important;
}

.meta-faq-question {
  width: 100% !important;
  text-align: left !important;
  background: transparent !important;
  border: none !important;
  padding: 1.4rem 1.75rem !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  cursor: pointer !important;
  gap: 1.25rem !important;
}

.meta-faq-question span:first-child {
  font-family: 'Cormorant Garamond', Georgia, serif !important;
  font-size: 1.25rem !important;
  font-weight: 600 !important;
  color: #17392F !important;
  line-height: 1.35 !important;
  letter-spacing: -0.01em !important;
}

.meta-faq-question span.faq-icon {
  width: 30px !important;
  height: 30px !important;
  border-radius: 50% !important;
  background: #FAF7F2 !important;
  border: 1px solid rgba(200, 164, 93, 0.35) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 1.15rem !important;
  font-weight: 400 !important;
  color: #C8A45D !important;
  flex-shrink: 0 !important;
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.3s ease, color 0.3s ease !important;
}

.meta-faq-item.open .meta-faq-question span.faq-icon {
  transform: rotate(45deg) !important;
  background: #17392F !important;
  color: #FAF7F2 !important;
  border-color: #17392F !important;
}

.meta-faq-answer {
  max-height: 0 !important;
  overflow: hidden !important;
  transition: max-height 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), padding 0.35s ease !important;
  padding: 0 1.75rem !important;
}

.meta-faq-item.open .meta-faq-answer {
  max-height: 500px !important;
  padding: 0 1.75rem 1.5rem !important;
}

.meta-faq-answer p {
  font-family: 'Manrope', -apple-system, sans-serif !important;
  font-size: 0.92rem !important;
  line-height: 1.7 !important;
  color: #4A564C !important;
  margin: 0 !important;
}

/* 4. MOBILE LAYOUT & SIZING FIXES (@media (max-width: 768px)) */
@media (max-width: 768px) {
  /* Amenities: Strict 2-column Grid */
  .meta-amenities-section {
    padding: 4.5rem 1.25rem 4rem !important;
  }

  .meta-amenities-grid {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 12px !important;
    overflow: visible !important;
    padding: 0 !important;
    margin: 0 auto !important;
    width: 100% !important;
  }

  .meta-amenity-card {
    flex: none !important;
    max-width: 100% !important;
    min-width: 0 !important;
    width: 100% !important;
    padding: 1.25rem 1rem !important;
    border-radius: 14px !important;
  }

  .meta-amenity-icon-wrap {
    width: 40px !important;
    height: 40px !important;
    border-radius: 10px !important;
    margin-bottom: 0.85rem !important;
  }

  .meta-amenity-icon-wrap svg {
    width: 20px !important;
    height: 20px !important;
  }

  .meta-amenity-card h4 {
    font-size: 1.05rem !important;
    margin-bottom: 0.35rem !important;
  }

  .meta-amenity-card p {
    font-size: 0.78rem !important;
    line-height: 1.5 !important;
  }

  /* Packages visual scaling fix on mobile */
  .meta-package-visual {
    max-height: 220px !important;
    aspect-ratio: 16 / 9 !important;
    border-radius: 14px !important;
    overflow: hidden !important;
    width: 100% !important;
  }

  .meta-package-visual img {
    height: 100% !important;
    width: 100% !important;
    object-fit: cover !important;
  }

  /* Instagram Horizontal Swipe Carousel on Mobile */
  .meta-instagram-section {
    padding: 4rem 1.25rem 4.5rem !important;
  }

  .meta-instagram-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 1rem !important;
    margin-bottom: 1.5rem !important;
  }

  .meta-instagram-header-right {
    display: none !important;
  }

  .meta-instagram-grid {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scroll-snap-type: x mandatory !important;
    -webkit-overflow-scrolling: touch !important;
    gap: 12px !important;
    padding: 4px 16px 16px 16px !important;
    margin-left: -16px !important;
    margin-right: -16px !important;
    width: calc(100% + 32px) !important;
    scrollbar-width: none !important;
  }

  .meta-instagram-grid::-webkit-scrollbar {
    display: none !important;
  }

  .meta-insta-card {
    flex: 0 0 68vw !important;
    max-width: 260px !important;
    min-width: 220px !important;
    scroll-snap-align: start !important;
    box-sizing: border-box !important;
  }

  .meta-instagram-mobile-action {
    display: block !important;
    margin-top: 1.5rem !important;
  }

  .meta-btn-gold-instagram.full-width {
    width: 100% !important;
    justify-content: center !important;
    box-sizing: border-box !important;
  }

  /* Footer 2x2 Clean Grids on Mobile */
  .footer-channel-cards {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 8px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .footer-channel-card {
    min-height: 46px !important;
    height: 46px !important;
    padding: 6px 10px !important;
    border-radius: 8px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    box-sizing: border-box !important;
    min-width: 0 !important;
    width: 100% !important;
  }

  .channel-card-brand {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    min-width: 0 !important;
    flex: 1 1 auto !important;
  }

  .channel-brand-svg {
    width: 22px !important;
    height: 22px !important;
    flex-shrink: 0 !important;
  }

  .channel-card-left {
    min-width: 0 !important;
    overflow: hidden !important;
  }

  .channel-card-name {
    font-size: 11px !important;
    font-weight: 600 !important;
    line-height: 1.2 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    display: block !important;
    color: #ffffff !important;
  }

  .channel-card-sub {
    display: none !important;
  }

  .channel-card-arrow {
    font-size: 11px !important;
    margin-left: 4px !important;
    flex-shrink: 0 !important;
  }

  .social-links-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 8px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .social-link {
    min-height: 46px !important;
    height: 46px !important;
    padding: 6px 10px !important;
    border-radius: 8px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    box-sizing: border-box !important;
    width: 100% !important;
  }

  .social-brand-svg {
    width: 22px !important;
    height: 22px !important;
    flex-shrink: 0 !important;
  }

  /* FAQ on mobile */
  .meta-faq-section {
    padding: 4.5rem 1.25rem 4.5rem !important;
  }

  .meta-faq-question {
    padding: 1.15rem 1.25rem !important;
  }

  .meta-faq-question span:first-child {
    font-size: 1.1rem !important;
  }

  .meta-faq-answer {
    padding: 0 1.25rem !important;
  }

  .meta-faq-item.open .meta-faq-answer {
    padding: 0 1.25rem 1.25rem !important;
  }

  .meta-faq-answer p {
    font-size: 0.85rem !important;
  }
}

/* Tablet view (769px to 1024px) for Instagram Grid */
@media (min-width: 769px) and (max-width: 1024px) {
  .meta-instagram-grid {
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 14px !important;
  }
  .meta-amenities-grid {
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 14px !important;
  }
}
`;

// Helper to append CSS marker
function appendMasterCss(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, "utf-8");
  if (content.includes("TRANQUIL TERRACE GALLE — MASTER LUXURY UPGRADES")) {
    // replace existing marker
    content = content.replace(
      /\/\* ==========================================================================\s*TRANQUIL TERRACE GALLE — MASTER LUXURY UPGRADES[\s\S]*$/,
      masterLuxuryCss.trim()
    );
  } else {
    content += "\n\n" + masterLuxuryCss.trim() + "\n";
  }
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`Updated CSS in ${filePath}`);
}

appendMasterCss(path.join(root, "public", "meta-redesign.css"));
appendMasterCss(path.join(root, "public", "cinematic-3d.css"));
appendMasterCss(path.join(root, "public", "mobile-carousels.css"));

// --- 2. Update public/index.html ---
const indexPath = path.join(root, "public", "index.html");
let indexHtml = fs.readFileSync(indexPath, "utf-8");

// A. Replace Amenities Section in index.html
if (indexHtml.includes('<section class="meta-amenities-section" id="amenities">')) {
  indexHtml = indexHtml.replace(
    /<section class="meta-amenities-section" id="amenities">[\s\S]*?<\/section>/,
    amenitiesSectionHtml
  );
  console.log("Replaced Amenities section in index.html");
}

// B. Replace FAQ Section in index.html
if (indexHtml.includes('<section class="meta-faq-section" id="faq">')) {
  indexHtml = indexHtml.replace(
    /<section class="meta-faq-section" id="faq">[\s\S]*?<\/section>/,
    faqSectionHtml
  );
  console.log("Replaced FAQ section in index.html");
}

// C. Insert or update Instagram Section in index.html (immediately above footer)
if (indexHtml.includes('<section class="meta-instagram-section" id="moments">')) {
  indexHtml = indexHtml.replace(
    /<section class="meta-instagram-section" id="moments">[\s\S]*?<\/section>/,
    instagramSectionHtml
  );
  console.log("Updated Instagram section in index.html");
} else {
  // Insert right before </main> or right before footer
  if (indexHtml.includes("</main>")) {
    indexHtml = indexHtml.replace(
      "</main>",
      `  ${instagramSectionHtml}\n  </main>`
    );
    console.log("Inserted Instagram section before </main> in index.html");
  } else {
    indexHtml = indexHtml.replace(
      /<footer/i,
      `${instagramSectionHtml}\n\n<footer`
    );
    console.log("Inserted Instagram section before footer in index.html");
  }
}

// D. Add FAQPage Schema.org JSON-LD to index.html if not present
if (!indexHtml.includes('"@type": "FAQPage"')) {
  indexHtml = indexHtml.replace(
    /<\/head>/i,
    `${faqSchemaJson}\n</head>`
  );
  console.log("Added FAQPage JSON-LD to index.html");
}

fs.writeFileSync(indexPath, indexHtml, "utf-8");

// --- 3. Update public/villas.html ---
const villasPath = path.join(root, "public", "villas.html");
let villasHtml = fs.readFileSync(villasPath, "utf-8");

// Replace or insert Amenities Section in villas.html
if (villasHtml.includes('<section class="meta-amenities-section" id="amenities">')) {
  villasHtml = villasHtml.replace(
    /<section class="meta-amenities-section" id="amenities">[\s\S]*?<\/section>/,
    amenitiesSectionHtml
  );
  console.log("Updated Amenities section in villas.html");
} else {
  // Insert right after <section class="stay-details section">...</section>
  if (villasHtml.includes('</section><section aria-labelledby="calendar-heading"')) {
    villasHtml = villasHtml.replace(
      '</section><section aria-labelledby="calendar-heading"',
      `</section>\n\n  ${amenitiesSectionHtml}\n\n  <section aria-labelledby="calendar-heading"`
    );
    console.log("Inserted Amenities section into villas.html");
  } else if (villasHtml.includes('id="stay-calendar"')) {
    villasHtml = villasHtml.replace(
      /<section[^>]*id="stay-calendar"/,
      `${amenitiesSectionHtml}\n\n$&`
    );
    console.log("Inserted Amenities section before calendar in villas.html");
  }
}

fs.writeFileSync(villasPath, villasHtml, "utf-8");

console.log("Successfully applied luxury upgrades to HTML and CSS files!");
