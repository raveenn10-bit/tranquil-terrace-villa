import { getPageContent } from "@/lib/pages-content";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: any,
) {
  const params = await context?.params;
  const slug = params?.slug;
  const key = Array.isArray(slug) ? slug.join("/") : (slug || "");
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
