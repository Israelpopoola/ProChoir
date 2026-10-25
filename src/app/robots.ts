import type { MetadataRoute } from "next";

// Keep lyrics out of search engines — the site is for the choir.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
