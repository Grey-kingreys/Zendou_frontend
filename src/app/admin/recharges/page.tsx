"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/dashboard/Badge";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { useAdminPendingCount } from "@/components/admin/admin-context";
import { api, ApiError } from "@/lib/api";
import { formatDateTimeFr, formatGnf, formatNumberFr } from "@/lib/format";
import { topUpMethodMeta } from "@/lib/status";
import type {
  AdminTopUpRequestItem,
  AdminTopUpRequestReviewResult,
  TopUpStatus,
} from "@/lib/types";

const STATUS_TABS: { value: TopUpStatus; label: string }[] = [
  { value: "PENDING", label: "À valider" },
  { value: "APPROVED", label: "Approuvées" },
  { value: "REJECTED", label: "Rejetées" },
];

const EMPTY_MESSAGES: Record<TopUpStatus, string> = {
  PENDING: "Aucune recharge en attente.",
  APPROVED: "Aucune recharge approuvée.",
  REJECTED: "Aucune recharge rejetée.",
};

/**
 * `packId` est un identifiant technique brut (ex. "starter"), le catalogue
 * complet des packs vit côté backend (src/billing/packs.ts) et n'est pas
 * dupliqué ici — on se contente d'une capitalisation de confort.
 */
function formatPackLabel(packId: string): string {
  if (!packId) return packId;
  return packId.charAt(0).toUpperCase() + packId.slice(1);
}

type ConfirmAction = {
  type: "approve" | "reject";
  item: AdminTopUpRequestItem;
};

/**
 * Fonction pure (pas de closure sur du state React) volontairement séparée
 * du composant : appelée à la fois depuis l'effet de chargement et depuis le
 * rechargement post-409, sans jamais faire passer un appel de setState par
 * l'argument d'un `useEffect` (ce que le linter React Compiler interdit).
 */
function fetchTopUpRequests(
  status: TopUpStatus
): Promise<AdminTopUpRequestItem[]> {
  return api.get<AdminTopUpRequestItem[]>(
    `/v1/admin/topup-requests?status=${status}`
  );
}

