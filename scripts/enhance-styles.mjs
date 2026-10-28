import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const footerAndInnerStyles = `
/* ========================================================
   OFFICIAL BRAND SVGS, FOOTER ANIMATIONS & INNER PAGES LUXURY
   Unified 5-Star Luxury Styling for Tranquil Terrace Galle
   ======================================================== */

/* Booking Channels Cards */
.footer-channel-cards {
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
  width: 100% !important;
}
.footer-channel-card {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 10px 14px !important;
  background: rgba(255,255,255,.04) !important;
  border: 1px solid rgba(183,146,88,.24) !important;
  border-radius: 10px !important;
  color: #f6f2e8 !important;
  text-decoration: none !important;
  transition: all .25s ease !important;
  min-height: 52px !important;
  box-sizing: border-box !important;
}
.footer-channel-card:hover {
  background: rgba(183,146,88,.14) !important;
  border-color: #b79258 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 24px rgba(0,0,0,.28) !important;
}
.channel-card-brand {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
}
.channel-brand-svg {
  width: 28px !important;
  height: 28px !important;
  flex-shrink: 0 !important;
  border-radius: 7px !important;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3) !important;
  transition: transform 0.25s ease !important;
}
.footer-channel-card:hover .channel-brand-svg {
  transform: scale(1.08) !important;
}
.calendar-icon-badge {
  width: 28px !important;
  height: 28px !important;
  border-radius: 7px !important;
  background: rgba(16, 185, 129, 0.2) !important;
  color: #10b981 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  border: 1px solid rgba(16, 185, 129, 0.45) !important;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2) !important;
  transition: transform 0.25s ease !important;
}
.footer-channel-card:hover .calendar-icon-badge {
  transform: scale(1.08) !important;
  background: rgba(16, 185, 129, 0.3) !important;
}
.channel-card-left {
  display: flex !important;
  flex-direction: column !important;
  gap: 2px !important;
}
.channel-card-name {
  font-size: 13px !important;
  font-weight: 600 !important;
  color: #ffffff !important;
  letter-spacing: .01em !important;
}
.channel-card-sub {
  font-size: 10px !important;
  color: #a8b59e !important;
  line-height: 1.3 !important;
  display: block !important;
}
.channel-card-arrow {
  font-size: 14px !important;
  color: #b79258 !important;
  transition: transform .2s ease !important;
  flex-shrink: 0 !important;
  margin-left: 10px !important;
}
.footer-channel-card:hover .channel-card-arrow {
  transform: translate(2px, -2px) !important;
  color: #ffffff !important;
}
.footer-calendar-card {
  border-color: rgba(16,185,129,.35) !important;
  background: rgba(16,185,129,.06) !important;
}
.footer-calendar-card:hover {
  background: rgba(16,185,129,.14) !important;
  border-color: #10b981 !important;
}

/* Social Media Section */
.footer-social-section {
  padding: 26px 0 22px !important;
  border-top: 1px solid rgba(183,146,88,.18) !important;
  border-bottom: 1px solid rgba(183,146,88,.18) !important;
  margin: 15px 0 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 20px !important;
  flex-wrap: wrap !important;
}
.social-header {
  font-size: 9px !important;
  letter-spacing: .24em !important;
  color: #b79258 !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
}
.social-links-grid {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 12px !important;
  align-items: center !important;
}
.social-link {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  padding: 8px 18px !important;
  border: 1px solid rgba(255,255,255,.16) !important;
  border-radius: 40px !important;
  background: rgba(255,255,255,.04) !important;
  color: #f0ece2 !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  text-decoration: none !important;
  transition: all .25s ease !important;
  min-height: 42px !important;
}
.social-brand-svg {
  width: 22px !important;
  height: 22px !important;
  flex-shrink: 0 !important;
  border-radius: 6px !important;
  box-shadow: 0 3px 8px rgba(0,0,0,0.25) !important;
  transition: transform 0.25s ease !important;
}
.social-link:hover {
  background: rgba(183,146,88,.2) !important;
  border-color: #b79258 !important;
  color: #ffffff !important;
  transform: translateY(-2px) !important;
}
.social-link:hover .social-brand-svg {
  transform: scale(1.15) !important;
}

/* Landscape Interactive Animation Elements */
.palm-left,
.palm-right {
  transform-box: fill-box !important;
  transform-origin: center bottom !important;
  animation: palm-breeze 9s ease-in-out infinite alternate !important;
}
.palm-right {
  animation-duration: 12s !important;
  animation-delay: -5s !important;
}

.curtain {
  transform-origin: 50% 50% !important;
  animation: curtain-drift 7s ease-in-out infinite alternate !important;
}

.pool-line {
  stroke-dasharray: 12 5 35 8 !important;
  animation: water-ripple 5s linear infinite !important;
}
.wave-delay {
  animation-direction: reverse !important;
  animation-duration: 7s !important;
}

.lamp-glow {
  transform-origin: 435px 205px !important;
  animation: lamp-breathe 6s ease-in-out infinite alternate !important;
}

.bird {
  transform-box: fill-box !important;
  animation: bird-drift 22s linear infinite !important;
}
.bird-two {
  animation-duration: 29s !important;
  animation-delay: -10s !important;
}

.reserve-orbit i {
  position: absolute !important;
  inset: -8px !important;
  border: 1px dashed rgba(183,146,88,.4) !important;
  border-radius: 50% !important;
  animation: slow-spin 45s linear infinite !important;
}

.footer-sync-dot {
  width: 7px !important;
  height: 7px !important;
  border-radius: 50% !important;
  background: #10b981 !important;
  box-shadow: 0 0 0 3px rgba(16,185,129,.25) !important;
  animation: sync-glow 2.2s infinite ease-in-out !important;
  flex-shrink: 0 !important;
}

@keyframes slow-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes palm-breeze {
  0% { transform: rotate(-2.5deg); }
  100% { transform: rotate(3deg); }
}

@keyframes curtain-drift {
  0% { transform: skewX(-2deg); }
  100% { transform: skewX(2.5deg); }
}

@keyframes water-ripple {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -120; }
}

@keyframes lamp-breathe {
  0% { opacity: 0.35; transform: scale(0.96); }
  100% { opacity: 0.95; transform: scale(1.05); }
}

@keyframes bird-drift {
  0% { transform: translateX(-60px); opacity: 0; }
  15%, 85% { opacity: 0.85; }
  100% { transform: translateX(160px); opacity: 0; }
}

@keyframes sync-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
    opacity: 1;
  }
  50% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
    opacity: 0.75;
  }
}

/* ========================================================
   INNER PAGES LUXURY REDESIGN HARMONIZATION
   ======================================================== */
body.page-inner {
  background: #F8F5F0 !important;
  color: #141615 !important;
  font-family: var(--font-ui, "Manrope", sans-serif) !important;
}

/* Inner Page Hero Sections */
.page-inner .inner-hero {
  background: linear-gradient(135deg, #F8F5F0 0%, #EFE9DF 100%) !important;
  color: #141615 !important;
  border-bottom: 1px solid rgba(200, 164, 93, 0.2) !important;
  position: relative !important;
  padding: 60px 8% 70px !important;
  display: grid !important;
  grid-template-columns: 1.1fr 1fr !important;
  gap: 8% !important;
  align-items: center !important;
  min-height: 480px !important;
}

.page-inner .inner-hero h1 {
  font-family: var(--font-editorial, "Cormorant Garamond", Georgia, serif) !important;
  font-size: clamp(48px, 5.2vw, 76px) !important;
  line-height: 1.05 !important;
  color: #141615 !important;
  margin: 18px 0 20px !important;
  letter-spacing: -0.03em !important;
  font-weight: 500 !important;
}

.page-inner .inner-hero h1 em {
  font-style: italic !important;
  font-weight: 400 !important;
  color: #141615 !important;
}

.page-inner .inner-copy .eyebrow {
  font-family: var(--font-ui, "Manrope", sans-serif) !important;
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.22em !important;
  color: #C8A45D !important;
  text-transform: uppercase !important;
  margin: 0 !important;
  display: block !important;
}

.page-inner .inner-copy .body-copy {
  font-family: var(--font-ui, "Manrope", sans-serif) !important;
  font-size: 1rem !important;
  line-height: 1.8 !important;
  color: #4A4E49 !important;
  max-width: 440px !important;
  margin: 0 !important;
}

.page-inner .inner-photo {
  position: relative !important;
  border-radius: 200px 200px 18px 18px !important;
  overflow: hidden !important;
  box-shadow: 0 24px 60px rgba(20, 22, 21, 0.12) !important;
  border: 1px solid rgba(200, 164, 93, 0.3) !important;
  height: 380px !important;
}

.page-inner .inner-photo img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}

.page-inner .inner-back {
  position: absolute !important;
  left: 8% !important;
  bottom: 22px !important;
  font-family: var(--font-ui, "Manrope", sans-serif) !important;
  font-size: 0.68rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.18em !important;
  text-transform: uppercase !important;
  color: #8C7B65 !important;
  text-decoration: none !important;
  transition: color 0.2s ease !important;
}

.page-inner .inner-back:hover {
  color: #C8A45D !important;
}

/* Floating Luxury Availability Strip on Inner Pages */
.page-inner .availability {
  background: #FFFFFF !important;
  color: #141615 !important;
  border: 1px solid rgba(200, 164, 93, 0.25) !important;
  border-radius: 16px !important;
  box-shadow: 0 16px 40px rgba(20, 22, 21, 0.06) !important;
  margin: -35px 8% 50px !important;
  position: relative !important;
  z-index: 20 !important;
  padding: 24px 30px !important;
  display: grid !important;
  grid-template-columns: 1.3fr repeat(3, 1fr) 1.2fr !important;
  gap: 18px !important;
  align-items: center !important;
}

.page-inner .availability-intro span.eyebrow {
  color: #C8A45D !important;
  font-size: 0.68rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.18em !important;
}

.page-inner .availability-intro span:last-child {
  font-family: var(--font-editorial, "Cormorant Garamond", serif) !important;
  font-size: 1.3rem !important;
  font-weight: 600 !important;
  color: #141615 !important;
  display: block !important;
  margin-top: 2px !important;
}

.page-inner .availability label {
  font-family: var(--font-ui, "Manrope", sans-serif) !important;
  font-size: 0.68rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.12em !important;
  color: #6B7267 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 6px !important;
  border-left: 1px solid rgba(20, 22, 21, 0.08) !important;
  padding-left: 16px !important;
}

.page-inner .availability input,
.page-inner .availability select {
  font-family: var(--font-ui, "Manrope", sans-serif) !important;
  font-size: 0.9rem !important;
  font-weight: 600 !important;
  color: #141615 !important;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  padding: 0 !important;
}

.page-inner .availability .button {
  background: #C8A45D !important;
  color: #141615 !important;
  font-family: var(--font-ui, "Manrope", sans-serif) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  border-radius: 9999px !important;
  padding: 14px 24px !important;
  border: none !important;
  box-shadow: 0 4px 15px rgba(200, 164, 93, 0.35) !important;
  cursor: pointer !important;
  transition: all 0.25s ease !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
}

.page-inner .availability .button:hover {
  background: #D7B56E !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 22px rgba(200, 164, 93, 0.45) !important;
}

/* Sections & Typography on Inner Pages */
.page-inner .section {
  padding: 80px 8% !important;
  position: relative !important;
}

.page-inner .section-head {
  border-top: 1px solid rgba(200, 164, 93, 0.25) !important;
  padding-top: 24px !important;
  margin-bottom: 35px !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
}

.page-inner .section-head .eyebrow {
  color: #C8A45D !important;
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.2em !important;
  text-transform: uppercase !important;
  margin: 0 !important;
}

.page-inner .section-head .tiny {
  color: #8C7B65 !important;
  font-size: 0.72rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.15em !important;
}

.page-inner .title-row {
  display: flex !important;
  justify-content: space-between !important;
  align-items: flex-end !important;
  gap: 30px !important;
  margin-bottom: 50px !important;
}

.page-inner .title-row h2,
.page-inner .section h2 {
  font-family: var(--font-editorial, "Cormorant Garamond", Georgia, serif) !important;
  font-size: clamp(38px, 4.2vw, 60px) !important;
  color: #141615 !important;
  line-height: 1.1 !important;
  font-weight: 500 !important;
  margin: 0 !important;
}

.page-inner .title-row h2 em,
.page-inner .section h2 em {
  font-style: italic !important;
  color: #141615 !important;
}

.page-inner .title-row .body-copy {
  font-size: 0.98rem !important;
  line-height: 1.8 !important;
  color: #4A4E49 !important;
  max-width: 420px !important;
  margin: 0 !important;
}

/* Villa Showcase on villas.html */
.page-inner .named-villa {
  background: #FFFFFF !important;
  border: 1px solid rgba(200, 164, 93, 0.22) !important;
  border-radius: 20px !important;
  box-shadow: 0 16px 45px rgba(20, 22, 21, 0.05) !important;
  margin-bottom: 55px !important;
  display: grid !important;
  grid-template-columns: 1.1fr 1fr !important;
  overflow: hidden !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease !important;
}

.page-inner .named-villa:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 24px 60px rgba(20, 22, 21, 0.09) !important;
}

.page-inner .named-villa.reverse {
  grid-template-columns: 1fr 1.1fr !important;
}
.page-inner .named-villa.reverse .villa-photo {
  order: 2 !important;
}
.page-inner .named-villa.reverse .villa-details {
  order: 1 !important;
}

.page-inner .villa-photo {
  height: 520px !important;
  position: relative !important;
  overflow: hidden !important;
  margin: 0 !important;
}

.page-inner .villa-photo img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  transition: transform 1.2s ease !important;
}
.page-inner .named-villa:hover .villa-photo img {
  transform: scale(1.04) !important;
}

.page-inner .villa-details {
  padding: 50px 10% !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  gap: 16px !important;
}

.page-inner .villa-details .eyebrow {
  color: #C8A45D !important;
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.2em !important;
  text-transform: uppercase !important;
}

.page-inner .villa-details h3 {
  font-family: var(--font-editorial, "Cormorant Garamond", serif) !important;
  font-size: clamp(42px, 4vw, 56px) !important;
  color: #141615 !important;
  line-height: 1.05 !important;
  margin: 0 !important;
  font-weight: 500 !important;
}

.page-inner .villa-details h3 em {
  font-style: italic !important;
}

.page-inner .villa-details p {
  color: #4A4E49 !important;
  font-size: 0.95rem !important;
  line-height: 1.8 !important;
  margin: 0 !important;
}

.page-inner .villa-facts {
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 12px 20px !important;
  list-style: none !important;
  padding: 16px 0 !important;
  margin: 8px 0 !important;
  border-top: 1px solid rgba(20, 22, 21, 0.08) !important;
  border-bottom: 1px solid rgba(20, 22, 21, 0.08) !important;
}

.page-inner .villa-facts li {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  font-size: 0.88rem !important;
  font-weight: 600 !important;
  color: #252824 !important;
}

.page-inner .villa-facts li span {
  font-family: var(--font-editorial, "Cormorant Garamond", serif) !important;
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  color: #C8A45D !important;
}

.page-inner .villa-details .button {
  align-self: flex-start !important;
  background: #141615 !important;
  color: #FFFFFF !important;
  border: 1px solid #141615 !important;
  border-radius: 9999px !important;
  padding: 14px 26px !important;
  font-family: var(--font-ui) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  cursor: pointer !important;
  transition: all 0.25s ease !important;
  margin-top: 8px !important;
}

.page-inner .villa-details .button:hover {
  background: #C8A45D !important;
  border-color: #C8A45D !important;
  color: #141615 !important;
  transform: translateY(-2px) !important;
}

/* Comparison Table on villas.html */
.page-inner .stay-details {
  background: #F1ECE5 !important;
}

.page-inner .comparison {
  background: #FFFFFF !important;
  border: 1px solid rgba(200, 164, 93, 0.25) !important;
  border-radius: 18px !important;
  padding: 36px 40px !important;
  box-shadow: 0 16px 40px rgba(20, 22, 21, 0.05) !important;
}

.page-inner .comparison table {
  width: 100% !important;
  border-collapse: collapse !important;
  font-family: var(--font-ui) !important;
  font-size: 0.95rem !important;
}

.page-inner .comparison thead th {
  font-size: 0.72rem !important;
  letter-spacing: 0.15em !important;
  text-transform: uppercase !important;
  color: #C8A45D !important;
  padding-bottom: 16px !important;
  border-bottom: 2px solid rgba(200, 164, 93, 0.3) !important;
  font-weight: 700 !important;
}

.page-inner .comparison tbody td,
.page-inner .comparison tbody th {
  padding: 18px 12px 18px 0 !important;
  border-bottom: 1px solid rgba(20, 22, 21, 0.06) !important;
  color: #333832 !important;
}

.page-inner .comparison tbody th {
  font-weight: 700 !important;
  color: #141615 !important;
}

/* Calendar Section on contact.html & villas.html */
.page-inner .stay-calendar {
  background: #F8F5F0 !important;
  border-top: 1px solid rgba(200, 164, 93, 0.2) !important;
}

.page-inner .calendar-right {
  background: #FFFFFF !important;
  border: 1px solid rgba(200, 164, 93, 0.25) !important;
  border-radius: 18px !important;
  box-shadow: 0 16px 45px rgba(20, 22, 21, 0.06) !important;
}

.page-inner .cal-day.chosen {
  background: #C8A45D !important;
  color: #141615 !important;
  font-weight: 700 !important;
}

/* Experience Cards on experiences.html */
.page-inner .experience {
  background: #F8F5F0 !important;
}

.page-inner .experience-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 32px !important;
}

.page-inner .experience-card {
  background: #FFFFFF !important;
  border: 1px solid rgba(200, 164, 93, 0.22) !important;
  border-radius: 18px !important;
  padding: 20px !important;
  box-shadow: 0 14px 38px rgba(20, 22, 21, 0.05) !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease !important;
}

.page-inner .experience-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 22px 50px rgba(20, 22, 21, 0.09) !important;
}

.page-inner .experience-card .frame {
  height: 380px !important;
  border-radius: 14px !important;
  overflow: hidden !important;
}

.page-inner .experience-card h3 {
  font-family: var(--font-editorial, "Cormorant Garamond", serif) !important;
  font-size: 1.8rem !important;
  color: #141615 !important;
  margin: 18px 0 10px !important;
  font-weight: 600 !important;
}

.page-inner .experience-card p {
  font-size: 0.92rem !important;
  line-height: 1.7 !important;
  color: #4A4E49 !important;
}

/* Gallery on gallery.html */
.page-inner .gallery {
  background: #F8F5F0 !important;
}

.page-inner .filters {
  display: flex !important;
  gap: 10px !important;
  flex-wrap: wrap !important;
}

.page-inner .filters button {
  font-family: var(--font-ui) !important;
  font-size: 0.78rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.08em !important;
  padding: 8px 18px !important;
  border-radius: 9999px !important;
  border: 1px solid rgba(200, 164, 93, 0.3) !important;
  background: transparent !important;
  color: #4A4E49 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

.page-inner .filters button.active,
.page-inner .filters button:hover {
  background: #C8A45D !important;
  border-color: #C8A45D !important;
  color: #141615 !important;
}

.page-inner .gallery-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  grid-auto-rows: 280px !important;
  gap: 22px !important;
}

.page-inner .gallery-item {
  border-radius: 16px !important;
  overflow: hidden !important;
  box-shadow: 0 12px 35px rgba(20, 22, 21, 0.08) !important;
  border: 1px solid rgba(200, 164, 93, 0.2) !important;
  transition: transform 0.3s ease !important;
}

.page-inner .gallery-item:hover {
  transform: translateY(-4px) !important;
}

/* Explore Galle Guide on explore-galle.html */
.page-inner .galle-guide {
  background: #F1ECE5 !important;
}

.page-inner .guide-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 30px !important;
  margin-top: 45px !important;
}

.page-inner .guide-grid article {
  background: #FFFFFF !important;
  border: 1px solid rgba(200, 164, 93, 0.22) !important;
  border-radius: 18px !important;
  padding: 32px 28px !important;
  box-shadow: 0 14px 38px rgba(20, 22, 21, 0.05) !important;
}

.page-inner .guide-grid article > span {
  font-family: var(--font-editorial) !important;
  font-size: 2.2rem !important;
  font-weight: 700 !important;
  color: #C8A45D !important;
  display: block !important;
  margin-bottom: 12px !important;
}

.page-inner .guide-grid article h3 {
  font-family: var(--font-editorial) !important;
  font-size: 1.8rem !important;
  color: #141615 !important;
  margin: 0 0 12px !important;
}

.page-inner .guide-grid article p {
  color: #4A4E49 !important;
  font-size: 0.92rem !important;
  line-height: 1.7 !important;
}

/* Contact Page on contact.html */
.page-inner .contact-layout {
  background: #F8F5F0 !important;
}

.page-inner .contact-card {
  background: #FFFFFF !important;
  border: 1px solid rgba(200, 164, 93, 0.25) !important;
  border-radius: 18px !important;
  padding: 40px !important;
  box-shadow: 0 16px 45px rgba(20, 22, 21, 0.06) !important;
}

.page-inner .contact-number {
  font-family: var(--font-editorial) !important;
  font-size: 2.2rem !important;
  color: #141615 !important;
  font-weight: 600 !important;
  margin: 24px 0 !important;
  display: flex !important;
  align-items: center !important;
  gap: 15px !important;
}

.page-inner .faq {
  background: #F1ECE5 !important;
}

.page-inner .faq-list details {
  background: #FFFFFF !important;
  border: 1px solid rgba(200, 164, 93, 0.2) !important;
  border-radius: 14px !important;
  margin-bottom: 14px !important;
  padding: 20px 26px !important;
  box-shadow: 0 4px 15px rgba(20, 22, 21, 0.03) !important;
  transition: all 0.2s ease !important;
}

.page-inner .faq-list details[open] {
  border-color: #C8A45D !important;
  box-shadow: 0 8px 25px rgba(200, 164, 93, 0.15) !important;
}

.page-inner .faq-list summary {
  font-family: var(--font-editorial, "Cormorant Garamond", serif) !important;
  font-size: 1.3rem !important;
  font-weight: 600 !important;
  color: #141615 !important;
  cursor: pointer !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
}

.page-inner .faq-list summary span {
  font-size: 1.4rem !important;
  color: #C8A45D !important;
  font-weight: 400 !important;
}

.page-inner .faq-list p {
  color: #4A4E49 !important;
  font-size: 0.95rem !important;
  line-height: 1.8 !important;
  margin: 14px 0 0 !important;
}

/* Responsive Overrides for Inner Pages */
@media (max-width: 1080px) {
  .page-inner .availability {
    grid-template-columns: repeat(2, 1fr) !important;
    margin: 20px 5% 40px !important;
  }
  .page-inner .availability-intro {
    grid-column: 1 / -1 !important;
  }
  .page-inner .availability .button {
    grid-column: 1 / -1 !important;
  }
  .page-inner .named-villa,
  .page-inner .named-villa.reverse {
    grid-template-columns: 1fr !important;
  }
  .page-inner .experience-grid {
    grid-template-columns: 1fr !important;
  }
  .page-inner .guide-grid {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 768px) {
  .page-inner .inner-hero {
    grid-template-columns: 1fr !important;
    padding: 40px 6% 50px !important;
    min-height: auto !important;
  }
  .page-inner .inner-photo {
    height: 280px !important;
    order: -1 !important;
    border-radius: 140px 140px 14px 14px !important;
  }
  .page-inner .availability {
    grid-template-columns: 1fr !important;
    padding: 20px !important;
  }
  .page-inner .availability label {
    border-left: none !important;
    border-top: 1px solid rgba(20, 22, 21, 0.08) !important;
    padding: 12px 0 0 !important;
  }
  .page-inner .gallery-grid {
    grid-template-columns: 1fr !important;
    grid-auto-rows: 240px !important;
  }
}
`;

// Append to both cinematic-3d.css and meta-redesign.css if not present
for (const file of ["cinematic-3d.css", "meta-redesign.css"]) {
  const filePath = path.join(root, "public", file);
  if (fs.existsSync(filePath)) {
    let css = fs.readFileSync(filePath, "utf-8");
    if (!css.includes("OFFICIAL BRAND SVGS, FOOTER ANIMATIONS & INNER PAGES LUXURY")) {
      css += "\n" + footerAndInnerStyles;
      fs.writeFileSync(filePath, css, "utf-8");
      console.log(`Enhanced ${file} with luxury inner styles and footer animations.`);
    }
  }
}
