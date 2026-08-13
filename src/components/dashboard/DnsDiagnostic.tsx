"use client";

import Badge from "@/components/dashboard/Badge";
import { buildSummary, SUMMARY_TONE_CLASSES } from "@/lib/dns-check";
import { formatDateTimeFr } from "@/lib/format";
import { dnsRecordCheckStatusMeta } from "@/lib/status";
import type {
  DkimDnsRecordCheck,
  DomainDnsCheckResult,
  TxtDnsRecordCheck,
} from "@/lib/types";

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

/**
 * Panneau de diagnostic DNS. Contrôlé depuis `page.tsx` (état levé au niveau
 * de la fiche domaine) plutôt que géré en interne : le même résultat sert à
 * la fois à ce panneau et au bandeau du bouton « Vérifier maintenant »
 * (B14), et l'auto-lancement au premier affichage doit pouvoir peupler ce
 * panneau sans passer par un clic sur son propre bouton.
 */
export default function DnsDiagnostic({
  result,
  loading,
  error,
  onRun,
}: {
  result: DomainDnsCheckResult | null;
  loading: boolean;
  error: string | null;
  onRun: () => void;
}) {
  const summary = result ? buildSummary(result) : null;

  return (
    <section className="mb-8">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-base font-semibold text-[#EDEEF0]">
          Diagnostic DNS
        </h2>
        <button
          type="button"
          onClick={onRun}
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
            className={`rounded-lg border px-3.5 py-2.5 text-[13.5px] leading-relaxed text-pretty ${SUMMARY_TONE_CLASSES[summary.tone]}`}
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
