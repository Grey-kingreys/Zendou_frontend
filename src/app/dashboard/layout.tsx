"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileNav from "@/components/dashboard/MobileNav";
import Topbar from "@/components/dashboard/Topbar";
import { DashboardUserContext } from "@/components/dashboard/dashboard-context";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    api
      .get<User>("/v1/auth/me")
      .then((data) => {
        if (!active) return;
        if (data.emailVerifiedAt === null) {
          // Compte pas encore confirmé : le tableau de bord reste fermé,
          // direction l'écran dédié (garde vague 8 — voir
          // /confirmez-votre-email). Ne pas appeler setChecking(false) ici :
          // l'écran de chargement reste affiché pendant la navigation.
          router.replace("/confirmez-votre-email");
          return;
        }
        setUser(data);
        setChecking(false);
      })
      .catch(() => {
        if (!active) return;
        // 401 (not logged in) or a network/server error: either way there is
        // no confirmed session, so send the user back to the login page.
        router.replace("/connexion");
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (checking || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090A]">
        <p className="text-sm text-[#9BA1A8]">Chargement…</p>
      </div>
    );
  }

  return (
    <DashboardUserContext.Provider value={user}>
      <div className="flex min-h-screen bg-[#08090A]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar user={user} />
          <MobileNav />
          <main className="flex-1 px-6 py-8 sm:px-8">{children}</main>
        </div>
      </div>
    </DashboardUserContext.Provider>
  );
}
