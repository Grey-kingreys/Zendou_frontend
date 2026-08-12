"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import ResendConfirmationControl from "@/components/confirmation/ResendConfirmationControl";
import { api, ApiError } from "@/lib/api";
import { formatNumberFr } from "@/lib/format";

interface ConfirmEmailResponse {
  confirmed: boolean;
  creditsGranted: number;
}

/**
 * Les quatre issues traitées ici correspondent au contrat figé de
 * `POST /v1/auth/confirm-email` : succès (200), jeton invalide/expiré (400),
 * déjà confirmé (409), et — cas purement front — absence de `token` dans
 * l'URL, qui ne déclenche même pas l'appel.
 */
type Outcome =
  | { kind: "no-token" }
  | { kind: "loading" }
  | { kind: "success"; creditsGranted: number }
  | { kind: "expired" }
  | { kind: "already-confirmed" }
  | { kind: "error"; message: string };

export default function ConfirmationView({ token }: { token: string | null }) {
  const [outcome, setOutcome] = useState<Outcome>(
    token ? { kind: "loading" } : { kind: "no-token" }
  );

  useEffect(() => {
    if (!token) return;
    let active = true;

    api
      .post<ConfirmEmailResponse>("/v1/auth/confirm-email", { token })
      .then((data) => {
        if (!active) return;
        setOutcome({ kind: "success", creditsGranted: data.creditsGranted });
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 400) {
          setOutcome({ kind: "expired" });
        } else if (err instanceof ApiError && err.status === 409) {
          setOutcome({ kind: "already-confirmed" });
        } else if (err instanceof ApiError) {
          setOutcome({ kind: "error", message: err.message });
        } else {
          setOutcome({
            kind: "error",
            message: "Impossible de joindre le serveur.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  if (outcome.kind === "loading") {
    return (
      <AuthCard
        title="Confirmation en cours"
        description="Un instant, nous vérifions votre lien."
        footer={null}
      >
        <p className="text-center text-sm text-[#9BA1A8]">Chargement…</p>
      </AuthCard>
    );
  }

  if (outcome.kind === "no-token") {
    return (
      <AuthCard
        title="Lien incomplet"
        description="Ce lien ne contient pas de jeton de confirmation."
        footer={
          <>
            Retrouvez le lien complet dans l&rsquo;email reçu, ou{" "}
            <Link href="/connexion" className="font-medium text-[#8AA4FF]">
              connectez-vous
            </Link>{" "}
            pour en redemander un depuis votre tableau de bord.
          </>
        }
      >
        <p className="text-center text-sm text-[#9BA1A8] text-pretty">
          Vérifiez que vous avez copié l&rsquo;adresse complète depuis
          l&rsquo;email de confirmation Zendou — un lien tronqué ne fonctionne
          pas.
        </p>
      </AuthCard>
    );
  }

  if (outcome.kind === "success") {
    return (
      <AuthCard
        title="Adresse confirmée"
        description="Votre adresse email est désormais confirmée."
        footer={
          <Link href="/dashboard" className="font-medium text-[#8AA4FF]">
            Aller au tableau de bord
          </Link>
        }
      >
        {outcome.creditsGranted > 0 ? (
          <div className="rounded-lg border border-[#35D07F]/30 bg-[#35D07F]/10 px-3.5 py-3.5 text-center text-[14px] leading-relaxed text-[#6FE3A3]">
            <p className="font-semibold">
              {formatNumberFr(outcome.creditsGranted)} emails offerts viennent
              d&rsquo;être crédités sur votre compte.
            </p>
            <p className="mt-1 text-[13px] text-[#9BA1A8]">
              Vous pouvez dès maintenant envoyer des emails et créer des clés
              API.
            </p>
          </div>
        ) : (
          <p className="text-center text-sm text-[#9BA1A8]">
            Vous pouvez maintenant envoyer des emails et créer des clés API.
          </p>
        )}
      </AuthCard>
    );
  }

  if (outcome.kind === "already-confirmed") {
    return (
      <AuthCard
        title="Déjà confirmée"
        description="Cette adresse email est déjà confirmée — tout est en ordre."
        footer={
          <Link href="/dashboard" className="font-medium text-[#8AA4FF]">
            Aller au tableau de bord
          </Link>
        }
      >
        <p className="text-center text-sm text-[#9BA1A8]">
          Il n&rsquo;y a rien de plus à faire, vous pouvez continuer
          normalement.
        </p>
      </AuthCard>
    );
  }

  if (outcome.kind === "expired") {
    return (
      <AuthCard
        title="Lien expiré"
        description="Ce lien de confirmation n'est plus valide."
        footer={
          <Link href="/connexion" className="font-medium text-[#8AA4FF]">
            Retour à la connexion
          </Link>
        }
      >
        <p className="mb-4 text-center text-sm text-[#9BA1A8] text-pretty">
          Il a peut-être expiré ou déjà été utilisé. Demandez-en un nouveau :
        </p>
        <div className="flex justify-center">
          <ResendConfirmationControl buttonLabel="Recevoir un nouveau lien" />
        </div>
      </AuthCard>
    );
  }

  // outcome.kind === "error"
  return (
    <AuthCard
      title="Impossible de confirmer"
      description={outcome.message}
      footer={
        <Link href="/connexion" className="font-medium text-[#8AA4FF]">
          Retour à la connexion
        </Link>
      }
    >
      <p className="text-center text-sm text-[#9BA1A8]">
        Réessayez dans quelques instants.
      </p>
    </AuthCard>
  );
}
