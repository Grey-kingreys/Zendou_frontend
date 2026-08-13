"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Badge from "@/components/dashboard/Badge";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { useAdminPendingCount } from "@/components/admin/admin-context";
import { api, ApiError } from "@/lib/api";
import { formatDateTimeFr, formatDateTimeShortFr, formatNumberFr } from "@/lib/format";
import {
  adminAccountRoleMeta,
  adminAccountStatusMeta,
  adminActionTypeMeta,
} from "@/lib/status";
import type {
  AdminActionItem,
  AdminCreditResult,
  AdminQuotaResult,
  AdminUserActionResult,
  AdminUserDeleteResult,
  AdminUserDetail,
} from "@/lib/types";

/**
 * Bornes alignées sur `backend/src/admin/admin.constants.ts` — dupliquées ici
 * faute de partage de code entre les deux sous-repos indépendants. La
 * validation serveur reste la source de vérité ; celle-ci n'est qu'un
 * confort pour éviter un aller-retour évitable.
 */
const REASON_MIN_LENGTH = 3;
const REASON_MAX_LENGTH = 300;
const MIN_DAILY_SEND_LIMIT = 1;
const MAX_DAILY_SEND_LIMIT = 1_000_000;
const MAX_CREDIT_DELTA = 1_000_000;

type DialogType = "credit" | "suspend" | "reactivate" | "quota" | "delete";

/**
 * Fonction pure séparée du composant — même raison qu'en `/admin/recharges` :
 * appelée à la fois par l'effet de chargement initial et par le rechargement
 * post-action, sans jamais faire passer un appel de `setState` par
 * l'argument d'un `useEffect`.
 */
function fetchAdminUserDetail(id: string): Promise<AdminUserDetail> {
  return api.get<AdminUserDetail>(`/v1/admin/users/${id}`);
}

/**
 * `details` est un blob JSON libre côté backend (`Prisma.JsonValue`) — cette
 * fonction n'interprète que les formes réellement écrites par
 * `AdminUsersService` (grantCredits, updateQuota, reactivate). Les autres
 * types d'action n'ont pas de détails connus et se contentent du motif.
 */
function describeActionDetails(action: AdminActionItem): string | null {
  const details = action.details;
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return null;
  }
  const record = details as Record<string, unknown>;

  if (action.type === "GRANT_CREDITS" && typeof record.delta === "number") {
    const sign = record.delta > 0 ? "+" : "";
    return `${sign}${formatNumberFr(record.delta)} crédits`;
  }

  if (
    action.type === "ADJUST_QUOTA" &&
    typeof record.previousDailySendLimit === "number" &&
    typeof record.dailySendLimit === "number"
  ) {
    return `${formatNumberFr(record.previousDailySendLimit)} → ${formatNumberFr(record.dailySendLimit)} emails/jour`;
  }

  if (action.type === "REACTIVATE_USER" && typeof record.reputationResetAt === "string") {
    return "Réputation réinitialisée";
  }

  return null;
}

