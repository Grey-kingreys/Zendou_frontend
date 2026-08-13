import type { Metadata } from "next";
import type { ReactNode } from "react";
import DashboardLayoutClient from "./DashboardLayoutClient";

/**
 * Server Component uniquement pour porter le `noindex` (l'export
 * `metadata` n'est supporté que dans les Server Components — voir
 * node_modules/next/dist/docs/01-app/03-api-reference/04-functions/
 * generate-metadata.md). La logique interactive (garde de session côté
 * client) reste dans DashboardLayoutClient, inchangée.
 *
 * ⚠️ Pourquoi ce `noindex` n'est pas cosmétique : la garde de session de
 * DashboardLayoutClient est **côté client** (elle tourne après hydratation).
 * Un robot qui ne rend pas le JS reçoit donc la coquille HTML du tableau de
 * bord **avant** la redirection vers /connexion. Sans `noindex`, une URL
 * privée (ex. /dashboard/emails) pourrait être indexée sous le titre du
 * site. `index: false, follow: false` sur ce layout s'applique à toutes les
 * routes filles (/dashboard/*) car aucune ne redéfinit son propre `robots`.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
