import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0A0B0C]">
      <div className="mx-auto grid max-w-[1160px] grid-cols-1 gap-10 px-6 pt-[60px] pb-[34px] sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-3.5 flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-[linear-gradient(150deg,#8AA4FF,#3D5CE8)] font-heading text-[13px] font-bold text-[#0B0B0C]">
              Z
            </div>
            <span className="font-heading text-base font-semibold">
              Zendou
            </span>
          </div>
          <p className="max-w-[280px] text-sm leading-[1.65] text-[#70767D] text-pretty">
            {
              "L'infrastructure d'email transactionnel construite en Guinée, pour l'Afrique de l'Ouest."
            }
          </p>
        </div>

        <div className="flex flex-col gap-2.5 text-sm text-[#8A9099]">
          <span className="mb-0.5 text-[13px] font-semibold text-[#EDEEF0]">
            Produit
          </span>
          <Link href="#fonctionnalites" className="text-[#8A9099]">
            Fonctionnalités
          </Link>
          <Link href="#tarifs" className="text-[#8A9099]">
            Tarifs
          </Link>
          <a href="#" className="text-[#8A9099]">
            Relais SMTP
          </a>
          <a href="#" className="text-[#8A9099]">
            Changelog
          </a>
        </div>

        <div className="flex flex-col gap-2.5 text-sm text-[#8A9099]">
          <span className="mb-0.5 text-[13px] font-semibold text-[#EDEEF0]">
            Développeurs
          </span>
          <Link href="/docs" className="text-[#8A9099]">
            Documentation
          </Link>
          <a href="#" className="text-[#8A9099]">
            Référence API
          </a>
          <a href="#" className="text-[#8A9099]">
            Vérifier un domaine
          </a>
          <a href="#" className="text-[#8A9099]">
            Statut
          </a>
        </div>

        <div className="flex flex-col gap-2.5 text-sm text-[#8A9099]">
          <span className="mb-0.5 text-[13px] font-semibold text-[#EDEEF0]">
            Entreprise
          </span>
          <a href="#" className="text-[#8A9099]">
            À propos
          </a>
          <a href="#" className="text-[#8A9099]">
            Contact
          </a>
          <a href="#" className="text-[#8A9099]">
            CGU
          </a>
          <a href="#" className="text-[#8A9099]">
            Politique anti-spam
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1160px] flex-col gap-3 border-t border-white/[0.06] px-6 pt-[22px] pb-10 font-mono text-[13px] text-[#5E646B] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>© 2026 Zendou · Conakry, Guinée</span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#35D07F]" />
          Tous les systèmes opérationnels
        </span>
      </div>
    </footer>
  );
}
