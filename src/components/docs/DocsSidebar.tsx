"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNavItems, isDocsNavItemActive } from "./nav-items";

/**
 * Sidebar desktop de la doc. Cachée en dessous de `sm`, où `DocsMobileNav`
 * prend le relais (même liste de liens, en bandeau horizontal).
 */
export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-white/[0.06] px-4 py-8 sm:flex">
      <nav className="sticky top-8 flex flex-col gap-1">
        {docsNavItems.map((item) => {
          const active = isDocsNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-white/[0.06] font-medium text-[#EDEEF0]"
                  : "text-[#9BA1A8] hover:text-[#EDEEF0]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
