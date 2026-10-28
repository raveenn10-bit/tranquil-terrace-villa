import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const updateSitePath = path.join(root, "scripts", "update-site.mjs");
let content = fs.readFileSync(updateSitePath, "utf-8");

// Normalize line endings
content = content.replace(/\r\n/g, "\n");

// 1. Add whatsapp-booking.css and whatsapp-booking.js to copy list
if (!content.includes('"whatsapp-booking.css"')) {
  content = content.replace(
    /for \(const file of \[[^\]]+\]\) \{/,
    'for (const file of ["cinematic-3d.css", "cinematic-3d.js", "meta-redesign.css", "meta-redesign.js", "style.css", "redesign.css", "booking.css", "motion.css", "whatsapp-booking.css", "whatsapp-booking.js"]) {'
  );
}

// 2. Official WhatsApp SVG constants
const OFFICIAL_WA_SVG_DRAWER = `<svg viewBox="0 0 36 36" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="36" height="36" rx="18" fill="#25D366"/><path d="M18 8.5C12.8 8.5 8.5 12.8 8.5 18C8.5 19.7 9 21.4 9.9 22.8L8.5 27.5L13.4 26.2C14.8 27 16.4 27.5 18 27.5C23.2 27.5 27.5 23.2 27.5 18C27.5 12.8 23.2 8.5 18 8.5ZM22.8 21.9C22.6 22.4 21.8 22.9 21.2 23C20.8 23.1 20.2 23.1 18.2 22.3C15.7 21.3 14 18.7 13.9 18.5C13.8 18.3 12.9 17.1 12.9 15.9C12.9 14.7 13.5 14.1 13.7 13.8C13.9 13.6 14.2 13.5 14.5 13.5C14.6 13.5 14.7 13.5 14.8 13.5C15.1 13.5 15.2 13.5 15.4 13.9C15.6 14.4 16.1 15.7 16.2 15.8C16.3 16 16.3 16.1 16.2 16.3C16.1 16.5 16 16.6 15.9 16.7C15.8 16.9 15.6 17 15.5 17.2C15.3 17.3 15.2 17.5 15.4 17.8C15.6 18.1 16.2 19.1 17.1 19.9C18.2 20.9 19.1 21.2 19.4 21.4C19.7 21.5 19.9 21.5 20.1 21.3C20.3 21 20.8 20.4 21 20.1C21.2 19.8 21.4 19.9 21.7 20C22 20.1 23.6 20.9 23.9 21.1C24.2 21.2 24.4 21.3 24.5 21.5C24.6 21.8 24.6 22.3 22.8 21.9Z" fill="#FFFFFF"/></svg>`;

const OFFICIAL_WA_SVG_FOOTER = `<svg viewBox="0 0 36 36" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="36" height="36" rx="18" fill="#25D366"/><path d="M18 8.5C12.8 8.5 8.5 12.8 8.5 18C8.5 19.7 9 21.4 9.9 22.8L8.5 27.5L13.4 26.2C14.8 27 16.4 27.5 18 27.5C23.2 27.5 27.5 23.2 27.5 18C27.5 12.8 23.2 8.5 18 8.5ZM22.8 21.9C22.6 22.4 21.8 22.9 21.2 23C20.8 23.1 20.2 23.1 18.2 22.3C15.7 21.3 14 18.7 13.9 18.5C13.8 18.3 12.9 17.1 12.9 15.9C12.9 14.7 13.5 14.1 13.7 13.8C13.9 13.6 14.2 13.5 14.5 13.5C14.6 13.5 14.7 13.5 14.8 13.5C15.1 13.5 15.2 13.5 15.4 13.9C15.6 14.4 16.1 15.7 16.2 15.8C16.3 16 16.3 16.1 16.2 16.3C16.1 16.5 16 16.6 15.9 16.7C15.8 16.9 15.6 17 15.5 17.2C15.3 17.3 15.2 17.5 15.4 17.8C15.6 18.1 16.2 19.1 17.1 19.9C18.2 20.9 19.1 21.2 19.4 21.4C19.7 21.5 19.9 21.5 20.1 21.3C20.3 21 20.8 20.4 21 20.1C21.2 19.8 21.4 19.9 21.7 20C22 20.1 23.6 20.9 23.9 21.1C24.2 21.2 24.4 21.3 24.5 21.5C24.6 21.8 24.6 22.3 22.8 21.9Z" fill="#FFFFFF"/></svg>`;

// 3. Update drawer contact WhatsApp icon in taruHeaderHtml
content = content.replace(
  /<a href="https:\/\/wa\.me\/94770682366"[^>]*class="drawer-contact-wa"[\s\S]*?<\/a>/,
  `<a href="https://wa.me/94770682366" target="_blank" rel="noopener" class="drawer-contact-wa" data-whatsapp-book="" aria-label="WhatsApp Concierge">
          ${OFFICIAL_WA_SVG_DRAWER}
          <span>WhatsApp Concierge ↗</span>
        </a>`
);

