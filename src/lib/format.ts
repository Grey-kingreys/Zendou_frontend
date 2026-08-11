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
