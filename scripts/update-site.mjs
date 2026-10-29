import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const BOOKING_URL = "https://www.booking.com/hotel/lk/tranquil-terrace-galle-galle1.html?aid=356980";
const AGODA_URL = "https://www.agoda.com/tranquil-terrace-galle-h79594102/hotel/galle-lk.html";
const AIRBNB_URL = "https://www.airbnb.co.in/rooms/1493263628966005427";
const FB_URL = "https://web.facebook.com/p/Tranquil-Terrace-Galle-61579428511398/?_rdc=1&_rdr#";
const TIKTOK_URL = "https://www.tiktok.com/@villa.tranquil.te?is_from_webapp=1&sender_device=pc";
const IG_URL = "https://www.instagram.com/tranquil_terrace_galle/";
const WHATSAPP_URL = "https://wa.me/94770682366";
const PHONE_NUMBER = "+94 77 068 2366";
const TEL_URL = "tel:+94770682366";

// 1. Copy CSS/JS assets from public/ to legacy-site/
for (const file of [
  "cinematic-3d.css",
  "cinematic-3d.js",
  "meta-redesign.css",
  "meta-redesign.js",
  "style.css",
  "redesign.css",
  "booking.css",
  "motion.css",
  "whatsapp-booking.css",
  "whatsapp-booking.js",
  "mobile-carousels.css",
  "mobile-carousels.js",
  "tranquil-sand-theme.css",
  "robots.txt",
  "sitemap.xml",
]) {
  const src = path.join(root, "public", file);
  const dst = path.join(root, "legacy-site", file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`Copied ${file} to legacy-site/`);
  }
}

// 2. Update app.js in both public/ and legacy-site/
for (const dir of ["public", "legacy-site"]) {
  const appJsPath = path.join(root, dir, "app.js");
  if (fs.existsSync(appJsPath)) {
    let content = fs.readFileSync(appJsPath, "utf-8");
    content = content.replace(
      /const channelUrls=\{[^}]+\};/,
      `const channelUrls={booking:'${BOOKING_URL}',agoda:'${AGODA_URL}',airbnb:'${AIRBNB_URL}'};`
    );
    content = content.replace(/wa\.me\/\d+/g, "wa.me/94770682366");
    content = content.replace(/tel:\+?\d+/g, TEL_URL);
    content = content.replace(
      /const footerBottom=\$\('\.new-footer \.footer-bottom'\);if\(footerBottom\)\{const adminLink=document\.createElement\('a'\);adminLink\.href='\/admin';adminLink\.textContent='ADMIN DASHBOARD [^']+';adminLink\.setAttribute\('aria-label','Open booking dashboard'\);footerBottom\.insertBefore\(adminLink,footerBottom\.lastElementChild\)\}/,
      `const footerBottom=$('.new-footer .footer-bottom');if(footerBottom&&!footerBottom.querySelector('a[href="/admin"]')){const adminLink=document.createElement('a');adminLink.href='/admin';adminLink.className='footer-admin-link';adminLink.textContent='Staff Portal \\u2197';adminLink.setAttribute('aria-label','Open booking dashboard');footerBottom.insertBefore(adminLink,footerBottom.lastElementChild)}`
    );
    fs.writeFileSync(appJsPath, content, "utf-8");
    console.log(`Updated ${appJsPath}`);
  }
}

// 3. Luxury Centered-Logo Crest SVG
const luxuryCrestSvg = `<svg class="luxury-crest-svg" viewBox="0 0 160 190" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Tranquil Terrace Galle Crest">
  <g stroke="#252824" stroke-linecap="round" stroke-linejoin="round">
    <!-- TOP CELESTIAL RADIANCE & STARBURST -->
    <g stroke-width="0.85" opacity="0.85">
      <line x1="80" y1="6" x2="80" y2="13"/>
      <line x1="80" y1="33" x2="80" y2="40"/>
      <line x1="66" y1="23" x2="73" y2="23"/>
      <line x1="87" y1="23" x2="94" y2="23"/>
      <line x1="70" y1="13" x2="75" y2="18"/>
      <line x1="85" y1="28" x2="90" y2="33"/>
      <line x1="70" y1="33" x2="75" y2="28"/>
      <line x1="85" y1="18" x2="90" y2="13"/>
      <line x1="74" y1="9" x2="77" y2="15" stroke-width="0.5"/>
      <line x1="86" y1="9" x2="83" y2="15" stroke-width="0.5"/>
      <line x1="74" y1="37" x2="77" y2="31" stroke-width="0.5"/>
      <line x1="86" y1="37" x2="83" y2="31" stroke-width="0.5"/>
      <line x1="66" y1="17" x2="72" y2="20" stroke-width="0.5"/>
      <line x1="94" y1="17" x2="88" y2="20" stroke-width="0.5"/>
      <line x1="66" y1="29" x2="72" y2="26" stroke-width="0.5"/>
      <line x1="94" y1="29" x2="88" y2="26" stroke-width="0.5"/>
    </g>
    <circle cx="80" cy="23" r="4" stroke-width="1.1" fill="#F8F5F0"/>
    <circle cx="80" cy="23" r="1.5" fill="#252824"/>
    <polygon points="80,4 81.2,7.5 84,8.5 81.2,9.5 80,13 78.8,9.5 76,8.5 78.8,7.5" fill="#252824" stroke="none"/>

    <!-- CARTOUCHE TOP CROWN SCROLLS -->
    <path d="M80 18 C72 13 65 18 62 25 C58 32 63 37 67 37 C61 43 59 51 60 58" stroke-width="1.1"/>
    <path d="M80 18 C88 13 95 18 98 25 C102 32 97 37 93 37 C99 43 101 51 100 58" stroke-width="1.1"/>
    <circle cx="62" cy="25" r="1.2" fill="#252824"/>
    <circle cx="98" cy="25" r="1.2" fill="#252824"/>

    <!-- BOTANICAL ACANTHUS & CINNAMON LEAVES (SYMMETRICAL FLANKS) -->
    <path d="M58 28 C50 25 44 31 46 38 C48 44 55 45 59 42" stroke-width="1"/>
    <path d="M46 38 C39 40 36 47 38 54 C40 60 48 61 52 56" stroke-width="1"/>
    <path d="M38 54 C32 58 31 66 34 73 C37 79 44 80 48 76" stroke-width="1"/>
    <path d="M34 73 C29 78 28 87 32 94 C35 100 43 100 47 96" stroke-width="1"/>
    <path d="M32 94 C29 101 31 109 36 115 C41 120 48 119 51 113" stroke-width="1"/>
    <path d="M36 115 C33 122 36 131 43 137 C49 141 56 138 58 131" stroke-width="1"/>
    <path d="M43 137 C42 145 49 154 58 158 C65 161 72 157 74 150" stroke-width="1"/>

    <path d="M102 28 C110 25 116 31 114 38 C112 44 105 45 101 42" stroke-width="1"/>
    <path d="M114 38 C121 40 124 47 122 54 C120 60 112 61 108 56" stroke-width="1"/>
    <path d="M122 54 C128 58 129 66 126 73 C123 79 116 80 112 76" stroke-width="1"/>
    <path d="M126 73 C131 78 132 87 128 94 C125 100 117 100 113 96" stroke-width="1"/>
    <path d="M128 94 C131 101 129 109 124 115 C119 120 112 119 109 113" stroke-width="1"/>
    <path d="M124 115 C127 122 124 131 117 137 C111 141 104 138 102 131" stroke-width="1"/>
    <path d="M117 137 C118 145 111 154 102 158 C95 161 88 157 86 150" stroke-width="1"/>

    <!-- CARTOUCHE MAIN SHIELD CONTOUR -->
    <path d="M80 34 C64 34 50 46 49 64 L49 116 C49 135 64 150 80 156 C96 150 111 135 111 116 L111 64 C110 46 96 34 80 34 Z" stroke-width="1.4"/>
    <path d="M80 38 C66 38 53 49 53 66 L53 114 C53 131 66 145 80 151 C94 145 107 131 107 114 L107 66 C107 49 94 38 80 38 Z" stroke-width="0.7" stroke-dasharray="2 1.5"/>

    <!-- CLASSICAL VILLA ARCH & ARCHITECTURAL MOTIF -->
    <path d="M59 86 L59 66 C59 55 68 46 80 46 C92 46 101 55 101 66 L101 86" stroke-width="1.1"/>
    <path d="M62 86 L62 67 C62 57 70 49 80 49 C90 49 98 57 98 67 L98 86" stroke-width="0.6"/>
    <line x1="57" y1="65" x2="64" y2="65" stroke-width="1.2"/>
    <line x1="96" y1="65" x2="103" y2="65" stroke-width="1.2"/>
    <line x1="57" y1="86" x2="64" y2="86" stroke-width="1.2"/>
    <line x1="96" y1="86" x2="103" y2="86" stroke-width="1.2"/>

    <!-- CLASSICAL BALUSTRADE / PEDIMENT STEPS AT BOTTOM -->
    <line x1="57" y1="127" x2="103" y2="127" stroke-width="1.2"/>
    <line x1="59" y1="130" x2="101" y2="130" stroke-width="0.8"/>
    <line x1="61" y1="127" x2="61" y2="122" stroke-width="1"/>
    <line x1="68" y1="127" x2="68" y2="122" stroke-width="1"/>
    <line x1="76" y1="127" x2="76" y2="122" stroke-width="1"/>
    <line x1="84" y1="127" x2="84" y2="122" stroke-width="1"/>
    <line x1="92" y1="127" x2="92" y2="122" stroke-width="1"/>
    <line x1="99" y1="127" x2="99" y2="122" stroke-width="1"/>
    <line x1="59" y1="122" x2="101" y2="122" stroke-width="0.9"/>

    <!-- BOTTOM DROPLET / PENDANT -->
    <path d="M80 156 L80 170 M73 162 C76 168 80 173 80 173 C80 173 84 168 87 162" stroke-width="1.1"/>
    <circle cx="80" cy="175" r="2" fill="#252824"/>
  </g>

  <!-- ROMAN MONOGRAM 'TT' WITH CLASSICAL SERIFS -->
  <path d="M68 60 L86 60 M77 60 L77 81 M73 81 L81 81" stroke="#252824" stroke-width="1.8" stroke-linecap="square"/>
  <path d="M68 60 L68 63 M86 60 L86 63" stroke="#252824" stroke-width="1.2"/>
  <path d="M75 65 L91 65 M83 65 L83 84 M79 84 L87 84" stroke="#252824" stroke-width="1.6" stroke-linecap="square"/>
  <path d="M75 65 L75 68 M91 65 L91 68" stroke="#252824" stroke-width="1.1"/>
  <path d="M66 79 C64 73 67 69 71 67" stroke="#252824" stroke-width="0.9" fill="none" stroke-linecap="round"/>
  <polygon points="66.5,74 65,71 68,72" fill="#252824"/>
  <polygon points="69,70 67.5,67 70.5,68" fill="#252824"/>

  <!-- TYPOGRAPHY -->
  <text x="80" y="98" text-anchor="middle" font-family="'Cormorant Garamond', Georgia, serif" font-size="8.5" font-weight="700" letter-spacing="2.2" fill="#252824">TRANQUIL</text>
  <text x="80" y="107" text-anchor="middle" font-family="'Cormorant Garamond', Georgia, serif" font-size="8" font-weight="700" letter-spacing="2.5" fill="#252824">TERRACE</text>
  <text x="80" y="116" text-anchor="middle" font-family="'Manrope', -apple-system, sans-serif" font-size="5.5" font-weight="600" letter-spacing="3.2" fill="#252824">GALLE</text>

  <!-- EST. 2024 -->
  <text x="80" y="142" text-anchor="middle" font-family="'Manrope', -apple-system, sans-serif" font-size="4.6" font-weight="600" letter-spacing="1.8" fill="#252824">EST. 2024</text>
</svg>`;

