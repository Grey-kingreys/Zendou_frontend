"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/dashboard-context";
import { api, ApiError } from "@/lib/api";
import { EMAIL_STATUS_OPTIONS, emailStatusMeta } from "@/lib/status";
import type { ApiKeySummary, DomainSummary, EmailStatus } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000";

interface Overview {
  totalEmails: number;
  statusCounts: Record<EmailStatus, number>;
  domains: DomainSummary[];
  apiKeys: ApiKeySummary[];
}

export default function DashboardOverviewPage() {
  const user = useDashboardUser();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [totalResult, statusResults, domains, apiKeys] =
          await Promise.all([
            api.get<{ total: number }>("/v1/emails?limit=1"),
            Promise.all(
              EMAIL_STATUS_OPTIONS.map((option) =>
                api
                  .get<{ total: number }>(
                    `/v1/emails?status=${option.value}&limit=1`
                  )
                  .then((res) => [option.value, res.total] as const)
              )
            ),
            api.get<DomainSummary[]>("/v1/domains"),
            api.get<ApiKeySummary[]>("/v1/api-keys"),
          ]);

        if (!active) return;

        const statusCounts = Object.fromEntries(statusResults) as Record<
          EmailStatus,
          number
        >;

        setOverview({
          totalEmails: totalResult.total,
          statusCounts,
          domains,
          apiKeys,
        });
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Impossible de joindre le serveur."
        );
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-[960px]">
        <p className="rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
          {error}
        </p>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="mx-auto max-w-[960px]">
        <p className="text-sm text-[#9BA1A8]">Chargement…</p>
      </div>
    );
  }

  const verifiedDomains = overview.domains.filter(
    (d) => d.status === "VERIFIED"
  ).length;
  const activeKeys = overview.apiKeys.filter((k) => !k.revokedAt).length;
  const isEmpty =
    overview.totalEmails === 0 &&
    overview.domains.length === 0 &&
    overview.apiKeys.length === 0;

  return (
    <div className="mx-auto max-w-[960px]">
      <div className="mb-8">
        <h1 className="mb-1.5 font-heading text-2xl font-semibold text-[#EDEEF0]">
          Vue d’ensemble
        </h1>
        <p className="text-sm text-[#9BA1A8]">
          L’activité de votre compte Zendou, en un coup d’œil.
        </p>
      </div>

      {isEmpty ? (
        <FirstSteps confirmed={user.emailVerifiedAt !== null} />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Emails envoyés"
              value={overview.totalEmails}
              href="/dashboard/emails"
              linkLabel="Voir le journal"
            />
            <StatCard
              label="Domaines vérifiés"
              value={`${verifiedDomains} / ${overview.domains.length}`}
              href="/dashboard/domaines"
              linkLabel="Gérer les domaines"
            />
            <StatCard
              label="Clés API actives"
              value={`${activeKeys} / ${overview.apiKeys.length}`}
              href="/dashboard/cles-api"
              linkLabel="Gérer les clés"
            />
          </div>

          {overview.totalEmails > 0 && (
            <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-6">
              <h2 className="mb-4 font-heading text-base font-semibold text-[#EDEEF0]">
                Répartition par statut
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {EMAIL_STATUS_OPTIONS.map((option) => {
                  const count = overview.statusCounts[option.value] ?? 0;
                  if (count === 0) return null;
                  const meta = emailStatusMeta(option.value);
                  return (
                    <div
                      key={option.value}
                      className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${DOT_CLASSES[meta.color]}`}
                      />
                      <span className="text-[13px] text-[#C5CACF]">
                        {meta.label}
                      </span>
                      <span className="font-mono text-[13px] text-[#EDEEF0]">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const DOT_CLASSES: Record<string, string> = {
  green: "bg-[#35D07F]",
  orange: "bg-[#F5A623]",
  red: "bg-[#E5484D]",
  gray: "bg-[#70767D]",
  blue: "bg-[#5B7CFA]",
};

function StatCard({
  label,
  value,
  href,
  linkLabel,
}: {
  label: string;
  value: string | number;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-6">
      <p className="mb-2 text-[13px] text-[#9BA1A8]">{label}</p>
      <p className="mb-4 font-heading text-[30px] font-semibold tracking-[-0.02em] text-[#EDEEF0]">
        {value}
      </p>
      <Link
        href={href}
        className="mt-auto text-[13px] font-medium text-[#8AA4FF]"
      >
        {linkLabel} →
      </Link>
    </div>
  );
}

function FirstSteps({ confirmed }: { confirmed: boolean }) {
  return (
    <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-8">
      <h2 className="mb-1.5 font-heading text-lg font-semibold text-[#EDEEF0]">
        Premiers pas
      </h2>
      <p className="mb-6 text-[13.5px] text-[#9BA1A8]">
        Trois étapes pour envoyer votre premier email avec Zendou.
      </p>

      <ol className="mb-6 flex flex-col gap-4">
        <Step number={1} title="Vérifiez un domaine">
          Ajoutez votre domaine d’envoi et publiez les 3 enregistrements
          DKIM chez votre registrar.{" "}
          <Link
            href="/dashboard/domaines"
            className="font-medium text-[#8AA4FF]"
          >
            Ajouter un domaine
          </Link>
        </Step>
        <Step number={2} title="Créez une clé API">
          Générez une clé pour authentifier vos appels à l’API d’envoi.{" "}
          <Link
            href="/dashboard/cles-api"
            className="font-medium text-[#8AA4FF]"
          >
            Créer une clé
          </Link>
        </Step>
        <Step number={3} title="Envoyez un premier email">
          {confirmed ? (
            "Un simple appel REST suffit :"
          ) : (
            <>
              Confirmez d’abord votre adresse email : tant que ce
              n’est pas fait, l’API refuse les envois avec une erreur 403.
              Utilisez le bandeau en haut de page pour renvoyer le lien de
              confirmation. Une fois confirmé, un simple appel REST suffit :
            </>
          )}
        </Step>
      </ol>

      <div className="overflow-hidden rounded-[12px] border border-white/[0.09] bg-[#0E1013]">
        <pre className="m-0 overflow-x-auto px-5 py-4 font-mono text-[12.5px] leading-[1.85] text-[#C5CACF]">
          {`curl -X POST ${API_BASE_URL}/v1/emails \\
  -H "Authorization: Bearer <votre_clé_api>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "no-reply@votre-domaine.gn",
    "to": "destinataire@exemple.gn",
    "subject": "Bienvenue",
    "html": "<p>Premier envoi via Zendou.</p>"
  }'`}
        </pre>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-3.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] font-mono text-[12px] text-[#8AA4FF]">
        {number}
      </span>
      <div className="text-[13.5px] leading-relaxed text-[#9BA1A8]">
        <span className="mb-0.5 block font-medium text-[#C5CACF]">
          {title}
        </span>
        {children}
      </div>
    </li>
  );
}
