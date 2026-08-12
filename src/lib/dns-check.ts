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
