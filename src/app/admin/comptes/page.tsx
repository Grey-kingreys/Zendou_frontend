"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Badge from "@/components/dashboard/Badge";
import { api, ApiError } from "@/lib/api";
import { formatDateFr, formatNumberFr } from "@/lib/format";
import {
  ADMIN_ACCOUNT_ROLE_OPTIONS,
  ADMIN_ACCOUNT_STATUS_OPTIONS,
  adminAccountRoleMeta,
  adminAccountStatusMeta,
} from "@/lib/status";
import type {
  AdminAccountRole,
  AdminAccountStatus,
  PaginatedAdminUsers,
} from "@/lib/types";

const LIMIT = 25;

export default function AdminComptesPage() {
  const [status, setStatus] = useState<AdminAccountStatus | "">("");
  const [role, setRole] = useState<AdminAccountRole | "">("");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<PaginatedAdminUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasFilters = Boolean(status || role || q);

  // Debounce le champ de recherche libre (~400 ms) avant de déclencher un
  // nouvel appel — évite une requête par frappe (même logique que la page
  // Emails du dashboard client).
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
    if (role) params.set("role", role);
    if (q) params.set("q", q);
    params.set("page", String(page));
    params.set("limit", String(LIMIT));

    api
      .get<PaginatedAdminUsers>(`/v1/admin/users?${params.toString()}`)
      .then((data) => {
        if (!active) return;
        setResult(data);
        setError(null);
        setLoading(false);
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
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [status, role, q, page]);

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-8">
        <h1 className="mb-1.5 font-heading text-2xl font-semibold text-[#EDEEF0]">
          Comptes clients
        </h1>
        <p className="text-sm text-[#9BA1A8]">
          Recherchez un compte, filtrez par statut ou par rôle, puis ouvrez sa
          fiche pour ajuster son quota, son solde de crédits ou son accès.
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
              setStatus(event.target.value as AdminAccountStatus | "");
              setPage(1);
              setLoading(true);
            }}
            className="rounded-lg border border-white/[0.09] bg-[#0E1013] px-3 py-2 text-[13.5px] text-[#EDEEF0] outline-none focus:border-[#5B7CFA]"
          >
            <option value="">Tous</option>
            {ADMIN_ACCOUNT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-[#C5CACF]">
            Rôle
          </label>
          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value as AdminAccountRole | "");
              setPage(1);
              setLoading(true);
            }}
            className="rounded-lg border border-white/[0.09] bg-[#0E1013] px-3 py-2 text-[13.5px] text-[#EDEEF0] outline-none focus:border-[#5B7CFA]"
          >
            <option value="">Tous</option>
            {ADMIN_ACCOUNT_ROLE_OPTIONS.map((option) => (
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
            placeholder="Nom ou email…"
            className="w-full rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2 text-[13.5px] text-[#EDEEF0] placeholder:text-[#5E646B] outline-none focus:border-[#5B7CFA]"
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
            Aucun compte pour l’instant
          </h2>
        </div>
      )}

      {result && result.items.length === 0 && hasFilters && (
        <div className="rounded-2xl border border-dashed border-white/[0.13] bg-white/[0.015] px-8 py-16 text-center">
          <h2 className="mb-2 font-heading text-lg font-semibold text-[#EDEEF0]">
            Aucun résultat
          </h2>
          <p className="mx-auto max-w-[420px] text-sm leading-relaxed text-[#9BA1A8] text-pretty">
            Aucun compte ne correspond à ces filtres. Essayez d’en retirer un.
          </p>
        </div>
      )}

      {result && result.items.length > 0 && (
        <>
          {/*
           * >= md : tableau classique, en lecture seule (pas de bouton
           * d'action dans les lignes — toute la ligne mène à la fiche, comme
           * la liste des domaines côté client). 7 colonnes compactes tiennent
           * largement sous 1280px une fois la sidebar admin déduite, mais on
           * garde quand même le `overflow-x-auto` par prudence, à l'image des
           * autres tableaux admin. En dessous de `md`, cartes empilées.
           */}
          <div className="hidden overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0C0D0F] md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
                    <th className="px-4 py-3 font-medium">Compte</th>
                    <th className="px-3 py-3 font-medium whitespace-nowrap">
                      Rôle
                    </th>
                    <th className="px-3 py-3 font-medium whitespace-nowrap">
                      Statut
                    </th>
                    <th className="px-3 py-3 font-medium whitespace-nowrap">
                      Solde
                    </th>
                    <th className="px-3 py-3 font-medium whitespace-nowrap">
                      Envois (30 j)
                    </th>
                    <th className="px-3 py-3 font-medium whitespace-nowrap">
                      Quota/jour
                    </th>
                    <th className="px-3 py-3 font-medium whitespace-nowrap">
                      Inscription
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => {
                    const roleMeta = adminAccountRoleMeta(item.role);
                    const statusMeta = adminAccountStatusMeta(item.status);
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-white/[0.05] last:border-b-0 hover:bg-white/[0.02]"
                      >
                        <td className="p-0">
                          <Link
                            href={`/admin/comptes/${item.id}`}
                            className="flex max-w-[260px] flex-col px-4 py-3.5"
                          >
                            <span className="truncate text-[#EDEEF0]">
                              {item.name}
                            </span>
                            <span className="truncate text-[12px] text-[#70767D]">
                              {item.email}
                            </span>
                            {item.company && (
                              <span className="truncate text-[12px] text-[#5E646B]">
                                {item.company}
                              </span>
                            )}
                          </Link>
                        </td>
                        <td className="p-0">
                          <Link
                            href={`/admin/comptes/${item.id}`}
                            className="block px-3 py-3.5"
                          >
                            <Badge color={roleMeta.color} label={roleMeta.label} />
                          </Link>
                        </td>
                        <td className="p-0">
                          <Link
                            href={`/admin/comptes/${item.id}`}
                            className="block px-3 py-3.5"
                          >
                            <Badge
                              color={statusMeta.color}
                              label={statusMeta.label}
                            />
                          </Link>
                        </td>
                        <td className="p-0">
                          <Link
                            href={`/admin/comptes/${item.id}`}
                            className="block px-3 py-3.5 whitespace-nowrap text-[#C5CACF]"
                          >
                            {formatNumberFr(item.creditBalance)}
                          </Link>
                        </td>
                        <td className="p-0">
                          <Link
                            href={`/admin/comptes/${item.id}`}
                            className="block px-3 py-3.5 whitespace-nowrap text-[#C5CACF]"
                          >
                            {formatNumberFr(item.emailsSent30d)}
                          </Link>
                        </td>
                        <td className="p-0">
                          <Link
                            href={`/admin/comptes/${item.id}`}
                            className="block px-3 py-3.5 whitespace-nowrap text-[#C5CACF]"
                          >
                            {formatNumberFr(item.dailySendLimit)}
                          </Link>
                        </td>
                        <td className="p-0">
                          <Link
                            href={`/admin/comptes/${item.id}`}
                            className="block px-3 py-3.5 whitespace-nowrap text-[#9BA1A8]"
                          >
                            {formatDateFr(item.createdAt)}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* < md : une carte par compte. */}
          <div className="flex flex-col gap-3 md:hidden">
            {result.items.map((item) => {
              const roleMeta = adminAccountRoleMeta(item.role);
              const statusMeta = adminAccountStatusMeta(item.status);
              return (
                <Link
                  key={item.id}
                  href={`/admin/comptes/${item.id}`}
                  className="block rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-[14px] font-medium text-[#EDEEF0]">
                        {item.name}
                      </span>
                      <span className="truncate text-[12px] text-[#70767D]">
                        {item.email}
                      </span>
                      {item.company && (
                        <span className="truncate text-[12px] text-[#5E646B]">
                          {item.company}
                        </span>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <Badge color={roleMeta.color} label={roleMeta.label} />
                      <Badge color={statusMeta.color} label={statusMeta.label} />
                    </div>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-[13px]">
                    <div>
                      <dt className="text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
                        Solde
                      </dt>
                      <dd className="text-[#EDEEF0]">
                        {formatNumberFr(item.creditBalance)} crédits
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
                        Envois (30 j)
                      </dt>
                      <dd className="text-[#C5CACF]">
                        {formatNumberFr(item.emailsSent30d)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
                        Quota/jour
                      </dt>
                      <dd className="text-[#C5CACF]">
                        {formatNumberFr(item.dailySendLimit)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
                        Inscription
                      </dt>
                      <dd className="text-[#9BA1A8]">
                        {formatDateFr(item.createdAt)}
                      </dd>
                    </div>
                  </dl>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-[#9BA1A8]">
            <span>{result.total} compte(s) au total</span>
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