// 4. Update footer social WhatsApp icon in taruFooterHtml
content = content.replace(
  /<a class="social-link" href="\${WHATSAPP_URL}"[\s\S]*?<\/a>/,
  `<a class="social-link" href="\${WHATSAPP_URL}" target="_blank" rel="noopener" aria-label="WhatsApp" data-whatsapp-book="">
        ${OFFICIAL_WA_SVG_FOOTER}
        <span>WhatsApp</span>
      </a>`
);

// 5. Update the page loop in update-site.mjs
const loopRegex = /for \(const fileName of htmlFiles\) \{[\s\S]*?console\.log\(`Updated \${fileName} in public\/ and legacy-site\/`\);\s*\}/;

const newLoopCode = `for (const fileName of htmlFiles) {
  const sourcePath = path.join(root, "public", fileName);
  let html = fs.readFileSync(sourcePath, "utf-8");

  // 1. Replace header with Taru-style header
  html = html.replace(/<header[\\s\\S]*?<\\/header>/, taruHeaderHtml(fileName));

  // 2. Replace footer with unified Luxury Taru-style footer
  html = html.replace(/<footer[\\s\\S]*?<\\/footer>/, taruFooterHtml);

  // 3. Inject whatsapp-booking.css into <head> if not already present
  if (!html.includes('whatsapp-booking.css')) {
    html = html.replace('</head>', '  <link href="whatsapp-booking.css" rel="stylesheet"/>\\n</head>');
  }

  // 4. Inject whatsapp-booking.js before </body> if not already present
  if (!html.includes('whatsapp-booking.js')) {
    html = html.replace('</body>', '  <script defer src="whatsapp-booking.js"></script>\\n</body>');
  }

  // 5. Replace generic SVG in floating WhatsApp button with official SVG logo & luxury tooltip
  const officialWaSvgFloating = \`<svg viewBox="0 0 36 36" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="36" height="36" rx="18" fill="#25D366"/><path d="M18 8.5C12.8 8.5 8.5 12.8 8.5 18C8.5 19.7 9 21.4 9.9 22.8L8.5 27.5L13.4 26.2C14.8 27 16.4 27.5 18 27.5C23.2 27.5 27.5 23.2 27.5 18C27.5 12.8 23.2 8.5 18 8.5ZM22.8 21.9C22.6 22.4 21.8 22.9 21.2 23C20.8 23.1 20.2 23.1 18.2 22.3C15.7 21.3 14 18.7 13.9 18.5C13.8 18.3 12.9 17.1 12.9 15.9C12.9 14.7 13.5 14.1 13.7 13.8C13.9 13.6 14.2 13.5 14.5 13.5C14.6 13.5 14.7 13.5 14.8 13.5C15.1 13.5 15.2 13.5 15.4 13.9C15.6 14.4 16.1 15.7 16.2 15.8C16.3 16 16.3 16.1 16.2 16.3C16.1 16.5 16 16.6 15.9 16.7C15.8 16.9 15.6 17 15.5 17.2C15.3 17.3 15.2 17.5 15.4 17.8C15.6 18.1 16.2 19.1 17.1 19.9C18.2 20.9 19.1 21.2 19.4 21.4C19.7 21.5 19.9 21.5 20.1 21.3C20.3 21 20.8 20.4 21 20.1C21.2 19.8 21.4 19.9 21.7 20C22 20.1 23.6 20.9 23.9 21.1C24.2 21.2 24.4 21.3 24.5 21.5C24.6 21.8 24.6 22.3 22.8 21.9Z" fill="#FFFFFF"/></svg>\`;

  if (html.includes('meta-floating-whatsapp')) {
    html = html.replace(
      /<a class="meta-floating-whatsapp"[\\s\\S]*?<\\/a>/,
      \`<a class="meta-floating-whatsapp" href="https://wa.me/94770682366" target="_blank" rel="noopener" aria-label="Chat or Book on WhatsApp">\${officialWaSvgFloating}</a>\\n  <div class="tt-wa-tooltip" id="tt-wa-tooltip" aria-hidden="true"><span class="tt-wa-pulse-dot"></span><span>Chat or Book on WhatsApp</span></div>\`
    );
  } else if (!html.includes('tt-floating-wa')) {
    html = html.replace(
      '</body>',
      \`  <!-- Floating WhatsApp Booking Button -->\\n  <button type="button" class="tt-floating-wa" id="tt-floating-wa" aria-label="Chat or Book on WhatsApp">\${officialWaSvgFloating}</button>\\n  <div class="tt-wa-tooltip" id="tt-wa-tooltip" aria-hidden="true"><span class="tt-wa-pulse-dot"></span><span>Chat or Book on WhatsApp</span></div>\\n</body>\`
    );
  }

  // Save to public and legacy-site
  fs.writeFileSync(path.join(root, "public", fileName), html, "utf-8");
  fs.writeFileSync(path.join(root, "legacy-site", fileName), html, "utf-8");

  processedPages[fileName] = html;
  console.log(\`Updated \${fileName} in public/ and legacy-site/\`);
}`;

if (loopRegex.test(content)) {
  content = content.replace(loopRegex, newLoopCode);
  console.log("Replaced loop in update-site.mjs");
} else {
  console.warn("Could not match loopRegex");
}

fs.writeFileSync(updateSitePath, content, "utf-8");
console.log("Successfully patched scripts/update-site.mjs");
