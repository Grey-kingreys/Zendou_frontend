export const adminNavItems = [
  { href: "/admin/recharges", label: "Recharges" },
] as const;

export function isAdminNavItemActive(pathname: string, href: string): boolean {
  return pathname.startsWith(href);
}
