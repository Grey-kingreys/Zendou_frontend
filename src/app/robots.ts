import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * `/dashboard` et `/admin` sont bloqués ici en complément du `noindex`
 * posé sur leurs layouts (src/app/dashboard/layout.tsx,
 * src/app/admin/layout.tsx) : `robots.txt` empêche le crawl, la balise
 * `noindex` empêche l'indexation d'une URL déjà connue par ailleurs
 * (lien externe, historique...). Les deux sont nécessaires — un robot qui
 * ignore `robots.txt` mais respecte le HTML reste couvert par le `noindex`,
 * et inversement un robot qui ne rend pas le JS et se contente de la
 * coquille reste bloqué en amont par `robots.txt`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
