"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Badge from "@/components/dashboard/Badge";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import CopyField from "@/components/dashboard/CopyField";
import { useDashboardUser } from "@/components/dashboard/dashboard-context";
import { api, ApiError } from "@/lib/api";
import { formatDateTimeShortFr } from "@/lib/format";
import type {
  ApiKeySummary,
  CreateApiKeyResponse,
  RotateApiKeyResponse,
} from "@/lib/types";

/** Union du secret révélé une seule fois : à la création ou après rotation. */
type RevealedSecret =
  | { kind: "created"; data: CreateApiKeyResponse }
  | { kind: "rotated"; data: RotateApiKeyResponse };

export default function DashboardClesApiPage() {
  const user = useDashboardUser();
  const [keys, setKeys] = useState<ApiKeySummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  // 403 spécifique : compte pas encore confirmé. En pratique inatteignable
  // depuis la vague 8 — le garde du tableau de bord (dashboard/layout.tsx)
  // redirige déjà tout compte non confirmé vers /confirmez-votre-email avant
  // que cet écran ne soit rendu — mais conservé en défense en profondeur si
  // jamais ce garde était contourné. Distingué de createError pour afficher
  // un message qui renvoie vers l'écran de confirmation plutôt que le texte
  // brut de l'API.
  const [createForbidden, setCreateForbidden] = useState(false);

  const [revealedSecret, setRevealedSecret] = useState<RevealedSecret | null>(
    null
  );

  const [revokeTarget, setRevokeTarget] = useState<ApiKeySummary | null>(
    null
  );
  const [revoking, setRevoking] = useState(false);

  const [rotateTarget, setRotateTarget] = useState<ApiKeySummary | null>(
    null
  );
  const [rotating, setRotating] = useState(false);

  const [purgeTarget, setPurgeTarget] = useState<ApiKeySummary | null>(null);
  const [purging, setPurging] = useState(false);

  async function loadKeys() {
    try {
      const data = await api.get<ApiKeySummary[]>("/v1/api-keys");
      setKeys(data);
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
        const data = await api.get<ApiKeySummary[]>("/v1/api-keys");
        if (!active) return;
        setKeys(data);
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
    setCreateForbidden(false);
    setCreating(true);

    try {
      const created = await api.post<CreateApiKeyResponse>("/v1/api-keys", {
        name: name.trim(),
      });
      setRevealedSecret({ kind: "created", data: created });
      setFormOpen(false);
      setName("");
      loadKeys();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        // Contrat API : la création de clé renvoie 403 tant que le compte
        // n'est pas confirmé — pas une erreur générique.
        setCreateForbidden(true);
      } else {
        setCreateError(
          err instanceof ApiError
            ? err.message
            : "Impossible de joindre le serveur."
        );
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke() {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await api.del(`/v1/api-keys/${revokeTarget.id}`);
      setRevokeTarget(null);
      loadKeys();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de joindre le serveur."
      );
      setRevokeTarget(null);
    } finally {
      setRevoking(false);
    }
  }

  /**
   * Rotation : régénère le secret sur place (coupure immédiate de l'ancienne
   * valeur, sans période de grâce — voir le texte du dialogue de
   * confirmation ci-dessous). 409 si la clé est révoquée : impossible en
   * temps normal puisque le bouton n'est pas proposé sur une clé révoquée,
   * mais peut survenir en cas de course avec un autre onglet — le message
   * de l'API est alors affiché tel quel via `err.message`.
   */
  async function handleRotate() {
    if (!rotateTarget) return;
    setRotating(true);
    try {
      const rotated = await api.post<RotateApiKeyResponse>(
        `/v1/api-keys/${rotateTarget.id}/rotate`
      );
      setRevealedSecret({ kind: "rotated", data: rotated });
      setRotateTarget(null);
      loadKeys();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de joindre le serveur."
      );
      setRotateTarget(null);
    } finally {
      setRotating(false);
    }
  }

  /**
   * Suppression définitive : réservée aux clés déjà révoquées (le bouton
   * n'est proposé que dans ce cas). 409 si la clé est encore active malgré
   * tout — course avec un autre onglet — le message de l'API est alors
   * affiché tel quel via `err.message`.
   */
  async function handlePurge() {
    if (!purgeTarget) return;
    setPurging(true);
    try {
      await api.del(`/v1/api-keys/${purgeTarget.id}/purge`);
      setPurgeTarget(null);
      loadKeys();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de joindre le serveur."
      );
      setPurgeTarget(null);
    } finally {
      setPurging(false);
    }
  }

  return (
    <div className="mx-auto max-w-[880px]">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1.5 font-heading text-2xl font-semibold text-[#EDEEF0]">
            Clés API
          </h1>
          <p className="text-sm text-[#9BA1A8]">
            Utilisez une clé API pour authentifier vos appels à l’API
            d’envoi.
          </p>
        </div>
        {!revealedSecret && (
          <button
            type="button"
            onClick={() => {
              setFormOpen((open) => !open);
              setCreateError(null);
              setCreateForbidden(false);
            }}
            className="shrink-0 rounded-lg bg-[#5B7CFA] px-4 py-2.5 text-[13.5px] font-semibold text-[#F7F9FF] transition-opacity hover:opacity-90"
          >
            {formOpen ? "Annuler" : "Nouvelle clé"}
          </button>
        )}
      </div>

      {/*
       * Mode bac à sable (B20, façon Resend) : envoyer immédiatement, sans
       * domaine vérifié, depuis l'adresse de test de Zendou — à condition
       * d'écrire à sa propre adresse de compte. `testSenderAddress` vient de
       * `GET /v1/auth/me` (partagé via `useDashboardUser`) ; tant que le
       * backend ne renvoie pas ce champ, il est `undefined` et ce bloc reste
       * simplement invisible plutôt que d'afficher une adresse devinée.
       */}
      {user.testSenderAddress && (
        <div className="mb-6 rounded-2xl border border-[#35D07F]/25 bg-[linear-gradient(180deg,rgba(53,208,127,0.06),rgba(53,208,127,0.01))] p-6">
          <div className="mb-2 flex flex-wrap items-center gap-2.5">
            <h2 className="font-heading text-base font-semibold text-[#EDEEF0]">
              Envoyez tout de suite, sans domaine
            </h2>
            <Badge color="green" label="Bac à sable" />
          </div>
          <p className="mb-4 text-[13.5px] leading-relaxed text-[#9BA1A8] text-pretty">
            Utilisez cette adresse comme expéditeur (<code>from</code>) pour
            envoyer votre premier email dès maintenant — pratique pour tester
            votre intégration avant de vérifier un domaine.
          </p>
          <div className="mb-4 rounded-lg border border-white/[0.09] bg-[#0E1013] p-1.5">
            <CopyField value={user.testSenderAddress} className="w-full" />
          </div>
          <p className="text-[13px] leading-relaxed text-[#9BA1A8] text-pretty">
            Tant qu&rsquo;aucun domaine n&rsquo;est vérifié, vous ne pouvez
            écrire qu&rsquo;à l&rsquo;adresse email de votre compte (
            {user.email}).{" "}
            <Link
              href="/dashboard/domaines"
              className="font-medium text-[#8AA4FF] underline underline-offset-2"
            >
              Vérifiez un domaine
            </Link>{" "}
            quand vous passerez en production, pour écrire à vos
            utilisateurs.
          </p>
        </div>
      )}

      {revealedSecret && (
        <div className="mb-6 rounded-2xl border border-[#5B7CFA]/35 bg-[linear-gradient(180deg,rgba(91,124,250,0.08),rgba(91,124,250,0.01))] p-6">
          <p className="mb-1 font-heading text-base font-semibold text-[#EDEEF0]">
            {revealedSecret.kind === "created"
              ? `Clé « ${revealedSecret.data.name} » créée`
              : `Clé « ${revealedSecret.data.name} » réinitialisée`}
          </p>
          <p className="mb-4 text-[13.5px] text-[#9BA1A8]">
            Copiez-la maintenant : elle ne sera plus jamais affichée en
            entier.
          </p>
          <div className="mb-4 flex flex-col gap-2 rounded-lg border border-white/[0.09] bg-[#0E1013] p-4 sm:flex-row sm:items-center sm:justify-between">
            <code className="min-w-0 flex-1 truncate font-mono text-[14px] text-[#EDEEF0]">
              {revealedSecret.data.key}
            </code>
            <button
              type="button"
              onClick={() =>
                navigator.clipboard.writeText(revealedSecret.data.key)
              }
              className="shrink-0 rounded-lg border border-white/[0.14] px-3.5 py-2 text-[13px] font-medium text-[#EDEEF0] transition-opacity hover:opacity-90"
            >
              Copier
            </button>
          </div>
          {revealedSecret.kind === "rotated" && (
            <p className="mb-4 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13px] text-[#FF9592]">
              L’ancienne clé a cessé de fonctionner immédiatement. Déployez
              cette nouvelle valeur pour rétablir l’application qui
              l’utilise.
            </p>
          )}
          <p className="mb-5 rounded-lg border border-[#F5A623]/30 bg-[#F5A623]/10 px-3.5 py-2.5 text-[13px] text-[#F5C177]">
            Cette clé ne sera plus affichée. Conservez-la maintenant.
          </p>
          <button
            type="button"
            onClick={() => setRevealedSecret(null)}
            className="rounded-lg bg-[#5B7CFA] px-4 py-2.5 text-[13.5px] font-semibold text-[#F7F9FF] transition-opacity hover:opacity-90"
          >
            J’ai copié la clé
          </button>
        </div>
      )}

      {formOpen && !revealedSecret && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-6"
        >
          <label
            htmlFor="key-name"
            className="mb-1.5 block text-[13px] font-medium text-[#C5CACF]"
          >
            Nom de la clé
          </label>
          <p className="mb-3 text-[12.5px] text-[#70767D]">
            Un nom qui vous aidera à la reconnaître plus tard (ex. « Serveur
            de production »).
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="key-name"
              name="name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Serveur de production"
              className="w-full flex-1 rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2.5 text-[16px] text-[#EDEEF0] placeholder:text-[#5E646B] outline-none transition-colors focus:border-[#5B7CFA] focus:ring-1 focus:ring-[#5B7CFA]"
            />
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="shrink-0 rounded-lg bg-[#5B7CFA] px-5 py-2.5 text-[13.5px] font-semibold text-[#F7F9FF] transition-opacity disabled:opacity-60"
            >
              {creating ? "Création…" : "Créer la clé"}
            </button>
          </div>
          {createForbidden && (
            <p className="mt-3 rounded-lg border border-[#F5A623]/30 bg-[#F5A623]/10 px-3.5 py-2.5 text-[13.5px] text-[#F5C177]">
              Confirmez votre adresse email avant de créer une clé API.{" "}
              <Link
                href="/confirmez-votre-email"
                className="font-medium underline underline-offset-2"
              >
                Renvoyer le lien de confirmation
              </Link>
            </p>
          )}
          {createError && !createForbidden && (
            <p className="mt-3 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
              {createError}
            </p>
          )}
        </form>
      )}

      {error && (
        <p className="mb-6 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
          {error}
        </p>
      )}

      {keys === null && !error && (
        <p className="text-sm text-[#9BA1A8]">Chargement…</p>
      )}

      {keys !== null && keys.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/[0.13] bg-white/[0.015] px-8 py-16 text-center">
          <h2 className="mb-2 font-heading text-lg font-semibold text-[#EDEEF0]">
            Aucune clé API pour l’instant
          </h2>
          <p className="mx-auto max-w-[420px] text-sm leading-relaxed text-[#9BA1A8] text-pretty">
            Créez une première clé pour commencer à envoyer des emails via
            l’API Zendou.
          </p>
        </div>
      )}

      {keys !== null && keys.length > 0 && (
        <>
          {/*
           * >= md : tableau classique avec colonne Actions collante à
           * droite (voir commit 948d191 sur /admin/recharges) — chaque
           * ligne active peut porter deux boutons (Réinitialiser,
           * Révoquer) et le préfixe/les dates sont en police fixe, donc le
           * tableau peut dépasser son conteneur ; sans colonne collante, le
           * dernier bouton finit hors champ. En dessous de md, cartes
           * empilées avec actions en pleine largeur.
           */}
          <div className="hidden overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0C0D0F] md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
                    <th className="px-4 py-3 font-medium">Nom</th>
                    <th className="px-3 py-3 font-medium whitespace-nowrap">
                      Préfixe
                    </th>
                    <th className="px-3 py-3 font-medium whitespace-nowrap">
                      Créée le
                    </th>
                    <th className="px-3 py-3 font-medium whitespace-nowrap">
                      Dernière utilisation
                    </th>
                    <th className="px-3 py-3 font-medium whitespace-nowrap">
                      Statut
                    </th>
                    <th className="sticky right-0 z-10 bg-[#0C0D0F] px-3 py-3 font-medium whitespace-nowrap shadow-[-8px_0_12px_-6px_rgba(0,0,0,0.55)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr
                      key={key.id}
                      className="border-b border-white/[0.05] last:border-b-0"
                    >
                      <td className="px-4 py-3.5 font-medium text-[#EDEEF0]">
                        {key.name}
                      </td>
                      <td className="px-3 py-3.5 font-mono whitespace-nowrap text-[#9BA1A8]">
                        {key.prefix}…
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-[#9BA1A8]">
                        {formatDateTimeShortFr(key.createdAt)}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-[#9BA1A8]">
                        {formatDateTimeShortFr(key.lastUsedAt)}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {key.revokedAt ? (
                          <Badge color="red" label="Révoquée" />
                        ) : (
                          <Badge color="green" label="Active" />
                        )}
                      </td>
                      <td className="sticky right-0 z-10 bg-[#0C0D0F] px-3 py-3.5 shadow-[-8px_0_12px_-6px_rgba(0,0,0,0.55)]">
                        <div className="flex justify-end gap-1.5">
                          {!key.revokedAt && (
                            <>
                              <button
                                type="button"
                                onClick={() => setRotateTarget(key)}
                                className="rounded-lg border border-white/[0.14] px-3 py-1.5 text-[12.5px] font-medium whitespace-nowrap text-[#EDEEF0] transition-opacity hover:opacity-90"
                              >
                                Réinitialiser
                              </button>
                              <button
                                type="button"
                                onClick={() => setRevokeTarget(key)}
                                className="rounded-lg border border-white/[0.14] px-3 py-1.5 text-[12.5px] font-medium whitespace-nowrap text-[#EDEEF0] transition-opacity hover:opacity-90"
                              >
                                Révoquer
                              </button>
                            </>
                          )}
                          {key.revokedAt && (
                            <button
                              type="button"
                              onClick={() => setPurgeTarget(key)}
                              className="rounded-lg border border-[#E5484D]/30 px-3 py-1.5 text-[12.5px] font-medium whitespace-nowrap text-[#FF9592] transition-opacity hover:opacity-90"
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* < md : une carte par clé, actions pleine largeur empilées. */}
          <div className="flex flex-col gap-3 md:hidden">
            {keys.map((key) => (
              <div
                key={key.id}
                className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span className="min-w-0 truncate text-[14px] font-medium text-[#EDEEF0]">
                    {key.name}
                  </span>
                  {key.revokedAt ? (
                    <Badge color="red" label="Révoquée" />
                  ) : (
                    <Badge color="green" label="Active" />
                  )}
                </div>

                <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-[13px]">
                  <div>
                    <dt className="text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
                      Préfixe
                    </dt>
                    <dd className="truncate font-mono text-[#C5CACF]">
                      {key.prefix}…
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
                      Créée le
                    </dt>
                    <dd className="text-[#9BA1A8]">
                      {formatDateTimeShortFr(key.createdAt)}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
                      Dernière utilisation
                    </dt>
                    <dd className="text-[#9BA1A8]">
                      {formatDateTimeShortFr(key.lastUsedAt)}
                    </dd>
                  </div>
                </dl>

                {!key.revokedAt && (
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setRotateTarget(key)}
                      className="w-full rounded-lg border border-white/[0.14] px-3 py-2 text-[13px] font-medium text-[#EDEEF0] transition-opacity hover:opacity-90"
                    >
                      Réinitialiser
                    </button>
                    <button
                      type="button"
                      onClick={() => setRevokeTarget(key)}
                      className="w-full rounded-lg border border-white/[0.14] px-3 py-2 text-[13px] font-medium text-[#EDEEF0] transition-opacity hover:opacity-90"
                    >
                      Révoquer
                    </button>
                  </div>
                )}
                {key.revokedAt && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setPurgeTarget(key)}
                      className="w-full rounded-lg border border-[#E5484D]/30 px-3 py-2 text-[13px] font-medium text-[#FF9592] transition-opacity hover:opacity-90"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={revokeTarget !== null}
        title="Révoquer cette clé ?"
        description={`La clé « ${revokeTarget?.name ?? ""} » ne pourra plus être utilisée pour envoyer des emails. Cette action est irréversible.`}
        confirmLabel="Révoquer"
        danger
        loading={revoking}
        onConfirm={handleRevoke}
        onCancel={() => setRevokeTarget(null)}
      />

      <ConfirmDialog
        open={rotateTarget !== null}
        title="Réinitialiser cette clé ?"
        description={`La clé « ${rotateTarget?.name ?? ""} » sera immédiatement remplacée par une nouvelle valeur : l’ancienne clé cesse de fonctionner à l’instant où vous confirmez, sans période de grâce. L’application qui l’utilise sera coupée tant que la nouvelle valeur n’est pas déployée.`}
        confirmLabel="Réinitialiser"
        danger
        loading={rotating}
        onConfirm={handleRotate}
        onCancel={() => setRotateTarget(null)}
      />

      <ConfirmDialog
        open={purgeTarget !== null}
        title="Supprimer définitivement cette clé ?"
        description={`La clé « ${purgeTarget?.name ?? ""} » sera supprimée définitivement, y compris son historique d’utilisation. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        danger
        loading={purging}
        onConfirm={handlePurge}
        onCancel={() => setPurgeTarget(null)}
      />
    </div>
  );
}
