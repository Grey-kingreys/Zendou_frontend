import Link from "next/link";

export default function PricingSection() {
  return (
    <section
      id="tarifs"
      className="mx-auto max-w-[1160px] px-6 py-16 sm:px-8 sm:py-20 lg:py-[110px]"
    >
      <div className="mb-12 text-center sm:mb-14">
        <div className="mb-4 font-mono text-xs tracking-[0.08em] text-[#5B7CFA]">
          03 — TARIFS
        </div>
        <h2 className="mb-3 font-heading text-[32px] leading-[1.12] font-semibold tracking-[-0.03em] text-balance sm:text-[38px]">
          Payez pour ce que vous envoyez
        </h2>
        <p className="mx-auto max-w-[520px] text-base text-[#9BA1A8] text-pretty">
          Pas d&rsquo;abonnement : vous achetez des packs de crédits
          prépayés. 1 crédit = 1 email. Les packs se cumulent et
          n&rsquo;expirent jamais.
        </p>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Découverte */}
        <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#0C0D0F] p-[30px_26px]">
          <div className="mb-1.5 font-heading text-base font-semibold">
            Découverte
          </div>
          <div className="mb-[22px] text-[13.5px] text-[#70767D]">
            Pour tester en vrai
          </div>
          <div className="mb-1 flex min-h-[46px] items-baseline gap-1.5 font-heading text-[28px] font-semibold tracking-[-0.03em] whitespace-nowrap sm:text-[clamp(24px,2.3vw,34px)]">
            0 <span className="text-[15px] font-normal text-[#70767D]">GNF</span>
          </div>
          <div className="mb-[26px] font-mono text-[12.5px] text-[#70767D]">
            1 000 emails offerts
          </div>
          <div className="mb-7 flex flex-col gap-2.5 text-sm text-[#A8AEB4]">
            <span>Offerts après confirmation de votre email</span>
            <span>Sans carte bancaire</span>
          </div>
          <Link
            href="/inscription"
            className="mt-auto rounded-[9px] border border-white/[0.14] py-[11px] text-center text-[14.5px] font-medium"
          >
            Commencer
          </Link>
        </div>

        {/* Starter — mis en avant */}
        <div className="relative flex flex-col rounded-2xl border border-[rgba(91,124,250,0.45)] bg-[linear-gradient(180deg,rgba(91,124,250,0.07),rgba(91,124,250,0.01))] p-[30px_26px] shadow-[0_0_60px_rgba(91,124,250,0.10)]">
          <div className="absolute -top-[11px] left-[26px] rounded-[6px] bg-[#5B7CFA] px-2.5 py-[3px] text-[11.5px] font-semibold tracking-[0.02em] text-[#F7F9FF]">
            POUR DÉMARRER
          </div>
          <div className="mb-1.5 font-heading text-base font-semibold">
            Starter
          </div>
          <div className="mb-[22px] text-[13.5px] text-[#8A9099]">
            Une app en production
          </div>
          <div className="mb-1 flex min-h-[46px] items-baseline gap-1.5 font-heading text-[28px] font-semibold tracking-[-0.03em] whitespace-nowrap sm:text-[clamp(24px,2.3vw,34px)]">
            50 000{" "}
            <span className="text-[15px] font-normal text-[#8A9099]">
              GNF
            </span>
          </div>
          <div className="mb-[26px] font-mono text-[12.5px] text-[#8A9099]">
            15 000 emails, sans expiration
          </div>
          <div className="mb-7 flex flex-col gap-2.5 text-sm text-[#C5CACF]">
            <span>Pack prépayé, achat unique</span>
            <span>Environ 3,33 GNF par email</span>
          </div>
          <Link
            href="/inscription"
            className="mt-auto rounded-[9px] bg-[#5B7CFA] py-[11px] text-center text-[14.5px] font-semibold text-[#F7F9FF]"
          >
            Choisir Starter
          </Link>
        </div>

        {/* Growth */}
        <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#0C0D0F] p-[30px_26px]">
          <div className="mb-1.5 font-heading text-base font-semibold">
            Growth
          </div>
          <div className="mb-[22px] text-[13.5px] text-[#70767D]">
            {"L'app qui décolle"}
          </div>
          <div className="mb-1 flex min-h-[46px] items-baseline gap-1.5 font-heading text-[28px] font-semibold tracking-[-0.03em] whitespace-nowrap sm:text-[clamp(24px,2.3vw,34px)]">
            90 000{" "}
            <span className="text-[15px] font-normal text-[#70767D]">
              GNF
            </span>
          </div>
          <div className="mb-[26px] font-mono text-[12.5px] text-[#70767D]">
            30 000 emails, sans expiration
          </div>
          <div className="mb-7 flex flex-col gap-2.5 text-sm text-[#A8AEB4]">
            <span>Pack prépayé, achat unique</span>
            <span>3 GNF par email</span>
          </div>
          <Link
            href="/inscription"
            className="mt-auto rounded-[9px] border border-white/[0.14] py-[11px] text-center text-[14.5px] font-medium"
          >
            Choisir Growth
          </Link>
        </div>

        {/* Business */}
        <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#0C0D0F] p-[30px_26px]">
          <div className="mb-1.5 font-heading text-base font-semibold">
            Business
          </div>
          <div className="mb-[22px] text-[13.5px] text-[#70767D]">
            PME établie
          </div>
          <div className="mb-1 flex min-h-[46px] items-baseline gap-1.5 font-heading text-[28px] font-semibold tracking-[-0.03em] whitespace-nowrap sm:text-[clamp(24px,2.3vw,34px)]">
            Sur devis
          </div>
          <div className="mb-[26px] font-mono text-[12.5px] text-[#70767D]">
            100 000 emails et +
          </div>
          <div className="mb-7 flex flex-col gap-2.5 text-sm text-[#A8AEB4]">
            <span>Volume et tarif discutés avec vous</span>
            <span>Accompagnement direct</span>
          </div>
          <a
            href="mailto:contact@zendou.app"
            className="mt-auto rounded-[9px] border border-white/[0.14] py-[11px] text-center text-[14.5px] font-medium"
          >
            Nous écrire
          </a>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-dashed border-white/[0.13] bg-white/[0.015] p-6 sm:p-[24px_28px]">
        <div className="mb-1.5 font-heading text-base font-semibold">
          Les mêmes fonctions pour tous les packs
        </div>
        <p className="max-w-[760px] text-[14.5px] text-[#8A9099] text-pretty">
          API REST et relais SMTP, domaines vérifiés sans limite de nombre,
          liste de suppression automatique, journal des envois conservé 6
          mois, support en français. Seul le volume de crédits change.
        </p>
      </div>
    </section>
  );
}
