import type { NextConfig } from "next";

// Origine de l'API (schema + hote + port), derivee de NEXT_PUBLIC_API_URL :
// http://localhost:4000 en dev, https://api.zendou.app en production. Elle
// sert a la fois a `connect-src` (le front appelle l'API en cross-origin) et
// a l'endpoint qui collecte les violations de CSP. Comme NEXT_PUBLIC_API_URL,
// la valeur est figee au build de l'image (voir Dockerfile).
const API_ORIGIN = new URL(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
).origin;

const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * Content-Security-Policy du site, servie pour l'instant en mode rapport.
 *
 * (a) Pourquoi `'unsafe-inline'` dans `script-src` : l'App Router injecte sur
 * CHAQUE page des scripts inline `self.__next_f.push(...)` (le flux RSC
 * serialise), et la landing porte en plus un bloc JSON-LD inline
 * (src/app/page.tsx). Les nonces sont la seule alternative propre, mais un
 * nonce doit etre unique par requete : Next.js ne peut donc l'injecter que
 * pendant un rendu dynamique, ce qui obligerait a passer TOUTES les pages en
 * rendu dynamique (voir node_modules/next/dist/docs/01-app/02-guides/
 * content-security-policy.md, section "Static vs Dynamic Rendering with
 * CSP"). On perdrait le prerendu de la landing et des pages /docs, qui sont
 * precisement les pages publiques ou il compte le plus. `'unsafe-inline'`
 * reste borne par le reste de la politique : `object-src 'none'`,
 * `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'` et une
 * liste blanche d'origines externes reduite a Cloudflare Turnstile.
 *
 * (b) Migration proposee vers les nonces, le jour ou on l'assume : generer un
 * nonce dans src/proxy.ts (`crypto.randomUUID()` en base64), le poser dans
 * l'en-tete `Content-Security-Policy` de la reponse ET dans un en-tete de
 * requete `x-nonce`, remplacer `'unsafe-inline'` par `'nonce-<valeur>'
 * 'strict-dynamic'`, et accepter le rendu dynamique de toutes les pages
 * (cout : plus de cache CDN sur la landing et les docs). Alternative sans
 * rendu dynamique : `experimental.sri` (hachages SRI calcules au build,
 * fonctionnalite experimentale, App Router uniquement), documentee dans le
 * meme guide.
 *
 * (c) Bascule en mode bloquant : apres 48 h en production sans violation
 * legitime dans le journal du backend (lignes `CspReport` alimentees par
 * POST /v1/csp-report), renommer l'en-tete
 * `Content-Security-Policy-Report-Only` en `Content-Security-Policy` sans
 * toucher a sa valeur.
 *
 * Hors production, `'unsafe-eval'` et les origines localhost/ws sont ajoutes
 * pour le HMR de `next dev` (React utilise `eval` en developpement pour
 * reconstruire les piles d'erreurs serveur). Jamais en production.
 */
function buildContentSecurityPolicy(): string {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "https://challenges.cloudflare.com",
  ];
  const connectSrc = [
    "'self'",
    API_ORIGIN,
    "https://challenges.cloudflare.com",
  ];

  if (!IS_PRODUCTION) {
    scriptSrc.push("'unsafe-eval'");
    connectSrc.push("ws://localhost:*", "http://localhost:*");
  }

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-src https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    `report-uri ${API_ORIGIN}/v1/csp-report`,
    "report-to csp-endpoint",
  ];

  return directives.join("; ");
}

const nextConfig: NextConfig = {
  // Sortie autonome pour l'image Docker (voir Dockerfile) : produit
  // .next/standalone avec un serveur node minimal + les dépendances tracées,
  // sans avoir besoin de node_modules complet à l'exécution.
  output: "standalone",

  // `x-powered-by: Next.js` ne sert qu'a annoncer la stack (et sa version
  // implicite) a un attaquant : aucun interet fonctionnel.
  poweredByHeader: false,

  // En-tetes de securite appliques a toutes les reponses servies par Next
  // (pages, assets statiques, routes de metadonnees).
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            // 2 ans + sous-domaines + eligible a la liste de preload des
            // navigateurs : plus aucune requete en clair vers zendou.app.
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            // Anti-clickjacking pour les navigateurs anciens ; le pendant
            // moderne est `frame-ancestors 'none'` dans la CSP.
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Origine seule vers les sites tiers, chemin complet en interne.
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Le site n'utilise aucune de ces API : on les coupe.
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            // Cible nommee du `report-to` de la CSP (API Reporting v1).
            key: "Reporting-Endpoints",
            value: `csp-endpoint="${API_ORIGIN}/v1/csp-report"`,
          },
          {
            // Mode rapport : les violations sont remontees mais rien n'est
            // bloque. Voir le commentaire de buildContentSecurityPolicy pour
            // la consigne de bascule.
            key: "Content-Security-Policy-Report-Only",
            value: buildContentSecurityPolicy(),
          },
        ],
      },
    ];
  },

  // Migration de domaine : zendou.kingreys.fr -> zendou.app.
  // Redirection permanente en préservant le chemin et la query string.
  // Ne concerne pas api.zendou.kingreys.fr (autre service, autre host).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "zendou.kingreys.fr" }],
        destination: "https://zendou.app/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
