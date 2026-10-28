import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const cssPath = path.join(root, 'public', 'cinematic-3d.css');
let css = fs.readFileSync(cssPath, 'utf-8');

const oldFooterStart = `/* ========================================================
   TRANQUIL TERRACE LUXURY FOOTER (TARU VILLAS STYLE)
   ======================================================== */`;

const oldFooterEnd = `.footer-back-to-top:hover {
  color: #ffffff !important;
}`;

const newFooterCss = `/* ========================================================
   TRANQUIL TERRACE LUXURY FOOTER (META AI & TARU REDESIGN)
   ======================================================== */
.new-footer {
  background: radial-gradient(ellipse at 50% 0%, rgba(200, 164, 93, 0.12) 0%, transparent 55%), #131514 !important;
  color: #faf7f2 !important;
  padding: 85px 6% 40px !important;
  position: relative;
  overflow: hidden;
  border-top: 1px solid rgba(200, 164, 93, 0.22) !important;
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
  gap: 10px !important;
  max-width: 660px !important;
}
.footer-invite .eyebrow {
  font-size: 9.5px !important;
  letter-spacing: .24em !important;
  color: #c8a45d !important;
  font-weight: 700 !important;
  margin: 0 !important;
  text-transform: uppercase !important;
}
.footer-invite h2 {
  font-family: var(--serif) !important;
  font-size: clamp(38px, 5.2vw, 76px) !important;
  font-weight: 300 !important;
  line-height: 1.05 !important;
  color: #faf7f2 !important;
  margin: 0 !important;
  letter-spacing: -0.01em !important;
}
.footer-invite h2 em {
  font-style: italic !important;
  color: #e5cb9b !important;
  font-weight: 400 !important;
}
.footer-invite-sub {
  font-size: 13.5px !important;
  line-height: 1.7 !important;
  color: #b5b2a9 !important;
  margin: 6px 0 0 !important;
  max-width: 560px !important;
}

/* Luxury Orbit Reserve Button with Satellite Ring */
.reserve-orbit {
  background: rgba(255, 255, 255, 0.03) !important;
  color: #faf7f2 !important;
  width: 150px !important;
  height: 150px !important;
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  border: 1px solid rgba(200, 164, 93, 0.38) !important;
  border-radius: 50% !important;
  flex-shrink: 0 !important;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35) !important;
  cursor: pointer !important;
  text-decoration: none !important;
}
.reserve-orbit:hover {
  background: rgba(200, 164, 93, 0.14) !important;
  border-color: #c8a45d !important;
  transform: translateY(-4px) scale(1.03) !important;
  box-shadow: 0 22px 50px rgba(0, 0, 0, 0.5), 0 0 28px rgba(200, 164, 93, 0.22) !important;
}
.reserve-orbit > span {
  font: 20px/1.2 var(--serif) !important;
  color: #faf7f2 !important;
  text-align: center !important;
  letter-spacing: 0.02em !important;
}
.reserve-orbit > b {
  font-size: 22px !important;
  color: #c8a45d !important;
  margin-top: 4px !important;
  font-weight: 400 !important;
  transition: transform 0.25s ease !important;
}
.reserve-orbit:hover > b {
  transform: translate(2px, -2px) !important;
  color: #ffffff !important;
}
.reserve-orbit i {
  position: absolute !important;
  inset: -9px !important;
  border: 1px dashed rgba(200, 164, 93, 0.45) !important;
  border-radius: 50% !important;
  animation: slow-spin 36s linear infinite !important;
}

/* Architectural Villa Landscape & Active Animations */
.landscape-wrap {
  margin: 25px -4% 35px !important;
  position: relative !important;
  color: #b5bea6 !important;
  text-align: center !important;
}
.villa-landscape {
  width: 100% !important;
  height: auto !important;
  min-height: 160px !important;
  filter: drop-shadow(0 20px 25px rgba(0, 0, 0, 0.45)) !important;
  transform: perspective(900px) rotateX(5deg) !important;
  transform-origin: center bottom !important;
}
.landscape-wrap > p {
  text-align: center !important;
  font-size: 8.5px !important;
  letter-spacing: .28em !important;
  color: #a3ab93 !important;
  margin-top: -15px !important;
  font-weight: 600 !important;
}

/* Villa Landscape Keyframes & High-Performance SVG Animations */
.palm-left,
.palm-right {
  transform-box: fill-box !important;
  transform-origin: center bottom !important;
  animation: palm-breeze 9s ease-in-out infinite alternate !important;
  will-change: transform !important;
}
.palm-right {
  animation-duration: 12s !important;
  animation-delay: -5s !important;
}
.curtain {
  transform-origin: 50% 50% !important;
  animation: curtain-drift 7s ease-in-out infinite alternate !important;
  will-change: transform !important;
}
.pool-line {
  stroke-dasharray: 12 5 35 8 !important;
  animation: water-ripple 5.5s linear infinite !important;
  will-change: stroke-dashoffset !important;
}
.wave-delay {
  animation-direction: reverse !important;
  animation-duration: 7.5s !important;
}
.lamp-glow {
  animation: lamp-breathe 6s ease-in-out infinite alternate !important;
  transform-origin: 435px 205px !important;
  will-change: opacity, transform !important;
}
.bird {
  animation: bird-drift 22s cubic-bezier(0.4, 0, 0.2, 1) infinite !important;
  transform-box: fill-box !important;
  will-change: transform, opacity !important;
}
.bird-two {
  animation-duration: 30s !important;
  animation-delay: -11s !important;
}

@keyframes palm-breeze {
  0% { transform: rotate(-2.8deg); }
  50% { transform: rotate(0.6deg); }
  100% { transform: rotate(2.8deg); }
}
@keyframes curtain-drift {
  0% { transform: skewX(-2deg); }
  100% { transform: skewX(2.5deg); }
}
@keyframes water-ripple {
  to { stroke-dashoffset: -120px; }
}
@keyframes lamp-breathe {
  0% { opacity: 0.35; transform: scale(0.96); }
  100% { opacity: 0.95; transform: scale(1.05); }
}
@keyframes bird-drift {
  0% { transform: translate(-60px, 10px); opacity: 0; }
  15%, 85% { opacity: 0.85; }
  100% { transform: translate(160px, -15px); opacity: 0; }
}
@keyframes slow-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 4-column Luxury Grid */
.new-footer .footer-grid,
.new-footer .footer-links {
  display: grid !important;
  grid-template-columns: 1.35fr 0.9fr 1.15fr 1.4fr !important;
  gap: 40px !important;
  padding: 40px 0 30px !important;
  border-top: 1px solid rgba(200, 164, 93, 0.2) !important;
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
  color: #c8a45d !important;
  text-transform: uppercase !important;
  margin: 0 0 4px !important;
  display: block !important;
}

/* Col 1: Brand & Verified Badges */
.footer-col-brand .footer-logo {
  max-width: 180px !important;
  display: block !important;
  margin-bottom: 4px !important;
  background: transparent !important;
  padding: 0 !important;
  border-radius: 0 !important;
  width: auto !important;
  min-height: unset !important;
}
.footer-col-brand .footer-logo img {
  height: auto !important;
  width: 100% !important;
  max-width: 180px !important;
  object-fit: contain !important;
  filter: brightness(0) invert(0.96) !important;
  opacity: 0.94 !important;
  transition: opacity 0.25s ease !important;
}
.footer-col-brand .footer-logo:hover img {
  opacity: 1 !important;
}
.footer-brand-desc {
  font-size: 12.5px !important;
  line-height: 1.7 !important;
  color: #b8b5ab !important;
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
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25) !important;
  animation: sync-glow 2.2s infinite ease-in-out !important;
  flex-shrink: 0 !important;
}

/* Col 2: Navigation Links */
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
  color: #e2ded5 !important;
  text-decoration: none !important;
  transition: all .2s ease !important;
  display: inline-flex !important;
  align-items: center !important;
  min-height: 26px !important;
}
.footer-nav-list a:hover {
  color: #c8a45d !important;
  transform: translateX(4px) !important;
}

/* Col 3: Direct Contact */
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
  color: #faf7f2 !important;
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
  color: #c8a45d !important;
  flex-shrink: 0 !important;
}
.footer-contact-link:hover {
  color: #c8a45d !important;
}
.footer-motto {
  font-family: var(--serif) !important;
  font-size: 18px !important;
  line-height: 1.3 !important;
  color: #b5bea6 !important;
  margin: 6px 0 0 !important;
  font-style: italic !important;
}

/* Col 4: Booking Channels Cards */
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
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(200, 164, 93, 0.22) !important;
  border-radius: 8px !important;
  color: #faf7f2 !important;
  text-decoration: none !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  min-height: 48px !important;
  box-sizing: border-box !important;
}
.footer-channel-card:hover {
  background: rgba(200, 164, 93, 0.12) !important;
  border-color: #c8a45d !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35) !important;
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
  color: #c8a45d !important;
  transition: transform .2s ease !important;
  flex-shrink: 0 !important;
  margin-left: 10px !important;
}
.footer-channel-card:hover .channel-card-arrow {
  transform: translate(2px, -2px) !important;
  color: #ffffff !important;
}
.footer-calendar-card {
  border-color: rgba(16, 185, 129, 0.35) !important;
  background: rgba(16, 185, 129, 0.05) !important;
}
.footer-calendar-card:hover {
  background: rgba(16, 185, 129, 0.14) !important;
  border-color: #10b981 !important;
}

/* Social Media Section */
.footer-social-section {
  padding: 26px 0 22px !important;
  border-top: 1px solid rgba(200, 164, 93, 0.18) !important;
  border-bottom: 1px solid rgba(200, 164, 93, 0.18) !important;
  margin: 15px 0 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 20px !important;
  flex-wrap: wrap !important;
}
.social-header {
  font-size: 9.5px !important;
  letter-spacing: .24em !important;
  color: #c8a45d !important;
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
  border: 1px solid rgba(200, 164, 93, 0.22) !important;
  border-radius: 40px !important;
  background: rgba(255, 255, 255, 0.03) !important;
  color: #faf7f2 !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  text-decoration: none !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  min-height: 42px !important;
}
.social-link svg {
  color: #c8a45d !important;
  transition: transform .2s ease !important;
  flex-shrink: 0 !important;
}
.social-link:hover {
  background: rgba(200, 164, 93, 0.18) !important;
  border-color: #c8a45d !important;
  color: #ffffff !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35) !important;
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
  color: #9f9c94 !important;
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
  color: rgba(200, 164, 93, 0.5) !important;
}
.footer-bottom-tagline {
  letter-spacing: .12em !important;
  font-size: 9px !important;
  color: #c8a45d !important;
  font-weight: 600 !important;
}
.footer-bottom-right {
  display: inline-flex !important;
  align-items: center !important;
  gap: 20px !important;
}
.footer-admin-link,
.new-footer .footer-bottom a {
  color: #9f9c94 !important;
  text-decoration: none !important;
  font-size: 10px !important;
  letter-spacing: .08em !important;
  transition: color .2s ease !important;
  padding: 4px 8px !important;
}
.footer-admin-link:hover,
.new-footer .footer-bottom a:hover {
  color: #c8a45d !important;
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

// Normalize line breaks for replacement
const normalizedCss = css.replace(/\r\n/g, '\n');
const normalizedStart = oldFooterStart.replace(/\r\n/g, '\n');
const normalizedEnd = oldFooterEnd.replace(/\r\n/g, '\n');

const startIndex = normalizedCss.indexOf(normalizedStart);
const endIndex = normalizedCss.indexOf(normalizedEnd);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find start or end tags in cinematic-3d.css');
  process.exit(1);
}

const before = normalizedCss.substring(0, startIndex);
const after = normalizedCss.substring(endIndex + normalizedEnd.length);

const result = before + newFooterCss + after;
fs.writeFileSync(cssPath, result.replace(/\n/g, '\r\n'), 'utf-8');
console.log('Successfully updated public/cinematic-3d.css with luxury footer styling and all animations!');
