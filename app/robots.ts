import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/api/calendar/",
          "/api/calendar/availability",
          "/assets/",
          "/images/",
          "/videos/",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/admin.html",
          "/api/admin/",
          "/api/auth/",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: [
          "/",
          "/assets/",
          "/images/",
          "/videos/",
        ],
      },
      {
        userAgent: "*",
        allow: [
          "/",
          "/api/calendar/",
          "/api/calendar/availability",
          "/assets/",
          "/images/",
          "/videos/",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/admin.html",
          "/api/admin/",
          "/api/auth/",
        ],
      },
    ],
    sitemap: "https://www.tranquilterracegalle.com/sitemap.xml",
  };
}
