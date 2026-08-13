"use client";

import { useState } from "react";

/**
 * Bouton « Tout copier » pour un bloc de valeurs DNS (B12) : copie un texte
 * déjà construit par l'appelant (tabulé — type, nom, valeur, une ligne par
 * enregistrement) en un seul geste, plutôt que de recopier champ par champ
 * via les `CopyField` déjà posés sur chaque ligne. Même retour visuel que
 * `CopyField` (bascule sur « Copié » puis revient après 1.6 s).
 */
export default function CopyAllButton({
  text,
  label = "Tout copier",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé, permissions...) :
      // les `CopyField` individuels restent disponibles en repli.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-colors ${
        copied
          ? "border-[#35D07F]/30 bg-[#35D07F]/10 text-[#35D07F]"
          : "border-white/[0.14] text-[#EDEEF0] hover:bg-white/[0.05]"
      } ${className ?? ""}`}
    >
      {copied ? "Copié" : label}
    </button>
  );
}
