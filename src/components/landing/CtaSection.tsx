import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="border-t border-white/[0.06] bg-[radial-gradient(800px_400px_at_50%_110%,rgba(91,124,250,0.12),transparent_65%)]">
      <div className="mx-auto max-w-[760px] px-6 py-20 text-center sm:px-8 sm:py-[120px]">
        <h2 className="mb-[18px] font-heading text-[34px] leading-[1.08] font-semibold tracking-[-0.035em] text-balance sm:text-[46px]">
          Envoyez votre premier email ce soir.
        </h2>
        <p className="mx-auto mb-8 max-w-[500px] text-[17px] leading-[1.65] text-[#9BA1A8] text-pretty">
          Compte créé en une minute, 1 000 emails offerts, aucune carte
          demandée.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/inscription"
            className="rounded-[9px] bg-[#5B7CFA] px-6 py-[14px] text-[15px] font-semibold text-[#F7F9FF]"
          >
            Créer mon compte
          </Link>
          <a
            href="#"
            className="rounded-[9px] border border-white/[0.14] px-6 py-[14px] text-[15px] font-medium text-[#EDEEF0]"
          >
            {"Parler à l'équipe"}
          </a>
        </div>
      </div>
    </section>
  );
}
