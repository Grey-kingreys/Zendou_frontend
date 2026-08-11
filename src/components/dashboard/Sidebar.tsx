"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavItemActive, navItems } from "./nav-items";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0A0B0C] px-4 py-6 sm:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[linear-gradient(150deg,#8AA4FF,#3D5CE8)] font-heading text-sm font-bold text-[#0B0B0C]">
          Z
        </div>
        <span className="font-heading text-base font-semibold tracking-[-0.02em] text-[#EDEEF0]">
          Zendou
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isNavItemActive(pathname, item.href);
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
