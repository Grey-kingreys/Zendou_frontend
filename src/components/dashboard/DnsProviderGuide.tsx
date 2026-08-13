"use client";

import { useState } from "react";

/**
 * Instructions ciblées par fournisseur DNS (B12) — la saisie manuelle reste
 * la seule voie livrée : pas de jeton d'API, pas de publication automatique
 * (décision orchestrateur, voir docs/plans/BACKLOG.md § B12). Cloudflare en
 * premier, c'est le cas du porteur, et son piège (nuage orange = proxy actif
 * = échec DKIM) est l'erreur n°1 constatée côté clients.
 */

type ProviderId = "cloudflare" | "ovh" | "godaddy" | "namecheap";

interface Provider {
  id: ProviderId;
  label: string;
  steps: string[];
  warning?: string;
}

const PROVIDERS: Provider[] = [
  {
    id: "cloudflare",
    label: "Cloudflare",
    warning:
      "Le nuage à droite de la ligne doit rester GRIS (« DNS only »), jamais orange (proxy activé). Un nuage orange fait résoudre le CNAME vers une adresse Cloudflare au lieu d'Amazon : DKIM échoue systématiquement. C'est l'erreur la plus fréquente chez nos clients — c'est justement ce que le diagnostic ci-dessus détecte.",
    steps: [
      "Tableau de bord Cloudflare → votre domaine → onglet « DNS » → « Records ».",
      "« Add record », type CNAME.",
      "Champ « Name » : collez uniquement la partie avant votre domaine (ex. le jeton avant « ._domainkey ») — Cloudflare complète automatiquement avec le reste de votre domaine.",
      "Champ « Target » : collez la valeur telle quelle, en entier.",
      "Avant d'enregistrer, cliquez sur l'icône nuage pour vérifier qu'elle est bien grise, pas orange.",
    ],
  },
  {
    id: "ovh",
    label: "OVH",
    steps: [
      "Espace client OVH → « Noms de domaine » → votre domaine → onglet « Zone DNS ».",
      "« Ajouter une entrée » → type CNAME.",
      "Champ « Sous-domaine » : collez uniquement la partie avant votre domaine, pas le nom complet.",
      "Champ « Cible » : collez la valeur telle quelle.",
    ],
  },
  {
    id: "godaddy",
    label: "GoDaddy",
    steps: [
      "« Mes produits » → votre domaine → « DNS » → « Gérer les zones DNS ».",
      "« Ajouter un enregistrement » → type CNAME.",
      "Champ « Nom »/« Host » : collez uniquement la partie avant votre domaine — GoDaddy ajoute automatiquement le reste.",
      "Champ « Valeur »/« Points to » : collez la valeur telle quelle.",
    ],
  },
  {
    id: "namecheap",
    label: "Namecheap",
    steps: [
      "« Domain List » → « Manage » sur votre domaine → onglet « Advanced DNS ».",
      "« Add New Record » → type CNAME Record.",
      "Champ « Host » : collez uniquement la partie avant votre domaine — Namecheap ajoute automatiquement le reste.",
      "Champ « Value » : collez la valeur telle quelle.",
    ],
  },
];

const DUPLICATE_DOMAIN_WARNING =
  "Piège fréquent, quel que soit le fournisseur : le champ « Nom »/« Host » n'attend en général que la partie avant votre domaine, que le registrar ajoute lui-même. Si vous y collez le nom complet, vous obtenez un enregistrement dupliqué (par exemple « jeton._domainkey.exemple.gn.exemple.gn ») qui ne correspond à rien — Amazon SES ne le trouvera jamais.";

export default function DnsProviderGuide() {
  const [openId, setOpenId] = useState<ProviderId | null>("cloudflare");

  return (
    <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5">
      <h3 className="mb-1.5 text-[13.5px] font-semibold text-[#EDEEF0]">
        Instructions par fournisseur DNS
      </h3>
      <p className="mb-4 text-[13px] leading-relaxed text-[#9BA1A8] text-pretty">
        {DUPLICATE_DOMAIN_WARNING}
      </p>
      <div className="flex flex-col gap-2">
        {PROVIDERS.map((provider) => {
          const isOpen = openId === provider.id;
          return (
            <div
              key={provider.id}
              className="overflow-hidden rounded-lg border border-white/[0.07]"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : provider.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[13.5px] font-medium text-[#EDEEF0] transition-colors hover:bg-white/[0.03]"
              >
                <span>{provider.label}</span>
                <span className="shrink-0 text-[#70767D]" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-white/[0.07] px-4 py-4">
                  {provider.warning && (
                    <p className="mb-3 rounded-lg border border-[#F5A623]/25 bg-[#F5A623]/10 px-3.5 py-2.5 text-[13px] leading-relaxed text-[#F5D9A9] text-pretty">
                      {provider.warning}
                    </p>
                  )}
                  <ol className="flex flex-col gap-2 text-[13px] leading-relaxed text-[#C5CACF]">
                    {provider.steps.map((step, index) => (
                      <li key={index} className="flex gap-2.5">
                        <span className="shrink-0 text-[#70767D]">
                          {index + 1}.
                        </span>
                        <span className="min-w-0 text-pretty">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
