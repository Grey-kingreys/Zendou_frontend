"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Badge from "@/components/dashboard/Badge";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import CopyField from "@/components/dashboard/CopyField";
import ScopeBadge from "@/components/dashboard/ScopeBadge";
import ScopePicker, {
  DEFAULT_SCOPE,
  isScopeValid,
  scopeToBody,
  type ScopeValue,
} from "@/components/dashboard/ScopePicker";
import { api, ApiError } from "@/lib/api";
import { formatDateTimeShortFr } from "@/lib/format";
import {
  SMTP_ALTERNATE_PORTS,
  SMTP_LIMITS,
  SMTP_PRIMARY_PORT,
  SMTP_RELAY_HOST,
} from "@/lib/smtp";
import type {
  CreateSmtpCredentialResponse,
  RotateSmtpCredentialResponse,
  SmtpCredentialSummary,
} from "@/lib/types";

/** Union du mot de passe révélé une seule fois : à la création ou après rotation. */
type RevealedSecret =
  | { kind: "created"; data: CreateSmtpCredentialResponse }
  | { kind: "rotated"; data: RotateSmtpCredentialResponse };

export default function DashboardSmtpPage() {
  const [credentials, setCredentials] = useState<
    SmtpCredentialSummary[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [scope, setScope] = useState<ScopeValue>(DEFAULT_SCOPE);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  // 403 spécifique : compte pas encore confirmé (même garde que la création
  // de clé API, voir /dashboard/cles-api). En pratique inatteignable depuis
  // la vague 8 - le garde du tableau de bord redirige déjà tout compte non
  // confirmé - mais conservé en défense en profondeur.
  const [createForbidden, setCreateForbidden] = useState(false);

  const [revealedSecret, setRevealedSecret] = useState<RevealedSecret | null>(
    null
  );

  const [revokeTarget, setRevokeTarget] = useState<SmtpCredentialSummary | null>(
    null
  );
  const [revoking, setRevoking] = useState(false);

  const [rotateTarget, setRotateTarget] = useState<SmtpCredentialSummary | null>(
    null
  );
  const [rotating, setRotating] = useState(false);

  const [purgeTarget, setPurgeTarget] = useState<SmtpCredentialSummary | null>(
    null
  );
  const [purging, setPurging] = useState(false);

  async function loadCredentials() {
    try {
      const data = await api.get<SmtpCredentialSummary[]>(
        "/v1/smtp-credentials"
      );
      setCredentials(data);
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
        const data = await api.get<SmtpCredentialSummary[]>(
          "/v1/smtp-credentials"
        );
        if (!active) return;
        setCredentials(data);
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
      const created = await api.post<CreateSmtpCredentialResponse>(
        "/v1/smtp-credentials",
        { name: name.trim(), ...scopeToBody(scope) }
      );
      setRevealedSecret({ kind: "created", data: created });
      setFormOpen(false);
      setName("");
      setScope(DEFAULT_SCOPE);
      loadCredentials();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        // Contrat API : la création d'un identifiant SMTP renvoie 403 tant
        // que le compte n'est pas confirmé - pas une erreur générique.
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
      await api.del(`/v1/smtp-credentials/${revokeTarget.id}`);
      setRevokeTarget(null);
      loadCredentials();
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
   * Rotation : régénère le mot de passe sur place (coupure immédiate de
   * l'ancienne valeur, sans période de grâce - voir le texte du dialogue de
   * confirmation ci-dessous). 409 si l'identifiant est révoqué : impossible
   * en temps normal puisque le bouton n'est pas proposé sur un identifiant
   * révoqué, mais peut survenir en cas de course avec un autre onglet - le
   * message de l'API est alors affiché tel quel via `err.message`.
   */
  async function handleRotate() {
    if (!rotateTarget) return;
    setRotating(true);
    try {
      const rotated = await api.post<RotateSmtpCredentialResponse>(
        `/v1/smtp-credentials/${rotateTarget.id}/rotate`
      );
      setRevealedSecret({ kind: "rotated", data: rotated });
      setRotateTarget(null);
      loadCredentials();
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
   * Suppression définitive : réservée aux identifiants déjà révoqués (le
   * bouton n'est proposé que dans ce cas). 409 si l'identifiant est encore
   * actif malgré tout - course avec un autre onglet - le message de l'API
   * est alors affiché tel quel via `err.message`.
   */
  async function handlePurge() {
    if (!purgeTarget) return;
    setPurging(true);
    try {
      await api.del(`/v1/smtp-credentials/${purgeTarget.id}/purge`);
      setPurgeTarget(null);
      loadCredentials();
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

  // Portée affichée avec le secret révélé : la réponse de création la porte ;
  // la rotation la conserve mais ne la renvoie pas, on la relit dans la liste.
  const revealedScope = revealedSecret
    ? revealedSecret.kind === "created"
      ? revealedSecret.data
      : (credentials?.find(
          (credential) => credential.id === revealedSecret.data.id
        ) ?? {})
    : {};

  return (
    <div className="mx-auto max-w-[880px]">
      <div className="mb-8">
        <h1 className="mb-1.5 font-heading text-2xl font-semibold text-[#EDEEF0]">
          Relais SMTP
        </h1>
        <p className="text-sm text-[#9BA1A8]">
          Envoyez des emails depuis n’importe quel logiciel qui parle SMTP
          (WordPress, votre ERP, un CRM…), sans passer par l’API.
        </p>
      </div>

      {/* Paramètres de connexion - valeurs centralisées dans src/lib/smtp.ts */}
      <div className="mb-6 rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-6">
        <h2 className="mb-1 font-heading text-base font-semibold text-[#EDEEF0]">
          Paramètres de connexion
        </h2>
        <p className="mb-4 text-[13.5px] text-[#9BA1A8]">
          À renseigner dans la configuration SMTP de votre application, avec
          un identifiant créé ci-dessous.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ConnectionField label="Hôte" value={SMTP_RELAY_HOST} />
          <ConnectionField
            label={`Port principal · ${SMTP_PRIMARY_PORT.mode}`}
            value={String(SMTP_PRIMARY_PORT.port)}
          />
          {SMTP_ALTERNATE_PORTS.map((p) => (
            <ConnectionField
              key={p.port}
              label={`Port alternatif · ${p.mode}`}
              value={String(p.port)}
              hint={p.note}
            />
          ))}
        </div>
      </div>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="mb-1.5 font-heading text-base font-semibold text-[#EDEEF0]">
            Identifiants SMTP
          </h2>
          <p className="text-[13.5px] text-[#9BA1A8]">
            Chaque identifiant a son propre nom d’utilisateur et mot de
            passe - révocables indépendamment de vos clés API.
          </p>
        </div>
        {!revealedSecret && (
          <button
            type="button"
            onClick={() => {
              setFormOpen((open) => !open);
              setScope(DEFAULT_SCOPE);
              setCreateError(null);
              setCreateForbidden(false);
            }}
            className="shrink-0 rounded-lg bg-[#5B7CFA] px-4 py-2.5 text-[13.5px] font-semibold text-[#F7F9FF] transition-opacity hover:opacity-90"
          >
            {formOpen ? "Annuler" : "Nouvel identifiant"}
          </button>
        )}
      </div>

      {revealedSecret && (
        <div className="mb-6 rounded-2xl border border-[#5B7CFA]/35 bg-[linear-gradient(180deg,rgba(91,124,250,0.08),rgba(91,124,250,0.01))] p-6">
          <p className="mb-1 font-heading text-base font-semibold text-[#EDEEF0]">
            {revealedSecret.kind === "created"
              ? `Identifiant « ${revealedSecret.data.name} » créé`
              : `Identifiant « ${revealedSecret.data.name} » réinitialisé`}
          </p>
          <p className="mb-4 text-[13.5px] text-[#9BA1A8]">
            Copiez le mot de passe maintenant : il ne sera plus jamais
            affiché en entier. Utilisez-le avec l’hôte et le port ci-dessus.
          </p>

          <div className="mb-3 flex min-w-0 flex-wrap items-center gap-2 text-[13px] text-[#9BA1A8]">
            <span>Portée :</span>
            <ScopeBadge {...revealedScope} />
          </div>

          <div className="mb-3">
            <ConnectionField
              label="Nom d’utilisateur"
              value={revealedSecret.data.username}
            />
          </div>

          <div className="mb-4 flex flex-col gap-2 rounded-lg border border-white/[0.09] bg-[#0E1013] p-4 sm:flex-row sm:items-center sm:justify-between">
            <code className="min-w-0 flex-1 truncate font-mono text-[14px] text-[#EDEEF0]">
              {revealedSecret.data.password}
            </code>
            <button
              type="button"
              onClick={() =>
                navigator.clipboard.writeText(revealedSecret.data.password)
              }
              className="shrink-0 rounded-lg border border-white/[0.14] px-3.5 py-2 text-[13px] font-medium text-[#EDEEF0] transition-opacity hover:opacity-90"
            >
              Copier
            </button>
          </div>
          {revealedSecret.kind === "rotated" && (
            <p className="mb-4 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13px] text-[#FF9592]">
              L’ancien mot de passe cesse de fonctionner immédiatement.
              Mettez à jour la configuration SMTP qui l’utilise avec cette
              nouvelle valeur.
            </p>
          )}
          <p className="mb-5 rounded-lg border border-[#F5A623]/30 bg-[#F5A623]/10 px-3.5 py-2.5 text-[13px] text-[#F5C177]">
            Ce mot de passe ne sera plus affiché. Conservez-le maintenant.
          </p>
          <button
            type="button"
            onClick={() => setRevealedSecret(null)}
            className="rounded-lg bg-[#5B7CFA] px-4 py-2.5 text-[13.5px] font-semibold text-[#F7F9FF] transition-opacity hover:opacity-90"
          >
            J’ai copié le mot de passe
          </button>
        </div>
      )}

      {formOpen && !revealedSecret && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-6"
        >
          <label
            htmlFor="smtp-credential-name"
            className="mb-1.5 block text-[13px] font-medium text-[#C5CACF]"
          >
            Nom de l’identifiant
          </label>
          <p className="mb-3 text-[12.5px] text-[#70767D]">
            Un nom qui vous aidera à le reconnaître plus tard (ex. «
            WordPress production »).
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="smtp-credential-name"
              name="name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="WordPress production"
              className="w-full flex-1 rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2.5 text-[16px] text-[#EDEEF0] placeholder:text-[#5E646B] outline-none transition-colors focus:border-[#5B7CFA] focus:ring-1 focus:ring-[#5B7CFA]"
            />
            <button
              type="submit"
              disabled={creating || !name.trim() || !isScopeValid(scope)}
              className="shrink-0 rounded-lg bg-[#5B7CFA] px-5 py-2.5 text-[13.5px] font-semibold text-[#F7F9FF] transition-opacity disabled:opacity-60"
            >
              {creating ? "Création…" : "Créer l’identifiant"}
            </button>
          </div>
          <ScopePicker
            value={scope}
            onChange={setScope}
            noun="cet identifiant"
          />
          {createForbidden && (
            <p className="mt-3 rounded-lg border border-[#F5A623]/30 bg-[#F5A623]/10 px-3.5 py-2.5 text-[13.5px] text-[#F5C177]">
              Confirmez votre adresse email avant de créer un identifiant
              SMTP.
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

      {credentials === null && !error && (
        <p className="mb-6 text-sm text-[#9BA1A8]">Chargement…</p>
      )}

      {credentials !== null && credentials.length === 0 && (
        <div className="mb-8 rounded-2xl border border-dashed border-white/[0.13] bg-white/[0.015] px-8 py-16 text-center">
          <h2 className="mb-2 font-heading text-lg font-semibold text-[#EDEEF0]">
            Aucun identifiant SMTP pour l’instant
          </h2>
          <p className="mx-auto max-w-[420px] text-sm leading-relaxed text-[#9BA1A8] text-pretty">
            Créez un premier identifiant pour commencer à envoyer des emails
            via le relais SMTP de Zendou.
          </p>
        </div>
      )}

      {credentials !== null && credentials.length > 0 && (
        <div className="mb-8">
          {/*
           * >= md : tableau classique avec colonne Actions collante à
           * droite, comme /dashboard/cles-api - chaque ligne active peut
           * porter deux boutons (Réinitialiser, Révoquer) et les dates sont
           * en police fixe, donc le tableau peut dépasser son conteneur ;
           * sans colonne collante, le dernier bouton finit hors champ. En
           * dessous de md, cartes empilées avec actions en pleine largeur.
           */}
          <div className="hidden overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0C0D0F] md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
                    <th className="px-4 py-3 font-medium">Nom</th>
                    <th className="px-3 py-3 font-medium whitespace-nowrap">
                      Utilisateur
                    </th>
                    <th className="px-3 py-3 font-medium whitespace-nowrap">
                      Préfixe
                    </th>
                    <th className="px-3 py-3 font-medium whitespace-nowrap">
                      Créé le
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
                  {credentials.map((credential) => (
                    <tr
                      key={credential.id}
                      className="border-b border-white/[0.05] last:border-b-0"
                    >
                      <td className="px-4 py-3.5 font-medium text-[#EDEEF0]">
                        {credential.name}
                        <div className="mt-1.5 max-w-[240px] font-normal">
                          <ScopeBadge
                            domainScope={credential.domainScope}
                            domains={credential.domains}
                          />
                        </div>
                      </td>
                      <td className="px-1 py-1.5">
                        <CopyField value={credential.username} />
                      </td>
                      <td className="px-3 py-3.5 font-mono whitespace-nowrap text-[#9BA1A8]">
                        {credential.prefix}…
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-[#9BA1A8]">
                        {formatDateTimeShortFr(credential.createdAt)}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-[#9BA1A8]">
                        {formatDateTimeShortFr(credential.lastUsedAt)}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {credential.revokedAt ? (
                          <Badge color="red" label="Révoqué" />
                        ) : (
                          <Badge color="green" label="Actif" />
                        )}
                      </td>
                      <td className="sticky right-0 z-10 bg-[#0C0D0F] px-3 py-3.5 shadow-[-8px_0_12px_-6px_rgba(0,0,0,0.55)]">
                        <div className="flex justify-end gap-1.5">
                          {!credential.revokedAt && (
                            <>
                              <button
                                type="button"
                                onClick={() => setRotateTarget(credential)}
                                className="rounded-lg border border-white/[0.14] px-3 py-1.5 text-[12.5px] font-medium whitespace-nowrap text-[#EDEEF0] transition-opacity hover:opacity-90"
                              >
                                Réinitialiser
                              </button>
                              <button
                                type="button"
                                onClick={() => setRevokeTarget(credential)}
                                className="rounded-lg border border-white/[0.14] px-3 py-1.5 text-[12.5px] font-medium whitespace-nowrap text-[#EDEEF0] transition-opacity hover:opacity-90"
                              >
                                Révoquer
                              </button>
                            </>
                          )}
                          {credential.revokedAt && (
                            <button
                              type="button"
                              onClick={() => setPurgeTarget(credential)}
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

          {/* < md : une carte par identifiant, actions pleine largeur empilées. */}
          <div className="flex flex-col gap-3 md:hidden">
            {credentials.map((credential) => (
              <div
                key={credential.id}
                className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span className="min-w-0 truncate text-[14px] font-medium text-[#EDEEF0]">
                    {credential.name}
                  </span>
                  {credential.revokedAt ? (
                    <Badge color="red" label="Révoqué" />
                  ) : (
                    <Badge color="green" label="Actif" />
                  )}
                </div>

                <dl className="grid grid-cols-1 gap-y-2.5 text-[13px]">
                  <div>
                    <dt className="mb-1 text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
                      Utilisateur
                    </dt>
                    <dd>
                      <CopyField
                        value={credential.username}
                        className="-ml-1.5"
                      />
                    </dd>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3">
                    <div>
                      <dt className="text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
                        Préfixe
                      </dt>
                      <dd className="truncate font-mono text-[#C5CACF]">
                        {credential.prefix}…
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
                        Créé le
                      </dt>
                      <dd className="text-[#9BA1A8]">
                        {formatDateTimeShortFr(credential.createdAt)}
                      </dd>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <dt className="mb-1 text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
                      Portée
                    </dt>
                    <dd>
                      <ScopeBadge
                        domainScope={credential.domainScope}
                        domains={credential.domains}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
                      Dernière utilisation
                    </dt>
                    <dd className="text-[#9BA1A8]">
                      {formatDateTimeShortFr(credential.lastUsedAt)}
                    </dd>
                  </div>
                </dl>

                {!credential.revokedAt && (
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setRotateTarget(credential)}
                      className="w-full rounded-lg border border-white/[0.14] px-3 py-2 text-[13px] font-medium text-[#EDEEF0] transition-opacity hover:opacity-90"
                    >
                      Réinitialiser
                    </button>
                    <button
                      type="button"
                      onClick={() => setRevokeTarget(credential)}
                      className="w-full rounded-lg border border-white/[0.14] px-3 py-2 text-[13px] font-medium text-[#EDEEF0] transition-opacity hover:opacity-90"
                    >
                      Révoquer
                    </button>
                  </div>
                )}
                {credential.revokedAt && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setPurgeTarget(credential)}
                      className="w-full rounded-lg border border-[#E5484D]/30 px-3 py-2 text-[13px] font-medium text-[#FF9592] transition-opacity hover:opacity-90"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Limites du canal SMTP - plan §4.5/§4.7, valeurs dans src/lib/smtp.ts */}
      <div className="rounded-2xl border border-white/[0.09] bg-white/[0.015] p-6">
        <h2 className="mb-3 font-heading text-base font-semibold text-[#EDEEF0]">
          Limites
        </h2>
        <ul className="space-y-2 text-[13.5px] leading-relaxed text-[#9BA1A8]">
          <li>
            {SMTP_LIMITS.creditsPerRecipient} crédit consommé par destinataire
          </li>
          <li>{SMTP_LIMITS.maxRecipients} destinataires maximum par message</li>
          <li>{SMTP_LIMITS.maxMessageSizeLabel} maximum par message</li>
        </ul>
      </div>

      <ConfirmDialog
        open={revokeTarget !== null}
        title="Révoquer cet identifiant ?"
        description={`L’identifiant « ${revokeTarget?.name ?? ""} » ne pourra plus être utilisé pour envoyer des emails via SMTP. Cette action est irréversible.`}
        confirmLabel="Révoquer"
        danger
        loading={revoking}
        onConfirm={handleRevoke}
        onCancel={() => setRevokeTarget(null)}
      />

      <ConfirmDialog
        open={rotateTarget !== null}
        title="Réinitialiser cet identifiant ?"
        description={`Le mot de passe de « ${rotateTarget?.name ?? ""} » sera immédiatement remplacé par une nouvelle valeur : l’ancien mot de passe cesse de fonctionner à l’instant où vous confirmez, sans période de grâce. La configuration SMTP qui l’utilise sera coupée tant que la nouvelle valeur n’est pas déployée.`}
        confirmLabel="Réinitialiser"
        danger
        loading={rotating}
        onConfirm={handleRotate}
        onCancel={() => setRotateTarget(null)}
      />

      <ConfirmDialog
        open={purgeTarget !== null}
        title="Supprimer définitivement cet identifiant ?"
        description={`L’identifiant « ${purgeTarget?.name ?? ""} » sera supprimé définitivement, y compris son historique d’utilisation. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        danger
        loading={purging}
        onConfirm={handlePurge}
        onCancel={() => setPurgeTarget(null)}
      />
    </div>
  );
}

/** Ligne « Paramètres de connexion » : libellé + valeur copiable, hôte ou port. */
function ConnectionField({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/[0.09] bg-[#0E1013] p-1.5">
      <span className="block px-1.5 pt-1 text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
        {label}
      </span>
      <CopyField value={value} className="w-full" />
      {hint && (
        <p className="px-1.5 pb-1 text-[12px] leading-relaxed text-[#70767D] text-pretty">
          {hint}
        </p>
      )}
    </div>
  );
}
