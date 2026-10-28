import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const updateSitePath = path.join(root, "scripts", "update-site.mjs");
let code = fs.readFileSync(updateSitePath, "utf-8");

// 1. Ensure file copy list has mobile-carousels.css/js and whatsapp-booking.css/js
if (!code.includes('"mobile-carousels.css"')) {
  code = code.replace(
    /"whatsapp-booking\.js",\s*\]/g,
    `"whatsapp-booking.js",\n  "mobile-carousels.css",\n  "mobile-carousels.js",\n]`
  );
}

// 2. Ensure mobile-carousels.css & whatsapp-booking.css are injected into <head>
if (!code.includes('href="mobile-carousels.css"')) {
  code = code.replace(
    /if \(!html\.includes\('href="meta-redesign\.css"'\)\) \{[\s\S]*?\}\s*\}\s*/,
    `if (!html.includes('href="meta-redesign.css"')) {
    html = html.replace(
      /<link[^>]*href="cinematic-3d\\.css"[^>]*\\/>/i,
      \`<link href="cinematic-3d.css" rel="stylesheet"/>\\n  <link href="meta-redesign.css" rel="stylesheet"/>\\n  <link href="whatsapp-booking.css" rel="stylesheet"/>\\n  <link href="mobile-carousels.css" rel="stylesheet"/>\`
    );
  } else if (!html.includes('href="mobile-carousels.css"')) {
    html = html.replace(
      /<link[^>]*href="meta-redesign\\.css"[^>]*\\/>/i,
      \`<link href="meta-redesign.css" rel="stylesheet"/>\\n  <link href="whatsapp-booking.css" rel="stylesheet"/>\\n  <link href="mobile-carousels.css" rel="stylesheet"/>\`
    );
  }
`
  );
}

// 3. Update clean up regexes and bottomAdditions for official green WhatsApp SVG and scripts
const officialGreenWaSvg = `<svg viewBox="0 0 36 36" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="36" height="36" rx="18" fill="#25D366"/><path d="M18 8.5C12.8 8.5 8.5 12.8 8.5 18C8.5 19.7 9 21.4 9.9 22.8L8.5 27.5L13.4 26.2C14.8 27 16.4 27.5 18 27.5C23.2 27.5 27.5 23.2 27.5 18C27.5 12.8 23.2 8.5 18 8.5ZM22.8 21.9C22.6 22.4 21.8 22.9 21.2 23C20.8 23.1 20.2 23.1 18.2 22.3C15.7 21.3 14 18.7 13.9 18.5C13.8 18.3 12.9 17.1 12.9 15.9C12.9 14.7 13.5 14.1 13.7 13.8C13.9 13.6 14.2 13.5 14.5 13.5C14.6 13.5 14.7 13.5 14.8 13.5C15.1 13.5 15.2 13.5 15.4 13.9C15.6 14.4 16.1 15.7 16.2 15.8C16.3 16 16.3 16.1 16.2 16.3C16.1 16.5 16 16.6 15.9 16.7C15.8 16.9 15.6 17 15.5 17.2C15.3 17.3 15.2 17.5 15.4 17.8C15.6 18.1 16.2 19.1 17.1 19.9C18.2 20.9 19.1 21.2 19.4 21.4C19.7 21.5 19.9 21.5 20.1 21.3C20.3 21 20.8 20.4 21 20.1C21.2 19.8 21.4 19.9 21.7 20C22 20.1 23.6 20.9 23.9 21.1C24.2 21.2 24.4 21.3 24.5 21.5C24.6 21.8 24.6 22.3 22.8 21.9Z" fill="#FFFFFF"/></svg>`;

code = code.replace(
  /\/\/ Clean up any old floating buttons or old script tags[\s\S]*?const bottomAdditions = `[\s\S]*?`\.trim\(\);/,
  `// Clean up any old floating buttons or old script tags
  html = html.replace(/<aside class="meta-mobile-sticky-bar"[\\s\\S]*?<\\/aside>\\s*/g, "");
  html = html.replace(/<a class="meta-floating-whatsapp"[\\s\\S]*?<\\/a>\\s*/g, "");
  html = html.replace(/<script src="mobile-carousels\\.js"><\\/script>\\s*/g, "");
  html = html.replace(/<script defer src="whatsapp-booking\\.js"><\\/script>\\s*/g, "");
  html = html.replace(/<script src="meta-redesign\\.js"><\\/script>\\s*/g, "");
  html = html.replace(/<script src="cinematic-3d\\.js"><\\/script>\\s*/g, "");
  html = html.replace(/<script src="app\\.js"><\\/script>\\s*/g, "");

  const bottomAdditions = \`
  <!-- Mobile Sticky Bottom Bar -->
  <aside class="meta-mobile-sticky-bar" aria-label="Mobile booking action">
    <div class="meta-sticky-bar-inner">
      <div class="meta-sticky-price-col">
        <span>TWO PRIVATE VILLAS</span>
        <div>From <strong data-price-lkr="12500">LKR 12,500</strong></div>
      </div>
      <a class="meta-btn-sticky-book" id="meta-sticky-book-btn" href="#booking-card" data-book="">
        <span>Book Now ↗</span>
      </a>
    </div>
  </aside>

  <!-- Floating WhatsApp Concierge Button (Official Green SVG) -->
  <a class="meta-floating-whatsapp" href="\${WHATSAPP_URL}" target="_blank" rel="noopener" aria-label="Chat directly on WhatsApp" data-whatsapp-book="">
    ${officialGreenWaSvg}
  </a>

  <!-- Core Scripts -->
  <script src="app.js"></script>
  <script src="cinematic-3d.js"></script>
  <script src="meta-redesign.js"></script>
  <script src="mobile-carousels.js"></script>
  <script defer src="whatsapp-booking.js"></script>
</body>
\`.trim();`
);

fs.writeFileSync(updateSitePath, code, "utf-8");
console.log("Successfully updated scripts/update-site.mjs");
