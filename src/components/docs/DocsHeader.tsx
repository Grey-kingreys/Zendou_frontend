import Link from "next/link";

/**
 * En-tête de la section /docs : logo Zendou (retour à l'accueil) + accès
 * direct au tableau de bord. Reste visible en mobile comme en desktop —
 * c'est `DocsSidebar` / `DocsMobileNav` qui changent de forme.
 */
export default function DocsHeader() {
  return (
    <header className="border-b border-white/[0.06] bg-[#0A0B0C]">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[linear-gradient(150deg,#8AA4FF,#3D5CE8)] font-heading text-sm font-bold text-[#0B0B0C]">
            Z
          </div>
          <span className="font-heading text-base font-semibold tracking-[-0.02em] text-[#EDEEF0]">
            Zendou
          </span>
          <span className="hidden rounded-full border border-white/[0.12] px-2 py-0.5 font-mono text-[11px] text-[#70767D] sm:inline">
            docs
          </span>
        </Link>

        <Link
          href="/dashboard"
          className="shrink-0 rounded-lg border border-white/[0.14] px-3.5 py-2 text-[13px] font-medium text-[#EDEEF0] transition-opacity hover:opacity-90"
        >
          Tableau de bord
        </Link>
      </div>
    </header>
  );
}
