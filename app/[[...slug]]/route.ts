import fs from "node:fs";
import path from "node:path";

const pageFileMap: Record<string, string> = {
  "": "index.html",
  "index": "index.html",
  "index.html": "index.html",
  "villas": "villas.html",
  "villas.html": "villas.html",
  "experiences": "experiences.html",
  "experiences.html": "experiences.html",
  "gallery": "gallery.html",
  "gallery.html": "gallery.html",
  "explore-galle": "explore-galle.html",
  "explore-galle.html": "explore-galle.html",
  "contact": "contact.html",
  "contact.html": "contact.html",
};

const cache = new Map<string, string>();

function loadHtml(fileName: string): string | null {
  if (cache.has(fileName)) {
    return cache.get(fileName)!;
  }

  const candidateDirs = [
    path.join(process.cwd(), "public"),
    path.join(process.cwd(), "legacy-site"),
  ];

  for (const dir of candidateDirs) {
    const fullPath = path.join(dir, fileName);
    try {
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        cache.set(fileName, content);
        return content;
      }
    } catch {
      // Continue searching
    }
  }

  return null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await context.params;
  const key = (slug ?? []).join("/");
  const fileName = pageFileMap[key];

  if (!fileName) {
    return new Response("Not found", { status: 404 });
  }

  const html = loadHtml(fileName);
  if (!html) {
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
