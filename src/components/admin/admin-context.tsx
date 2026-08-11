"use client";

import { createContext, useContext } from "react";

interface AdminPendingCountValue {
  /** `null` tant que le premier chargement n'a pas abouti. */
  pendingCount: number | null;
  /** Recharge le compteur — à appeler après chaque approbation/rejet. */
  refreshPendingCount: () => void;
}

/**
 * Compteur de demandes de recharge en attente, partagé entre le layout admin
 * (qui le charge et l'affiche en pastille dans la nav) et les pages admin
 * (qui déclenchent son rafraîchissement après une action).
 */
export const AdminPendingCountContext = createContext<AdminPendingCountValue>({
  pendingCount: null,
  refreshPendingCount: () => {},
});

export function useAdminPendingCount(): AdminPendingCountValue {
  return useContext(AdminPendingCountContext);
}
