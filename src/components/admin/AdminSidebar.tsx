"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems, isAdminNavItemActive } from "./nav-items";
import { useAdminPendingCount } from "./admin-context";

/**
 * Barre latérale de l'espace admin — délibérément distincte de celle de
 * l'espace client (accent ambre au lieu de bleu, badge « Admin ») pour
 * qu'on ne confonde jamais les deux contextes : « mes chiffres » contre
 * « ceux de tout le monde ».
 */
export default function AdminSidebar() {
  const pathname = usePathname();
  const { pendingCount } = useAdminPendingCount();

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-[#F5A623]/[0.16] bg-[#0A0B0C] px-4 py-6 sm:flex">
      <Link
        href="/admin/recharges"
        className="mb-8 flex items-center gap-2.5 px-2"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[linear-gradient(150deg,#FFC876,#F5A623)] font-heading text-sm font-bold text-[#0B0B0C]">
          Z
        </div>
        <span className="font-heading text-base font-semibold tracking-[-0.02em] text-[#EDEEF0]">
          Zendou
        </span>
        <span className="ml-auto rounded-full border border-[#F5A623]/40 bg-[#F5A623]/10 px-2 py-0.5 text-[11px] font-semibold tracking-[0.02em] text-[#F5A623]">
          Admin
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
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
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-[#F5A623]/[0.14] font-medium text-[#F5A623]"
                  : "text-[#9BA1A8] hover:text-[#EDEEF0]"
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
    </aside>
  );
}
