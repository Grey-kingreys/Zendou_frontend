"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavItemActive, navItems } from "./nav-items";

/**
 * Mobile replacement for the sidebar: a simple, non-collapsible horizontal
 * strip of the same nav links (no hamburger / drawer, per spec).
 */
export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-white/[0.06] bg-[#0A0B0C] px-4 py-2 sm:hidden">
      {navItems.map((item) => {
        const active = isNavItemActive(pathname, item.href);
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