// 4. Header HTML function (Centered luxury crest + desktop navs)
const taruHeaderHtml = (activePage) => `
<header class="taru-header luxury-hotel-header" id="site-header">
  <div class="luxury-header-grid">
    <!-- 1. LEFT MENU (Desktop) -->
    <nav class="luxury-nav luxury-nav-left" aria-label="Main menu left">
      <ul class="luxury-menu-list">
        <li><a class="luxury-nav-link ${activePage === "index.html" ? "active" : ""}" href="index.html" ${activePage === "index.html" ? 'aria-current="page"' : ''}>HOME</a></li>
        <li><a class="luxury-nav-link ${activePage === "villas.html" ? "active" : ""}" href="villas.html" ${activePage === "villas.html" ? 'aria-current="page"' : ''}>OUR VILLAS</a></li>
        <li><a class="luxury-nav-link" href="index.html#packages">PACKAGES</a></li>
        <li><a class="luxury-nav-link ${activePage === "gallery.html" ? "active" : ""}" href="gallery.html" ${activePage === "gallery.html" ? 'aria-current="page"' : ''}>GALLERY</a></li>
      </ul>
    </nav>

    <!-- 2. MOBILE HAMBURGER BUTTON (Mobile only) -->
    <div class="luxury-mobile-burger-wrap">
      <button class="luxury-burger-btn" id="luxury-burger-btn" aria-label="Open navigation menu" aria-expanded="false" aria-controls="luxury-mobile-drawer">
        <span class="burger-line line-1"></span>
        <span class="burger-line line-2"></span>
        <span class="burger-line line-3"></span>
      </button>
    </div>

    <!-- 3. CENTER EMBLEM / CREST -->
    <div class="luxury-brand-center">
      <a class="luxury-crest-link" href="index.html" aria-label="Tranquil Terrace Galle — Private Villa">
        ${luxuryCrestSvg}
      </a>
    </div>

    <!-- 4. RIGHT MENU (Desktop) -->
    <nav class="luxury-nav luxury-nav-right" aria-label="Main menu right">
      <ul class="luxury-menu-list">
        <li><a class="luxury-nav-link ${activePage === "experiences.html" ? "active" : ""}" href="experiences.html" ${activePage === "experiences.html" ? 'aria-current="page"' : ''}>ABOUT</a></li>
        <li><a class="luxury-nav-link" href="index.html#faq">FAQ</a></li>
        <li><a class="luxury-nav-link ${activePage === "contact.html" ? "active" : ""}" href="contact.html" ${activePage === "contact.html" ? 'aria-current="page"' : ''}>CONTACT</a></li>
        <li><a class="luxury-nav-link luxury-book-link" href="${activePage === "index.html" ? "#booking-card" : "index.html#booking-card"}" data-book="" aria-label="Book your escape">BOOK NOW</a></li>
      </ul>

      <span class="luxury-nav-sep" aria-hidden="true">|</span>

      <div class="luxury-currency-toggle currency-toggle" role="group" aria-label="Currency toggle">
        <button type="button" class="luxury-curr-btn active" data-curr="LKR" aria-pressed="true">LKR</button>
        <span class="luxury-curr-slash">/</span>
        <button type="button" class="luxury-curr-btn" data-curr="USD" aria-pressed="false">USD</button>
      </div>

      <span class="luxury-nav-sep luxury-nav-sep-status" aria-hidden="true">|</span>

      <div class="luxury-nav-status" aria-label="Location and weather: 29 degrees Celsius in Galle">
        <span class="status-sun" aria-hidden="true">☀</span>
        <span class="status-text">29°C GALLE</span>
      </div>
    </nav>

    <!-- 5. MOBILE BOOK BUTTON (Mobile only) -->
    <div class="luxury-mobile-book-wrap">
      <a class="luxury-mobile-book-btn" href="${activePage === "index.html" ? "#booking-card" : "index.html#booking-card"}" data-book="" aria-label="Book your escape">
        <span>BOOK</span>
      </a>
    </div>
  </div>
</header>
`.trim();

