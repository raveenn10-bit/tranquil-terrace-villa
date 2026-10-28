import fs from "fs";

const newFooterCss = `/* ========================================================
   TRANQUIL TERRACE GALLE — 5-STAR ANIMATED LUXURY FOOTER
   Color Palettes: 06 Mint Lagoon, 05 Dreamy Periwinkle, 04 Peach Champagne
   ======================================================== */
:root {
  --tt-green: #082f28;
  --tt-gold: #eac085;
  --tt-cream: #f5eee1;
  --tt-muted: #b8c9bb;
  --tt-peach: #FFD3B6;
  --tt-peach-glow: #FFAAA6;
  --tt-mint: #6DD5C4;
  --tt-mint-light: #DFF6F0;
  --tt-periwinkle: #B8C0FF;
  --tt-periwinkle-light: #E7D8FF;
}

.tt-footer {
  position: relative;
  background: var(--tt-green);
  color: var(--tt-cream);
  isolation: isolate;
  padding: 0 0 1rem;
  overflow: hidden;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.tt-footer a {
  color: inherit;
  text-decoration: none;
}

/* Panoramic Illustrated Tropical Landscape */
.tt-landscape {
  height: 210px;
  position: relative;
  background: linear-gradient(180deg, #E7D8FF 0%, #DFF7FF 32%, #FFD3B6 72%, #EAC085 100%);
  overflow: hidden;
}

.tt-sky-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 78% 74%, rgba(255, 211, 182, 0.65), rgba(109, 213, 196, 0.22) 42%, transparent 72%);
}

.tt-sun {
  width: 68px;
  height: 68px;
  position: absolute;
  right: 19%;
  bottom: 38px;
  background: radial-gradient(circle at 40% 40%, #FFFFFF 0%, #FFD3B6 38%, #EAC085 75%, #D48B47 100%);
  border-radius: 50%;
  box-shadow: 0 0 54px 10px rgba(255, 211, 182, 0.75), 0 0 85px 25px rgba(109, 213, 196, 0.25);
  animation: tt-sunrise 2s ease-out both;
}

.tt-scenery {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.tt-palm {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: tt-palm-sway 5.5s ease-in-out infinite alternate;
}

.tt-palm-b, .tt-palm-d {
  animation-delay: -2.6s;
}

.tt-palm-c, .tt-palm-e {
  animation-delay: -1.3s;
}

.tt-birds {
  position: absolute;
  width: 130px;
  top: 34px;
  right: 26%;
  animation: tt-birds-float 7s ease-in-out infinite alternate;
}

/* Footer Container & Grid */
.tt-inner {
  position: relative;
  z-index: 2;
  max-width: 1380px;
  margin: auto;
  padding: 42px clamp(20px, 5.7vw, 88px) 0;
}

.tt-grid {
  display: grid;
  grid-template-columns: 1.25fr 0.9fr 1.05fr 1fr;
  gap: clamp(23px, 3.6vw, 58px);
}

/* Brand Section */
.tt-brand-title {
  display: flex !important;
  gap: 16px !important;
  align-items: center !important;
  color: #FFFFFF !important;
  text-decoration: none !important;
}

.tt-monogram {
  display: inline-grid;
  place-items: center;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 4.4rem;
  position: relative;
  line-height: 1;
  border: 1.8px solid #D4B47B;
  border-radius: 70px 70px 10px 10px;
  width: 75px;
  height: 82px;
  background: #0A332B;
  color: var(--tt-gold);
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
}

.tt-monogram-svg {
  width: 75px;
  height: 82px;
  display: block;
  flex-shrink: 0;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.45));
}

.tt-monogram span {
  position: absolute;
  left: 40px;
  top: 21px;
  font-size: 2.4rem;
  color: #FFFFFF;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
}

.tt-brand-text {
  display: flex !important;
  flex-direction: column !important;
}

.tt-brand strong,
.tt-brand-text strong {
  font-family: 'Cormorant Garamond', Georgia, serif !important;
  font-size: clamp(2.2rem, 3.2vw, 3.2rem) !important;
  font-weight: 600 !important;
  line-height: 0.92 !important;
  color: #FFFFFF !important;
  letter-spacing: -0.01em !important;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55), 0 0 2px rgba(0, 0, 0, 0.8) !important;
  display: block !important;
}

.tt-brand small,
.tt-brand-text small {
  font-size: 11px !important;
  letter-spacing: 0.44em !important;
  color: #EAC085 !important;
  font-weight: 700 !important;
  display: block !important;
  margin-top: 8px !important;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6) !important;
}

.tt-brand p {
  font-size: 0.9rem;
  line-height: 1.8;
  color: var(--tt-muted);
  max-width: 325px;
  margin: 20px 0 16px;
}

.tt-badges {
  margin-bottom: 20px;
}

.tt-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(109, 213, 196, 0.1);
  border: 1px solid rgba(109, 213, 196, 0.35);
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 0.76rem;
  color: var(--tt-cream);
  transition: background 0.25s, border-color 0.25s;
}

.tt-badge:hover {
  background: rgba(109, 213, 196, 0.2);
  border-color: var(--tt-mint);
}

.tt-badge strong {
  color: var(--tt-peach);
}

/* Radiant Peach Champagne CTA Button */
.tt-button {
  background: linear-gradient(135deg, #FFD3B6 0%, #EAC085 45%, #C89B55 100%);
  border-radius: 100px;
  padding: 13px 24px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  min-width: 200px;
  gap: 18px;
  color: #0A332B !important;
  font-weight: 700;
  font-size: 0.88rem;
  box-shadow: 0 7px 25px rgba(0, 29, 24, 0.3), 0 0 15px rgba(255, 211, 182, 0.22);
  transition: transform 0.25s, box-shadow 0.25s, background 0.25s;
}

.tt-button:hover {
  transform: translateY(-3px);
  background: linear-gradient(135deg, #FFF5EB 0%, #FFD3B6 40%, #EAC085 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 25px rgba(255, 211, 182, 0.4);
}

.tt-button span:last-child {
  font-size: 1.25rem;
}

/* Footer Columns Header */
.tt-column h2 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  color: var(--tt-gold);
  font-size: 1.85rem;
  font-weight: 600;
  margin: 6px 0 20px;
  padding-bottom: 10px;
  position: relative;
}

.tt-column h2:after {
  content: "";
  width: 74px;
  height: 1px;
  background: rgba(163, 143, 111, 0.45);
  position: absolute;
  bottom: 0;
  left: 0;
}

.tt-column > a {
  display: flex !important;
  gap: 11px !important;
  align-items: center !important;
  margin-bottom: 14px !important;
  font-size: 0.88rem !important;
  line-height: 1.45 !important;
  white-space: nowrap !important;
  word-break: keep-all !important;
  overflow-wrap: normal !important;
  transition: color 0.25s, transform 0.25s;
}

.tt-column > a span {
  white-space: nowrap !important;
  display: inline-block !important;
}

.tt-column > a:hover {
  color: var(--tt-peach) !important;
  transform: translateX(4px) !important;
}

.tt-column > a.tt-sub-nav {
  padding-left: 14px !important;
  font-size: 0.82rem !important;
  color: var(--tt-muted) !important;
  white-space: nowrap !important;
}

/* Explore 2-Column Desktop & Subcol Structure */
.tt-nav-grid-2col {
  display: flex;
  flex-direction: column;
}

.tt-nav-subcol > a {
  display: flex !important;
  gap: 11px !important;
  align-items: center !important;
  margin-bottom: 14px !important;
  font-size: 0.88rem !important;
  line-height: 1.45 !important;
  white-space: nowrap !important;
  word-break: keep-all !important;
  overflow-wrap: normal !important;
  transition: color 0.25s, transform 0.25s;
}

.tt-nav-subcol > a span {
  white-space: nowrap !important;
  display: inline-block !important;
}

.tt-nav-subcol > a:hover {
  color: var(--tt-peach) !important;
  transform: translateX(4px) !important;
}

.tt-nav-subcol > a.tt-sub-nav {
  padding-left: 14px !important;
  font-size: 0.82rem !important;
  color: var(--tt-muted) !important;
  white-space: nowrap !important;
}

/* Guest Details Accordion (Desktop Open / Mobile Collapsible) */
.tt-guest-details {
  border: none;
  padding: 0;
  margin: 0;
}

.tt-guest-summary {
  list-style: none;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tt-guest-summary::-webkit-details-marker {
  display: none;
}

.tt-acc-arrow {
  display: none;
  font-size: 1.1rem;
  color: var(--tt-gold);
  transition: transform 0.3s ease;
}

.tt-guest-links > a {
  display: flex !important;
  gap: 11px !important;
  align-items: center !important;
  margin-bottom: 14px !important;
  font-size: 0.88rem !important;
  line-height: 1.45 !important;
  white-space: nowrap !important;
  word-break: keep-all !important;
  overflow-wrap: normal !important;
  transition: color 0.25s, transform 0.25s;
}

.tt-guest-links > a span {
  white-space: nowrap !important;
  display: inline-block !important;
}

.tt-guest-links > a:hover {
  color: var(--tt-peach) !important;
  transform: translateX(4px) !important;
}

.tt-direct-guarantee {
  font-size: 0.74rem;
  color: #8ca79b;
  line-height: 1.6;
  margin-top: 18px;
}

/* PARTNERS / SOCIAL & OTAS */
.tt-partners {
  border-top: 1px solid rgba(109, 213, 196, 0.25);
  border-bottom: 1px solid rgba(109, 213, 196, 0.25);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  padding: 24px 0;
  margin-top: 38px;
}

.tt-partner-group {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.tt-partner-group > span:first-child {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #dfd7c5;
  margin-right: 4px;
}

.tt-social {
  display: inline-grid;
  place-items: center;
  border-radius: 9px;
  width: 38px;
  height: 38px;
  transition: transform 0.25s, filter 0.25s;
}

.tt-social:hover {
  transform: translateY(-3px);
  filter: brightness(1.15);
}

.tt-ota-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  transition: transform 0.25s, background 0.25s, border-color 0.25s;
}

.tt-ota-badge:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--tt-mint);
}

.tt-ota-agoda-txt {
  font-weight: 500;
  letter-spacing: -0.02em;
}

.tt-ota-airbnb-txt {
  color: #ff7195;
}

/* LEGAL ROW */
.tt-legal {
  display: flex;
  justify-content: space-between;
  gap: 25px;
  align-items: center;
  padding: 22px 0 6px;
  color: #b9cabb;
  font-size: 0.76rem;
}

.tt-legal-copy {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tt-legal-sep {
  opacity: 0.45;
}

.tt-crafted {
  color: #b9cabb;
  font-size: 0.74rem;
  letter-spacing: 0.02em;
}

.tt-crafted strong {
  color: var(--tt-gold);
  font-weight: 600;
}

.tt-legal-links {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.tt-legal-links a:hover,
.tt-admin-link:hover,
.tt-back-top:hover {
  color: var(--tt-peach);
}

.tt-leaf {
  position: absolute;
  pointer-events: none;
  color: rgba(74, 128, 107, 0.22);
  font-size: 11rem;
  bottom: 95px;
}

.tt-leaf-left {
  left: -50px;
  transform: rotate(25deg);
}

.tt-leaf-right {
  right: -50px;
  transform: rotate(205deg);
}

/* REVEAL ANIMATIONS (Ensures guaranteed visibility) */
.tt-reveal {
  opacity: 1 !important;
  transform: translateY(0) !important;
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.tt-reveal.tt-visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

.tt-grid .tt-reveal:nth-child(2) { transition-delay: 0.12s; }
.tt-grid .tt-reveal:nth-child(3) { transition-delay: 0.22s; }
.tt-grid .tt-reveal:nth-child(4) { transition-delay: 0.32s; }

@keyframes tt-palm-sway {
  0% { transform: rotate(-2deg); }
  100% { transform: rotate(2.8deg); }
}

@keyframes tt-sunrise {
  from { opacity: 0.25; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes tt-birds-float {
  from { transform: translate(-6px, 3px); }
  to { transform: translate(24px, -6px); }
}

/* ========================================================
   RESPONSIVE & MOBILE POLISH (STRICT COMPACT SPEC 320px–430px)
   ======================================================== */
@media (max-width: 1050px) {
  .tt-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 40px;
  }
  .tt-partners {
    justify-content: flex-start;
  }
  .tt-legal {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .tt-footer {
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 85px) !important;
  }

  /* Compact silhouette height 110px per spec (90-130px) */
  .tt-landscape {
    height: 110px !important;
  }

  .tt-sun {
    width: 38px !important;
    height: 38px !important;
    bottom: 22px !important;
    right: 22% !important;
  }

  .tt-birds {
    width: 55px !important;
    right: 20% !important;
    top: 12px !important;
  }

  .tt-inner {
    padding: 20px 16px 0 !important;
  }

  /* Compact single column with 14-16px element spacing */
  .tt-grid {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }

  /* Centered compact brand */
  .tt-brand {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
    grid-column: 1 / -1 !important;
  }

  .tt-brand-title {
    justify-content: center !important;
    gap: 12px !important;
  }

  .tt-monogram,
  .tt-monogram-svg {
    width: 54px !important;
    height: 60px !important;
  }

  .tt-monogram {
    font-size: 3.2rem !important;
    border-radius: 40px 40px 8px 8px !important;
  }

  .tt-monogram span {
    left: 29px !important;
    top: 15px !important;
    font-size: 1.8rem !important;
    color: #FFFFFF !important;
  }

  .tt-brand strong,
  .tt-brand-text strong {
    font-size: 1.85rem !important;
    line-height: 0.92 !important;
    color: #FFFFFF !important;
    text-align: left !important;
  }

  .tt-brand small,
  .tt-brand-text small {
    font-size: 8.5px !important;
    letter-spacing: 0.32em !important;
    margin-top: 4px !important;
    color: #EAC085 !important;
    text-align: left !important;
  }

  .tt-brand p {
    font-size: 0.8rem !important;
    line-height: 1.5 !important;
    margin: 10px auto 12px !important;
    max-width: 320px !important;
    text-align: center !important;
  }

  .tt-badges {
    margin-bottom: 12px !important;
  }

  .tt-badge {
    padding: 4px 10px !important;
    font-size: 0.72rem !important;
  }

  .tt-button {
    padding: 11px 20px !important;
    font-size: 0.82rem !important;
    min-width: 0 !important;
    width: 100% !important;
    max-width: 280px !important;
    justify-content: center !important;
    gap: 10px !important;
  }

  /* Explore: 2 clean columns side-by-side */
  .tt-column-explore {
    padding-top: 4px !important;
  }

  .tt-column-explore h2 {
    font-size: 1.25rem !important;
    margin: 0 0 10px !important;
    padding-bottom: 6px !important;
  }

  .tt-nav-grid-2col {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 4px 12px !important;
  }

  .tt-nav-subcol > a {
    font-size: 0.78rem !important;
    gap: 6px !important;
    margin-bottom: 8px !important;
    white-space: nowrap !important;
    word-break: keep-all !important;
    overflow-wrap: normal !important;
  }

  /* Guest information: compact collapsible accordion */
  .tt-column-guest {
    border-top: 1px solid rgba(119, 144, 131, 0.2) !important;
    padding-top: 12px !important;
  }

  .tt-guest-details {
    width: 100% !important;
  }

  .tt-guest-summary {
    cursor: pointer !important;
    padding: 4px 0 !important;
    user-select: none !important;
  }

  .tt-guest-summary h2 {
    font-size: 1.25rem !important;
    margin: 0 !important;
    padding-bottom: 0 !important;
  }

  .tt-guest-summary h2:after {
    display: none !important;
  }

  .tt-acc-arrow {
    display: inline-block !important;
  }

  .tt-guest-details[open] .tt-acc-arrow {
    transform: rotate(180deg) !important;
  }

  .tt-guest-links {
    padding-top: 10px !important;
  }

  .tt-guest-links > a {
    font-size: 0.78rem !important;
    gap: 6px !important;
    margin-bottom: 8px !important;
    white-space: nowrap !important;
    word-break: keep-all !important;
    overflow-wrap: normal !important;
  }

  /* Contact column */
  .tt-column-contact {
    border-top: 1px solid rgba(119, 144, 131, 0.2) !important;
    padding-top: 12px !important;
  }

  .tt-column-contact h2 {
    font-size: 1.25rem !important;
    margin: 0 0 10px !important;
    padding-bottom: 6px !important;
  }

  .tt-column-contact > a {
    font-size: 0.78rem !important;
    gap: 6px !important;
    margin-bottom: 8px !important;
    white-space: nowrap !important;
    word-break: keep-all !important;
    overflow-wrap: normal !important;
  }

  .tt-direct-guarantee {
    font-size: 0.72rem !important;
    line-height: 1.5 !important;
    margin-top: 10px !important;
  }

  /* Partners bar: compact horizontal rows */
  .tt-partners {
    margin-top: 16px !important;
    padding: 14px 0 !important;
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
    gap: 12px !important;
  }

  .tt-partner-group {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    width: 100% !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    padding-bottom: 2px !important;
  }

  .tt-partner-group > span:first-child {
    font-size: 0.65rem !important;
    white-space: nowrap !important;
    margin-right: 2px !important;
  }

  .tt-social {
    width: 36px !important;
    height: 36px !important;
    flex-shrink: 0 !important;
  }

  .tt-ota-badge {
    padding: 5px 8px !important;
    font-size: 0.74rem !important;
    gap: 5px !important;
    flex-shrink: 0 !important;
  }

  .tt-ota-badge svg {
    width: 18px !important;
    height: 18px !important;
  }

  /* Legal bar */
  .tt-legal {
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
    gap: 8px !important;
    padding: 14px 0 4px !important;
    font-size: 0.7rem !important;
  }

  .tt-legal-copy {
    flex-direction: column !important;
    align-items: center !important;
    gap: 3px !important;
  }

  .tt-legal-sep {
    display: none !important;
  }

  .tt-legal-links {
    justify-content: center !important;
    gap: 10px !important;
  }

  .tt-leaf {
    display: none !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tt-footer *,
  .tt-footer *:before,
  .tt-footer *:after {
    animation: none !important;
    transition: none !important;
  }
  .tt-reveal {
    opacity: 1 !important;
    transform: none !important;
  }
}
`;

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const startIdx = content.indexOf("/* ========================================================\r\n   TRANQUIL TERRACE GALLE — 5-STAR ANIMATED LUXURY FOOTER") !== -1
    ? content.indexOf("/* ========================================================\r\n   TRANQUIL TERRACE GALLE — 5-STAR ANIMATED LUXURY FOOTER")
    : content.indexOf("/* ========================================================\n   TRANQUIL TERRACE GALLE — 5-STAR ANIMATED LUXURY FOOTER");
  
  const endIdx = content.indexOf(".drawer-sub-item");

  if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find start or end index in " + filePath);
    return false;
  }

  const updated = content.substring(0, startIdx) + newFooterCss + "\n\n" + content.substring(endIdx);
  fs.writeFileSync(filePath, updated, "utf8");
  console.log("Successfully updated " + filePath);
  return true;
}

updateFile("public/meta-redesign.css");
updateFile("legacy-site/meta-redesign.css");
