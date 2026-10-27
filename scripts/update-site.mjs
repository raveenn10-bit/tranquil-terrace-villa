import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const BOOKING_URL = "https://www.booking.com/hotel/lk/tranquil-terrace-galle-galle1.html?aid=356980";
const AGODA_URL = "https://www.agoda.com/tranquil-terrace-galle-h79594102/hotel/galle-lk.html";
const AIRBNB_URL = "https://www.airbnb.co.in/rooms/1493263628966005427";
const FB_URL = "https://web.facebook.com/p/Tranquil-Terrace-Galle-61579428511398/?_rdc=1&_rdr#";
const TIKTOK_URL = "https://www.tiktok.com/@villa.tranquil.te?is_from_webapp=1&sender_device=pc";
const IG_URL = "https://www.instagram.com/tranquil.terrace.galle/";
const WHATSAPP_URL = "https://wa.me/94770682366";
const PHONE_NUMBER = "+94 77 068 2366";
const TEL_URL = "tel:+94770682366";

// 1. Update app.js in both public and legacy-site, and copy CSS/JS assets
for (const file of ["cinematic-3d.css", "cinematic-3d.js", "style.css", "redesign.css", "booking.css", "motion.css"]) {
  const src = path.join(root, "public", file);
  const dst = path.join(root, "legacy-site", file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`Copied ${file} to legacy-site/`);
  }
}

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
    fs.writeFileSync(appJsPath, content, "utf-8");
    console.log(`Updated ${appJsPath}`);
  }
}

// 2. Taru-style Header HTML
const taruHeaderHtml = (activePage) => `
<header class="taru-header">
  <div class="header-left">
    <a aria-label="Tranquil Terrace Galle home" class="brand brand-logo" href="index.html">
      <img src="assets/tranquil-terrace-logo.webp" alt="Tranquil Terrace Galle — Private Villa" width="1200" height="420"/>
    </a>
  </div>
  <div class="header-actions">
    <button class="nav-action-btn btn-menu menu-toggle" aria-expanded="false" aria-label="Toggle navigation menu">
      <svg class="nav-action-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <circle cx="4" cy="4" r="1.8"/><circle cx="10" cy="4" r="1.8"/><circle cx="16" cy="4" r="1.8"/>
        <circle cx="4" cy="10" r="1.8"/><circle cx="10" cy="10" r="1.8"/><circle cx="16" cy="10" r="1.8"/>
        <circle cx="4" cy="16" r="1.8"/><circle cx="10" cy="16" r="1.8"/><circle cx="16" cy="16" r="1.8"/>
      </svg>
      <span>MENU</span>
    </button>
    <button class="nav-action-btn btn-book-now" data-book="" aria-label="Book your escape">
      <svg class="nav-action-icon gold-icon" viewBox="0 0 24 24" fill="none" stroke="#c8a45d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <span>BOOK NOW</span>
    </button>
    <a class="nav-action-btn btn-call" href="${TEL_URL}" aria-label="Call Tranquil Terrace">
      <svg class="nav-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
      <span>CALL</span>
    </a>
    <a class="nav-action-btn btn-whatsapp" href="${WHATSAPP_URL}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
      <svg class="nav-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
      <span>WHATSAPP</span>
    </a>
  </div>
  <nav class="header-nav" aria-label="Main navigation">
    <a ${activePage === "index.html" ? 'aria-current="page"' : ''} href="index.html">Home</a>
    <a ${activePage === "villas.html" ? 'aria-current="page"' : ''} href="villas.html">The Villas</a>
    <a ${activePage === "experiences.html" ? 'aria-current="page"' : ''} href="experiences.html">Experiences</a>
    <a ${activePage === "gallery.html" ? 'aria-current="page"' : ''} href="gallery.html">Gallery</a>
    <a ${activePage === "explore-galle.html" ? 'aria-current="page"' : ''} href="explore-galle.html">Explore Galle</a>
    <a ${activePage === "contact.html" ? 'aria-current="page"' : ''} href="contact.html">Contact Us</a>
  </nav>
</header>
`.trim();

// 3. Social Media HTML block for footer
const socialBlockHtml = `
<div class="footer-social-section">
  <span>CONNECT WITH US</span>
  <div class="social-links-grid">
    <a class="social-link" href="${IG_URL}" target="_blank" rel="noopener" aria-label="Instagram">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
      <span>Instagram</span>
    </a>
    <a class="social-link" href="${FB_URL}" target="_blank" rel="noopener" aria-label="Facebook">
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
      <span>Facebook</span>
    </a>
    <a class="social-link" href="${TIKTOK_URL}" target="_blank" rel="noopener" aria-label="TikTok">
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v2a7 7 0 0 1-5-2.2V16a6 6 0 1 1-6-6v2z"/></svg>
      <span>TikTok</span>
    </a>
    <a class="social-link" href="${WHATSAPP_URL}" target="_blank" rel="noopener" aria-label="WhatsApp">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      <span>WhatsApp</span>
    </a>
  </div>
</div>
`.trim();

const htmlFiles = [
  "index.html",
  "villas.html",
  "experiences.html",
  "gallery.html",
  "explore-galle.html",
  "contact.html",
];

const processedPages = {};

for (const fileName of htmlFiles) {
  const sourcePath = path.join(root, "public", fileName);
  let html = fs.readFileSync(sourcePath, "utf-8");

  // Replace header with Taru-style header
  html = html.replace(/<header[\s\S]*?<\/header>/, taruHeaderHtml(fileName));

  // Update Booking.com link
  html = html.replace(
    /href="https:\/\/www\.booking\.com\/hotel\/lk\/tranquil-terrace-galle-galle1\.html[^"]*"/g,
    `href="${BOOKING_URL}"`
  );

  // Update Airbnb link
  html = html.replace(
    /href="https:\/\/www\.airbnb\.com\/rooms\/1493263628966005427[^"]*"/g,
    `href="${AIRBNB_URL}"`
  );

  // Update Agoda link
  html = html.replace(
    /href="https:\/\/www\.agoda\.com\/tranquil-terrace-galle-h79594102\/hotel\/galle-lk\.html[^"]*"/g,
    `href="${AGODA_URL}"`
  );

  // Ensure WhatsApp links
  html = html.replace(/href="https:\/\/wa\.me\/\d+[^"]*"/g, `href="${WHATSAPP_URL}"`);

  // Ensure phone number text and tel link
  html = html.replace(/href="tel:\+?\d+"/g, `href="${TEL_URL}"`);

  // Inject social block into footer if not present
  if (!html.includes("footer-social-section")) {
    html = html.replace(
      /<div class="footer-bottom">/,
      `${socialBlockHtml}\n<div class="footer-bottom">`
    );
  }

  // Save to public and legacy-site
  fs.writeFileSync(path.join(root, "public", fileName), html, "utf-8");
  fs.writeFileSync(path.join(root, "legacy-site", fileName), html, "utf-8");

  processedPages[fileName] = html;
  console.log(`Updated ${fileName} in public/ and legacy-site/`);
}

// 4. Generate lib/pages-content.ts with zero runtime fs access
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