// 5. Mobile Drawer Overlay HTML (Single instance placed right after header)
const taruDrawerHtml = (activePage) => `
<!-- MOBILE DRAWER / FULLSCREEN OVERLAY -->
<div class="luxury-mobile-drawer" id="luxury-mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile navigation" aria-hidden="true">
  <div class="drawer-scroller">
    <!-- Top Bar with Close Button -->
    <div class="drawer-top-bar">
      <span class="drawer-eyebrow">TRANQUIL TERRACE · GALLE</span>
      <button class="drawer-close-btn" id="luxury-drawer-close" aria-label="Close navigation menu">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- Centered Mini Crest -->
    <div class="drawer-crest-center">
      <a href="index.html" aria-label="Tranquil Terrace Galle home" class="drawer-crest-link">
        ${luxuryCrestSvg}
      </a>
    </div>

    <!-- Centered Navigation Links with Thin Dividers -->
    <nav class="drawer-nav-menu" aria-label="Mobile menu links">
      <ul class="drawer-links-list">
        <li style="--stagger: 1;"><a class="drawer-nav-link ${activePage === "index.html" ? "active" : ""}" href="index.html" ${activePage === "index.html" ? 'aria-current="page"' : ''}>HOME</a></li>
        <li style="--stagger: 2;"><a class="drawer-nav-link ${activePage === "villas.html" ? "active" : ""}" href="villas.html" ${activePage === "villas.html" ? 'aria-current="page"' : ''}>OUR VILLAS</a></li>
        <li style="--stagger: 3;" class="drawer-sub-item"><a class="drawer-nav-link drawer-nav-sub" href="villas.html#araliya">↳ Villa Araliya</a></li>
        <li style="--stagger: 4;" class="drawer-sub-item"><a class="drawer-nav-link drawer-nav-sub" href="villas.html#olu">↳ Villa Olu</a></li>
        <li style="--stagger: 5;"><a class="drawer-nav-link ${activePage === "gallery.html" ? "active" : ""}" href="gallery.html" ${activePage === "gallery.html" ? 'aria-current="page"' : ''}>GALLERY</a></li>
        <li style="--stagger: 6;"><a class="drawer-nav-link" href="index.html#packages">PACKAGES &amp; BOOKING</a></li>
        <li style="--stagger: 7;"><a class="drawer-nav-link ${activePage === "experiences.html" ? "active" : ""}" href="experiences.html" ${activePage === "experiences.html" ? 'aria-current="page"' : ''}>ABOUT / EXPERIENCES</a></li>
        <li style="--stagger: 8;"><a class="drawer-nav-link" href="index.html#faq">FAQ</a></li>
        <li style="--stagger: 9;"><a class="drawer-nav-link ${activePage === "contact.html" ? "active" : ""}" href="contact.html" ${activePage === "contact.html" ? 'aria-current="page"' : ''}>CONTACT</a></li>
      </ul>
    </nav>

    <!-- Drawer Actions & CTA -->
    <div class="drawer-footer-actions" style="--stagger: 10;">
      <a class="drawer-book-cta" href="${activePage === "index.html" ? "#booking-card" : "index.html#booking-card"}" data-book="" aria-label="Book your stay at Tranquil Terrace">
        <span>BOOK YOUR STAY</span>
        <span class="cta-arrow" aria-hidden="true">↗</span>
      </a>

      <!-- Currency & Weather Row in Drawer -->
      <div class="drawer-meta-row">
        <div class="luxury-currency-toggle currency-toggle drawer-curr-toggle" role="group" aria-label="Mobile currency selector">
          <button type="button" class="luxury-curr-btn active" data-curr="LKR" aria-pressed="true">LKR</button>
          <span class="luxury-curr-slash">/</span>
          <button type="button" class="luxury-curr-btn" data-curr="USD" aria-pressed="false">USD</button>
        </div>
        <span class="drawer-meta-dot">·</span>
        <span class="drawer-weather">☀ 29°C GALLE</span>
      </div>

      <!-- Quick Contact Links -->
      <div class="drawer-direct-contacts">
        <a href="tel:+94770682366" class="drawer-contact-tel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>+94 77 068 2366</span>
        </a>
        <a href="https://wa.me/94770682366" target="_blank" rel="noopener" class="drawer-contact-wa" data-whatsapp-book="" aria-label="WhatsApp Concierge">
          <svg class="official-wa-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill="#25D366" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z"/>
            <path fill="#FFFFFF" fill-rule="evenodd" d="M17.51 14.38C17.21 14.23 15.74 13.51 15.47 13.41C15.19 13.31 15 13.26 14.8 13.56C14.6 13.86 14.04 14.52 13.86 14.72C13.69 14.92 13.52 14.94 13.22 14.79C12.92 14.64 11.96 14.33 10.82 13.31C9.94 12.52 9.34 11.55 9.17 11.25C9 10.95 9.15 10.79 9.3 10.64C9.43 10.51 9.6 10.29 9.75 10.12C9.9 9.94 9.95 9.82 10.05 9.62C10.15 9.42 10.1 9.24 10.02 9.09C9.95 8.94 9.35 7.47 9.1 6.86C8.86 6.27 8.61 6.35 8.43 6.34C8.26 6.33 8.06 6.33 7.86 6.33C7.66 6.33 7.34 6.41 7.06 6.71C6.79 7.01 6.02 7.73 6.02 9.19C6.02 10.65 7.08 12.06 7.23 12.26C7.38 12.46 9.32 15.46 12.3 16.74C13.01 17.05 13.57 17.23 14 17.37C14.71 17.6 15.36 17.57 15.87 17.49C16.44 17.4 17.63 16.77 17.88 16.06C18.13 15.36 18.13 14.75 18.05 14.63C17.98 14.5 17.81 14.43 17.51 14.28V14.38Z"/>
          </svg>
          <span>WhatsApp Concierge ↗</span>
        </a>
      </div>
    </div>
  </div>
</div><!-- /luxury-mobile-drawer -->
`.trim();

