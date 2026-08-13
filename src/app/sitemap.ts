import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * La vraie surface SEO du produit est `/docs` (docs/plans/BACKLOG.md,
 * fiche B8) : le beachhead visé, ce sont des développeurs qui cherchent
 * « envoyer un email transactionnel », « API email Guinée », « alternative
 * Mailgun Afrique de l'Ouest ». Les 6 pages de documentation sont donc
 * toutes listées ici, à une priorité proche de la landing.
 *
 * `/connexion`, `/inscription`, `/confirmation` et
 * `/confirmez-votre-email` sont volontairement absentes : ce sont des
 * pages d'entonnoir ou de flux transitoire, pas du contenu à faire remonter
 * en recherche, et elles ne définissent pas de `canonical` propre (voir
 * ces pages) — les lister ici sans canonical serait incohérent.
 * `/dashboard` et `/admin` sont exclues pour la raison inverse : elles sont
 * en `noindex` (voir leurs layouts).
 */
const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/docs", priority: 0.9, changeFrequency: "monthly" },
  { path: "/docs/envoyer-un-email", priority: 0.9, changeFrequency: "monthly" },
  { path: "/docs/verifier-un-domaine", priority: 0.8, changeFrequency: "monthly" },
  { path: "/docs/cles-api", priority: 0.8, changeFrequency: "monthly" },
  { path: "/docs/facturation", priority: 0.7, changeFrequency: "monthly" },
  { path: "/docs/erreurs", priority: 0.7, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
