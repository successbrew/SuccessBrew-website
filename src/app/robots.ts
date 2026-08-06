import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/sbh-1111", "/api", "/auth", "/account"],
    },
    host: "https://successbrew.in",
  };
}
