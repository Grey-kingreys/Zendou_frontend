"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import ResendConfirmationControl from "@/components/confirmation/ResendConfirmationControl";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

/**
 * Écran de blocage post-inscription (vague 8) : tant que `emailVerifiedAt`
 * est `null`, le garde du tableau de bord (`dashboard/layout.tsx`) renvoie
 * ici plutôt que de rendre le dashboard. Atterrissage aussi direct après
 * `POST /v1/auth/register` (voir /inscription) et après une connexion sur un
 * compte non confirmé (le garde du dashboard fait le même aiguillage).
 *
 * Contrepartie non négociable de la fermeture du dashboard : une faute de
 * frappe dans l'adresse ne doit jamais enfermer quelqu'un dehors sans
 * recours — l'adresse saisie est donc affichée ici en évidence (bloc dédié
 * ci-dessous), pas noyée dans une phrase.
 *
 * Cette page fait son propre appel à `/v1/auth/me` plutôt que de recevoir
 * l'email en paramètre d'URL : source unique de vérité (l'adresse vient
 * toujours du compte réellement authentifié, jamais d'une valeur qu'on
 * pourrait falsifier ou désynchroniser via l'URL), et elle doit de toute
 * façon fonctionner si on y arrive par rechargement direct (favoris, lien
 * partagé) sans être passé par /inscription.
 */
export default function ConfirmezVotreEmailPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    api
      .get<User>("/v1/auth/me")
      .then((data) => {
        if (!active) return;
        if (data.emailVerifiedAt !== null) {
          // Déjà confirmé entre-temps (lien ouvert dans un autre onglet,
          // navigation arrière après confirmation…) : rien à faire ici.
          router.replace("/dashboard");
          return;
        }
        setUser(data);
      })
      .catch(() => {
        if (!active) return;
        // 401 (pas connecté) ou erreur réseau/serveur : pas de session
        // confirmée, retour à la connexion.
        router.replace("/connexion");
      });

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await api.post("/v1/auth/logout");
    } catch {
      // Même logique que Topbar : aucune récupération utile côté client si
      // la déconnexion échoue, on renvoie vers la connexion malgré tout.
    } finally {
      router.push("/connexion");
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090A]">
        <p className="text-sm text-[#9BA1A8]">Chargement…</p>
      </div>
    );
  }

  return (
    <AuthCard
      title="Confirmez votre adresse email"
      description="Encore une étape avant d’accéder à votre tableau de bord."
      footer={
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="font-medium text-[#8AA4FF] disabled:opacity-60"
        >
          {loggingOut ? "Déconnexion…" : "Ce n’est pas vous ? Se déconnecter"}
        </button>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="rounded-lg border border-white/[0.09] bg-[#0E1013] px-4 py-3.5 text-center">
          <p className="mb-1 text-[11.5px] font-medium tracking-wide text-[#70767D] uppercase">
            Adresse à confirmer
          </p>
          <p className="text-pretty break-all font-mono text-[15px] font-semibold text-[#EDEEF0]">
            {user.email}
          </p>
        </div>

        <p className="text-center text-[13.5px] leading-relaxed text-[#9BA1A8] text-pretty">
          Nous avons envoyé un email de confirmation à cette adresse. Ouvrez
          votre boîte de réception (et vos spams) et cliquez le lien
          qu’il contient : votre tableau de bord se débloque aussitôt.
        </p>

        <div className="flex flex-col items-center gap-2">
          <ResendConfirmationControl buttonLabel="Renvoyer l'email de confirmation" />
        </div>

        <div className="border-t border-white/[0.06] pt-4">
          <p className="text-center text-[12.5px] leading-relaxed text-[#70767D] text-pretty">
            Adresse mal orthographiée ? Elle ne peut pas être corrigée sur un
            compte déjà créé. Le plus simple :{" "}
            <Link href="/inscription" className="font-medium text-[#8AA4FF]">
              créez un nouveau compte
            </Link>{" "}
            avec la bonne adresse — un compte non confirmé n’a reçu aucun
            crédit, vous ne perdez donc rien à recommencer.
          </p>
        </div>
      </div>
    </AuthCard>
  );
}
