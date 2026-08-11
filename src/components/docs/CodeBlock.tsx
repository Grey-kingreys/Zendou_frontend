"use client";

import { useState } from "react";

/**
 * Bloc de code à un seul langage/exemple, avec bouton de copie — variante
 * simplifiée de `CodeTabs` pour les exemples de requête/réponse isolés
 * (JSON, un seul curl...).
 */
export default function CodeBlock({
  code,
  label,
}: {
  code: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Presse-papiers indisponible : le code reste sélectionnable à la main.
    }
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-white/[0.09] bg-[#0C0D0F]">
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] px-4 py-2">
        <span className="font-mono text-[11.5px] tracking-[0.02em] text-[#70767D] uppercase">
          {label ?? ""}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-md px-2.5 py-1 text-[11.5px] font-medium text-[#5E646B] transition-colors hover:bg-white/[0.05] hover:text-[#8AA4FF]"
        >
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
      <pre className="m-0 overflow-x-auto px-6 py-[22px] font-mono text-[13.5px] leading-[1.85] text-[#C5CACF]">
        {code}
      </pre>
    </div>
  );
}
