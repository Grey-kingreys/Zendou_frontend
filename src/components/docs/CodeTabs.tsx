"use client";

import { useState } from "react";

export interface CodeTab {
  label: string;
  code: string;
}

/**
 * Bloc de code à onglets (curl / Node.js / PHP...) avec bouton de copie.
 * Reprend le langage visuel de `landing/IntegrationSection` (mêmes classes,
 * même sensation) sans importer un composant de la landing dans /docs — la
 * landing reste indépendante des pages docs, et inversement.
 */
export default function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(tabs[active].code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Presse-papiers indisponible : le code reste sélectionnable à la main.
    }
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-white/[0.09] bg-[#0C0D0F]">
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] px-2 py-1.5">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActive(i)}
              className={
                "shrink-0 appearance-none rounded-[7px] border-0 px-3.5 py-1.5 font-mono text-[12.5px] cursor-pointer " +
                (active === i
                  ? "bg-[rgba(91,124,250,0.13)] text-[#8AA4FF]"
                  : "bg-transparent text-[#70767D]")
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-md px-2.5 py-1 text-[11.5px] font-medium text-[#5E646B] transition-colors hover:bg-white/[0.05] hover:text-[#8AA4FF]"
        >
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
      <pre className="m-0 overflow-x-auto px-6 py-[22px] font-mono text-[13.5px] leading-[1.85] text-[#C5CACF]">
        {tabs[active].code}
      </pre>
    </div>
  );
}