// 6. World-Class Luxury Footer HTML with Official Brand SVGs & Active Animations
const taruFooterHtml = `<footer class="tt-footer" id="site-footer" aria-label="Tranquil Terrace site footer">
  <div class="tt-landscape" aria-hidden="true">
    <div class="tt-sky-glow"></div>
    <div class="tt-sun"></div>
    <svg class="tt-scenery" viewBox="0 0 1440 220" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <g id="palm">
          <path d="M0 0 V-85" stroke="#092f28" stroke-width="6" fill="none"/>
          <g fill="#092f28">
            <path d="M0 -85 Q-25 -118 -78 -112 Q-46 -91 0 -85Z"/>
            <path d="M0 -85 Q-4 -128 -32 -143 Q-27 -109 0 -85Z"/>
            <path d="M0 -85 Q24 -128 54 -134 Q33 -106 0 -85Z"/>
            <path d="M0 -85 Q48 -106 83 -89 Q42 -81 0 -85Z"/>
            <path d="M0 -85 Q-49 -78 -69 -57 Q-31 -67 0 -85Z"/>
            <path d="M0 -85 Q35 -75 62 -53 Q25 -64 0 -85Z"/>
          </g>
        </g>
        <g id="villa">
          <path d="M0 0 V-47 H138 V0Z" fill="#0a332b"/>
          <path d="M-9 -47 L18 -66 H118 L147 -47Z" fill="#082b25"/>
          <path d="M21 -41 H48 V-6 H21Z M63 -41 H91 V-6 H63Z M106 -41 H126 V-6 H106Z" fill="#FFD3B6" opacity=".78"/>
          <!-- Mint Lagoon Shimmer Pool & Loungers -->
          <rect x="145" y="-12" width="68" height="12" rx="3" fill="#6DD5C4" fill-opacity="0.85"/>
          <path d="M148 -6 Q162 -9 178 -6 T208 -6" stroke="#DFF6F0" stroke-width="1.2" fill="none" opacity="0.9"/>
          <path d="M218 -12 L227 -16 L234 -12" stroke="#FFD3B6" stroke-width="1.5" fill="none"/>
          <path d="M-12 -6 H150 L169 4 H-16Z" fill="#0c3a31"/>
        </g>
        <!-- Galle Fort Historic Lighthouse -->
        <g id="lighthouse">
          <path d="M0 0 H140 V-18 H0Z M21 -18 V-64 H43 V-18 M82 -18 V-46 H119 V-18" fill="#092f28"/>
          <path d="M10 -64 H55 L32 -79Z M74 -46 H125 L100 -59Z" fill="#092f28"/>
          <polygon points="32,-18 36,-96 46,-96 50,-18" fill="#082923"/>
          <rect x="33" y="-98" width="16" height="3" fill="#092f28"/>
          <rect x="35" y="-108" width="12" height="10" fill="#FFD3B6" opacity="0.92"/>
          <path d="M33 -108 H49 L41 -118 Z" fill="#092f28"/>
          <polygon points="41,-103 -180,-125 -180,-80" fill="url(#beacon-glow)" opacity="0.32"/>
        </g>
        <g id="shrub" fill="#09352d">
          <path d="M0 0 Q-42 -25 -7 -45 Q-9 -20 0 0 Q5 -49 24 -43 Q17 -20 0 0 Q42 -34 47 -15 Q18 -4 0 0Z"/>
        </g>
        <linearGradient id="beacon-glow" x1="100%" y1="50%" x2="0%" y2="50%">
          <stop offset="0%" stop-color="#FFD3B6" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#FFD3B6" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <!-- Back Wave Contour (Warm Sand Shore #E8D5BC) -->
      <path d="M0 154 Q120 110 248 143 T508 137 T782 144 T1050 152 T1440 158 V220 H0Z" fill="#E8D5BC"/>
      <g class="tt-palm tt-palm-a" transform="translate(62 143) scale(1.05)"><use href="#palm"/></g>
      <g class="tt-palm tt-palm-b" transform="translate(227 142) scale(.8)"><use href="#palm"/></g>
      <g class="tt-palm tt-palm-c" transform="translate(421 142) scale(.65)"><use href="#palm"/></g>
      <g class="tt-palm tt-palm-d" transform="translate(827 150) scale(.81)"><use href="#palm"/></g>
      <g class="tt-palm tt-palm-e" transform="translate(1170 154) scale(.72)"><use href="#palm"/></g>
      <!-- Left: Villa with Mint Lagoon Pool -->
      <g transform="translate(95 145)"><use href="#villa"/></g>
      <g transform="translate(320 147) scale(.7)"><use href="#villa"/></g>
      <!-- Right: Galle Fort Lighthouse -->
      <g transform="translate(1230 156)"><use href="#lighthouse"/></g>
      <g transform="translate(534 159)"><use href="#shrub"/></g>
      <g transform="translate(973 158)"><use href="#shrub"/></g>
      <g transform="translate(1390 171)"><use href="#shrub"/></g>
      <!-- Front Wave Contour (Seamless Champagne Grounding #FFF2DB) -->
      <path d="M0 170 Q120 143 245 160 T485 169 T741 168 T986 166 T1243 171 T1440 172 V220 H0Z" fill="#FFF2DB"/>
    </svg>
    <svg class="tt-birds" viewBox="0 0 180 70" fill="none" stroke="#34352F" stroke-width="2.5" stroke-linecap="round">
      <path d="M12 28 Q26 16 40 29 Q54 15 68 26 M91 17 Q102 9 113 18 Q123 8 135 16 M136 46 Q147 38 157 47 Q168 37 177 44"/>
    </svg>
  </div>

  <div class="tt-inner">
    <div class="tt-grid">
      <!-- Col 1: Brand & Direct CTA -->
      <section class="tt-brand">
        <div class="tt-brand-title">
          <span class="tt-monogram" aria-label="Tranquil Terrace Galle Logo">
            <svg class="tt-monogram-svg" viewBox="0 0 75 82" width="75" height="82" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 42 C4 18 20 4 37.5 4 C55 4 71 18 71 42 L71 78 C71 79.5 69.5 81 68 81 L7 81 C5.5 81 4 79.5 4 78 Z" stroke="#C17C60" stroke-width="2.2" fill="#34352F"/>
              <path d="M9 43 C9 22 23 9 37.5 9 C52 9 66 22 66 43 L66 76 L9 76 Z" stroke="#C17C60" stroke-width="0.8" stroke-dasharray="2 1.5" opacity="0.65"/>
              <text x="31" y="56" font-family="'Cormorant Garamond', Georgia, serif" font-size="46" font-weight="700" fill="#EAC085" text-anchor="middle">T</text>
              <text x="47" y="61" font-family="'Cormorant Garamond', Georgia, serif" font-size="29" font-weight="700" fill="#FFFFFF" text-anchor="middle">T</text>
              <path d="M22 63 C20 57 24 53 28 51 C27 57 23 61 22 63 Z" fill="#C17C60"/>
            </svg>
          </span>
          <div class="tt-brand-text">
            <strong>Tranquil<br/>Terrace</strong>
            <small>G A L L E</small>
          </div>
        </div>
        <p>Two private pool villas in Galle, offering a peaceful tropical escape with modern comforts and timeless Sri Lankan charm amidst lush cinnamon hills.</p>
        <div class="tt-badges">
          <a class="tt-badge" href="https://www.google.com/maps/place/Tranquil+Terrace+Galle/@6.0750215,80.2264243,17z/data=!4m11!3m10!1s0x3ae17190008d4b95:0x7d9bae152f119179!5m2!4m1!1i2!8m2!3d6.0750215!4d80.2264243!9m1!1b1!16s%2Fg%2F11xsjw9mts!18m1!1e1" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="#D97706" width="14" height="14"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            <span><strong>4.6 / 5.0</strong> Google Reviews (49 verified reviews) &nearr;</span>
          </a>
        </div>
        <a class="tt-button" href="index.html#packages" data-book="" aria-label="Book your stay at Tranquil Terrace">
          <span>Book Your Stay</span>
          <span aria-hidden="true">&nearr;</span>
        </a>
      </section>

      <!-- Col 2: Explore Navigation (2 Columns on Mobile) -->
      <nav class="tt-column tt-column-explore" aria-label="Footer navigation">
        <h2>Explore</h2>
        <div class="tt-nav-grid-2col">
          <div class="tt-nav-subcol">
            <a href="index.html">
              <svg class="tt-link-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>Home</span>
            </a>
            <a href="villas.html">
              <svg class="tt-link-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/></svg>
              <span>Our Villas</span>
            </a>
            <a href="villas.html#araliya" class="tt-sub-nav">
              <svg class="tt-link-icon tt-sub-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
              <span>Villa Araliya</span>
            </a>
            <a href="villas.html#olu" class="tt-sub-nav">
              <svg class="tt-link-icon tt-sub-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
              <span>Villa Olu</span>
            </a>
          </div>
          <div class="tt-nav-subcol">
            <a href="gallery.html">
              <svg class="tt-link-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              <span>Gallery</span>
            </a>
            <a href="index.html#packages">
              <svg class="tt-link-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              <span>Packages &amp; Booking</span>
            </a>
            <a href="contact.html">
              <svg class="tt-link-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>Contact &amp; Location</span>
            </a>
          </div>
        </div>
      </nav>

      <!-- Col 3: Guest Information (Accordion on Mobile, Column on Desktop) -->
      <nav class="tt-column tt-column-guest" aria-label="Guest information">
        <details class="tt-guest-details" open>
          <summary class="tt-guest-summary">
            <h2>Guest Information</h2>
            <span class="tt-acc-arrow" aria-hidden="true">▾</span>
          </summary>
          <div class="tt-guest-links">
            <a href="index.html#faq">
              <svg class="tt-link-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
              <span>Frequently Asked Questions</span>
            </a>
            <a href="index.html#faq">
              <svg class="tt-link-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Check-in 2 PM &middot; Check-out 11 AM</span>
            </a>
            <a href="index.html#faq">
              <svg class="tt-link-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              <span>Cancellation Policy</span>
            </a>
            <a href="contact.html#stay-calendar">
              <svg class="tt-link-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
              <span>Live Availability Calendar</span>
            </a>
            <a href="https://maps.app.goo.gl/RJAmGePoCYyHsJYX8" target="_blank" rel="noopener">
              <svg class="tt-link-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              <span>Google Maps &amp; Directions &nearr;</span>
            </a>
          </div>
        </details>
      </nav>

      <!-- Col 4: Contact & Direct Perks -->
      <section class="tt-column tt-column-contact" aria-label="Direct contact">
        <h2>Contact &amp; Concierge</h2>
        <a href="${TEL_URL}">
          <svg class="tt-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>${PHONE_NUMBER}</span>
        </a>
        <a href="${WHATSAPP_URL}" target="_blank" rel="noopener" data-whatsapp-book="" aria-label="WhatsApp Concierge">
          <svg class="tt-link-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><path fill="#25D366" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z"/><path fill="#FFF" fill-rule="evenodd" d="M17.51 14.38C17.21 14.23 15.74 13.51 15.47 13.41C15.19 13.31 15 13.26 14.8 13.56C14.6 13.86 14.04 14.52 13.86 14.72C13.69 14.92 13.52 14.94 13.22 14.79C12.92 14.64 11.96 14.33 10.82 13.31C9.94 12.52 9.34 11.55 9.17 11.25C9 10.95 9.15 10.79 9.3 10.64C9.43 10.51 9.6 10.29 9.75 10.12C9.9 9.94 9.95 9.82 10.05 9.62C10.15 9.42 10.1 9.24 10.02 9.09C9.95 8.94 9.35 7.47 9.1 6.86C8.86 6.27 8.61 6.35 8.43 6.34C8.26 6.33 8.06 6.33 7.86 6.33C7.66 6.33 7.34 6.41 7.06 6.71C6.79 7.01 6.02 7.73 6.02 9.19C6.02 10.65 7.08 12.06 7.23 12.26C7.38 12.46 9.32 15.46 12.3 16.74C13.01 17.05 13.57 17.23 14 17.37C14.71 17.6 15.36 17.57 15.87 17.49C16.44 17.4 17.63 16.77 17.88 16.06C18.13 15.36 18.13 14.75 18.05 14.63C17.98 14.5 17.81 14.43 17.51 14.28V14.38Z"/></svg>
          <span>WhatsApp Concierge &nearr;</span>
        </a>
        <a href="mailto:hello@tranquilterracegalle.com">
          <svg class="tt-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <span>hello@tranquilterracegalle.com</span>
        </a>
        <a href="${IG_URL}" target="_blank" rel="noopener">
          <svg class="tt-link-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          <span>@tranquil_terrace_galle</span>
        </a>
        <a href="https://maps.app.goo.gl/RJAmGePoCYyHsJYX8" target="_blank" rel="noopener">
          <svg class="tt-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>Galle, Sri Lanka (Google Maps &nearr;)</span>
        </a>
        <p class="tt-direct-guarantee">✨ Direct reservations receive guaranteed best rates, complimentary early check-in (subject to availability) &amp; tailored concierge.</p>
      </section>
    </div>

    <!-- Social & Booking Channels Bar -->
    <div class="tt-partners tt-reveal">
      <div class="tt-partner-group tt-partner-socials">
        <span class="tt-partner-label">FIND US ON</span>
        <div class="tt-social-row">
          <a href="${IG_URL}" target="_blank" rel="noopener" class="tt-social" aria-label="Instagram">
            <svg viewBox="0 0 28 28" width="22" height="22" fill="none">
              <defs><linearGradient id="tt-ig-f" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFD600"/><stop offset="25%" stop-color="#FF0069"/><stop offset="50%" stop-color="#D300C5"/><stop offset="100%" stop-color="#7638FA"/></linearGradient></defs>
              <rect width="28" height="28" rx="7" fill="url(#tt-ig-f)"/>
              <rect x="6.5" y="6.5" width="15" height="15" rx="4" stroke="#FFF" stroke-width="1.8"/>
              <circle cx="14" cy="14" r="3.6" stroke="#FFF" stroke-width="1.8"/>
              <circle cx="18.2" cy="9.8" r="1.1" fill="#FFF"/>
            </svg>
          </a>
          <a href="${FB_URL}" target="_blank" rel="noopener" class="tt-social" aria-label="Facebook">
            <svg viewBox="0 0 28 28" width="22" height="22" fill="none">
              <rect width="28" height="28" rx="7" fill="#1877F2"/>
              <path d="M17.5 14.8l.6-4.1h-3.9v-2.7c0-1.1.5-2.2 2.3-2.2h1.8V2.3c-.3 0-1.4-.2-2.7-.2-2.8 0-4.6 1.7-4.6 4.8v3.8H7.5v4.1h3.5V28h4.4V14.8h2.1z" fill="#FFF"/>
            </svg>
          </a>
          <a href="${TIKTOK_URL}" target="_blank" rel="noopener" class="tt-social" aria-label="TikTok">
            <svg viewBox="0 0 28 28" width="22" height="22" fill="none">
              <rect width="28" height="28" rx="7" fill="#000"/>
              <path d="M17.2 6.5c.7 1.2 1.8 2.1 3.1 2.5v2.8c-1.3 0-2.5-.4-3.5-1.1v6.7c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.4 0 .7 0 1.1.1V14c-.3 0-.7-.1-1.1-.1-1.7 0-3.1 1.4-3.1 3.1s1.4 3.1 3.1 3.1 3.1-1.4 3.1-3.1V6.5h3.3z" fill="#FE2C55" transform="translate(0.6,0.6)"/>
              <path d="M17.2 6.5c.7 1.2 1.8 2.1 3.1 2.5v2.8c-1.3 0-2.5-.4-3.5-1.1v6.7c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.4 0 .7 0 1.1.1V14c-.3 0-.7-.1-1.1-.1-1.7 0-3.1 1.4-3.1 3.1s1.4 3.1 3.1 3.1 3.1-1.4 3.1-3.1V6.5h3.3z" fill="#25F4EE" transform="translate(-0.6,-0.6)"/>
              <path d="M17.2 6.5c.7 1.2 1.8 2.1 3.1 2.5v2.8c-1.3 0-2.5-.4-3.5-1.1v6.7c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.4 0 .7 0 1.1.1V14c-.3 0-.7-.1-1.1-.1-1.7 0-3.1 1.4-3.1 3.1s1.4 3.1 3.1 3.1 3.1-1.4 3.1-3.1V6.5h3.3z" fill="#FFF"/>
            </svg>
          </a>
          <a href="${WHATSAPP_URL}" target="_blank" rel="noopener" class="tt-social" data-whatsapp-book="" aria-label="WhatsApp">
            <svg viewBox="0 0 28 28" width="22" height="22" fill="none">
              <rect width="28" height="28" rx="7" fill="#25D366"/>
              <path d="M14 6C9.6 6 6 9.6 6 14c0 1.5.4 3 1.2 4.3L6 22l3.8-1.2C11 21.6 12.5 22 14 22c4.4 0 8-3.6 8-8s-3.6-8-8-8zm4.6 11.3c-.2.6-1.1 1.1-1.6 1.2-.5.1-1.1.1-3.3-.8-2.6-1.1-4.2-3.8-4.3-4-.1-.2-1.1-1.5-1.1-2.8 0-1.4.7-2 1-2.3.2-.2.6-.4.9-.4.1 0 .2 0 .3.1.3 0 .4.1.6.5.2.5.7 1.7.8 1.8.1.2.1.3 0 .5-.1.2-.2.3-.3.5-.1.1-.3.3-.4.4-.1.1-.3.3-.1.6.2.3.8 1.4 1.8 2.2 1.2 1.1 2.2 1.4 2.5 1.6.3.1.5.1.7-.1.2-.2.8-1 1-1.3.2-.3.4-.3.7-.2.3.1 1.8.8 2.1 1 .3.2.5.3.6.4.1.2.1.8-.1 1.4z" fill="#FFF"/>
            </svg>
          </a>
        </div>
      </div>

      <div class="tt-partner-group tt-partner-otas">
        <span class="tt-partner-label">BOOK WITH CONFIDENCE</span>
        <div class="tt-ota-row">
          <a class="tt-ota-badge tt-ota-booking" href="${BOOKING_URL}" target="_blank" rel="noopener" aria-label="Booking.com">
            <svg viewBox="0 0 32 32" width="22" height="22" fill="none"><rect width="32" height="32" rx="6" fill="#003580"/><path d="M9.5 8h5.6c2.8 0 4.6 1.3 4.6 3.3 0 1.4-.9 2.5-2.2 2.9 1.7.4 2.7 1.7 2.7 3.3 0 2.3-2 3.8-5 3.8H9.5V8zm3.4 5.1h2c1.1 0 1.9-.4 1.9-1.4 0-.9-.7-1.4-1.8-1.4h-2.1v2.8zm0 5.7h2.2c1.3 0 2.2-.5 2.2-1.6 0-1-.8-1.6-2.2-1.6h-2.2v3.2z" fill="#FFF"/><circle cx="23.2" cy="19.5" r="1.8" fill="#006CE4"/></svg>
            <span>Booking.com</span>
          </a>
          <a class="tt-ota-badge tt-ota-agoda" href="${AGODA_URL}" target="_blank" rel="noopener" aria-label="Agoda">
            <svg viewBox="0 0 32 32" width="22" height="22" fill="none"><rect width="32" height="32" rx="6" fill="#FFF"/><circle cx="10" cy="11" r="3.2" fill="#E1251B"/><circle cx="22" cy="11" r="3.2" fill="#F8A51D"/><circle cx="8" cy="21" r="2.8" fill="#5EAA22"/><circle cx="16" cy="16" r="3.8" fill="#5392F9"/><circle cx="24" cy="21" r="2.8" fill="#5C2D91"/></svg>
            <span class="tt-ota-agoda-txt">agoda</span>
          </a>
          <a class="tt-ota-badge tt-ota-airbnb" href="${AIRBNB_URL}" target="_blank" rel="noopener" aria-label="Airbnb">
            <svg viewBox="0 0 32 32" width="22" height="22" fill="none"><rect width="32" height="32" rx="6" fill="#FF5A5F"/><path d="M16 4.5c-2.8 0-5.1 1.8-6.1 4.5-1.9 4.9-3.9 11.2-3.9 15.2 0 6 4.5 9.8 10 9.8s10-3.8 10-9.8c0-4-2-10.3-3.9-15.2-1-2.7-3.3-4.5-6.1-4.5zm0 2.5c1.8 0 3.3 1.2 4 2.9 1.8 4.7 3.5 10.4 3.5 14.3 0 4.4-3.2 7.3-7.5 7.3s-7.5-2.9-7.5-7.3c0-3.9 1.7-9.6 3.5-14.3.7-1.7 2.2-2.9 4-2.9zm0 6.5c-2.5 0-4.5 2-4.5 4.5 0 2.2 1.6 4.1 3.7 4.4.3 0 .5.1.8.1.3 0 .5 0 .8-.1 2.1-.3 3.7-2.2 3.7-4.4 0-2.5-2-4.5-4.5-4.5zm0 2c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5z" fill="#FFF"/></svg>
            <span class="tt-ota-airbnb-txt">airbnb</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Legal Bar -->
    <div class="tt-legal">
      <div class="tt-legal-copy">
        <span>&copy; 2026 Tranquil Terrace Galle &middot; All Rights Reserved</span>
        <span class="tt-legal-sep">&middot;</span>
        <span class="tt-crafted">Crafted by <strong style="color: var(--tt-gold); font-weight: 600;">Harsh Apex Digital Solutions</strong></span>
      </div>
      <div class="tt-legal-links">
        <a href="privacy-policy.html">Privacy Policy</a>
        <a href="terms-and-conditions.html">Terms &amp; Conditions</a>
        <a href="sitemap.xml">Sitemap</a>
        <a class="tt-admin-link" href="/admin" aria-label="Staff Portal">Staff Portal &nearr;</a>
        <a class="tt-back-top" href="#top">Back to top &uarr;</a>
      </div>
    </div>
  </div>

  <div class="tt-leaf tt-leaf-left" aria-hidden="true">&#10087;</div>
  <div class="tt-leaf tt-leaf-right" aria-hidden="true">&#10087;</div>
</footer>`.trim();

