"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { formatDateTimeFr, formatNumberFr, pluralizeFr } from "@/lib/format";
import { EMAIL_STATUS_OPTIONS, emailStatusMeta } from "@/lib/status";
import type { AdminEmailStats, AdminPlatformCounts } from "@/lib/types";

const PERIODS: {
  key: "today" | "last7d" | "last30d" | "total";
  label: string;
}[] = [
  { key: "today", label: "Aujourd’hui" },
  { key: "last7d", label: "7 derniers jours" },
  { key: "last30d", label: "30 derniers jours" },
  { key: "total", label: "Depuis le début" },
];

/** Même palette que la répartition par statut de `/dashboard` (B_home). */
const DOT_CLASSES: Record<string, string> = {
  green: "bg-[#35D07F]",
  orange: "bg-[#F5A623]",
  red: "bg-[#E5484D]",
  gray: "bg-[#70767D]",
  blue: "bg-[#5B7CFA]",
};

function fetchEmailStats(): Promise<AdminEmailStats> {
  return api.get<AdminEmailStats>("/v1/admin/stats/emails");
}

export default function AdminStatistiquesPage() {
  const [stats, setStats] = useState<AdminEmailStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchEmailStats()
      .then((data) => {
        if (!active) return;
        setStats(data);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 403) {
          setError("Accès refusé.");
        } else if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Impossible de joindre le serveur.");
        }
      });

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

  if (!stats) {
    return (
      <div className="mx-auto max-w-[960px]">
        <p className="text-sm text-[#9BA1A8]">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[960px]">
      <div className="mb-6">
        <h1 className="mb-1.5 font-heading text-2xl font-semibold text-[#EDEEF0]">
          Statistiques
        </h1>
        <p className="text-sm text-[#9BA1A8]">
          {formatNumberFr(stats.total.all)}{" "}
          {pluralizeFr(stats.total.all, "email", "emails")} au total sur la
          plateforme, système et client confondus.
        </p>
      </div>

      {/*
       * Règle qui a présidé à la conception du backend : jamais un seul
       * total ambigu. Ce bandeau l'explique une fois, la suite (tableau +
       * répartition par statut) ne montre plus jamais `all` sans `system`
       * et `client` juste à côté.
       */}
      <div className="mb-8 rounded-2xl border border-[#5B7CFA]/25 bg-[linear-gradient(180deg,rgba(91,124,250,0.08),rgba(91,124,250,0.01))] p-5">
        <p className="text-[13.5px] leading-relaxed text-[#C5CACF] text-pretty">
          <span className="font-medium text-[#EDEEF0]">
            Total = Système + Client
          </span>
          , sur chaque ligne ci-dessous. « Système » désigne les emails que
          Zendou envoie lui-même (confirmations d’adresse) ; « Client »
          désigne les emails envoyés par vos utilisateurs via l’API. Ce total
          inclut donc le système — contrairement au compteur « Envois »
          affiché sur chaque fiche compte, qui l’exclut délibérément. Ne
          soyez pas surpris si les deux chiffres diffèrent.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 font-heading text-base font-semibold text-[#EDEEF0]">
          Envois par période
        </h2>
        {/*
         * Tableau de statistiques compact (4 lignes × 4 colonnes) mais
         * toujours dans `overflow-x-auto` : patron déjà utilisé sur
         * `/dashboard/domaines/[id]` pour ne jamais faire déborder la page
         * à 320/375px, même si ce tableau-ci tient largement en pratique.
         */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0C0D0F]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
                  <th className="px-4 py-3 font-medium">Période</th>
                  <th className="px-3 py-3 font-medium whitespace-nowrap">
                    Total
                  </th>
                  <th className="px-3 py-3 font-medium whitespace-nowrap">
                    Système
                  </th>
                  <th className="px-3 py-3 font-medium whitespace-nowrap">
                    Client
                  </th>
                </tr>
              </thead>
              <tbody>
                {PERIODS.map(({ key, label }) => {
                  const counts: AdminPlatformCounts = stats[key];
                  return (
                    <tr
                      key={key}
                      className="border-b border-white/[0.05] last:border-b-0"
                    >
                      <td className="px-4 py-3.5 font-medium whitespace-nowrap text-[#EDEEF0]">
                        {label}
                      </td>
                      <td className="px-3 py-3.5 font-mono whitespace-nowrap text-[#EDEEF0]">
                        {formatNumberFr(counts.all)}
                      </td>
                      <td className="px-3 py-3.5 font-mono whitespace-nowrap text-[#9BA1A8]">
                        {formatNumberFr(counts.system)}
                      </td>
                      <td className="px-3 py-3.5 font-mono whitespace-nowrap text-[#9BA1A8]">
                        {formatNumberFr(counts.client)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-1.5 font-heading text-base font-semibold text-[#EDEEF0]">
          Répartition par statut
        </h2>
        <p className="mb-4 text-[13px] text-[#9BA1A8]">
          Historique complet de la plateforme, système inclus.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {EMAIL_STATUS_OPTIONS.map((option) => {
            const meta = emailStatusMeta(option.value);
            const count = stats.byStatus[option.value] ?? 0;
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
                  {formatNumberFr(count)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <p className="text-[12px] text-[#70767D]">
        Généré le {formatDateTimeFr(stats.generatedAt)}.
      </p>
    </div>
  );
}
