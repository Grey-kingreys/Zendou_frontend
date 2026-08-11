"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Badge from "@/components/dashboard/Badge";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import CopyField from "@/components/dashboard/CopyField";
import { api, ApiError } from "@/lib/api";
import { formatDateTimeFr } from "@/lib/format";
import { domainStatusMeta } from "@/lib/status";
import type { DomainCheckResult, DomainDetail } from "@/lib/types";

export default function DashboardDomainDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [domain, setDomain] = useState<DomainDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;

    (async () => {
      try {
        const data = await api.get<DomainDetail>(`/v1/domains/${id}`);
        if (!active) return;
        setDomain(data);
        setError(null);
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
          return;
        }
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
  }, [id]);

  async function handleCheck() {
    setChecking(true);
    setCheckMessage(null);
    try {
      const result = await api.post<DomainCheckResult>(
        `/v1/domains/${id}/check`
      );
      setDomain((current) =>
        current
          ? { ...current, status: result.status, verifiedAt: result.verifiedAt }
          : current
      );
      if (result.status === "PENDING") {
        setCheckMessage(
          "Vérification en cours chez AWS, cela peut prendre jusqu’à 72 h."
        );
      } else if (result.status === "VERIFIED") {
        setCheckMessage("Domaine vérifié.");
      } else {
        setCheckMessage(
          "La vérification a échoué. Contrôlez les enregistrements DNS ci-dessous."
        );
      }
    } catch (err) {
      setCheckMessage(
        err instanceof ApiError
          ? err.message
          : "Impossible de joindre le serveur."
      );
    } finally {
      setChecking(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.del(`/v1/domains/${id}`);
      router.push("/dashboard/domaines");
    } catch (err) {
      setDeleteError(
        err instanceof ApiError
          ? err.message
          : "Impossible de joindre le serveur."
      );
      setDeleting(false);
    }
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-[880px]">
        <div className="rounded-2xl border border-dashed border-white/[0.13] bg-white/[0.015] px-8 py-16 text-center">
          <h1 className="mb-2 font-heading text-lg font-semibold text-[#EDEEF0]">
            Domaine introuvable
          </h1>
          <p className="mb-4 text-sm text-[#9BA1A8]">
            Ce domaine n’existe pas ou a été supprimé.
          </p>
          <Link
            href="/dashboard/domaines"
            className="text-sm font-medium text-[#8AA4FF]"
          >
            Retour aux domaines
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[880px]">
        <p className="rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
          {error}
        </p>
      </div>
    );
  }

  if (!domain) {
    return (
      <div className="mx-auto max-w-[880px]">
        <p className="text-sm text-[#9BA1A8]">Chargement…</p>
      </div>
    );
  }

  const meta = domainStatusMeta(domain.status);

  return (
    <div className="mx-auto max-w-[880px]">
      <Link
        href="/dashboard/domaines"
        className="mb-6 inline-block text-[13.5px] text-[#9BA1A8] hover:text-[#8AA4FF]"
      >
        ← Domaines
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="font-heading text-2xl font-semibold text-[#EDEEF0]">
              {domain.name}
            </h1>
            <Badge color={meta.color} label={meta.label} />
          </div>
          <p className="text-sm text-[#9BA1A8]">
            Ajouté le {formatDateTimeFr(domain.createdAt)}
            {domain.verifiedAt &&
              ` · Vérifié le ${formatDateTimeFr(domain.verifiedAt)}`}
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={handleCheck}
            disabled={checking}
            className="rounded-lg bg-[#5B7CFA] px-4 py-2.5 text-[13.5px] font-semibold text-[#F7F9FF] transition-opacity disabled:opacity-60"
          >
            {checking ? "Vérification…" : "Vérifier maintenant"}
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="rounded-lg border border-white/[0.14] px-4 py-2.5 text-[13.5px] font-medium text-[#EDEEF0] transition-opacity hover:opacity-90"
          >
            Supprimer
          </button>
        </div>
      </div>

      {checkMessage && (
        <p className="mb-8 rounded-lg border border-white/[0.09] bg-white/[0.03] px-3.5 py-2.5 text-[13.5px] text-[#C5CACF]">
          {checkMessage}
        </p>
      )}

      <section className="mb-8">
        <h2 className="mb-1.5 font-heading text-base font-semibold text-[#EDEEF0]">
          1. Enregistrements DKIM (obligatoires)
        </h2>
        <p className="mb-4 text-[13.5px] text-[#9BA1A8] text-pretty">
          Publiez ces 3 enregistrements CNAME chez votre registrar DNS. Une
          fois propagés, Amazon SES vérifie automatiquement le domaine.
        </p>
        <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0C0D0F]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Nom</th>
                  <th className="px-5 py-3 font-medium">Valeur</th>
                </tr>
              </thead>
              <tbody>
                {domain.dkimRecords.map((record, index) => (
                  <tr
                    key={`${record.name}-${index}`}
                    className="border-b border-white/[0.05] last:border-b-0"
                  >
                    <td className="px-5 py-2 font-mono text-[#9BA1A8]">
                      {record.type}
                    </td>
                    <td className="p-0">
                      <CopyField value={record.name} className="w-full" />
                    </td>
                    <td className="p-0">
                      <CopyField value={record.value} className="w-full" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-1.5 font-heading text-base font-semibold text-[#EDEEF0]">
          2. Enregistrements recommandés (SPF, DMARC)
        </h2>
        <p className="mb-4 text-[13.5px] text-[#9BA1A8] text-pretty">
          Facultatifs pour la vérification, fortement conseillés pour la
          délivrabilité.
        </p>
        <div className="flex flex-col gap-4">
          {domain.recommendedRecords.map((record, index) => (
            <div
              key={`${record.purpose}-${index}`}
              className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5"
            >
              <div className="mb-3 flex items-center gap-2.5">
                <Badge color="blue" label={record.purpose} />
                <span className="font-mono text-[12px] text-[#70767D]">
                  {record.type}
                </span>
              </div>
              <div className="mb-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-[11.5px] tracking-[0.02em] text-[#70767D] uppercase">
                    Nom
                  </p>
                  <CopyField value={record.name} />
                </div>
                <div>
                  <p className="mb-1 text-[11.5px] tracking-[0.02em] text-[#70767D] uppercase">
                    Valeur
                  </p>
                  <CopyField value={record.value} />
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-[#9BA1A8] text-pretty">
                {record.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      <ConfirmDialog
        open={deleteOpen}
        title="Supprimer ce domaine ?"
        description={`« ${domain.name} » sera retiré de votre compte et l’identité SES associée sera supprimée. Les emails déjà envoyés ne sont pas affectés.`}
        confirmLabel="Supprimer"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
      {deleteError && (
        <p className="mt-4 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
          {deleteError}
        </p>
      )}
    </div>
  );
}
