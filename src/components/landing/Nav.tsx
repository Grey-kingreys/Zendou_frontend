import Link from "next/link";

export default function Nav() {
  return (
    <nav className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-5 sm:px-8 sm:py-[26px]">
      <div className="flex items-center gap-2.5">
        <div className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-[linear-gradient(150deg,#8AA4FF,#3D5CE8)] font-heading text-sm font-bold text-[#0B0B0C]">
          Z
        </div>
        <span className="font-heading text-lg font-semibold tracking-[-0.02em]">
          Zendou
        </span>
      </div>

      <div className="hidden items-center gap-7 text-sm text-[#9BA1A8] md:flex">
        <Link href="#fonctionnalites" className="text-[#9BA1A8]">
          Produit
        </Link>
        <Link href="/docs" className="text-[#9BA1A8]">
          Documentation
        </Link>
        <Link href="#tarifs" className="text-[#9BA1A8]">
          Tarifs
        </Link>
        <a href="#" className="text-[#9BA1A8]">
          Changelog
        </a>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <Link href="/connexion" className="text-[#9BA1A8]">
          Connexion
        </Link>
        <Link
          href="/inscription"
          className="rounded-lg bg-[#F2F3F4] px-4 py-[9px] font-semibold text-[#0B0B0C]"
        >
          Créer un compte
        </Link>
      </div>
    </nav>
  );
}
