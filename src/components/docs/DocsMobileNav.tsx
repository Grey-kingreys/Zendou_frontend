"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNavItems, isDocsNavItemActive } from "./nav-items";

/**
 * Remplaçant mobile de `DocsSidebar` : bandeau horizontal qui scrolle,
 * mêmes liens. Pas de tiroir/hamburger, comme `dashboard/MobileNav`.
 */
export default function DocsMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-white/[0.06] bg-[#0A0B0C] px-4 py-2 sm:hidden">
      {docsNavItems.map((item) => {
        const active = isDocsNavItemActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[13.5px] transition-colors ${
              active
                ? "bg-white/[0.06] font-medium text-[#EDEEF0]"
                : "text-[#9BA1A8]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
