export const navItems = [
  { href: "/dashboard", label: "Vue d'ensemble" },
  { href: "/dashboard/emails", label: "Emails" },
  { href: "/dashboard/domaines", label: "Domaines" },
  { href: "/dashboard/cles-api", label: "Clés API" },
  { href: "/dashboard/facturation", label: "Facturation" },
] as const;

export function isNavItemActive(pathname: string, href: string): boolean {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}
