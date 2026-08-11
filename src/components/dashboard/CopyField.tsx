"use client";

import { useState } from "react";

/**
 * Valeur mono cliquable pour copier dans le presse-papiers (utilisé pour
 * les enregistrements DNS, préfixes de clés, identifiants...).
 */
export default function CopyField({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé, permissions...) :
      // la valeur reste visible et sélectionnable manuellement.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copier"
      className={`group inline-flex max-w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-white/[0.05] ${className ?? ""}`}
    >
      <span className="truncate font-mono text-[12.5px] text-[#C5CACF]">
        {value}
      </span>
      <span
        className={`shrink-0 text-[11px] font-medium ${copied ? "text-[#35D07F]" : "text-[#5E646B] group-hover:text-[#8AA4FF]"}`}
      >
        {copied ? "Copié" : "Copier"}
      </span>
    </button>
  );
}
