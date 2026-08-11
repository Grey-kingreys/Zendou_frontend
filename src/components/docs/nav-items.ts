/**
 * Navigation de la section /docs. Même forme que
 * `components/dashboard/nav-items.ts` (label + href, actif dérivé du
 * pathname) pour rester cohérent avec le reste du produit.
 */
export const docsNavItems = [
  { href: "/docs", label: "Démarrage rapide" },
  { href: "/docs/envoyer-un-email", label: "Envoyer un email" },
  { href: "/docs/verifier-un-domaine", label: "Vérifier un domaine" },
  { href: "/docs/cles-api", label: "Clés API" },
  { href: "/docs/erreurs", label: "Erreurs" },
  { href: "/docs/facturation", label: "Facturation" },
] as const;

export function isDocsNavItemActive(pathname: string, href: string): boolean {
  return href === "/docs" ? pathname === href : pathname.startsWith(href);
}
