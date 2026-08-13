import { ApiError } from "./api";
import type { DomainDnsCheckResult } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000";

/**
 * Levée quand `GET /v1/domains/:id/dns-check` répond 429 : porte le délai
 * d'attente en secondes (en-tête `Retry-After`, avec repli sur le champ
 * `retryAfter` du corps JSON).
 *
 * Appel en `fetch` direct plutôt que via `api.get` : `ApiError` ne porte que
 * `status`/`message`, pas les en-têtes de réponse, or c'est justement le
 * `Retry-After` qu'il faut lire ici pour afficher un délai précis.
 */
export class DnsCheckRateLimitError extends Error {
  retryAfterSeconds: number | null;

  constructor(retryAfterSeconds: number | null) {
    super("dns-check-rate-limited");
    this.name = "DnsCheckRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export async function fetchDomainDnsCheck(
  domainId: string
): Promise<DomainDnsCheckResult> {
  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/v1/domains/${domainId}/dns-check`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch {
    throw new Error("network-error");
  }

  if (response.status === 429) {
    const header = response.headers.get("Retry-After");
    let retryAfter: number | null = header !== null ? Number(header) : null;
    if (retryAfter === null || Number.isNaN(retryAfter)) {
      try {
        const body = (await response.json()) as { retryAfter?: unknown };
        retryAfter =
          typeof body.retryAfter === "number" ? body.retryAfter : null;
      } catch {
        retryAfter = null;
      }
    }
    throw new DnsCheckRateLimitError(retryAfter);
  }

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // Pas de corps JSON exploitable : message générique ci-dessous.
    }
    const message =
      body &&
      typeof body === "object" &&
      "message" in body &&
      typeof (body as { message?: unknown }).message === "string"
        ? (body as { message: string }).message
        : `Erreur ${response.status}`;
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as DomainDnsCheckResult;
}

/** Formatte un délai en secondes en texte lisible (ex : « 2 min », « 45 s »). */
export function formatRetryAfterFr(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds) || seconds <= 0) {
    return "quelques instants";
  }
  if (seconds < 60) {
    const rounded = Math.ceil(seconds);
    return `${rounded} seconde${rounded >= 2 ? "s" : ""}`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes >= 2 ? "s" : ""}`;
}

// --- Classification du résultat du diagnostic (B14) ------------------------
//
// Extrait de `DnsDiagnostic.tsx` (posé en B2) pour être partagé avec le
// bouton « Vérifier maintenant » de la fiche domaine : les deux doivent
// raconter la même histoire pour la même question, jamais deux logiques
// divergentes.

export type SummaryTone = "success" | "waiting" | "issue";

export interface DnsDiagnosticSummary {
  tone: SummaryTone;
  text: string;
}

/**
 * Classe un résultat de diagnostic DNS en un message unique.
 *
 * Le diagnostic est informatif, SES reste seul juge du statut (posé en B2) :
 * 3 enregistrements DKIM corrects avec un statut SES encore `PENDING` est un
 * état normal (ton `waiting`, pas `issue`) — Amazon peut mettre jusqu'à 72 h
 * après la publication pour refaire son propre contrôle.
 */
export function buildSummary(result: DomainDnsCheckResult): DnsDiagnosticSummary {
  const hasDkimTokens = result.dkim.length > 0;
  const dkimAllOk =
    hasDkimTokens && result.dkim.every((record) => record.status === "ok");

  if (result.sesStatus === "VERIFIED") {
    return {
      tone: "success",
      text: "Domaine déjà vérifié par Amazon SES. Ces résultats sont là pour référence.",
    };
  }

  if (!hasDkimTokens) {
    return {
      tone: "issue",
      text: "Aucun jeton DKIM enregistré pour ce domaine : aucun des 3 enregistrements attendus n'a pu être vérifié.",
    };
  }

  if (dkimAllOk) {
    return {
      tone: "waiting",
      text: "Vos enregistrements sont corrects — en attente de la validation d'Amazon. Ce n'est pas une erreur : Amazon SES peut prendre jusqu'à 72 h après la publication pour refaire son contrôle.",
    };
  }

  return {
    tone: "issue",
    text: "Des écarts ont été détectés sur vos enregistrements DKIM : Amazon SES ne pourra pas vérifier le domaine tant qu'ils ne sont pas corrigés. Voir le détail ci-dessous.",
  };
}

/** Styles partagés entre le panneau de diagnostic et le bandeau « Vérifier maintenant ». */
export const SUMMARY_TONE_CLASSES: Record<SummaryTone, string> = {
  success: "border-[#35D07F]/25 bg-[#35D07F]/10 text-[#B7F5D3]",
  waiting: "border-[#5B7CFA]/30 bg-[#5B7CFA]/10 text-[#C7D3FF]",
  issue: "border-[#F5A623]/25 bg-[#F5A623]/10 text-[#F5D9A9]",
};
