import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const htmlFiles = [
  "index.html",
  "villas.html",
  "experiences.html",
  "gallery.html",
  "explore-galle.html",
  "contact.html",
];

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(publicDir, file), "utf-8");
  const regex = /<(?:a|button)[^>]+(?:whatsapp|wa\.me)[^>]*>[\s\S]*?<\/(?:a|button)>/gi;
  let match;
  console.log(`\n=== Checking ${file} ===`);
  while ((match = regex.exec(content)) !== null) {
    const text = match[0];
    const isOfficialGreen = text.includes("#25D366");
    const summary = text
      .replace(/<svg[\s\S]*?<\/svg>/, "[SVG]")
      .replace(/\s+/g, " ");
    console.log(`- Official Green: ${isOfficialGreen} | ${summary.slice(0, 120)}`);
  }
}
