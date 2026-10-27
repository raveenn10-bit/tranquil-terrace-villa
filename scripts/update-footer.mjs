import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const desktopFooterCss = `/* ========================================================
   TRANQUIL TERRACE LUXURY FOOTER (TARU VILLAS STYLE)
   ======================================================== */
.new-footer {
  background: radial-gradient(circle at 50% 0, rgba(183,146,88,.16), transparent 45%), #143328 !important;
  color: #f6f2e8 !important;
  padding: 85px 6% 40px !important;
  position: relative;
  overflow: hidden;
  border-top: 1px solid rgba(183,146,88,.22);
}

.footer-invite {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 35px !important;
  padding: 0 0 20px !important;
}
.footer-invite-text {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  max-width: 640px !important;
}
.footer-invite .eyebrow {
  font-size: 9px !important;
  letter-spacing: .25em !important;
  color: #b79258 !important;
  font-weight: 700 !important;
  margin: 0 !important;
}
.footer-invite h2 {
  font-family: var(--serif) !important;
  font-size: clamp(38px, 5.2vw, 76px) !important;
  font-weight: 300 !important;
  line-height: 1.05 !important;
  color: #fcf9f2 !important;
  margin: 0 !important;
}
.footer-invite h2 em {
  font-style: italic !important;
  color: #e5cb9b !important;
}
.footer-invite-sub {
  font-size: 13px !important;
  line-height: 1.7 !important;
  color: #c7d2bf !important;
  margin: 8px 0 0 !important;
}
.reserve-orbit {
  background: rgba(255,255,255,.03) !important;
  color: #f6f2e8 !important;
  width: 150px !important;
  height: 150px !important;
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  border: 1px solid rgba(183,146,88,.4) !important;
  border-radius: 50% !important;
  flex-shrink: 0 !important;
  transition: all .35s ease !important;
  box-shadow: 0 16px 40px rgba(0,0,0,.25) !important;
  cursor: pointer !important;
  text-decoration: none !important;
}
.reserve-orbit:hover {
  background: rgba(183,146,88,.14) !important;
  border-color: #b79258 !important;
  transform: translateY(-3px) scale(1.03) !important;
  box-shadow: 0 22px 48px rgba(0,0,0,.35) !important;
}
.reserve-orbit > span {
  font: 20px/1.2 var(--serif) !important;
  color: #fcf9f2 !important;
  text-align: center !important;
}
.reserve-orbit > b {
  font-size: 22px !important;
  color: #b79258 !important;
  margin-top: 4px !important;
  font-weight: 400 !important;
}
.reserve-orbit i {
  position: absolute !important;
  inset: -8px !important;
  border: 1px dashed rgba(183,146,88,.3) !important;
  border-radius: 50% !important;
  animation: slow-spin 45s linear infinite !important;
}

.landscape-wrap {
  margin: 25px -4% 35px !important;
  position: relative !important;
  color: #b6c0a4 !important;
  text-align: center !important;
}
.villa-landscape {
  width: 100% !important;
  height: auto !important;
  min-height: 160px !important;
  filter: drop-shadow(0 20px 25px rgba(0,0,0,.3)) !important;
  transform: perspective(900px) rotateX(6deg) !important;
  transform-origin: center bottom !important;
}
.landscape-wrap > p {
  text-align: center !important;
  font-size: 8px !important;
  letter-spacing: .28em !important;
  color: #aeb89c !important;
  margin-top: -15px !important;
  font-weight: 600 !important;
}

/* 4-column Luxury Grid */
.new-footer .footer-grid,
.new-footer .footer-links {
  display: grid !important;
  grid-template-columns: 1.35fr 0.9fr 1.15fr 1.4fr !important;
  gap: 40px !important;
  padding: 40px 0 30px !important;
  border-top: 1px solid rgba(183,146,88,.2) !important;
}
.new-footer .footer-col,
.new-footer .footer-links > div {
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;
  align-items: flex-start !important;
  grid-column: auto !important;
  grid-row: auto !important;
}
.footer-col-title {
  font-size: 10px !important;
  font-weight: 700 !important;
  letter-spacing: .22em !important;
  color: #b79258 !important;
  text-transform: uppercase !important;
  margin: 0 0 4px !important;
  display: block !important;
}
.footer-col-brand .footer-logo {
  max-width: 180px !important;
  display: block !important;
  margin-bottom: 4px !important;
}
.footer-col-brand .footer-logo img {
  height: auto !important;
  width: 100% !important;
  object-fit: contain !important;
}
.footer-brand-desc {
  font-size: 12px !important;
  line-height: 1.7 !important;
  color: #c7d2bf !important;
  margin: 0 !important;
}
.footer-badges {
  display: flex !important;
  flex-direction: column !important;
  gap: 9px !important;
  margin-top: 6px !important;
  width: 100% !important;
}
.footer-badge {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  font-size: 11px !important;
  color: #e5cb9b !important;
  text-decoration: none !important;
  transition: color .2s !important;
  line-height: 1.4 !important;
}
.footer-badge:hover {
  color: #ffffff !important;
}
.footer-badge strong {
  color: #ffffff !important;
  font-weight: 600 !important;
}
.footer-badge svg {
  flex-shrink: 0 !important;
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

.footer-nav-list {
  list-style: none !important;
  padding: 0 !important;
  margin: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
  width: 100% !important;
}
.footer-nav-list li {
  margin: 0 !important;
  padding: 0 !important;
}
.footer-nav-list a {
  font-size: 13px !important;
  color: #e8e4d8 !important;
  text-decoration: none !important;
  transition: all .2s ease !important;
  display: inline-flex !important;
  align-items: center !important;
  min-height: 26px !important;
}
.footer-nav-list a:hover {
  color: #b79258 !important;
  transform: translateX(4px) !important;
}
.footer-contact-items {
  display: flex !important;
  flex-direction: column !important;
  gap: 11px !important;
  width: 100% !important;
}
.footer-contact-link {
  display: inline-flex !important;
  align-items: center !important;
  gap: 10px !important;
  color: #f6f2e8 !important;
  font-size: 13px !important;
  transition: all .2s ease !important;
  text-decoration: none !important;
  background: transparent !important;
  border: 0 !important;
  padding: 0 !important;
  cursor: pointer !important;
  text-align: left !important;
  min-height: 30px !important;
}
.footer-contact-link svg {
  color: #b79258 !important;
  flex-shrink: 0 !important;
}
.footer-contact-link:hover {
  color: #b79258 !important;
}
.footer-motto {
  font-family: var(--serif) !important;
  font-size: 18px !important;
  line-height: 1.3 !important;
  color: #b2bba3 !important;
  margin: 6px 0 0 !important;
  font-style: italic !important;
}

/* Booking Channels Cards */
.footer-channel-cards {
  display: flex !important;
  flex-direction: column !important;
  gap: 9px !important;
  width: 100% !important;
}
.footer-channel-card {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 10px 14px !important;
  background: rgba(255,255,255,.04) !important;
  border: 1px solid rgba(183,146,88,.24) !important;
  border-radius: 8px !important;
  color: #f6f2e8 !important;
  text-decoration: none !important;
  transition: all .25s ease !important;
  min-height: 48px !important;
  box-sizing: border-box !important;
}
.footer-channel-card:hover {
  background: rgba(183,146,88,.14) !important;
  border-color: #b79258 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 20px rgba(0,0,0,.25) !important;
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
  gap: 9px !important;
  padding: 9px 18px !important;
  border: 1px solid rgba(255,255,255,.16) !important;
  border-radius: 40px !important;
  background: rgba(255,255,255,.04) !important;
  color: #f0ece2 !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  text-decoration: none !important;
  transition: all .25s ease !important;
  min-height: 42px !important;
}
.social-link svg {
  color: #b79258 !important;
  transition: transform .2s ease !important;
  flex-shrink: 0 !important;
}
.social-link:hover {
  background: rgba(183,146,88,.2) !important;
  border-color: #b79258 !important;
  color: #ffffff !important;
  transform: translateY(-2px) !important;
}
.social-link:hover svg {
  color: #ffffff !important;
  transform: scale(1.15) !important;
}

/* Footer Bottom Bar */
.new-footer .footer-bottom {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 24px 0 10px !important;
  font-size: 11px !important;
  color: #9fa894 !important;
  gap: 20px !important;
  border-top: 0 !important;
  margin-top: 0 !important;
}
.footer-bottom-left {
  display: inline-flex !important;
  align-items: center !important;
  gap: 10px !important;
  flex-wrap: wrap !important;
}
.footer-bottom-divider {
  color: rgba(183,146,88,.5) !important;
}
.footer-bottom-tagline {
  letter-spacing: .12em !important;
  font-size: 9px !important;
  color: #b79258 !important;
  font-weight: 600 !important;
}
.footer-bottom-right {
  display: inline-flex !important;
  align-items: center !important;
  gap: 20px !important;
}
.footer-admin-link,
.new-footer .footer-bottom a {
  color: #9fa894 !important;
  text-decoration: none !important;
  font-size: 10px !important;
  letter-spacing: .08em !important;
  transition: color .2s ease !important;
  padding: 4px 8px !important;
}
.footer-admin-link:hover,
.new-footer .footer-bottom a:hover {
  color: #b79258 !important;
}
.footer-back-to-top {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  font-weight: 600 !important;
  color: #e5cb9b !important;
}
.footer-back-to-top:hover {
  color: #ffffff !important;
}`;

