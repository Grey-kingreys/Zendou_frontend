"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import { FormError, SubmitButton, TextField } from "@/components/auth/fields";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

// Destinations autorisees apres connexion. Le proxy (src/proxy.ts) renvoie
// ici avec `?next=<chemin prive demande>` ; tout le reste est ignore.
const NEXT_PATH_PREFIXES = ["/dashboard", "/admin", "/confirmez-votre-email"];

/**
 * Resout le parametre `next` en chemin de redirection sur. Une liste blanche
 * de prefixes evite la redirection ouverte : un `next` fourni par un tiers ne
 * peut pas envoyer ailleurs que dans les zones privees du site. `//hote` et
 * `/\hote` sont rejetes explicitement car les navigateurs les traitent comme
 * des URL absolues malgre le `/` initial.
 */
function resolveNextPath(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/dashboard";
  return NEXT_PATH_PREFIXES.some((prefix) => raw.startsWith(prefix))
    ? raw
    : "/dashboard";
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
      router.push(resolveNextPath(searchParams.get("next")));
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
          revealable
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