export default function AdminRechargesPage() {
  const { refreshPendingCount } = useAdminPendingCount();

  const [statusFilter, setStatusFilter] = useState<TopUpStatus>("PENDING");
  // `items === null` sert d'indicateur de chargement (pas de state `loading`
  // séparé), comme sur les autres pages du dashboard — évite d'avoir à
  // déclencher un setState synchrone dans l'effet de chargement.
  const [items, setItems] = useState<AdminTopUpRequestItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function applyLoadResult(
    data: AdminTopUpRequestItem[] | null,
    err: unknown
  ) {
    if (err) {
      if (err instanceof ApiError && err.status === 403) {
        setLoadError("Accès refusé.");
      } else if (err instanceof ApiError) {
        setLoadError(err.message);
      } else {
        setLoadError("Impossible de joindre le serveur.");
      }
      setItems(null);
      return;
    }
    setItems(data);
  }

  useEffect(() => {
    let active = true;

    fetchTopUpRequests(statusFilter)
      .then((data) => {
        if (!active) return;
        applyLoadResult(data, null);
      })
      .catch((err) => {
        if (!active) return;
        applyLoadResult(null, err);
      });

    return () => {
      active = false;
    };
  }, [statusFilter]);

  function openApprove(item: AdminTopUpRequestItem) {
    setSuccessMessage(null);
    setActionError(null);
    setRejectReason("");
    setConfirmAction({ type: "approve", item });
  }

  function openReject(item: AdminTopUpRequestItem) {
    setSuccessMessage(null);
    setActionError(null);
    setRejectReason("");
    setConfirmAction({ type: "reject", item });
  }

  function closeConfirm() {
    if (actionLoading) return;
    setConfirmAction(null);
    setActionError(null);
    setRejectReason("");
  }

  async function handleConfirm() {
    if (!confirmAction) return;
    const { type, item } = confirmAction;

    if (type === "reject" && rejectReason.trim().length < 3) {
      setActionError("Le motif doit contenir au moins 3 caractères.");
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      if (type === "approve") {
        await api.post<AdminTopUpRequestReviewResult>(
          `/v1/admin/topup-requests/${item.id}/approve`
        );
        setSuccessMessage(
          `Recharge de ${item.user.name} approuvée : ${formatNumberFr(
            item.credits
          )} crédits ajoutés à son compte.`
        );
      } else {
        await api.post<AdminTopUpRequestReviewResult>(
          `/v1/admin/topup-requests/${item.id}/reject`,
          { reason: rejectReason.trim() }
        );
        setSuccessMessage(`Recharge de ${item.user.name} rejetée.`);
      }

      setItems((prev) => (prev ? prev.filter((i) => i.id !== item.id) : prev));
      setConfirmAction(null);
      setRejectReason("");
      refreshPendingCount();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Cas classique de deux onglets admin ouverts : la demande a déjà
        // été traitée ailleurs entre-temps. On referme et on recharge la
        // liste pour refléter l'état réel. Le message est fixé *après* le
        // rechargement pour ne pas être écrasé par un succès de la requête.
        setConfirmAction(null);
        setRejectReason("");
        try {
          const data = await fetchTopUpRequests(statusFilter);
          setItems(data);
        } catch {
          // Le rechargement peut lui-même échouer (réseau...) : la liste
          // garde alors son contenu précédent, le message ci-dessous prime.
        }
        setLoadError("Cette demande a déjà été traitée.");
        refreshPendingCount();
      } else if (err instanceof ApiError && err.status === 403) {
        setActionError("Accès refusé.");
      } else if (err instanceof ApiError) {
        setActionError(err.message);
      } else {
        setActionError("Impossible de joindre le serveur.");
      }
    } finally {
      setActionLoading(false);
    }
  }

  const dialogTitle =
    confirmAction?.type === "approve"
      ? "Approuver cette recharge ?"
      : "Rejeter cette recharge ?";

  const dialogDescription = confirmAction
    ? confirmAction.type === "approve"
      ? `${confirmAction.item.user.name} (${confirmAction.item.user.email}) sera crédité de ${formatNumberFr(confirmAction.item.credits)} crédits pour un paiement de ${formatGnf(confirmAction.item.amountGnf)}. Cette action crédite réellement le compte, elle n’est pas anodine.`
      : `La demande de ${confirmAction.item.user.name} (${confirmAction.item.user.email}) — ${formatGnf(confirmAction.item.amountGnf)} pour ${formatNumberFr(confirmAction.item.credits)} crédits — sera rejetée. Aucun crédit ne sera ajouté.`
    : "";

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-8">
        <h1 className="mb-1.5 font-heading text-2xl font-semibold text-[#EDEEF0]">
          Recharges Mobile Money
        </h1>
        <p className="text-sm text-[#9BA1A8]">
          Les API Orange Money et MTN MoMo ne sont pas branchées : chaque
          paiement passe par une validation humaine, à rapprocher du relevé
          via la référence de transaction.
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              if (tab.value === statusFilter) return;
              setStatusFilter(tab.value);
              setItems(null);
              setLoadError(null);
              setSuccessMessage(null);
            }}
            className={`rounded-lg px-3.5 py-2 text-[13.5px] font-medium transition-colors ${
              statusFilter === tab.value
                ? "bg-white/[0.08] text-[#EDEEF0]"
                : "text-[#9BA1A8] hover:text-[#EDEEF0]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {successMessage && (
        <p className="mb-6 rounded-lg border border-[#35D07F]/30 bg-[#35D07F]/10 px-3.5 py-2.5 text-[13.5px] text-[#35D07F]">
          {successMessage}
        </p>
      )}

      {loadError && (
        <p className="mb-6 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
          {loadError}
        </p>
      )}

      {items === null && !loadError && (
        <p className="text-sm text-[#9BA1A8]">Chargement…</p>
      )}

      {items && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/[0.13] bg-white/[0.015] px-8 py-16 text-center">
          <h2 className="font-heading text-lg font-semibold text-[#EDEEF0]">
            {EMPTY_MESSAGES[statusFilter]}
          </h2>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0C0D0F]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Pack</th>
                  <th className="px-5 py-3 font-medium">Crédits</th>
                  <th className="px-5 py-3 font-medium">Montant</th>
                  <th className="px-5 py-3 font-medium">Méthode</th>
                  <th className="px-5 py-3 font-medium">Téléphone</th>
                  <th className="px-5 py-3 font-medium">Référence</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  {statusFilter === "PENDING" && (
                    <th className="px-5 py-3 font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const methodMeta = topUpMethodMeta(item.method);
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-white/[0.05] last:border-b-0"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-[#EDEEF0]">
                            {item.user.name}
                          </span>
                          <span className="text-[12px] text-[#70767D]">
                            {item.user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#C5CACF]">
                        {formatPackLabel(item.packId)}
                      </td>
                      <td className="px-5 py-3.5 text-[#C5CACF]">
                        {formatNumberFr(item.credits)}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[#EDEEF0]">
                        {formatGnf(item.amountGnf)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge color={methodMeta.color} label={methodMeta.label} />
                      </td>
                      <td className="px-5 py-3.5 text-[#C5CACF]">
                        {item.phoneNumber}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[#9BA1A8]">
                        {item.transactionRef}
                      </td>
                      <td className="px-5 py-3.5 text-[#9BA1A8]">
                        {formatDateTimeFr(item.createdAt)}
                      </td>
                      {statusFilter === "PENDING" && (
                        <td className="px-5 py-3.5">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openApprove(item)}
                              className="rounded-lg bg-[#35D07F]/15 px-3 py-1.5 text-[12.5px] font-medium text-[#35D07F] transition-opacity hover:opacity-90"
                            >
                              Approuver
                            </button>
                            <button
                              type="button"
                              onClick={() => openReject(item)}
                              className="rounded-lg border border-[#E5484D]/30 px-3 py-1.5 text-[12.5px] font-medium text-[#FF9592] transition-opacity hover:opacity-90"
                            >
                              Rejeter
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmAction !== null}
        title={dialogTitle}
        description={dialogDescription}
        confirmLabel={confirmAction?.type === "approve" ? "Approuver" : "Rejeter"}
        danger={confirmAction?.type === "reject"}
        loading={actionLoading}
        confirmDisabled={
          confirmAction?.type === "reject" && rejectReason.trim().length < 3
        }
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      >
        {confirmAction?.type === "reject" && (
          <div>
            <label
              htmlFor="reject-reason"
              className="mb-1.5 block text-[12.5px] font-medium text-[#C5CACF]"
            >
              Motif du rejet
            </label>
            <textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              rows={3}
              placeholder="Ex. : référence introuvable sur le relevé Orange Money."
              className="w-full rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2.5 text-[13.5px] text-[#EDEEF0] placeholder:text-[#5E646B] outline-none focus:border-[#5B7CFA]"
            />
          </div>
        )}
        {actionError && (
          <p className="mt-3 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
            {actionError}
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}
