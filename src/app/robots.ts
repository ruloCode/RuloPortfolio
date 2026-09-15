import { baseURL } from "@/app/resources";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The study platform is behind a session; the login page is noindex
        // on its own but there is no reason to spend crawl budget there.
        disallow: ["/dashboard", "/es/dashboard", "/login", "/es/login", "/api/", "/auth/"],
      },
    ],
    sitemap: `https://${baseURL}/sitemap.xml`,
  };
}
