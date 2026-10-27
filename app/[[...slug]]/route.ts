import home from "@/legacy-site/index.html?raw";
import villa from "@/legacy-site/villas.html?raw";
import experiences from "@/legacy-site/experiences.html?raw";
import gallery from "@/legacy-site/gallery.html?raw";
import explore from "@/legacy-site/explore-galle.html?raw";
import contact from "@/legacy-site/contact.html?raw";

const pages: Record<string, string> = {
  "": home,
  "index.html": home,
  "villas.html": villa,
  "experiences.html": experiences,
  "gallery.html": gallery,
  "explore-galle.html": explore,
  "contact.html": contact,
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await context.params;
  const key = (slug ?? []).join("/");
  const html = pages[key];
  if (!html) return new Response("Not found", { status: 404 });

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
      "x-content-type-options": "nosniff",
    },
  });
}
