"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import { FormError, SubmitButton, TextField } from "@/components/auth/fields";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post<User>("/v1/auth/login", { email, password });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
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
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && <FormError message={error} />}

        <SubmitButton loading={loading} loadingLabel="Connexion…">
          Se connecter
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
