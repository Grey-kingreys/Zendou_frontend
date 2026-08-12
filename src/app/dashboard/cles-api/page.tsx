"use client";

import { useEffect, useState, type FormEvent } from "react";
import Badge from "@/components/dashboard/Badge";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import { formatDateTimeFr } from "@/lib/format";
import type { ApiKeySummary, CreateApiKeyResponse } from "@/lib/types";

export default function DashboardClesApiPage() {
  const [keys, setKeys] = useState<ApiKeySummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [revealedKey, setRevealedKey] = useState<CreateApiKeyResponse | null>(
    null
  );

  const [revokeTarget, setRevokeTarget] = useState<ApiKeySummary | null>(
    null
  );
  const [revoking, setRevoking] = useState(false);

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
    setCreating(true);

    try {
      const created = await api.post<CreateApiKeyResponse>("/v1/api-keys", {
        name: name.trim(),
      });
      setRevealedKey(created);
      setFormOpen(false);
      setName("");
      loadKeys();
    } catch (err) {
      setCreateError(
        err instanceof ApiError
          ? err.message
          : "Impossible de joindre le serveur."
      );
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
        {!revealedKey && (
          <button
            type="button"
            onClick={() => {
              setFormOpen((open) => !open);
              setCreateError(null);
            }}
            className="shrink-0 rounded-lg bg-[#5B7CFA] px-4 py-2.5 text-[13.5px] font-semibold text-[#F7F9FF] transition-opacity hover:opacity-90"
          >
            {formOpen ? "Annuler" : "Nouvelle clé"}
          </button>
        )}
      </div>

      {revealedKey && (
        <div className="mb-6 rounded-2xl border border-[#5B7CFA]/35 bg-[linear-gradient(180deg,rgba(91,124,250,0.08),rgba(91,124,250,0.01))] p-6">
          <p className="mb-1 font-heading text-base font-semibold text-[#EDEEF0]">
            Clé « {revealedKey.name} » créée
          </p>
          <p className="mb-4 text-[13.5px] text-[#9BA1A8]">
            Copiez-la maintenant : elle ne sera plus jamais affichée en
            entier.
          </p>
          <div className="mb-4 flex flex-col gap-2 rounded-lg border border-white/[0.09] bg-[#0E1013] p-4 sm:flex-row sm:items-center sm:justify-between">
            <code className="min-w-0 flex-1 truncate font-mono text-[14px] text-[#EDEEF0]">
              {revealedKey.key}
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(revealedKey.key)}
              className="shrink-0 rounded-lg border border-white/[0.14] px-3.5 py-2 text-[13px] font-medium text-[#EDEEF0] transition-opacity hover:opacity-90"
            >
              Copier
            </button>
          </div>
          <p className="mb-5 rounded-lg border border-[#F5A623]/30 bg-[#F5A623]/10 px-3.5 py-2.5 text-[13px] text-[#F5C177]">
            Cette clé ne sera plus affichée. Conservez-la maintenant.
          </p>
          <button
            type="button"
            onClick={() => setRevealedKey(null)}
            className="rounded-lg bg-[#5B7CFA] px-4 py-2.5 text-[13.5px] font-semibold text-[#F7F9FF] transition-opacity hover:opacity-90"
          >
            J’ai copié la clé
          </button>
        </div>
      )}

      {formOpen && !revealedKey && (
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
          {createError && (
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
        <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0C0D0F]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
                  <th className="px-5 py-3 font-medium">Nom</th>
                  <th className="px-5 py-3 font-medium">Préfixe</th>
                  <th className="px-5 py-3 font-medium">Créée le</th>
                  <th className="px-5 py-3 font-medium">
                    Dernière utilisation
                  </th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr
                    key={key.id}
                    className="border-b border-white/[0.05] last:border-b-0"
                  >
                    <td className="px-5 py-3.5 font-medium text-[#EDEEF0]">
                      {key.name}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[#9BA1A8]">
                      {key.prefix}…
                    </td>
                    <td className="px-5 py-3.5 text-[#9BA1A8]">
                      {formatDateTimeFr(key.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-[#9BA1A8]">
                      {formatDateTimeFr(key.lastUsedAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      {key.revokedAt ? (
                        <Badge color="red" label="Révoquée" />
                      ) : (
                        <Badge color="green" label="Active" />
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {!key.revokedAt && (
                        <button
                          type="button"
                          onClick={() => setRevokeTarget(key)}
                          className="rounded-lg border border-white/[0.14] px-3 py-1.5 text-[12.5px] font-medium text-[#EDEEF0] transition-opacity hover:opacity-90"
                        >
                          Révoquer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
    </div>
  );
}
