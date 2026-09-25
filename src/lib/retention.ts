/**
 * Miroir côté frontend de `backend/src/retention/retention.constants.ts`
 * (lot RET-12) : le journal des envois (`Email`) est purgé chaque jour au
 * delà de 6 mois civils, calculés sur `queuedAt`. Ce fichier ne pilote
 * aucune suppression, il sert uniquement à anticiper côté UI qu'une ligne
 * du grand livre (`CreditEntry`, motif `SEND`) n'a plus de détail
 * consultable à `/dashboard/emails/:publicId` une fois ce seuil dépassé
 * (lot RET-F) : le débit reste au grand livre (trace de paiement), mais le
 * lien vers le détail de l'email mènerait à un 404.
 *
 * Même durée, même calcul en mois civils (`setUTCMonth`) que le backend,
 * pour que le lien et la purge basculent au même moment. Si la constante
 * backend change, celle-ci doit changer avec elle.
 */
export const EMAIL_LOG_RETENTION_MONTHS = 6;

/**
 * Instant avant lequel une ligne `Email` a été purgée du journal, calculé à
 * partir de `now`. Copie fidèle de
 * `emailLogRetentionCutoff` (`backend/src/retention/retention.constants.ts`).
 */
export function emailLogRetentionCutoff(now: Date): Date {
  const cutoff = new Date(now.getTime());
  cutoff.setUTCMonth(cutoff.getUTCMonth() - EMAIL_LOG_RETENTION_MONTHS);
  return cutoff;
}

/**
 * Vrai si une entrée du grand livre datée de `entryCreatedAt` (date ISO,
 * `CreditEntry.createdAt`) pointe vers un email dont la ligne `Email` a
 * déjà été purgée du journal (lot RET-12). Le backend supprime les lignes
 * dont `queuedAt` est strictement antérieur au seuil (`lt: cutoff`) : une
 * entrée exactement à 6 mois pile n'est donc pas encore purgée.
 *
 * `entryCreatedAt` (date de l'écriture au grand livre) sert d'approximation
 * de `queuedAt` (date de mise en file de l'email) : les deux sont posées au
 * même instant par `emails.service.ts` lors de l'envoi, il n'y a pas de
 * dérive entre elles.
 */
export function isEmailLogEntryPurged(
  entryCreatedAt: string,
  now: Date = new Date()
): boolean {
  const entryDate = new Date(entryCreatedAt);
  return entryDate.getTime() < emailLogRetentionCutoff(now).getTime();
}