const mobileFooterCss = `  .new-footer {
    padding: 50px 6% 115px !important; /* 115px bottom clearance so .floating-book never overlaps footer links */
  }
  .footer-invite {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 22px !important;
  }
  .reserve-orbit {
    width: 120px !important;
    height: 120px !important;
    align-self: flex-start !important;
  }
  .reserve-orbit > span {
    font-size: 17px !important;
  }
  .reserve-orbit > b {
    font-size: 18px !important;
  }
  .new-footer .footer-grid,
  .new-footer .footer-links {
    grid-template-columns: 1fr !important;
    gap: 34px !important;
    padding: 30px 0 25px !important;
  }
  .new-footer .footer-col,
  .new-footer .footer-links > div {
    width: 100% !important;
    align-items: flex-start !important;
  }
  .new-footer .footer-platforms,
  .new-footer .footer-links > div:last-child {
    grid-column: auto !important;
    grid-template-columns: none !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
  }
  .footer-col-brand .footer-logo {
    max-width: 160px !important;
  }
  .footer-social-section {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 14px !important;
    padding: 22px 0 18px !important;
  }
  .social-header {
    text-align: left !important;
  }
  /* Perfectly balanced 2x2 grid on mobile & portrait screens */
  .social-links-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 10px !important;
    width: 100% !important;
  }
  .social-link {
    width: 100% !important;
    min-height: 46px !important; /* Touch target >= 44px */
    font-size: 11px !important;
    padding: 10px 12px !important;
    box-sizing: border-box !important;
  }
  .new-footer .footer-bottom {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 14px !important;
    padding: 18px 0 0 !important;
  }
  .footer-bottom-left {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 6px !important;
  }
  .footer-bottom-divider {
    display: none !important;
  }
  .footer-bottom-right {
    width: 100% !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    border-top: 1px solid rgba(255,255,255,.08) !important;
    padding-top: 12px !important;
  }`;

