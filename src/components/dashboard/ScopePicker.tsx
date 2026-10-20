"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { DomainSummary } from "@/lib/types";

export type ScopeMode = "all" | "selected";

export interface ScopeValue {
  mode: ScopeMode;
  domainIds: string[];
}

export const DEFAULT_SCOPE: ScopeValue = { mode: "all", domainIds: [] };

/** `true` si la portée peut être envoyée : « choisis » exige au moins un domaine. */
export function isScopeValid(scope: ScopeValue): boolean {
  return scope.mode === "all" || scope.domainIds.length > 0;
}

/** Corps de création : `domainIds` n'est envoyé que pour une sélection. */
export function scopeToBody(scope: ScopeValue): { domainIds?: string[] } {
  return scope.mode === "selected" ? { domainIds: scope.domainIds } : {};
}

/**
 * Choix de la portée à la création d'une clé API ou d'un identifiant SMTP
 * (B27). Les domaines vérifiés sont chargés avec l'appel existant
 * `GET /v1/domains`. Sans domaine vérifié (ou si la liste est injoignable),
 * seule l'option « Tous » est proposée.
 */
export default function ScopePicker({
  value,
  onChange,
  noun,
}: {
  value: ScopeValue;
  onChange: (value: ScopeValue) => void;
  /** « cette clé » ou « cet identifiant », pour les phrases d'explication. */
  noun: string;
}) {
  const [verified, setVerified] = useState<DomainSummary[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.get<DomainSummary[]>("/v1/domains");
        if (!active) return;
        setVerified(data.filter((domain) => domain.status === "VERIFIED"));
      } catch {
        if (!active) return;
        setLoadFailed(true);
        setVerified([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function toggle(id: string) {
    const next = value.domainIds.includes(id)
      ? value.domainIds.filter((existing) => existing !== id)
      : [...value.domainIds, id];
    onChange({ mode: "selected", domainIds: next });
  }

  return (
    <fieldset className="mt-5 min-w-0 border-0 p-0">
      <legend className="mb-1.5 p-0 text-[13px] font-medium text-[#C5CACF]">
        Domaines autorisés
      </legend>

      {verified === null && (
        <p className="text-[12.5px] text-[#70767D]">Chargement des domaines…</p>
      )}

      {verified !== null && verified.length === 0 && loadFailed && (
        <p className="text-[12.5px] leading-relaxed text-[#F5C177] text-pretty">
          Impossible de charger vos domaines : seule l’option Tous les
          domaines est proposée. Réessayez plus tard.
        </p>
      )}

      {verified !== null && verified.length === 0 && !loadFailed && (
        <p className="text-[12.5px] leading-relaxed text-[#70767D] text-pretty">
          Tous les domaines vérifiés, y compris ceux que vous vérifierez plus
          tard. Vous pourrez limiter {noun} à des domaines précis dès que vous
          aurez{" "}
          <Link
            href="/dashboard/domaines"
            className="font-medium text-[#8AA4FF] underline underline-offset-2"
          >
            vérifié un domaine
          </Link>
          .
        </p>
      )}

      {verified !== null && verified.length > 0 && (
        <>
          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2.5 text-[13.5px] text-[#EDEEF0]">
              <input
                type="radio"
                name="scope-mode"
                checked={value.mode === "all"}
                onChange={() => onChange({ mode: "all", domainIds: [] })}
                className="mt-1 accent-[#5B7CFA]"
              />
              <span>
                Tous les domaines vérifiés
                <span className="block text-[12.5px] text-[#70767D]">
                  Y compris ceux que vous vérifierez plus tard.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2.5 text-[13.5px] text-[#EDEEF0]">
              <input
                type="radio"
                name="scope-mode"
                checked={value.mode === "selected"}
                onChange={() =>
                  onChange({ mode: "selected", domainIds: value.domainIds })
                }
                className="mt-1 accent-[#5B7CFA]"
              />
              <span>
                Domaines choisis
                <span className="block text-[12.5px] text-[#70767D]">
                  Seuls les domaines cochés ci-dessous seront autorisés.
                </span>
              </span>
            </label>
          </div>

          {value.mode === "selected" && (
            <div className="mt-3 max-h-[220px] overflow-y-auto rounded-lg border border-white/[0.09] bg-[#0E1013] p-1.5">
              {verified.map((domain) => (
                <label
                  key={domain.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-[13.5px] text-[#EDEEF0] hover:bg-white/[0.04]"
                >
                  <input
                    type="checkbox"
                    checked={value.domainIds.includes(domain.id)}
                    onChange={() => toggle(domain.id)}
                    className="accent-[#5B7CFA]"
                  />
                  <span className="min-w-0 break-all font-mono">
                    {domain.name}
                  </span>
                </label>
              ))}
            </div>
          )}

          {value.mode === "selected" && value.domainIds.length === 0 && (
            <p
              role="alert"
              aria-live="polite"
              className="mt-2 text-[12.5px] text-[#F5C177]"
            >
              Cochez au moins un domaine.
            </p>
          )}
        </>
      )}

      <p className="mt-3 text-[12.5px] leading-relaxed text-[#70767D] text-pretty">
        La portée est définitive : elle ne pourra plus être modifiée après la
        création de {noun}. Pour la changer, créez-en une nouvelle.
      </p>
    </fieldset>
  );
}
