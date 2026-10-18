import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "À propos - Zendou",
  description:
    "Zendou est un service d'email transactionnel pensé pour la Guinée : facturation en GNF, paiement mobile money, support en français. Qui l'exploite et comment le contacter.",
  alternates: { canonical: "/a-propos" },
};

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-12 mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
      {children}
    </h2>
  );
}

function P({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8] text-pretty">
      {children}
    </p>
  );
}

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-[#08090A]">
      <header className="border-b border-white/[0.06] bg-[#0A0B0C]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[linear-gradient(150deg,#8AA4FF,#3D5CE8)] font-heading text-sm font-bold text-[#0B0B0C]">
              Z
            </div>
            <span className="font-heading text-base font-semibold tracking-[-0.02em] text-[#EDEEF0]">
              Zendou
            </span>
          </Link>
          <Link
            href="/"
            className="shrink-0 rounded-lg border border-white/[0.14] px-3.5 py-2 text-[13px] font-medium text-[#EDEEF0] transition-opacity hover:opacity-90"
          >
            Retour à l&rsquo;accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[780px] px-6 py-14 sm:px-8">
        <div className="mb-3 font-mono text-xs tracking-[0.08em] text-[#5B7CFA]">
          À PROPOS
        </div>
        <h1 className="mb-3 font-heading text-[28px] font-semibold tracking-[-0.02em] text-[#EDEEF0] sm:text-[32px]">
          À propos de Zendou
        </h1>
        <P>
          Zendou est un service d&rsquo;email transactionnel pensé pour la
          Guinée : vos applications envoient leurs emails (codes de
          connexion, reçus, notifications) par une API ou un relais SMTP,
          sans que vous ayez à gérer un serveur de messagerie.
        </P>

        <H2>Ce qui le distingue</H2>
        <P>
          Les prix sont en francs guinéens (GNF) et se règlent par mobile
          money (Orange Money, MTN MoMo), sans carte bancaire
          internationale. Le support et la documentation sont en français,
          et la configuration de votre domaine d&rsquo;envoi est guidée pas
          à pas.
        </P>

        <H2>Qui exploite Zendou</H2>
        <P>
          Zendou est exploité à titre individuel par{" "}
          <strong className="text-[#EDEEF0]">Souleymane Diallo</strong>,
          personne physique, en République de Guinée. Aucune société
          n&rsquo;est aujourd&rsquo;hui immatriculée pour l&rsquo;exploitation
          du service ; cette mention sera mise à jour dès qu&rsquo;une
          immatriculation sera effectuée.
        </P>

        <H2>Contact</H2>
        <P>
          Une question, une demande de volume ou un retour :{" "}
          <a
            href="mailto:contact@zendou.app"
            className="text-[#8AA4FF] underline underline-offset-2"
          >
            contact@zendou.app
          </a>
          . Les données personnelles sont décrites dans la{" "}
          <Link
            href="/confidentialite"
            className="text-[#8AA4FF] underline underline-offset-2"
          >
            politique de confidentialité
          </Link>
          .
        </P>
      </main>

      <Footer />
    </div>
  );
}
