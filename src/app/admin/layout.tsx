import type { Metadata } from "next";
import type { ReactNode } from "react";
import AdminLayoutClient from "./AdminLayoutClient";

/**
 * Server Component uniquement pour porter le `noindex` (l'export
 * `metadata` n'est supporté que dans les Server Components). La garde de
 * session + de rôle reste dans AdminLayoutClient, inchangée — voir ce
 * fichier pour le détail de la garde.
 *
 * ⚠️ Même raisonnement que src/app/dashboard/layout.tsx : la garde tourne
 * côté client, un robot qui ne rend pas le JS reçoit la coquille HTML
 * avant la redirection. `index: false, follow: false` s'applique à toutes
 * les routes filles (/admin/*) car aucune ne redéfinit son propre
 * `robots`.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
