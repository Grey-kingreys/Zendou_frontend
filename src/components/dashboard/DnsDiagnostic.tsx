"use client";

import { useState } from "react";
import Badge from "@/components/dashboard/Badge";
import {
  DnsCheckRateLimitError,
  fetchDomainDnsCheck,
  formatRetryAfterFr,
} from "@/lib/dns-check";
import { formatDateTimeFr } from "@/lib/format";
import { dnsRecordCheckStatusMeta } from "@/lib/status";
import { ApiError } from "@/lib/api";
import type {
  DkimDnsRecordCheck,
  DomainDnsCheckResult,
  TxtDnsRecordCheck,
} from "@/lib/types";

type SummaryTone = "success" | "waiting" | "issue";

const TONE_CLASSES: Record<SummaryTone, string> = {
  success: "border-[#35D07F]/25 bg-[#35D07F]/10 text-[#B7F5D3]",
  waiting: "border-[#5B7CFA]/30 bg-[#5B7CFA]/10 text-[#C7D3FF]",
  issue: "border-[#F5A623]/25 bg-[#F5A623]/10 text-[#F5D9A9]",
};

function buildSummary(result: DomainDnsCheckResult): {
  tone: SummaryTone;
  text: string;
} {
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

function DnsValue({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[11.5px] tracking-[0.02em] text-[#70767D] uppercase">
        {label}
      </p>
      <p className="min-w-0 font-mono text-[12.5px] break-all text-[#C5CACF]">
        {value ?? "Aucune valeur trouvée"}
      </p>
    </div>
  );
}

function DnsCheckRow({
  title,
  record,
}: {
  title: string;
  record: DkimDnsRecordCheck | TxtDnsRecordCheck;
}) {
  const meta = dnsRecordCheckStatusMeta(record.status);
  const message = "message" in record ? record.message : undefined;

  return (
    <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <Badge color={meta.color} label={meta.label} />
        <span className="min-w-0 truncate font-mono text-[12px] text-[#70767D]">
          {title}
        </span>
        {record.ttl !== null && (
          <span className="shrink-0 text-[11px] text-[#70767D]">
            TTL {record.ttl}s
          </span>
        )}
      </div>
      <p className="mb-3 min-w-0 font-mono text-[12.5px] break-all text-[#9BA1A8]">
        {record.name}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DnsValue label="Attendu" value={record.attendu} />
        <DnsValue label="Trouvé" value={record.trouve} />
      </div>
      {message && (
        <p className="mt-3 rounded-lg border border-[#F5A623]/25 bg-[#F5A623]/10 px-3.5 py-2.5 text-[13px] leading-relaxed text-[#F5D9A9] text-pretty">
          {message}
        </p>
      )}
    </div>
  );
}

export default function DnsDiagnostic({ domainId }: { domainId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DomainDnsCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDomainDnsCheck(domainId);
      setResult(data);
    } catch (err) {
      if (err instanceof DnsCheckRateLimitError) {
        setError(
          `Vous avez atteint la limite de vérifications (30 par heure). Réessayez dans ${formatRetryAfterFr(err.retryAfterSeconds)}.`
        );
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Impossible de joindre le serveur.");
      }
    } finally {
      setLoading(false);
    }
  }

  const summary = result ? buildSummary(result) : null;

  return (
    <section className="mb-8">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-base font-semibold text-[#EDEEF0]">
          3. Diagnostic DNS
        </h2>
        <button
          type="button"
          onClick={handleRun}
          disabled={loading}
          className="shrink-0 rounded-lg border border-white/[0.14] px-4 py-2.5 text-[13.5px] font-medium text-[#EDEEF0] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading
            ? "Vérification…"
            : result
              ? "Relancer le diagnostic"
              : "Lancer le diagnostic"}
        </button>
      </div>
      <p className="mb-4 text-[13.5px] text-[#9BA1A8] text-pretty">
        Interroge directement le DNS pour chaque enregistrement DKIM, SPF et
        DMARC, et repère les erreurs les plus fréquentes (proxy Cloudflare,
        domaine dupliqué, aplatissement CNAME). Limité à 30 vérifications par
        heure.
      </p>

      {error && (
        <p className="mb-4 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
          {error}
        </p>
      )}

      {result && summary && (
        <div className="flex flex-col gap-4">
          <div
            className={`rounded-lg border px-3.5 py-2.5 text-[13.5px] leading-relaxed text-pretty ${TONE_CLASSES[summary.tone]}`}
          >
            {summary.text}
          </div>
          <p className="text-[12px] text-[#70767D]">
            Vérifié le {formatDateTimeFr(result.checkedAt)}
          </p>

          <div>
            <h3 className="mb-3 text-[13.5px] font-semibold text-[#EDEEF0]">
              DKIM
            </h3>
            {result.dkim.length === 0 ? (
              <p className="rounded-lg border border-[#F5A623]/25 bg-[#F5A623]/10 px-3.5 py-2.5 text-[13.5px] text-[#F5D9A9]">
                Aucun jeton DKIM enregistré pour ce domaine.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {result.dkim.map((record) => (
                  <DnsCheckRow key={record.token} title="CNAME" record={record} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-[13.5px] font-semibold text-[#EDEEF0]">
              SPF
            </h3>
            <DnsCheckRow title="TXT" record={result.spf} />
          </div>

          <div>
            <h3 className="mb-3 text-[13.5px] font-semibold text-[#EDEEF0]">
              DMARC
            </h3>
            <DnsCheckRow title="TXT" record={result.dmarc} />
          </div>
        </div>
      )}
    </section>
  );
}