export default function AdminCompteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { adminUser } = useAdminPendingCount();
  const isSelf = adminUser !== null && adminUser.id === id;

  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [dialog, setDialog] = useState<DialogType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  // Vrai uniquement pour un 409 sur la suppression : ce compte a des
  // données, il faut orienter explicitement vers la suspension plutôt que
  // de laisser l'admin face à un message d'erreur sans issue.
  const [deleteBlocked, setDeleteBlocked] = useState(false);

  const [creditDelta, setCreditDelta] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [reactivateReason, setReactivateReason] = useState("");
  const [quotaValue, setQuotaValue] = useState("");

  useEffect(() => {
    if (!id) return;
    let active = true;

    fetchAdminUserDetail(id)
      .then((data) => {
        if (!active) return;
        setDetail(data);
        setLoadError(null);
        setNotFound(false);
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
          return;
        }
        if (err instanceof ApiError && err.status === 403) {
          setLoadError("Accès refusé.");
          return;
        }
        setLoadError(
          err instanceof ApiError ? err.message : "Impossible de joindre le serveur."
        );
      });

    return () => {
      active = false;
    };
  }, [id]);

  async function reloadDetail() {
    if (!id) return;
    try {
      const data = await fetchAdminUserDetail(id);
      setDetail(data);
    } catch {
      // Le rafraîchissement peut échouer (réseau...) : le détail affiché
      // reste celui d'avant l'action, mais le message de succès prime.
    }
  }

  function openCredit() {
    setSuccessMessage(null);
    setActionError(null);
    setCreditDelta("");
    setCreditReason("");
    setDialog("credit");
  }

  function openSuspend() {
    setSuccessMessage(null);
    setActionError(null);
    setDeleteBlocked(false);
    setSuspendReason("");
    setDialog("suspend");
  }

  function openReactivate() {
    setSuccessMessage(null);
    setActionError(null);
    setReactivateReason("");
    setDialog("reactivate");
  }

  function openQuota() {
    setSuccessMessage(null);
    setActionError(null);
    setQuotaValue(detail ? String(detail.dailySendLimit) : "");
    setDialog("quota");
  }

  function openDelete() {
    setSuccessMessage(null);
    setActionError(null);
    setDeleteBlocked(false);
    setDialog("delete");
  }

  function closeDialog() {
    if (actionLoading) return;
    setDialog(null);
    setActionError(null);
    setDeleteBlocked(false);
  }

  const creditDeltaNum = Number(creditDelta);
  const creditDeltaValid =
    creditDelta.trim() !== "" &&
    Number.isInteger(creditDeltaNum) &&
    creditDeltaNum !== 0 &&
    Math.abs(creditDeltaNum) <= MAX_CREDIT_DELTA;
  const creditReasonValid =
    creditReason.trim().length >= REASON_MIN_LENGTH &&
    creditReason.trim().length <= REASON_MAX_LENGTH;

  const suspendReasonValid =
    suspendReason.trim().length >= REASON_MIN_LENGTH &&
    suspendReason.trim().length <= REASON_MAX_LENGTH;

  const reactivateReasonValid =
    reactivateReason.trim().length === 0 ||
    (reactivateReason.trim().length >= REASON_MIN_LENGTH &&
      reactivateReason.trim().length <= REASON_MAX_LENGTH);

  const quotaValueNum = Number(quotaValue);
  const quotaValueValid =
    quotaValue.trim() !== "" &&
    Number.isInteger(quotaValueNum) &&
    quotaValueNum >= MIN_DAILY_SEND_LIMIT &&
    quotaValueNum <= MAX_DAILY_SEND_LIMIT;

  async function handleConfirm() {
    if (!dialog || !detail) return;

    setActionLoading(true);
    setActionError(null);

    try {
      if (dialog === "credit") {
        const result = await api.post<AdminCreditResult>(
          `/v1/admin/users/${detail.id}/credits`,
          { delta: creditDeltaNum, reason: creditReason.trim() }
        );
        setSuccessMessage(
          `${result.delta > 0 ? "+" : ""}${formatNumberFr(result.delta)} crédits appliqués. Nouveau solde : ${formatNumberFr(result.creditBalance)} crédits.`
        );
      } else if (dialog === "suspend") {
        await api.post<AdminUserActionResult>(
          `/v1/admin/users/${detail.id}/suspend`,
          { reason: suspendReason.trim() }
        );
        setSuccessMessage("Compte suspendu : les envois sont coupés immédiatement.");
      } else if (dialog === "reactivate") {
        await api.post<AdminUserActionResult>(
          `/v1/admin/users/${detail.id}/reactivate`,
          { reason: reactivateReason.trim() || undefined }
        );
        setSuccessMessage(
          "Compte réactivé : le compteur de réputation (bounces/plaintes) est reparti de zéro."
        );
      } else if (dialog === "quota") {
        const result = await api.patch<AdminQuotaResult>(
          `/v1/admin/users/${detail.id}/quota`,
          { dailySendLimit: quotaValueNum }
        );
        setSuccessMessage(
          `Quota mis à jour : ${formatNumberFr(result.previousDailySendLimit)} → ${formatNumberFr(result.dailySendLimit)} emails/jour.`
        );
      } else if (dialog === "delete") {
        // Suppression réelle de la ligne : la fiche n'existe plus après
        // succès, donc pas de `reloadDetail()` ici — retour direct à la
        // liste des comptes (exigence produit : « la fiche n'existe plus »).
        await api.del<AdminUserDeleteResult>(`/v1/admin/users/${detail.id}`);
        router.push("/admin/comptes");
        return;
      }

      setDialog(null);
      await reloadDetail();
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
        // 409 sur la suppression : refus métier « ce compte a encore des
        // données » — le message de l'API (affiché tel quel ci-dessus) le
        // détaille déjà, mais l'orientation vers la suspension doit être un
        // geste, pas seulement une phrase.
        setDeleteBlocked(dialog === "delete" && err.status === 409);
      } else {
        setActionError("Impossible de joindre le serveur.");
        setDeleteBlocked(false);
      }
    } finally {
      setActionLoading(false);
    }
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-[960px]">
        <div className="rounded-2xl border border-dashed border-white/[0.13] bg-white/[0.015] px-8 py-16 text-center">
          <h1 className="mb-2 font-heading text-lg font-semibold text-[#EDEEF0]">
            Compte introuvable
          </h1>
          <p className="mb-4 text-sm text-[#9BA1A8]">
            Ce compte n’existe pas ou a été supprimé.
          </p>
          <Link href="/admin/comptes" className="text-sm font-medium text-[#8AA4FF]">
            Retour aux comptes
          </Link>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-[960px]">
        <p className="rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
          {loadError}
        </p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="mx-auto max-w-[960px]">
        <p className="text-sm text-[#9BA1A8]">Chargement…</p>
      </div>
    );
  }

  const roleMeta = adminAccountRoleMeta(detail.role);
  const statusMeta = adminAccountStatusMeta(detail.status);

  const dialogTitle =
    dialog === "credit"
      ? "Créditer le compte ?"
      : dialog === "suspend"
        ? "Suspendre ce compte ?"
        : dialog === "reactivate"
          ? "Réactiver ce compte ?"
          : dialog === "quota"
            ? "Modifier le quota ?"
            : dialog === "delete"
              ? "Supprimer ce compte ?"
              : "";

  const dialogDescription =
    dialog === "credit"
      ? `Le solde de ${detail.name} sera ajusté immédiatement. Un montant négatif reprend un geste accordé à tort — le motif est obligatoire et reste visible dans le journal d'audit.`
      : dialog === "suspend"
        ? `Les envois de ${detail.name} seront coupés immédiatement. Le motif est obligatoire et reste visible dans le journal d'audit.`
        : dialog === "reactivate"
          ? `Les envois de ${detail.name} seront réautorisés immédiatement. Le compteur de réputation (bounces/plaintes) repart de zéro à cet instant : sans ce geste, le compte serait re-suspendu au premier événement suivant.`
          : dialog === "quota"
            ? `Nouveau quota d'envoi journalier pour ${detail.name}. Quota actuel : ${formatNumberFr(detail.dailySendLimit)} emails/jour.`
            : dialog === "delete"
              ? `Le compte de ${detail.name} sera supprimé définitivement — impossible à annuler. Son adresse (${detail.email}) redeviendra aussitôt disponible pour une nouvelle inscription. Les lignes du journal d'audit qui le concernent sont conservées (son email y reste archivé) : la trace administrative ne disparaît pas.`
              : "";

  const confirmLabel =
    dialog === "credit"
      ? "Appliquer"
      : dialog === "suspend"
        ? "Suspendre"
        : dialog === "reactivate"
          ? "Réactiver"
          : dialog === "quota"
            ? "Modifier"
            : "Supprimer";

  const confirmDisabled =
    dialog === "credit"
      ? !(creditDeltaValid && creditReasonValid)
      : dialog === "suspend"
        ? !suspendReasonValid
        : dialog === "reactivate"
          ? !reactivateReasonValid
          : dialog === "quota"
            ? !quotaValueValid
            : false;

  return (
    <div className="mx-auto max-w-[960px]">
      <Link
        href="/admin/comptes"
        className="mb-6 inline-block text-[13.5px] text-[#9BA1A8] hover:text-[#8AA4FF]"
      >
        ← Comptes
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2.5">
            <h1 className="font-heading text-2xl font-semibold text-[#EDEEF0]">
              {detail.name}
            </h1>
            <Badge color={roleMeta.color} label={roleMeta.label} />
            <Badge color={statusMeta.color} label={statusMeta.label} />
            {isSelf && <Badge color="blue" label="Vous" />}
          </div>
          <p className="text-sm text-[#9BA1A8]">
            {detail.email}
            {detail.company && ` · ${detail.company}`}
          </p>
          <p className="mt-1 text-[12.5px] text-[#70767D]">
            Inscrit le {formatDateTimeFr(detail.createdAt)}
          </p>
        </div>
      </div>

      {successMessage && (
        <p className="mb-6 rounded-lg border border-[#35D07F]/30 bg-[#35D07F]/10 px-3.5 py-2.5 text-[13.5px] text-[#35D07F]">
          {successMessage}
        </p>
      )}

      {detail.status === "SUSPENDED" && detail.suspensionReason && (
        <p className="mb-6 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
          Suspendu{detail.suspendedAt && ` le ${formatDateTimeFr(detail.suspendedAt)}`} — motif :
          {" "}
          {detail.suspensionReason}
        </p>
      )}

      {detail.reputationResetAt && (
        <p className="mb-6 rounded-lg border border-white/[0.09] bg-white/[0.03] px-3.5 py-2.5 text-[13.5px] text-[#9BA1A8]">
          Compteur de réputation réinitialisé le {formatDateTimeFr(detail.reputationResetAt)}.
        </p>
      )}

      <section className="mb-8">
        <h2 className="mb-4 font-heading text-base font-semibold text-[#EDEEF0]">
          Contexte du dossier
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-4">
            <p className="mb-1 text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
              Solde crédits
            </p>
            <p className="font-heading text-lg font-semibold text-[#EDEEF0]">
              {formatNumberFr(detail.creditBalance)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-4">
            <p className="mb-1 text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
              Quota/jour
            </p>
            <p className="font-heading text-lg font-semibold text-[#EDEEF0]">
              {formatNumberFr(detail.dailySendLimit)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-4">
            <p className="mb-1 text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
              Envois (30 j)
            </p>
            <p className="font-heading text-lg font-semibold text-[#EDEEF0]">
              {formatNumberFr(detail.emailsSent30d)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-4">
            <p className="mb-1 text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
              Domaines vérifiés
            </p>
            <p className="font-heading text-lg font-semibold text-[#EDEEF0]">
              {detail.verifiedDomainsCount} / {detail.domainsCount}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-4">
            <p className="mb-1 text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
              Clés API actives
            </p>
            <p className="font-heading text-lg font-semibold text-[#EDEEF0]">
              {formatNumberFr(detail.activeApiKeysCount)}
            </p>
          </div>
        </div>
        {detail.declaredUsage && (
          <div className="mt-3 rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-4">
            <p className="mb-1 text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
              Usage déclaré
            </p>
            <p className="text-[13.5px] leading-relaxed text-[#C5CACF] text-pretty">
              {detail.declaredUsage}
            </p>
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-4 font-heading text-base font-semibold text-[#EDEEF0]">
          Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5">
            <h3 className="mb-1.5 font-heading text-[14.5px] font-semibold text-[#EDEEF0]">
              Créditer / débiter
            </h3>
            <p className="mb-4 text-[13px] leading-relaxed text-[#9BA1A8] text-pretty">
              Ajoute ou retire des crédits du solde. Un montant négatif
              reprend un geste accordé à tort.
            </p>
            {isSelf ? (
              <p className="rounded-lg border border-[#F5A623]/30 bg-[#F5A623]/10 px-3.5 py-2.5 text-[12.5px] text-[#F5C177]">
                Vous ne pouvez pas créditer votre propre compte : passez par
                une demande de recharge approuvée par un autre administrateur.
              </p>
            ) : (
              <button
                type="button"
                onClick={openCredit}
                className="rounded-lg bg-[#5B7CFA] px-4 py-2.5 text-[13.5px] font-semibold text-[#F7F9FF] transition-opacity hover:opacity-90"
              >
                Créditer le compte
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5">
            {detail.status === "ACTIVE" ? (
              <>
                <h3 className="mb-1.5 font-heading text-[14.5px] font-semibold text-[#EDEEF0]">
                  Suspendre
                </h3>
                <p className="mb-4 text-[13px] leading-relaxed text-[#9BA1A8] text-pretty">
                  Coupe immédiatement les envois du compte. Motif obligatoire.
                </p>
                {isSelf ? (
                  <p className="rounded-lg border border-[#F5A623]/30 bg-[#F5A623]/10 px-3.5 py-2.5 text-[12.5px] text-[#F5C177]">
                    Vous ne pouvez pas suspendre votre propre compte :
                    demandez à un autre administrateur.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={openSuspend}
                    className="rounded-lg border border-[#E5484D]/30 px-4 py-2.5 text-[13.5px] font-medium text-[#FF9592] transition-opacity hover:opacity-90"
                  >
                    Suspendre le compte
                  </button>
                )}
              </>
            ) : (
              <>
                <h3 className="mb-1.5 font-heading text-[14.5px] font-semibold text-[#EDEEF0]">
                  Réactiver
                </h3>
                <p className="mb-4 text-[13px] leading-relaxed text-[#9BA1A8] text-pretty">
                  Rouvre le compte et réinitialise son compteur de réputation
                  — bounces et plaintes repartent de zéro.
                </p>
                <button
                  type="button"
                  onClick={openReactivate}
                  className="rounded-lg bg-[#35D07F]/15 px-4 py-2.5 text-[13.5px] font-medium text-[#35D07F] transition-opacity hover:opacity-90"
                >
                  Réactiver le compte
                </button>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5 sm:col-span-2">
            <h3 className="mb-1.5 font-heading text-[14.5px] font-semibold text-[#EDEEF0]">
              Quota d’envoi journalier
            </h3>
            <p className="mb-4 text-[13px] leading-relaxed text-[#9BA1A8] text-pretty">
              Quota actuel : {formatNumberFr(detail.dailySendLimit)}{" "}
              emails/jour, hors montée en charge automatique.
            </p>
            <button
              type="button"
              onClick={openQuota}
              className="rounded-lg border border-white/[0.14] px-4 py-2.5 text-[13.5px] font-medium text-[#EDEEF0] transition-opacity hover:opacity-90"
            >
              Modifier le quota
            </button>
          </div>

          <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5 sm:col-span-2">
            <h3 className="mb-1.5 font-heading text-[14.5px] font-semibold text-[#EDEEF0]">
              Supprimer le compte
            </h3>
            <p className="mb-4 text-[13px] leading-relaxed text-[#9BA1A8] text-pretty">
              Suppression définitive, réservée aux comptes sans aucune donnée
              (domaine, clé API, email, mouvement de crédit, demande de
              recharge). Dans tous les autres cas, suspendez le compte plutôt
              que de le supprimer.
            </p>
            {isSelf ? (
              <p className="rounded-lg border border-[#F5A623]/30 bg-[#F5A623]/10 px-3.5 py-2.5 text-[12.5px] text-[#F5C177]">
                Vous ne pouvez pas supprimer votre propre compte : demandez à
                un autre administrateur.
              </p>
            ) : (
              <button
                type="button"
                onClick={openDelete}
                className="rounded-lg border border-[#E5484D]/30 px-4 py-2.5 text-[13.5px] font-medium text-[#FF9592] transition-opacity hover:opacity-90"
              >
                Supprimer le compte
              </button>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-heading text-base font-semibold text-[#EDEEF0]">
          Journal d’audit
        </h2>
        {detail.recentActions.length === 0 ? (
          <p className="text-sm text-[#9BA1A8]">
            Aucune action enregistrée pour ce compte.
          </p>
        ) : (
          <>
            {/*
             * >= md : tableau, colonne « Motif » libre en largeur (elle
             * s'enroule, pas de `whitespace-nowrap`) pour ne jamais pousser
             * le tableau hors de son conteneur à 1280px. Pas de colonne
             * d'actions ici — c'est un journal en lecture seule. < md :
             * cartes empilées, même contenu.
             */}
            <div className="hidden overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0C0D0F] md:block">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-[13.5px]">
                  <thead>
                    <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
                      <th className="px-4 py-3 font-medium whitespace-nowrap">
                        Action
                      </th>
                      <th className="px-3 py-3 font-medium">Motif</th>
                      <th className="px-3 py-3 font-medium whitespace-nowrap">
                        Admin
                      </th>
                      <th className="px-3 py-3 font-medium whitespace-nowrap">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.recentActions.map((action) => {
                      const meta = adminActionTypeMeta(action.type);
                      const summary = describeActionDetails(action);
                      return (
                        <tr
                          key={action.id}
                          className="border-b border-white/[0.05] last:border-b-0"
                        >
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <Badge color={meta.color} label={meta.label} />
                          </td>
                          <td className="px-3 py-3.5 text-[#C5CACF]">
                            {action.reason ?? "—"}
                            {summary && (
                              <span className="mt-0.5 block text-[12px] text-[#70767D]">
                                {summary}
                              </span>
                            )}
                          </td>
                          <td className="max-w-[200px] px-3 py-3.5">
                            <span className="block truncate text-[#C5CACF]">
                              {action.admin.name}
                            </span>
                            <span className="block truncate text-[12px] text-[#70767D]">
                              {action.admin.email}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 whitespace-nowrap text-[#9BA1A8]">
                            {formatDateTimeShortFr(action.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {detail.recentActions.map((action) => {
                const meta = adminActionTypeMeta(action.type);
                const summary = describeActionDetails(action);
                return (
                  <div
                    key={action.id}
                    className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <Badge color={meta.color} label={meta.label} />
                      <span className="text-[12px] text-[#9BA1A8]">
                        {formatDateTimeShortFr(action.createdAt)}
                      </span>
                    </div>
                    <p className="mb-1 text-[13px] text-[#C5CACF]">
                      {action.reason ?? "—"}
                    </p>
                    {summary && (
                      <p className="mb-2 text-[12px] text-[#70767D]">{summary}</p>
                    )}
                    <p className="truncate text-[12px] text-[#70767D]">
                      {action.admin.name} · {action.admin.email}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      <ConfirmDialog
        open={dialog !== null}
        title={dialogTitle}
        description={dialogDescription}
        confirmLabel={confirmLabel}
        danger={dialog === "suspend" || dialog === "delete"}
        loading={actionLoading}
        confirmDisabled={confirmDisabled}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      >
        {dialog === "credit" && (
          <div className="flex flex-col gap-3">
            <div>
              <label
                htmlFor="credit-delta"
                className="mb-1.5 block text-[12.5px] font-medium text-[#C5CACF]"
              >
                Montant (positif pour créditer, négatif pour reprendre)
              </label>
              <input
                id="credit-delta"
                type="number"
                step={1}
                value={creditDelta}
                onChange={(event) => setCreditDelta(event.target.value)}
                placeholder="Ex. 5000 ou -2000"
                className="w-full rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2.5 text-[16px] text-[#EDEEF0] placeholder:text-[#5E646B] outline-none focus:border-[#5B7CFA]"
              />
            </div>
            <div>
              <label
                htmlFor="credit-reason"
                className="mb-1.5 block text-[12.5px] font-medium text-[#C5CACF]"
              >
                Motif (obligatoire)
              </label>
              <textarea
                id="credit-reason"
                value={creditReason}
                onChange={(event) => setCreditReason(event.target.value)}
                rows={3}
                placeholder="Ex. geste commercial suite à un incident de livraison."
                className="w-full rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2.5 text-[16px] text-[#EDEEF0] placeholder:text-[#5E646B] outline-none focus:border-[#5B7CFA]"
              />
            </div>
          </div>
        )}

        {dialog === "suspend" && (
          <div>
            <label
              htmlFor="suspend-reason"
              className="mb-1.5 block text-[12.5px] font-medium text-[#C5CACF]"
            >
              Motif de la suspension (obligatoire)
            </label>
            <textarea
              id="suspend-reason"
              value={suspendReason}
              onChange={(event) => setSuspendReason(event.target.value)}
              rows={3}
              placeholder="Ex. taux de bounce anormal détecté sur les dernières 24 h."
              className="w-full rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2.5 text-[16px] text-[#EDEEF0] placeholder:text-[#5E646B] outline-none focus:border-[#5B7CFA]"
            />
          </div>
        )}

        {dialog === "reactivate" && (
          <div>
            <label
              htmlFor="reactivate-reason"
              className="mb-1.5 block text-[12.5px] font-medium text-[#C5CACF]"
            >
              Motif (facultatif)
            </label>
            <textarea
              id="reactivate-reason"
              value={reactivateReason}
              onChange={(event) => setReactivateReason(event.target.value)}
              rows={3}
              placeholder="Ex. cause de la suspension corrigée par le client."
              className="w-full rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2.5 text-[16px] text-[#EDEEF0] placeholder:text-[#5E646B] outline-none focus:border-[#5B7CFA]"
            />
          </div>
        )}

        {dialog === "quota" && (
          <div>
            <label
              htmlFor="quota-value"
              className="mb-1.5 block text-[12.5px] font-medium text-[#C5CACF]"
            >
              Nouveau quota (emails/jour, entre 1 et 1 000 000)
            </label>
            <input
              id="quota-value"
              type="number"
              min={MIN_DAILY_SEND_LIMIT}
              max={MAX_DAILY_SEND_LIMIT}
              step={1}
              value={quotaValue}
              onChange={(event) => setQuotaValue(event.target.value)}
              className="w-full rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2.5 text-[16px] text-[#EDEEF0] outline-none focus:border-[#5B7CFA]"
            />
          </div>
        )}

        {actionError && (
          <p className="mt-3 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
            {actionError}
          </p>
        )}

        {deleteBlocked && (
          <button
            type="button"
            onClick={openSuspend}
            className="mt-3 w-full rounded-lg border border-white/[0.14] px-4 py-2.5 text-[13.5px] font-medium text-[#EDEEF0] transition-opacity hover:opacity-90"
          >
            Suspendre le compte à la place →
          </button>
        )}
      </ConfirmDialog>
    </div>
  );
}
