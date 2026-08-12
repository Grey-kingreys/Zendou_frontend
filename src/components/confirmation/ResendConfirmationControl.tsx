"use client";

import { useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

type ResendState =
  | "idle"
  | "sending"
  | "sent"
  | "rate-limited"
  | "suppressed"
  | "already-confirmed"
  | "unauthenticated"
  | "error";

/**
 * Bouton « Renvoyer l'email » + retours de POST /v1/auth/resend-confirmation,
 * partagé entre le bandeau du tableau de bord (UnconfirmedEmailBanner) et
 * l'état « lien expiré » de /confirmation — mêmes cas, même traitement.
 *
 * Cas 422 (adresse en liste de suppression) : un rebond dur antérieur
 * signifie qu'aucun email ne pourra plus jamais arriver à cette adresse.
 * Renvoyer ne changera rien, donc on ne réaffiche pas le bouton — on explique
 * le problème et on renvoie vers le profil pour corriger l'adresse. On ne
 * reste jamais sur un message « email envoyé » dans ce cas.
 */
export default function ResendConfirmationControl({
  buttonLabel = "Renvoyer l'email",
}: {
  buttonLabel?: string;
}) {
  const [state, setState] = useState<ResendState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleResend() {
    setState("sending");
    setErrorMessage(null);

    try {
      await api.post<{ sent: boolean }>("/v1/auth/resend-confirmation");
      setState("sent");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422) {
          setState("suppressed");
        } else if (err.status === 429) {
          setState("rate-limited");
        } else if (err.status === 409) {
          setState("already-confirmed");
        } else if (err.status === 401) {
          setState("unauthenticated");
        } else {
          setErrorMessage(err.message);
          setState("error");
        }
      } else {
        setErrorMessage("Impossible de joindre le serveur.");
        setState("error");
      }
    }
  }

  if (state === "suppressed") {
    return (
      <div className="rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-3 text-[13.5px] text-[#FF9592]">
        <p className="mb-1.5 font-medium">Cette adresse email est invalide</p>
        <p className="mb-3 leading-relaxed text-pretty">
          Un envoi précédent vers cette adresse a définitivement échoué
          (rebond dur) : aucun email ne pourra plus jamais lui parvenir tant
          qu&rsquo;elle reste en liste de suppression. Corrigez votre adresse
          depuis votre profil, puis redemandez une confirmation.
        </p>
        <Link
          href="/dashboard/profil"
          className="font-medium text-[#FF9592] underline underline-offset-2"
        >
          Aller à mon profil
        </Link>
      </div>
    );
  }

  if (state === "already-confirmed") {
    return (
      <p className="text-[13px] text-[#9BA1A8]">
        Cette adresse est déjà confirmée. Actualisez la page si le message
        persiste.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleResend}
        disabled={state === "sending"}
        className="rounded-lg border border-white/[0.14] px-3.5 py-2 text-[13px] font-medium whitespace-nowrap text-[#EDEEF0] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {state === "sending" ? "Envoi…" : buttonLabel}
      </button>

      {state === "sent" && (
        <p className="text-[12.5px] text-[#35D07F]">
          Email envoyé. Vérifiez votre boîte de réception (et vos spams).
        </p>
      )}
      {state === "rate-limited" && (
        <p className="text-[12.5px] text-[#F5C177]">
          Trop de demandes récentes : patientez quelques minutes avant de
          réessayer.
        </p>
      )}
      {state === "unauthenticated" && (
        <p className="text-[12.5px] text-[#FF9592]">
          Connectez-vous pour demander un nouveau lien.{" "}
          <Link href="/connexion" className="font-medium text-[#8AA4FF]">
            Se connecter
          </Link>
        </p>
      )}
      {state === "error" && (
        <p className="text-[12.5px] text-[#FF9592]">
          {errorMessage ?? "Impossible d'envoyer l'email pour le moment."}
        </p>
      )}
    </div>
  );
}
