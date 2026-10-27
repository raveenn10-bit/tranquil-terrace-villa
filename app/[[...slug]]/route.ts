import { getPageContent } from "@/lib/pages-content";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await context.params;
  const key = (slug ?? []).join("/");
  const html = getPageContent(key);

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
