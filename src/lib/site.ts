/**
 * URL publique du site — sert de base à `metadataBase`, aux URL canoniques,
 * au sitemap, à `robots.txt` et aux balises Open Graph / Twitter (via
 * `next/og`, qui a besoin d'une URL absolue pour résoudre les images
 * relatives).
 *
 * ⚠️ `NEXT_PUBLIC_SITE_URL` est une variable `NEXT_PUBLIC_*` : elle est
 * inlinée dans le bundle **au build**, exactement comme `NEXT_PUBLIC_API_URL`
 * (voir `frontend/Dockerfile` et `docs/DEPLOIEMENT-DOKPLOY.md` §5.2). Changer
 * de domaine impose donc un rebuild de l'image, pas un simple redémarrage.
 *
 * Repli sur le domaine de bêta tranché par le porteur le 12/08/2026
 * (`docs/plans/BACKLOG.md`, fiche B8) si la variable est absente — utile en
 * développement local et filet de sécurité si le build arg est oublié en
 * production (plutôt qu'une URL relative invalide dans les metadata).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://zendou.kingreys.fr"
).replace(/\/+$/, "");

export const SITE_NAME = "Zendou";
