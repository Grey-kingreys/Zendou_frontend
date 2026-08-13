"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { AdminPendingCountContext } from "@/components/admin/admin-context";
import { api } from "@/lib/api";
import type { AdminTopUpRequestItem, User } from "@/lib/types";

/**
 * Garde de session + de rôle pour l'espace admin (`/admin/*`).
 *
 * IMPORTANT — cette garde est purement cosmétique. Elle évite d'afficher une
 * interface admin à un compte qui n'en a pas l'usage, mais elle ne protège
 * rien : la vraie barrière est l'`AdminGuard` du backend
 * (backend/src/billing/admin/admin.guard.ts), qui renvoie 403 sur toutes les
 * routes `/v1/admin/*` pour tout compte dont le rôle n'est pas ADMIN. Un
 * client qui contournerait ce garde (devtools, appel direct à l'API...) se
 * heurterait de toute façon à ce 403 — le front ne fait que masquer une
 * interface qui ne lui servirait à rien.
 *
 * Vague 8 — confirmation obligatoire : un compte ADMIN dont l'email n'est
 * pas confirmé est renvoyé vers /confirmez-votre-email, exactement comme le
 * garde du tableau de bord (`dashboard/layout.tsx`). Décision explicite,
 * pas d'exemption pour les admins : un rôle ADMIN ne dispense pas de
 * prouver l'adresse — c'est justement l'adresse qui reçoit les alertes du
 * compte, une faute de frappe dessus serait aussi grave que pour un client.
 * La contrepartie (ne pas enfermer un admin dehors si son adresse est
 * fausse) se traite côté seed du compte admin (T15, backend — le compte
 * doit être créé déjà confirmé), pas par un contournement ici.
 *
 * Vague 10b — SEO : le `noindex` de cet espace vit dans le layout.tsx
 * parent (Server Component), pas ici, car l'export `metadata` n'est
 * supporté que côté serveur. Voir ce fichier pour le pourquoi.
 */
export default function AdminLayoutClient({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    api
      .get<User>("/v1/auth/me")
      .then((data) => {
        if (!active) return;
        if (data.role !== "ADMIN") {
          // Compte authentifié mais pas admin : renvoi silencieux vers son
          // propre espace, pas d'écran d'erreur.
          router.replace("/dashboard");
          return;
        }
        if (data.emailVerifiedAt === null) {
          // Admin authentifié mais pas encore confirmé : même garde que le
          // tableau de bord, aucune exemption de rôle (voir le commentaire
          // au-dessus du composant).
          router.replace("/confirmez-votre-email");
          return;
        }
        setUser(data);
        setChecking(false);
      })
      .catch(() => {
        if (!active) return;
        // 401 (pas connecté) ou erreur réseau/serveur : pas de session
        // confirmée, retour à la connexion.
        router.replace("/connexion");
      });

    return () => {
      active = false;
    };
  }, [router]);

  const refreshPendingCount = useCallback(() => {
    api
      .get<AdminTopUpRequestItem[]>("/v1/admin/topup-requests?status=PENDING")
      .then((data) => setPendingCount(data.length))
      .catch(() => {
        // La pastille est un confort d'affichage — une erreur ici ne doit
        // pas bloquer le reste de l'espace admin.
      });
  }, []);

  useEffect(() => {
    if (user) refreshPendingCount();
  }, [user, refreshPendingCount]);

  if (checking || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090A]">
        <p className="text-sm text-[#9BA1A8]">Chargement…</p>
      </div>
    );
  }

  return (
    <AdminPendingCountContext.Provider
      value={{ pendingCount, refreshPendingCount, adminUser: user }}
    >
      <div className="flex min-h-screen bg-[#08090A]">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar user={user} />
          <AdminMobileNav />
          <main className="flex-1 px-6 py-8 sm:px-8">{children}</main>
        </div>
      </div>
    </AdminPendingCountContext.Provider>
  );
}
