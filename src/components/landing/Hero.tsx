import Link from "next/link";
import Nav from "./Nav";
import HeroDiagram from "./HeroDiagram";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06] bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(91,124,250,0.10),transparent_60%)]">
      <Nav />

      <div className="mx-auto max-w-[900px] px-6 pt-12 text-center [animation:zd-rise_.7s_ease_both] sm:px-8 sm:pt-16">
        <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/[0.10] bg-white/[0.03] px-3.5 py-1.5 text-[13px] text-[#9BA1A8]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#35D07F] shadow-[0_0_8px_#35D07F]" />
          Paiement Orange Money &amp; MTN MoMo — facturation en GNF
        </div>
        <h1 className="mb-5 font-heading text-4xl font-semibold text-balance sm:text-5xl md:text-[60px] md:leading-[1.06] md:tracking-[-0.035em]">
          {"L'email transactionnel,"}
          <br />
          <span className="text-[#5B7CFA]">à la bonne taille.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-[600px] text-lg leading-relaxed text-[#9BA1A8] text-pretty">
          {
            "OTP, reçus, notifications : une requête HTTP et c'est parti. Des paliers pensés pour les petites équipes ouest-africaines, sans carte bancaire internationale."
          }
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/inscription"
            className="rounded-[9px] bg-[#5B7CFA] px-[22px] py-[13px] text-[15px] font-semibold text-[#F7F9FF]"
          >
            Générer ma clé API
          </Link>
          <Link
            href="/docs"
            className="rounded-[9px] border border-white/[0.14] bg-white/[0.02] px-[22px] py-[13px] text-[15px] font-medium text-[#EDEEF0]"
          >
            Lire la doc
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-[1264px] px-6 sm:mt-14 sm:px-8">
        <HeroDiagram />
      </div>
      <div className="h-12 sm:h-20" />
    </section>
  );
}
