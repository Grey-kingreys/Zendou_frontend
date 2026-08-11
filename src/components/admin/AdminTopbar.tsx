"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export default function AdminTopbar({ user }: { user: User }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await api.post("/v1/auth/logout");
    } catch {
      // Même logique que le Topbar client : pas de récupération utile côté
      // front si la requête échoue, on renvoie vers la connexion.
    } finally {
      router.push("/connexion");
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-[#F5A623]/[0.16] px-6 py-4 sm:px-8">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[linear-gradient(150deg,#FFC876,#F5A623)] font-heading text-xs font-bold text-[#0B0B0C] sm:hidden">
          Z
        </div>
        <span className="truncate text-sm text-[#9BA1A8]">{user.email}</span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-lg border border-white/[0.14] px-3.5 py-2 text-[13.5px] font-medium text-[#EDEEF0] transition-colors hover:border-white/[0.28]"
        >
          Espace client
        </Link>
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
