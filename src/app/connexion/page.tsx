"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import { FormError, SubmitButton, TextField } from "@/components/auth/fields";
import {
  GoogleContinueButton,
  useGoogleProviderAvailable,
} from "@/components/auth/GoogleButton";
import { api, ApiError } from "@/lib/api";
import { resolveNextPath } from "@/lib/next-path";
import type { User } from "@/lib/types";

// Codes d'erreur renvoyes par GET /v1/auth/google/callback (redirection
// `/connexion?erreur=<code>` en echec, contrat B30 fige dans
// docs/plans/ACTIVE.md). La valeur brute du parametre n'est jamais affichee :
// un code absent du dictionnaire retombe sur le message generique.
const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_annule: "Connexion Google annulée.",
  google_session_expiree:
    "La session de connexion Google a expiré. Réessayez.",
  google_email_non_verifie:
    "Votre compte Google n'a pas d'adresse email vérifiée par Google. Utilisez un compte Google avec un email vérifié, ou créez un compte avec un mot de passe.",
  google_compte_conflit:
    "Cet email est déjà associé à un autre compte Google. Connectez-vous avec ce compte Google, ou contactez le support.",
  google_indisponible:
    "La connexion Google est momentanément indisponible. Réessayez plus tard ou utilisez votre mot de passe.",
};
const GOOGLE_ERROR_FALLBACK =
  "Une erreur est survenue pendant la connexion. Réessayez.";

function googleErrorMessage(code: string | null): string | null {
  if (!code) return null;
  return GOOGLE_ERROR_MESSAGES[code] ?? GOOGLE_ERROR_FALLBACK;
}

/**
 * `useSearchParams` impose une frontiere `<Suspense>` au-dessus du composant
 * qui l'appelle, sans quoi le build echoue sur le bailout CSR (voir
 * node_modules/next/dist/docs/01-app/03-api-reference/04-functions/
 * use-search-params.md). Le layout de ce dossier forcant le rendu dynamique,
 * la solution de repli n'est jamais affichee en pratique.
 */
export default function ConnexionPage() {
  return (
    <Suspense fallback={null}>
      <ConnexionForm />
    </Suspense>
  );
}

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleAvailable = useGoogleProviderAvailable();
  const nextPath = resolveNextPath(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(() =>
    googleErrorMessage(searchParams.get("erreur"))
  );
  const [passwordNotSet, setPasswordNotSet] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPasswordNotSet(false);
    setLoading(true);

    try {
      await api.post<User>("/v1/auth/login", { email, password });
      router.push(nextPath);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401 && err.code === "PASSWORD_NOT_SET") {
        setError(err.message);
        setPasswordNotSet(true);
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Email ou mot de passe incorrect.");
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Impossible de joindre le serveur.");
      }
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Connexion"
      description="Accédez à votre tableau de bord Zendou."
      footer={
        <>
          Pas de compte ?{" "}
          <Link href="/inscription" className="font-medium text-[#8AA4FF]">
            En créer un
          </Link>
        </>
      }
    >
      {googleAvailable && <GoogleContinueButton next={nextPath} />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label="Mot de passe"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          revealable
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && <FormError message={error} />}
        {passwordNotSet && googleAvailable && (
          <p className="text-[13px] text-[#9BA1A8]">
            Utilisez le bouton « Continuer avec Google » ci-dessus pour vous connecter.
          </p>
        )}

        <SubmitButton loading={loading} loadingLabel="Connexion…">
          Se connecter
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
