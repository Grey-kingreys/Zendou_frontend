export const adminNavItems = [
  { href: "/admin/recharges", label: "Recharges" },
  { href: "/admin/comptes", label: "Comptes" },
  { href: "/admin/statistiques", label: "Statistiques" },
] as const;

export function isAdminNavItemActive(pathname: string, href: string): boolean {
  return pathname.startsWith(href);
}
