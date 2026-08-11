"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export default function Topbar({ user }: { user: User }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await api.post("/v1/auth/logout");
    } catch {
      // Even if the request fails, there is no useful recovery client-side —
      // send the user back to the login page regardless.
    } finally {
      router.push("/connexion");
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 sm:px-8">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[linear-gradient(150deg,#8AA4FF,#3D5CE8)] font-heading text-xs font-bold text-[#0B0B0C] sm:hidden">
          Z
        </div>
        <Link
          href="/dashboard/profil"
          className="truncate text-sm text-[#9BA1A8] transition-colors hover:text-[#EDEEF0]"
        >
          {user.email}
        </Link>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className="rounded-lg border border-[#F5A623]/30 bg-[#F5A623]/10 px-3.5 py-2 text-[13.5px] font-medium text-[#F5A623] transition-opacity hover:opacity-90"
          >
            Espace admin
          </Link>
        )}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-lg border border-white/[0.14] px-3.5 py-2 text-[13.5px] font-medium text-[#EDEEF0] transition-opacity disabled:opacity-60"
        >
          {loggingOut ? "Déconnexion…" : "Déconnexion"}
        </button>
      </div>
    </header>
  );
}
