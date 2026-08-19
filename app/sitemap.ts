import type { MetadataRoute } from "next";

const siteUrl = "https://7era-platform.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/download", "/promotions", "/privacy", "/terms", "/responsible-gaming"];

  return routes.map((route, index) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: index === 0 ? 1 : 0.7,
  }));
}
