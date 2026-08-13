/** Formatte une date/heure ISO en français (ex : "11 août 2026, 18:32"). */
export function formatDateTimeFr(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/**
 * Formatte une date/heure ISO en français, en format court numérique
 * (ex : "11/08/2026, 21:43"). Utile dans les colonnes de tableau serrées où
 * `formatDateTimeFr` (« 11 août 2026, 21:43 ») prend trop de place.
 */
export function formatDateTimeShortFr(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const datePart = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${datePart}, ${timePart}`;
}

/** Formatte une date ISO en français, sans l'heure (ex : "11 août 2026"). */
export function formatDateFr(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
    date
  );
}

/** Formatte un entier avec les séparateurs de milliers à la française. */
export function formatNumberFr(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

/** Formatte un montant en GNF à la française (ex : "25 000 GNF"). */
export function formatGnf(value: number): string {
  return `${formatNumberFr(value)} GNF`;
}

/**
 * Accorde un mot (ou une expression) au singulier ou au pluriel selon
 * `count` — piège classique en français : l'accord après zéro suit la même
 * règle que le pluriel normal ("0 email", jamais "0 emails"). `plural` peut
 * être omis quand un simple "s" suffit.
 */
export function pluralizeFr(
  count: number,
  singular: string,
  plural: string = `${singular}s`
): string {
  return count > 1 ? plural : singular;
}
