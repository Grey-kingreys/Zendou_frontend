import type { ReactNode } from "react";

/**
 * Layout serveur minimal, present uniquement pour porter `dynamic` :
 * la page lit un jeton de confirmation dans l'URL.
 * Aucune page d'authentification ne doit etre servie depuis un cache CDN de
 * longue duree, ou une reponse construite pour un visiteur serait rejouee
 * pour les suivants.
 */
export const dynamic = "force-dynamic";

export default function ConfirmationLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
