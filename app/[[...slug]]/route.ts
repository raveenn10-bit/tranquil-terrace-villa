import { getPageContent } from "@/lib/pages-content";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: any,
) {
  const params = await context?.params;
  const slug = params?.slug;
  const key = Array.isArray(slug) ? slug.join("/") : (slug || "");

  // Direct static fallbacks for search engine crawlers
  if (key === "robots.txt") {
    try {
      const filePath = path.join(process.cwd(), "public", "robots.txt");
      if (fs.existsSync(filePath)) {
        const text = fs.readFileSync(filePath, "utf8");
        return new Response(text, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600, must-revalidate",
          },
        });
      }
    } catch {}
  }

  if (key === "sitemap.xml") {
    try {
      const filePath = path.join(process.cwd(), "public", "sitemap.xml");
      if (fs.existsSync(filePath)) {
        const xml = fs.readFileSync(filePath, "utf8");
        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600, must-revalidate",
          },
        });
      }
    } catch {}
  }

  // Direct static fallbacks for favicons and web manifests
  if (
    key === "site.webmanifest" ||
    key === "manifest.json" ||
    key === "favicon.ico" ||
    key.startsWith("favicon") ||
    key.startsWith("android-chrome") ||
    key === "apple-touch-icon.png"
  ) {
    try {
      const filePath = path.join(process.cwd(), "public", key);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(key).toLowerCase();
        const mimeTypes: Record<string, string> = {
          ".ico": "image/x-icon",
          ".png": "image/png",
          ".svg": "image/svg+xml",
          ".webmanifest": "application/manifest+json",
          ".json": "application/json",
        };
        const contentType = mimeTypes[ext] || "application/octet-stream";
        const buf = fs.readFileSync(filePath);
        return new Response(buf, {
          headers: {
            "content-type": contentType,
            "cache-control": "public, max-age=86400, must-revalidate",
          },
        });
      }
    } catch {}
  }

  const fileName = key === "" ? "index.html" : (key.endsWith(".html") ? key : `${key}.html`);
  const html = getPageContent(fileName);

  if (!html) {
    const notFoundHtml = getPageContent("404.html");
    if (notFoundHtml) {
      return new Response(notFoundHtml, {
        status: 404,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-cache, no-store, must-revalidate",
          "x-content-type-options": "nosniff",
        },
      });
    }
    return new Response("Not found", { status: 404 });
  }

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
      "x-content-type-options": "nosniff",
    },
  });
}
