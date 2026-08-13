"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import {
  FormError,
  SelectField,
  SubmitButton,
  TextField,
} from "@/components/auth/fields";
import TurnstileWidget, {
  type TurnstileWidgetHandle,
} from "@/components/auth/TurnstileWidget";
import { api, ApiError } from "@/lib/api";
import type { RegisterPayload, User } from "@/lib/types";

const USAGE_OPTIONS = [
  { value: "otp", label: "Codes OTP" },
  { value: "notifications", label: "Notifications" },
  { value: "receipts", label: "Reçus et factures" },
  { value: "other", label: "Autre" },
];

// Absente → aucun widget rendu, l'inscription se comporte exactement comme
// avant (voir CaptchaGuard côté backend, qui ignore captchaToken quand le
// captcha est désactivé).
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const CAPTCHA_EXPIRED_MESSAGE = "La vérification a expiré, refaites-la.";

export default function InscriptionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [declaredUsage, setDeclaredUsage] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  function resetCaptcha() {
    setCaptchaToken(null);
    turnstileRef.current?.reset();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const payload: RegisterPayload = { name, email, password };
    if (company.trim()) payload.company = company.trim();
    if (declaredUsage) payload.declaredUsage = declaredUsage;
    if (captchaToken) payload.captchaToken = captchaToken;

    try {
      await api.post<User>("/v1/auth/register", payload);
      // Compte créé mais pas encore confirmé (vague 8) : le tableau de bord
      // reste fermé jusqu'au clic sur le lien reçu par email — direction
      // l'écran dédié plutôt que /dashboard, qui renverrait de toute façon
      // ici via son garde (dashboard/layout.tsx).
      router.push("/confirmez-votre-email");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Un compte existe déjà avec cet email.");
      } else if (err instanceof ApiError) {
        setError(err.message);
        if (err.status === 400 && TURNSTILE_SITE_KEY) {
          // Un jeton Turnstile est à usage unique : le rejouer échouerait à
          // coup sûr, quelle que soit la cause exacte du 400.
          resetCaptcha();
        }
      } else {
        setError("Impossible de joindre le serveur.");
      }
      setLoading(false);
    }
  }

  const captchaRequired = Boolean(TURNSTILE_SITE_KEY);
  const canSubmit = !captchaRequired || Boolean(captchaToken);

  return (
    <AuthCard
      title="Créer un compte"
      description="1 000 emails offerts, aucune carte demandée."
      footer={
        <>
          Déjà un compte ?{" "}
          <Link href="/connexion" className="font-medium text-[#8AA4FF]">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="Nom"
          type="text"
          name="name"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
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
          label="Entreprise (optionnel)"
          type="text"
          name="company"
          autoComplete="organization"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
        />
        <SelectField
          label="Utilisation prévue (optionnel)"
          name="declaredUsage"
          placeholder="Sélectionner…"
          options={USAGE_OPTIONS}
          value={declaredUsage}
          onChange={(event) => setDeclaredUsage(event.target.value)}
        />
        <TextField
          label="Mot de passe"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="8 caractères minimum"
          revealable
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {TURNSTILE_SITE_KEY && (
          <div>
            <TurnstileWidget
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              onVerify={(token) => {
                setCaptchaToken(token);
                setCaptchaError(null);
              }}
              onExpire={() => {
                setCaptchaToken(null);
                setCaptchaError(CAPTCHA_EXPIRED_MESSAGE);
              }}
              onError={() => {
                setCaptchaToken(null);
                setCaptchaError(CAPTCHA_EXPIRED_MESSAGE);
              }}
            />
            {captchaError && (
              <p className="mt-1.5 text-[12.5px] text-[#FF9592]">
                {captchaError}
              </p>
            )}
          </div>
        )}

        {error && <FormError message={error} />}

        <SubmitButton
          loading={loading}
          loadingLabel="Création du compte…"
          disabled={!canSubmit}
        >
          Créer mon compte
        </SubmitButton>
        {captchaRequired && !captchaToken && (
          <p className="text-center text-[12.5px] text-[#70767D]">
            Complétez la vérification anti-robot pour continuer.
          </p>
        )}
      </form>
    </AuthCard>
  );
}
