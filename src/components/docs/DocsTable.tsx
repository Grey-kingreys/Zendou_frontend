import type { ReactNode } from "react";

/**
 * Conteneur de tableau standard des pages /docs : coins arrondis, bordure
 * fine, et surtout un scroll horizontal cantonné au tableau — jamais à la
 * page — quand le contenu dépasse `minWidth`.
 */
export default function DocsTable({
  children,
  minWidth = 560,
}: {
  children: ReactNode;
  minWidth?: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0C0D0F]">
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse text-left text-[13.5px]"
          style={{ minWidth }}
        >
          {children}
        </table>
      </div>
    </div>
  );
}
