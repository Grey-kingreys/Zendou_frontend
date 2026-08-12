"use client";

import { createContext, useContext } from "react";
import type { User } from "@/lib/types";

interface AdminPendingCountValue {
  /** `null` tant que le premier chargement n'a pas abouti. */
  pendingCount: number | null;
  /** Recharge le compteur — à appeler après chaque approbation/rejet. */
  refreshPendingCount: () => void;
  /**
   * Identité de l'admin connecté (déjà vérifiée par le garde du layout).
   * Sert aux pages admin à désactiver les actions qu'un admin ne peut pas
   * exercer sur son propre compte (se créditer, se suspendre) sans attendre
   * l'échec de l'appel API pour l'expliquer.
   */
  adminUser: User | null;
}

/**
 * Compteur de demandes de recharge en attente et identité de l'admin
 * connecté, partagés entre le layout admin (qui les charge) et les pages
 * admin (qui en ont besoin pour l'affichage et les gardes côté client).
 */
export const AdminPendingCountContext = createContext<AdminPendingCountValue>({
  pendingCount: null,
  refreshPendingCount: () => {},
  adminUser: null,
});

export function useAdminPendingCount(): AdminPendingCountValue {
  return useContext(AdminPendingCountContext);
}
