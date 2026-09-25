"use client";

import { useEffect, useState } from "react";
import { api, API_BASE_URL } from "@/lib/api";
import type { AuthProvidersResponse } from "@/lib/types";

/**
 * Interroge `GET /v1/auth/providers` pour savoir si la connexion Google est
 * active cote backend. `false` par defaut : appel en echec (route absente
 * en production actuelle - vague B30 pas encore deployee -, reseau injoignable,
 * timeout...) ou champ "google" absent du corps -> aucun bouton, l'ecran
 * reste exactement celui d'avant B30.
 */
export function useGoogleProviderAvailable(): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let active = true;

    api
      .get<AuthProvidersResponse>("/v1/auth/providers")
      .then((data) => {
        if (active && data?.google === true) {
          setAvailable(true);
        }
      })
      .catch(() => {
        // Route absente ou backend injoignable : pas de bouton, comportement inchange.
      });

    return () => {
      active = false;
    };
  }, []);

  return available;
}

/**
 * Bouton "Continuer avec Google" + separateur "ou", a afficher au-dessus du
 * formulaire d'un ecran d'authentification. C'est un lien de navigation
 * plein ecran (`<a href>`), pas un appel `fetch` : le navigateur doit suivre
 * la redirection 302 de l'API vers l'ecran de consentement Google dans
 * l'onglet courant. `next` doit deja avoir ete valide par l'appelant (voir
 * `resolveNextPath` dans `src/lib/next-path.ts`) - ce composant se contente
 * de l'encoder dans l'URL.
 */
export function GoogleContinueButton({ next }: { next: string }) {
  const href = `${API_BASE_URL}/v1/auth/google?next=${encodeURIComponent(next)}`;

  return (
    <div className="mb-6 flex flex-col gap-5">
      <a
        href={href}
        className="flex w-full items-center justify-center gap-3 rounded-[9px] border border-[#DADCE0] bg-white py-[13px] text-[16px] font-medium text-[#3C4043] transition-opacity hover:opacity-90"
      >
        <GoogleLogo />
        Continuer avec Google
      </a>
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
        <span className="text-[13px] text-[#70767D]">ou</span>
        <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
      </div>
    </div>
  );
}

/** Logo "G" officiel Google, multicolore, respectant les consignes de marque. */
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"
      />
      <path
        fill="#34A853"
        d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45c-.87.59-2 .94-3.46.94-2.66 0-4.91-1.8-5.72-4.22H1.02v2.53C2.67 17.75 6.09 20 10 20z"
      />
      <path
        fill="#FBBC05"
        d="M4.28 11.85c-.2-.6-.32-1.24-.32-1.85s.12-1.25.32-1.85V5.62H1.02A9.99 9.99 0 0 0 0 10c0 1.61.39 3.13 1.02 4.38z"
      />
      <path
        fill="#EA4335"
        d="M10 3.96c1.47 0 2.79.51 3.82 1.5l2.86-2.86C14.95.99 12.7 0 10 0 6.09 0 2.67 2.25 1.02 5.62l3.26 2.53C5.09 5.73 7.34 3.96 10 3.96z"
      />
    </svg>
  );
}
