"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Badge from "@/components/dashboard/Badge";
import { api, ApiError } from "@/lib/api";
import { formatDateTimeFr } from "@/lib/format";
import { EMAIL_STATUS_OPTIONS, emailStatusMeta } from "@/lib/status";
import type { EmailStatus, PaginatedEmails } from "@/lib/types";

const LIMIT = 25;

export default function DashboardEmailsPage() {
  const [status, setStatus] = useState<EmailStatus | "">("");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<PaginatedEmails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasFilters = Boolean(status || q || from || to);

  // Debounce le champ de recherche libre (~400 ms) avant de déclencher un
  // nouvel appel — évite une requête par frappe.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      setPage(1);
      setQ(qInput.trim());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [qInput]);

  useEffect(() => {
    let active = true;

    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("page", String(page));
    params.set("limit", String(LIMIT));

    api
      .get<PaginatedEmails>(`/v1/emails?${params.toString()}`)
      .then((data) => {
        if (!active) return;
        setResult(data);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Impossible de joindre le serveur."
        );
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [status, q, from, to, page]);

  return (
    <div className="mx-auto max-w-[1080px]">
      <div className="mb-8">
        <h1 className="mb-1.5 font-heading text-2xl font-semibold text-[#EDEEF0]">
          Emails
        </h1>
        <p className="text-sm text-[#9BA1A8]">
          Historique de vos envois et de leur statut de livraison.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-[#C5CACF]">
            Statut
          </label>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as EmailStatus | "");
              setPage(1);
              setLoading(true);
            }}
            className="rounded-lg border border-white/[0.09] bg-[#0E1013] px-3 py-2 text-[16px] text-[#EDEEF0] outline-none focus:border-[#5B7CFA]"
          >
            <option value="">Tous</option>
            {EMAIL_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[220px] flex-1">
          <label className="mb-1.5 block text-[12.5px] font-medium text-[#C5CACF]">
            Recherche
          </label>
          <input
            type="text"
            value={qInput}
            onChange={(event) => setQInput(event.target.value)}
            placeholder="Destinataire ou sujet…"
            className="w-full rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2 text-[16px] text-[#EDEEF0] placeholder:text-[#5E646B] outline-none focus:border-[#5B7CFA]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-[#C5CACF]">
            Du
          </label>
          <input
            type="date"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
              setLoading(true);
            }}
            className="rounded-lg border border-white/[0.09] bg-[#0E1013] px-3 py-2 text-[16px] text-[#EDEEF0] outline-none focus:border-[#5B7CFA]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-[#C5CACF]">
            Au
          </label>
          <input
            type="date"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
              setLoading(true);
            }}
            className="rounded-lg border border-white/[0.09] bg-[#0E1013] px-3 py-2 text-[16px] text-[#EDEEF0] outline-none focus:border-[#5B7CFA]"
          />
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
          {error}
        </p>
      )}

      {loading && !result && (
        <p className="text-sm text-[#9BA1A8]">Chargement…</p>
      )}

      {result && result.items.length === 0 && !hasFilters && (
        <div className="rounded-2xl border border-dashed border-white/[0.13] bg-white/[0.015] px-8 py-16 text-center">
          <h2 className="mb-2 font-heading text-lg font-semibold text-[#EDEEF0]">
            Aucun email envoyé pour l’instant
          </h2>
          <p className="mx-auto mb-4 max-w-[420px] text-sm leading-relaxed text-[#9BA1A8] text-pretty">
            Une fois votre premier email envoyé via l’API, il apparaîtra ici
            avec son statut de livraison.
          </p>
          <Link
            href="/#integration"
            className="text-sm font-medium text-[#8AA4FF]"
          >
            Voir la documentation d’intégration
          </Link>
        </div>
      )}

      {result && result.items.length === 0 && hasFilters && (
        <div className="rounded-2xl border border-dashed border-white/[0.13] bg-white/[0.015] px-8 py-16 text-center">
          <h2 className="mb-2 font-heading text-lg font-semibold text-[#EDEEF0]">
            Aucun résultat
          </h2>
          <p className="mx-auto max-w-[420px] text-sm leading-relaxed text-[#9BA1A8] text-pretty">
            Aucun email ne correspond à ces filtres. Essayez d’en retirer un.
          </p>
        </div>
      )}

      {result && result.items.length > 0 && (
        <>
          <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0C0D0F]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
                    <th className="px-5 py-3 font-medium">Destinataire</th>
                    <th className="px-5 py-3 font-medium">Sujet</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => {
                    const meta = emailStatusMeta(item.status);
                    return (
                      <tr
                        key={item.publicId}
                        className="border-b border-white/[0.05] last:border-b-0"
                      >
                        <td className="p-0">
                          <Link
                            href={`/dashboard/emails/${item.publicId}`}
                            className="block px-5 py-3.5 text-[#EDEEF0] hover:text-[#8AA4FF]"
                          >
                            {item.toAddress}
                          </Link>
                        </td>
                        <td className="p-0">
                          <Link
                            href={`/dashboard/emails/${item.publicId}`}
                            className="block max-w-[280px] truncate px-5 py-3.5 text-[#C5CACF]"
                          >
                            {item.subject}
                          </Link>
                        </td>
                        <td className="p-0">
                          <Link
                            href={`/dashboard/emails/${item.publicId}`}
                            className="block px-5 py-3.5"
                          >
                            <Badge color={meta.color} label={meta.label} />
                          </Link>
                        </td>
                        <td className="p-0">
                          <Link
                            href={`/dashboard/emails/${item.publicId}`}
                            className="block px-5 py-3.5 text-[#9BA1A8]"
                          >
                            {formatDateTimeFr(item.queuedAt)}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-[#9BA1A8]">
            <span>{result.total} email(s) au total</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setPage((p) => Math.max(1, p - 1));
                }}
                disabled={result.page <= 1}
                className="rounded-lg border border-white/[0.14] px-3 py-1.5 text-[12.5px] font-medium text-[#EDEEF0] transition-opacity disabled:opacity-40"
              >
                Précédent
              </button>
              <span>
                Page {result.page} sur {Math.max(1, result.totalPages)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setPage((p) => Math.min(result.totalPages, p + 1));
                }}
                disabled={result.page >= result.totalPages}
                className="rounded-lg border border-white/[0.14] px-3 py-1.5 text-[12.5px] font-medium text-[#EDEEF0] transition-opacity disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
