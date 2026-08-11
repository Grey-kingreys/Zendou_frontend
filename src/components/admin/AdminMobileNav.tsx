"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems, isAdminNavItemActive } from "./nav-items";
import { useAdminPendingCount } from "./admin-context";

/** Équivalent mobile de `AdminSidebar` — même liens, même accent ambre. */
export default function AdminMobileNav() {
  const pathname = usePathname();
  const { pendingCount } = useAdminPendingCount();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-[#F5A623]/[0.16] bg-[#0A0B0C] px-4 py-2 sm:hidden">
      {adminNavItems.map((item) => {
        const active = isAdminNavItemActive(pathname, item.href);
        const showBadge =
          item.href === "/admin/recharges" &&
          pendingCount !== null &&
          pendingCount > 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13.5px] transition-colors ${
              active
                ? "bg-[#F5A623]/[0.14] font-medium text-[#F5A623]"
                : "text-[#9BA1A8]"
            }`}
          >
            <span>{item.label}</span>
            {showBadge && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#F5A623] px-1.5 text-[11px] font-semibold text-[#0B0B0C]">
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
