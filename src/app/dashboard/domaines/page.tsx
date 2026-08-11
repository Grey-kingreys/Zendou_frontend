"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Badge from "@/components/dashboard/Badge";
import { api, ApiError } from "@/lib/api";
import { formatDateFr } from "@/lib/format";
import { domainStatusMeta } from "@/lib/status";
import type { DomainDetail, DomainSummary } from "@/lib/types";

export default function DashboardDomainesPage() {
  const [domains, setDomains] = useState<DomainSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdDomain, setCreatedDomain] = useState<DomainDetail | null>(
    null
  );

  async function loadDomains() {
    try {
      const data = await api.get<DomainSummary[]>("/v1/domains");
      setDomains(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de joindre le serveur."
      );
    }
  }

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await api.get<DomainSummary[]>("/v1/domains");
        if (!active) return;
        setDomains(data);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Impossible de joindre le serveur."
        );
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);
    setCreating(true);

    try {
      const created = await api.post<DomainDetail>("/v1/domains", {
        name: name.trim(),
      });
      setCreatedDomain(created);
      setFormOpen(false);
      setName("");
      loadDomains();
    } catch (err) {
      // Le backend renvoie déjà des messages en français pour 409 (domaine
      // déjà pris) et 400 (nom invalide) — on les affiche tels quels.
      setCreateError(
        err instanceof ApiError
          ? err.message
          : "Impossible de joindre le serveur."
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-[880px]">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1.5 font-heading text-2xl font-semibold text-[#EDEEF0]">
            Domaines
          </h1>
          <p className="text-sm text-[#9BA1A8]">
            Ajoutez et vérifiez vos domaines d’envoi (DKIM, SPF, DMARC).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormOpen((open) => !open);
            setCreateError(null);
            setCreatedDomain(null);
          }}
          className="shrink-0 rounded-lg bg-[#5B7CFA] px-4 py-2.5 text-[13.5px] font-semibold text-[#F7F9FF] transition-opacity hover:opacity-90"
        >
          {formOpen ? "Annuler" : "Ajouter un domaine"}
        </button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-6"
        >
          <label
            htmlFor="domain-name"
            className="mb-1.5 block text-[13px] font-medium text-[#C5CACF]"
          >
            Nom de domaine
          </label>
          <p className="mb-3 text-[12.5px] text-[#70767D]">
            Le domaine depuis lequel vous enverrez vos emails, ex.{" "}
            <span className="font-mono text-[#9BA1A8]">boutique-awa.gn</span>.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="domain-name"
              name="name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="boutique-awa.gn"
              className="w-full flex-1 rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2.5 font-mono text-[14.5px] text-[#EDEEF0] placeholder:text-[#5E646B] outline-none transition-colors focus:border-[#5B7CFA] focus:ring-1 focus:ring-[#5B7CFA]"
            />
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="shrink-0 rounded-lg bg-[#5B7CFA] px-5 py-2.5 text-[13.5px] font-semibold text-[#F7F9FF] transition-opacity disabled:opacity-60"
            >
              {creating ? "Ajout…" : "Ajouter"}
            </button>
          </div>
          {createError && (
            <p className="mt-3 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
              {createError}
            </p>
          )}
        </form>
      )}

      {createdDomain && (
        <p className="mb-6 rounded-lg border border-[#35D07F]/30 bg-[#35D07F]/10 px-3.5 py-2.5 text-[13.5px] text-[#35D07F]">
          Domaine « {createdDomain.name} » ajouté.{" "}
          <Link
            href={`/dashboard/domaines/${createdDomain.id}`}
            className="font-medium underline"
          >
            Voir les instructions DKIM
          </Link>
        </p>
      )}

      {error && (
        <p className="mb-6 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
          {error}
        </p>
      )}

      {domains === null && !error && (
        <p className="text-sm text-[#9BA1A8]">Chargement…</p>
      )}

      {domains !== null && domains.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/[0.13] bg-white/[0.015] px-8 py-16 text-center">
          <h2 className="mb-2 font-heading text-lg font-semibold text-[#EDEEF0]">
            Aucun domaine pour l’instant
          </h2>
          <p className="mx-auto max-w-[420px] text-sm leading-relaxed text-[#9BA1A8] text-pretty">
            Ajoutez votre premier domaine pour obtenir les enregistrements
            DKIM à publier chez votre registrar.
          </p>
        </div>
      )}

      {domains !== null && domains.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0C0D0F]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
                  <th className="px-5 py-3 font-medium">Domaine</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 font-medium">Vérifié le</th>
                  <th className="px-5 py-3 font-medium">Ajouté le</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain) => {
                  const meta = domainStatusMeta(domain.status);
                  return (
                    <tr
                      key={domain.id}
                      className="border-b border-white/[0.05] last:border-b-0"
                    >
                      <td className="p-0">
                        <Link
                          href={`/dashboard/domaines/${domain.id}`}
                          className="block px-5 py-3.5 font-mono text-[#EDEEF0] hover:text-[#8AA4FF]"
                        >
                          {domain.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge color={meta.color} label={meta.label} />
                      </td>
                      <td className="px-5 py-3.5 text-[#9BA1A8]">
                        {formatDateFr(domain.verifiedAt)}
                      </td>
                      <td className="px-5 py-3.5 text-[#9BA1A8]">
                        {formatDateFr(domain.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