// 1. Update cinematic-3d.css
let css = fs.readFileSync(path.join(root, "public", "cinematic-3d.css"), "utf8");

const socialSecStart = css.indexOf("/* Footer Social Section */");
const responsiveSecStart = css.indexOf("/* ========================================================\n   RESPONSIVE MEDIA QUERIES (MOBILE & PORTRAIT OPTIMIZATION)");

if (socialSecStart !== -1 && responsiveSecStart !== -1) {
  css = css.substring(0, socialSecStart) + desktopFooterCss + "\n\n" + css.substring(responsiveSecStart);
  console.log("Replaced desktop footer CSS block");
}

const mobileFooterStart = css.indexOf(".new-footer {\n    padding: 45px 5% 20px;");
const mobileVillaPhoto = css.indexOf(".named-villa .villa-photo {\n    height: 270px;");

if (mobileFooterStart !== -1 && mobileVillaPhoto !== -1) {
  css = css.substring(0, mobileFooterStart) + mobileFooterCss + "\n  " + css.substring(mobileVillaPhoto);
  console.log("Replaced mobile footer CSS block");
}

fs.writeFileSync(path.join(root, "public", "cinematic-3d.css"), css, "utf8");
fs.writeFileSync(path.join(root, "legacy-site", "cinematic-3d.css"), css, "utf8");
console.log("Updated cinematic-3d.css");