const htmlFiles = [
  "index.html",
  "villas.html",
  "experiences.html",
  "gallery.html",
  "explore-galle.html",
  "contact.html",
  "privacy-policy.html",
  "terms-and-conditions.html",
];

const pageMetadata = {
  "index.html": {
    url: "https://tranquilterracegalle.com/",
    title: "Tranquil Terrace Galle · Luxury Boutique Villas in Galle, Sri Lanka",
    description: "Two private boutique villas in Galle, Sri Lanka: Villa Araliya & Villa Olu. Each with 1 king bedroom, private plunge pool, and capacity for up to two guests. Guaranteed best rates and direct concierge.",
    image: "https://tranquilterracegalle.com/assets/villa-0.webp"
  },
  "villas.html": {
    url: "https://tranquilterracegalle.com/villas.html",
    title: "Our Private Villas · Tranquil Terrace Galle",
    description: "Discover Villa Araliya and Villa Olu. Two private luxury villas in Galle, each with king bedroom suite, en-suite bathroom, and private plunge pool.",
    image: "https://tranquilterracegalle.com/assets/villa-2.webp"
  },
  "experiences.html": {
    url: "https://tranquilterracegalle.com/experiences.html",
    title: "Signature Experiences · Tranquil Terrace Galle",
    description: "Floating breakfasts, cinnamon grove walks, and curated Galle Fort explorations.",
    image: "https://tranquilterracegalle.com/assets/villa-0.webp"
  },
  "gallery.html": {
    url: "https://tranquilterracegalle.com/gallery.html",
    title: "Visual Journal · Tranquil Terrace Galle",
    description: "Explore photographs and moments from Villa Araliya and Villa Olu in Galle, Sri Lanka.",
    image: "https://tranquilterracegalle.com/assets/villa-1.webp"
  },
  "explore-galle.html": {
    url: "https://tranquilterracegalle.com/explore-galle.html",
    title: "Explore Galle & Fort · Tranquil Terrace Galle",
    description: "A curated insider guide to Galle Fort, pristine southern beaches, and tropical gems.",
    image: "https://tranquilterracegalle.com/assets/villa-3.webp"
  },
  "contact.html": {
    url: "https://tranquilterracegalle.com/contact.html",
    title: "Contact & Reservations · Tranquil Terrace Galle",
    description: "Direct reservations, 24/7 WhatsApp concierge, location in Galle, Sri Lanka, and availability calendar.",
    image: "https://tranquilterracegalle.com/assets/villa-0.webp"
  },
  "privacy-policy.html": {
    url: "https://tranquilterracegalle.com/privacy-policy.html",
    title: "Privacy Policy · Tranquil Terrace Galle",
    description: "Privacy Policy and guest data protection practices at Tranquil Terrace Galle.",
    image: "https://tranquilterracegalle.com/assets/villa-0.webp"
  },
  "terms-and-conditions.html": {
    url: "https://tranquilterracegalle.com/terms-and-conditions.html",
    title: "Terms & Conditions · Tranquil Terrace Galle",
    description: "Booking terms, check-in policies, and guest rules at Tranquil Terrace Galle.",
    image: "https://tranquilterracegalle.com/assets/villa-0.webp"
  }
};

