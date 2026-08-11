"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import {
  FormError,
  SelectField,
  SubmitButton,
  TextField,
} from "@/components/auth/fields";
import { api, ApiError } from "@/lib/api";
import type { RegisterPayload, User } from "@/lib/types";

const USAGE_OPTIONS = [
  { value: "otp", label: "Codes OTP" },
  { value: "notifications", label: "Notifications" },
  { value: "receipts", label: "Reçus et factures" },
  { value: "other", label: "Autre" },
];

export default function InscriptionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [declaredUsage, setDeclaredUsage] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const payload: RegisterPayload = { name, email, password };
    if (company.trim()) payload.company = company.trim();
    if (declaredUsage) payload.declaredUsage = declaredUsage;

    try {
      await api.post<User>("/v1/auth/register", payload);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Un compte existe déjà avec cet email.");
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
      title="Créer un compte"
      description="1 000 emails offerts chaque mois, aucune carte demandée."
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
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && <FormError message={error} />}

        <SubmitButton loading={loading} loadingLabel="Création du compte…">
          Créer mon compte
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
