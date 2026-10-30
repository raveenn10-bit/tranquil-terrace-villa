import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const svgPath = path.join(root, 'public', 'favicon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

console.log('--- 1. Rendering PNG icons from public/favicon.svg ---');

const renders = [
  { size: 512, targets: ['public/android-chrome-512x512.png', 'app/icon.png', 'legacy-site/android-chrome-512x512.png'] },
  { size: 192, targets: ['public/favicon-192x192.png', 'public/android-chrome-192x192.png', 'legacy-site/favicon-192x192.png', 'legacy-site/android-chrome-192x192.png'] },
  { size: 180, targets: ['public/apple-touch-icon.png', 'app/apple-icon.png', 'legacy-site/apple-touch-icon.png'] },
  { size: 96,  targets: ['public/favicon-96x96.png', 'legacy-site/favicon-96x96.png'] },
  { size: 48,  targets: ['public/favicon-48x48.png', 'legacy-site/favicon-48x48.png'] },
  { size: 32,  targets: ['public/favicon-32x32.png', 'legacy-site/favicon-32x32.png'] },
  { size: 16,  targets: ['public/favicon-16x16.png', 'legacy-site/favicon-16x16.png'] },
];

const renderedBuffers = {};

for (const { size, targets } of renders) {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${size}px;
    height: ${size}px;
    overflow: hidden;
    background: transparent !important;
  }
  svg {
    width: ${size}px;
    height: ${size}px;
    display: block;
  }
</style>
</head>
<body>
${svgContent}
</body>
</html>`;

  const htmlPath = path.join(root, `temp-render-${size}.html`);
  const tempPng = path.join(root, `temp-${size}.png`);
  fs.writeFileSync(htmlPath, html, 'utf8');

  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  const cmd = `"${chromePath}" --headless --disable-gpu --default-background-color=00000000 --window-size=${size},${size} --screenshot="${tempPng}" "${fileUrl}"`;
  execSync(cmd, { stdio: 'pipe' });

  const buf = fs.readFileSync(tempPng);
  renderedBuffers[size] = buf;

  for (const target of targets) {
    const fullTarget = path.join(root, target);
    fs.mkdirSync(path.dirname(fullTarget), { recursive: true });
    fs.writeFileSync(fullTarget, buf);
    console.log(`Saved ${target} (${size}x${size}, ${buf.length} bytes)`);
  }

  fs.unlinkSync(htmlPath);
  fs.unlinkSync(tempPng);
}

console.log('\n--- 2. Building Multi-resolution ICO (16x16, 32x32, 48x48) ---');

function createIco(pngEntries) {
  const count = pngEntries.length;
  const headerSize = 6 + count * 16;
  let currentOffset = headerSize;
  
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dataBuffers = [];

  for (let i = 0; i < count; i++) {
    const { width, height, buffer } = pngEntries[i];
    const entryOffset = 6 + i * 16;
    header.writeUInt8(width >= 256 ? 0 : width, entryOffset);
    header.writeUInt8(height >= 256 ? 0 : height, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2);
    header.writeUInt8(0, entryOffset + 3);
    header.writeUInt16LE(1, entryOffset + 4);
    header.writeUInt16LE(32, entryOffset + 6);
    header.writeUInt32LE(buffer.length, entryOffset + 8);
    header.writeUInt32LE(currentOffset, entryOffset + 12);

    dataBuffers.push(buffer);
    currentOffset += buffer.length;
  }

  return Buffer.concat([header, ...dataBuffers]);
}

const icoBuffer = createIco([
  { width: 16, height: 16, buffer: renderedBuffers[16] },
  { width: 32, height: 32, buffer: renderedBuffers[32] },
  { width: 48, height: 48, buffer: renderedBuffers[48] },
]);

for (const target of ['public/favicon.ico', 'app/favicon.ico', 'legacy-site/favicon.ico']) {
  const fullTarget = path.join(root, target);
  fs.mkdirSync(path.dirname(fullTarget), { recursive: true });
  fs.writeFileSync(fullTarget, icoBuffer);
  console.log(`Saved ${target} (ICO, ${icoBuffer.length} bytes)`);
}

// Copy SVG to legacy-site as well
fs.copyFileSync(svgPath, path.join(root, 'legacy-site', 'favicon.svg'));
console.log('Synced public/favicon.svg to legacy-site/favicon.svg');

console.log('\n--- 3. Creating Web App Manifest (site.webmanifest & manifest.json) ---');

const webManifest = {
  name: "Tranquil Terrace Galle",
  short_name: "Tranquil Terrace",
  description: "Two private luxury pool villas in Karapitiya, Galle, Sri Lanka for couples.",
  icons: [
    {
      src: "/favicon-48x48.png",
      sizes: "48x48",
      type: "image/png"
    },
    {
      src: "/favicon-96x96.png",
      sizes: "96x96",
      type: "image/png"
    },
    {
      src: "/favicon-192x192.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "/android-chrome-192x192.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "/android-chrome-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable"
    }
  ],
  start_url: "/",
  display: "standalone",
  background_color: "#141615",
  theme_color: "#183D32"
};

const manifestJson = JSON.stringify(webManifest, null, 2);
for (const p of [
  'public/site.webmanifest',
  'public/manifest.json',
  'legacy-site/site.webmanifest',
  'legacy-site/manifest.json'
]) {
  fs.writeFileSync(path.join(root, p), manifestJson, 'utf8');
  console.log(`Saved ${p}`);
}

console.log('\n--- 4. Updating HTML Pages ---');

const faviconHeadSnippet = `  <!-- Favicons & Mobile Web App Metadata -->
  <link rel="icon" href="/favicon.ico" sizes="any"/>
  <link rel="shortcut icon" href="/favicon.ico"/>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png"/>
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png"/>
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png"/>
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
  <link rel="manifest" href="/site.webmanifest"/>`;

const pageFiles = [
  'index.html',
  'villas.html',
  'experiences.html',
  'gallery.html',
  'explore-galle.html',
  'contact.html',
  'privacy-policy.html',
  'terms-and-conditions.html',
  '404.html'
];

const updatedPageContents = {};

for (const fileName of pageFiles) {
  const pubPath = path.join(root, 'public', fileName);
  if (!fs.existsSync(pubPath)) {
    console.warn(`File ${fileName} not found in public/`);
    continue;
  }

  let html = fs.readFileSync(pubPath, 'utf8');

  // Strip existing icon / manifest link tags
  html = html.replace(/\s*<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*\/?>/gi, '');
  html = html.replace(/\s*<link[^>]*rel=["']apple-touch-icon["'][^>]*\/?>/gi, '');
  html = html.replace(/\s*<link[^>]*rel=["']manifest["'][^>]*\/?>/gi, '');

  // Insert the clean favicon tags right after style.css link or after canonical link or before </head>
  if (html.includes('href="style.css" rel="stylesheet"/>')) {
    html = html.replace(
      'href="style.css" rel="stylesheet"/>',
      `href="style.css" rel="stylesheet"/>\n${faviconHeadSnippet}`
    );
  } else if (html.includes('href="style.css"')) {
    html = html.replace(
      /(<link[^>]*href="style\.css"[^>]*>)/i,
      `$1\n${faviconHeadSnippet}`
    );
  } else {
    html = html.replace('</head>', `${faviconHeadSnippet}\n</head>`);
  }

  fs.writeFileSync(pubPath, html, 'utf8');
  const legacyPath = path.join(root, 'legacy-site', fileName);
  if (fs.existsSync(path.dirname(legacyPath))) {
    fs.writeFileSync(legacyPath, html, 'utf8');
  }

  updatedPageContents[fileName] = html;
  console.log(`Updated favicon tags in ${fileName} (public/ & legacy-site/)`);
}

console.log('\n--- 5. Regenerating lib/pages-content.ts ---');

const pagesContentCode = `// Generated pages module - zero runtime filesystem access to ensure 100% Vercel & Turbopack build compatibility
export const pages: Record<string, string> = ${JSON.stringify(updatedPageContents, null, 2)};

export function getPageContent(name: string): string | undefined {
  if (name === "" || name === "index" || name === "index.html") {
    return pages["index.html"];
  }
  const clean = name.endsWith(".html") ? name : \`\${name}.html\`;
  return pages[clean] || pages[name];
}
`;

fs.writeFileSync(path.join(root, 'lib', 'pages-content.ts'), pagesContentCode, 'utf8');
console.log('Successfully generated lib/pages-content.ts');

console.log('\n--- 6. Updating app/layout.tsx ---');

const layoutPath = path.join(root, 'app', 'layout.tsx');
let layoutCode = fs.readFileSync(layoutPath, 'utf8');

const updatedMetadataIcons = `export const metadata: Metadata = {
  title: "Tranquil Terrace Galle",
  description: "Private villa reservations and management.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};`;

layoutCode = layoutCode.replace(/export const metadata: Metadata = \{[\s\S]*?\};\n/m, `${updatedMetadataIcons}\n`);
fs.writeFileSync(layoutPath, layoutCode, 'utf8');
console.log('Successfully updated app/layout.tsx');

console.log('\nAll favicon assets, HTML tags, and metadata updated cleanly!');
