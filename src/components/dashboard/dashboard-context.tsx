"use client";

import { createContext, useContext } from "react";
import type { User } from "@/lib/types";

/**
 * Identité du compte connecté, déjà chargée et vérifiée par le garde du
 * layout (`/v1/auth/me`) — partagée avec les pages du tableau de bord pour
 * éviter un second appel réseau quand elles ont besoin, par exemple, de
 * savoir si l'adresse email est confirmée (`emailVerifiedAt`).
 */
export const DashboardUserContext = createContext<User | null>(null);

export function useDashboardUser(): User {
  const user = useContext(DashboardUserContext);
  if (!user) {
    throw new Error(
      "useDashboardUser doit être utilisé sous DashboardLayout, une fois l'utilisateur chargé."
    );
  }
  return user;
}