const processedPages = {};

for (const fileName of htmlFiles) {
  const sourcePath = path.join(root, "public", fileName);
  let html = fs.readFileSync(sourcePath, "utf-8");

  // A. Harmonize <head> with fonts, theme-color, stylesheets, canonical domain & Open Graph metadata
  html = html.replace(/<meta content="[^"]*?" name="theme-color"\/>/, '<meta content="#141615" name="theme-color"/>');

  // Clean up any existing canonical, og, and twitter tags
  html = html.replace(/<link[^>]*rel="canonical"[^>]*\/?>\s*/gi, "");
  html = html.replace(/<meta[^>]*property="og:[^"]*"[^>]*\/?>\s*/gi, "");
  html = html.replace(/<meta[^>]*name="twitter:[^"]*"[^>]*\/?>\s*/gi, "");

  const meta = pageMetadata[fileName] || {
    url: `https://tranquilterracegalle.com/${fileName}`,
    title: "Tranquil Terrace Galle",
    description: "Two private boutique villas in Galle, Sri Lanka.",
    image: "https://tranquilterracegalle.com/assets/villa-0.webp"
  };

  const seoTags = `  <link rel="canonical" href="${meta.url}"/>
  <meta property="og:url" content="${meta.url}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:title" content="${meta.title}"/>
  <meta property="og:description" content="${meta.description}"/>
  <meta property="og:image" content="${meta.image}"/>
  <meta property="og:site_name" content="Tranquil Terrace Galle"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${meta.title}"/>
  <meta name="twitter:description" content="${meta.description}"/>
  <meta name="twitter:image" content="${meta.image}"/>`;

  if (html.includes('name="description"')) {
    html = html.replace(/(<meta[^>]*name="description"[^>]*\/>)/i, `$1\n${seoTags}`);
  } else {
    html = html.replace(/<head>/i, `<head>\n${seoTags}`);
  }

  // Ensure Google Fonts Cormorant Garamond & Manrope are loaded
  if (!html.includes("family=Cormorant+Garamond")) {
    html = html.replace(
      /<head>/i,
      `<head>\n  <link href="https://fonts.googleapis.com" rel="preconnect"/>\n  <link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>\n  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet"/>`
    );
  }

  // Ensure cinematic-3d.css and meta-redesign.css are both linked in head
  if (!html.includes('href="meta-redesign.css"')) {
    html = html.replace(
      /<link[^>]*href="cinematic-3d\.css"[^>]*\/>/i,
      `<link href="cinematic-3d.css" rel="stylesheet"/>\n  <link href="meta-redesign.css" rel="stylesheet"/>`
    );
  }

  // Ensure whatsapp-booking.css is linked in head
  if (!html.includes('href="whatsapp-booking.css"')) {
    if (html.includes('href="meta-redesign.css"')) {
      html = html.replace(
        /<link[^>]*href="meta-redesign\.css"[^>]*\/>/i,
        `<link href="meta-redesign.css" rel="stylesheet"/>\n  <link href="whatsapp-booking.css" rel="stylesheet"/>`
      );
    } else {
      html = html.replace('</head>', '  <link href="whatsapp-booking.css" rel="stylesheet"/>\n</head>');
    }
  }

  // Ensure mobile-carousels.css is linked in head
  if (!html.includes('href="mobile-carousels.css"')) {
    if (html.includes('href="whatsapp-booking.css"')) {
      html = html.replace(
        /<link[^>]*href="whatsapp-booking\.css"[^>]*\/>/i,
        `<link href="whatsapp-booking.css" rel="stylesheet"/>\n  <link href="mobile-carousels.css" rel="stylesheet"/>`
      );
    } else {
      html = html.replace('</head>', '  <link href="mobile-carousels.css" rel="stylesheet"/>\n</head>');
    }
  }

  // Ensure tranquil-sand-theme.css is linked in head
  if (!html.includes('href="tranquil-sand-theme.css"')) {
    if (html.includes('href="mobile-carousels.css"')) {
      html = html.replace(
        /<link[^>]*href="mobile-carousels\.css"[^>]*\/>/i,
        `<link href="mobile-carousels.css" rel="stylesheet"/>\n  <link href="tranquil-sand-theme.css" rel="stylesheet"/>`
      );
    } else if (html.includes('href="meta-redesign.css"')) {
      html = html.replace(
        /<link[^>]*href="meta-redesign\.css"[^>]*\/>/i,
        `<link href="meta-redesign.css" rel="stylesheet"/>\n  <link href="tranquil-sand-theme.css" rel="stylesheet"/>`
      );
    } else {
      html = html.replace('</head>', '  <link href="tranquil-sand-theme.css" rel="stylesheet"/>\n</head>');
    }
  }

  // Clean up duplicate FAQ if found in contact.html
  if (fileName === "contact.html") {
    html = html.replace(/<section class="faq section">[\s\S]*?<\/section>\s*/g, "");
  }

  // Update Instagram URL in LodgingBusiness schema in index.html
  html = html.replace(/https:\/\/www\.instagram\.com\/tranquil\.terrace\.galle\//g, "https://www.instagram.com/tranquil_terrace_galle/");

  // B. Clean up any existing header, orphaned notice bars, and duplicate mobile drawers
  html = html.replace(/<!-- (?:1\. )?Top Notice Announcement Bar -->\s*/g, "");
  html = html.replace(/<aside class="meta-notice-bar"[\s\S]*?<\/aside>\s*/g, "");
  html = html.replace(/<header[\s\S]*?<\/header>\s*/g, "");
  html = html.replace(/(?:<!-- MOBILE DRAWER[\s\S]*?-->\s*)?<div class="luxury-mobile-drawer"[\s\S]*?<!-- \/luxury-mobile-drawer -->\s*/g, "");
  html = html.replace(/<div class="luxury-mobile-drawer"[\s\S]*?<\/div><!-- \/luxury-mobile-drawer -->\s*/g, "");

  // Insert the unified header and single mobile drawer right at top of body (after skip link)
  const headerAndDrawer = `${taruHeaderHtml(fileName)}\n\n${taruDrawerHtml(fileName)}`;
  if (html.includes('class="skip"')) {
    html = html.replace(/(<a class="skip"[^>]*>[\s\S]*?<\/a>)/, `$1\n\n${headerAndDrawer}`);
  } else if (html.includes('<div aria-hidden="true" class="progress"></div>')) {
    html = html.replace(
      '<div aria-hidden="true" class="progress"></div>',
      `<div aria-hidden="true" class="progress"></div>\n\n${headerAndDrawer}`
    );
  } else if (html.includes('<body')) {
    html = html.replace(/<body([^>]*)>/, `<body$1>\n\n${headerAndDrawer}`);
  }

  // B2. Optimize hero video for fast streaming and responsive mobile video in index.html
  if (fileName === "index.html") {
    html = html.replace(
      /<video\s+id="meta-hero-video"[\s\S]*?<\/video>/,
      `<video 
          id="meta-hero-video"
          class="meta-hero-video" 
          autoplay 
          muted 
          loop 
          playsinline 
          poster="videos/hero-poster.webp"
          preload="metadata"
          aria-hidden="true">
          <source src="videos/hero-cinematic-portrait.mp4" type="video/mp4" media="(orientation: portrait) and (max-width: 1024px)"/>
          <source src="videos/hero-cinematic-portrait.mp4" type="video/mp4" media="(max-width: 768px)"/>
          <source src="videos/hero-cinematic.mp4" type="video/mp4"/>
        </video>`
    );
    // User request: remove rate banner, CTA buttons, and video control pill from hero section
    html = html.replace(/<div class="meta-hero-rate-banner">[\s\S]*?<\/div>\s*/g, "");
    html = html.replace(/<div class="meta-hero-cta-group">[\s\S]*?<\/div>\s*/g, "");
    html = html.replace(/<button[^>]*id="meta-video-control"[\s\S]*?<\/button>\s*/g, "");
    if (!html.includes('rel="preload" as="image" href="videos/hero-poster.webp"')) {
      html = html.replace(
        /<link\s+href="style\.css"/,
        `<link rel="preload" as="image" href="videos/hero-poster.webp"/>\n  <link href="style.css"`
      );
    }
  }

  // C. Replace footer with unified Luxury Taru-style footer containing official brand SVGs
  html = html.replace(/<footer[\s\S]*?<\/footer>/, taruFooterHtml);

  // Upgrade legacy whatsapp-link button with official SVG
  html = html.replace(
    /<a class="button" id="whatsapp-link"([^>]*)>Open WhatsApp <span>↗<\/span><\/a>/g,
    `<a class="button" id="whatsapp-link"$1><svg class="official-wa-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="margin-right:6px;"><path fill="#25D366" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z"/><path fill="#FFFFFF" fill-rule="evenodd" d="M17.51 14.38C17.21 14.23 15.74 13.51 15.47 13.41C15.19 13.31 15 13.26 14.8 13.56C14.6 13.86 14.04 14.52 13.86 14.72C13.69 14.92 13.52 14.94 13.22 14.79C12.92 14.64 11.96 14.33 10.82 13.31C9.94 12.52 9.34 11.55 9.17 11.25C9 10.95 9.15 10.79 9.3 10.64C9.43 10.51 9.6 10.29 9.75 10.12C9.9 9.94 9.95 9.82 10.05 9.62C10.15 9.42 10.1 9.24 10.02 9.09C9.95 8.94 9.35 7.47 9.1 6.86C8.86 6.27 8.61 6.35 8.43 6.34C8.26 6.33 8.06 6.33 7.86 6.33C7.66 6.33 7.34 6.41 7.06 6.71C6.79 7.01 6.02 7.73 6.02 9.19C6.02 10.65 7.08 12.06 7.23 12.26C7.38 12.46 9.32 15.46 12.3 16.74C13.01 17.05 13.57 17.23 14 17.37C14.71 17.6 15.36 17.57 15.87 17.49C16.44 17.4 17.63 16.77 17.88 16.06C18.13 15.36 18.13 14.75 18.05 14.63C17.98 14.5 17.81 14.43 17.51 14.28V14.38Z"/></svg>Open WhatsApp <span>↗</span></a>`
  );

  // D. Ensure bottom elements: Ambient Audio, Mobile Sticky Booking Bar, Floating WhatsApp button, and scripts
  // Clean up any old floating buttons, old script tags, and comments
  html = html.replace(/<!-- (?:Mobile Sticky Bottom Bar|Floating WhatsApp|Official Floating WhatsApp|Core Scripts|1[12]\.|Luxury WhatsApp|Scripts|Ambient Audio)[^\n]*-->\s*/g, "");
  html = html.replace(/<audio id="ambient-audio"[\s\S]*?<\/audio>\s*/g, "");
  html = html.replace(/<button[^>]*id="luxury-audio-toggle"[\s\S]*?<\/button>\s*/g, "");
  html = html.replace(/<div class="luxury-audio-tooltip"[\s\S]*?<\/div>\s*/g, "");
  html = html.replace(/<aside class="meta-mobile-sticky-bar"[\s\S]*?<\/aside>\s*/g, "");
  html = html.replace(/<a class="meta-floating-whatsapp"[\s\S]*?<\/a>\s*/g, "");
  html = html.replace(/<button[^>]*class="[^"]*meta-floating-whatsapp[^"]*"[\s\S]*?<\/button>\s*/g, "");
  html = html.replace(/<button[^>]*class="[^"]*tt-floating-wa[^"]*"[\s\S]*?<\/button>\s*/g, "");
  html = html.replace(/<div class="tt-wa-tooltip"[\s\S]*?<\/div>\s*/g, "");
  html = html.replace(/<dialog id="whatsapp-booking-dialog"[\s\S]*?<\/dialog>\s*/g, "");
  html = html.replace(/<script[^>]*src="meta-redesign\.js"[^>]*><\/script>\s*/g, "");
  html = html.replace(/<script[^>]*src="cinematic-3d\.js"[^>]*><\/script>\s*/g, "");
  html = html.replace(/<script[^>]*src="app\.js"[^>]*><\/script>\s*/g, "");
  html = html.replace(/<script[^>]*src="mobile-carousels\.js"[^>]*><\/script>\s*/g, "");
  html = html.replace(/<script[^>]*src="whatsapp-booking\.js"[^>]*><\/script>\s*/g, "");

  const bottomAdditions = `
  <!-- Ambient Audio & Luxury Floating Toggle Button (Bottom Left) -->
  <audio id="ambient-audio" preload="none">
    <source src="assets/ambient.mp3" type="audio/mp3">
  </audio>
  <button type="button" class="luxury-audio-toggle" id="luxury-audio-toggle" aria-label="Play ambient sound" title="Play ambient sound">
    <svg class="audio-icon-muted" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    </svg>
    <svg class="audio-icon-playing" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
    </svg>
  </button>
  <div class="luxury-audio-tooltip" id="luxury-audio-tooltip" aria-hidden="true"><span>Play Ambient Sound</span></div>

  <!-- Mobile Sticky Bottom Bar -->
  <aside class="meta-mobile-sticky-bar" aria-label="Mobile booking action">
    <div class="meta-sticky-bar-inner">
      <div class="meta-sticky-price-col">
        <span>TWO PRIVATE VILLAS</span>
        <div>Day Packages from <strong data-price-lkr="12500">LKR 12,500</strong></div>
      </div>
      <a class="meta-btn-sticky-book" id="meta-sticky-book-btn" href="${fileName === "index.html" ? "#booking-card" : "index.html#booking-card"}" data-whatsapp-book="" aria-label="Book your stay on WhatsApp">
        <span>Book Now &nearr;</span>
      </a>
    </div>
  </aside>

  <!-- Official Floating WhatsApp Concierge Button (#25D366) -->
  <button type="button" class="meta-floating-whatsapp" id="floating-whatsapp" data-whatsapp-book="" aria-label="Chat or Book on WhatsApp">
    <svg viewBox="0 0 36 36" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="36" height="36" rx="18" fill="#25D366"/>
      <path d="M18 8.5C12.8 8.5 8.5 12.8 8.5 18C8.5 19.7 9 21.4 9.9 22.8L8.5 27.5L13.4 26.2C14.8 27 16.4 27.5 18 27.5C23.2 27.5 27.5 23.2 27.5 18C27.5 12.8 23.2 8.5 18 8.5ZM22.8 21.9C22.6 22.4 21.8 22.9 21.2 23C20.8 23.1 20.2 23.1 18.2 22.3C15.7 21.3 14 18.7 13.9 18.5C13.8 18.3 12.9 17.1 12.9 15.9C12.9 14.7 13.5 14.1 13.7 13.8C13.9 13.6 14.2 13.5 14.5 13.5C14.6 13.5 14.7 13.5 14.8 13.5C15.1 13.5 15.2 13.5 15.4 13.9C15.6 14.4 16.1 15.7 16.2 15.8C16.3 16 16.3 16.1 16.2 16.3C16.1 16.5 16 16.6 15.9 16.7C15.8 16.9 15.6 17 15.5 17.2C15.3 17.3 15.2 17.5 15.4 17.8C15.6 18.1 16.2 19.1 17.1 19.9C18.2 20.9 19.1 21.2 19.4 21.4C19.7 21.5 19.9 21.5 20.1 21.3C20.3 21 20.8 20.4 21 20.1C21.2 19.8 21.4 19.9 21.7 20C22 20.1 23.6 20.9 23.9 21.1C24.2 21.2 24.4 21.3 24.5 21.5C24.6 21.8 24.6 22.3 22.8 21.9Z" fill="#FFFFFF"/>
    </svg>
  </button>
  <div class="tt-wa-tooltip" id="tt-wa-tooltip" aria-hidden="true"><span class="tt-wa-pulse-dot"></span><span>Chat or Book on WhatsApp</span></div>

  <!-- Core Scripts -->
  <script src="app.js"></script>
  <script src="cinematic-3d.js"></script>
  <script src="meta-redesign.js"></script>
  <script defer src="whatsapp-booking.js"></script>
  <script defer src="mobile-carousels.js"></script>
</body>
`.trim();

  html = html.replace(/<\/body>/i, bottomAdditions);

  // E. Save to public and legacy-site
  fs.writeFileSync(path.join(root, "public", fileName), html, "utf-8");
  fs.writeFileSync(path.join(root, "legacy-site", fileName), html, "utf-8");

  processedPages[fileName] = html;
  console.log(`Updated ${fileName} in public/ and legacy-site/`);
}

// 7. Generate lib/pages-content.ts with zero runtime fs access
const pagesContentCode = `// Generated pages module - zero runtime filesystem access to ensure 100% Vercel & Turbopack build compatibility
export const pages: Record<string, string> = ${JSON.stringify(processedPages, null, 2)};

export function getPageContent(name: string): string | undefined {
  if (name === "" || name === "index" || name === "index.html") {
    return pages["index.html"];
  }
  const clean = name.endsWith(".html") ? name : \`\${name}.html\`;
  return pages[clean] || pages[name];
}
`;

fs.writeFileSync(path.join(root, "lib", "pages-content.ts"), pagesContentCode, "utf-8");
console.log("Successfully generated lib/pages-content.ts");
