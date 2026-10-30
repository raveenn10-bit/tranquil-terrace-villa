import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.tranquilterracegalle.com";
  const lastmod = "2026-10-30";

  return [
    {
      url: `${baseUrl}/`,
      lastModified: lastmod,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/villas.html`,
      lastModified: lastmod,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/experiences.html`,
      lastModified: lastmod,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact.html`,
      lastModified: lastmod,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery.html`,
      lastModified: lastmod,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/explore-galle.html`,
      lastModified: lastmod,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy.html`,
      lastModified: lastmod,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-and-conditions.html`,
      lastModified: lastmod,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
