import type { ReactNode } from "react";

/**
 * Layout serveur minimal, present uniquement pour porter `dynamic` :
 * la page est un Client Component, qui ne peut pas exporter cette option.
 * Aucune page d'authentification ne doit etre servie depuis un cache CDN de
 * longue duree, ou une reponse construite pour un visiteur serait rejouee
 * pour les suivants.
 */
export const dynamic = "force-dynamic";

export default function InscriptionLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
