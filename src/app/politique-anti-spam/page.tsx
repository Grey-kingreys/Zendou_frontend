import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Politique anti-spam - Zendou",
  description:
    "Ce que vous pouvez envoyer avec Zendou : consentement, désinscription, contenus interdits, liste de suppression, seuils de rebonds et de plaintes.",
  alternates: { canonical: "/politique-anti-spam" },
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

export default function AntiSpamPage() {
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
          ANTI-SPAM
        </div>
        <h1 className="mb-3 font-heading text-[28px] font-semibold tracking-[-0.02em] text-[#EDEEF0] sm:text-[32px]">
          Politique anti-spam
        </h1>
        <p className="mb-10 text-[13px] text-[#70767D]">
          Dernière mise à jour : 18 octobre 2026.
        </p>

        <P>
          Cette politique décrit ce que vous pouvez et ne pouvez pas envoyer avec Zendou. Elle fait partie des <Link href="/cgu" className="text-[#8AA4FF] underline underline-offset-2">conditions générales d&rsquo;utilisation</Link>. Zendou est conçu pour l&rsquo;email transactionnel : les messages que vos utilisateurs attendent parce qu&rsquo;ils ont fait une action (inscription, achat, demande de code). Ce n&rsquo;est pas un outil d&rsquo;envoi en masse.
        </P>
        <H2>Consentement des destinataires</H2>
        <P>
          Vous n&rsquo;envoyez des emails qu&rsquo;à des personnes qui ont consenti à les recevoir ou qui les attendent du fait de leur relation avec vous. Les listes achetées, louées, récupérées sur des sites ou des annuaires, ou obtenues par recoupement sont interdites. Vous devez pouvoir prouver l&rsquo;origine de chaque adresse sur simple demande.
        </P>
        <H2>Envois réguliers et désinscription</H2>
        <P>
          Les messages purement transactionnels (code de connexion, reçu, confirmation de commande) n&rsquo;ont pas besoin de lien de désinscription. En revanche, tout envoi régulier ou d&rsquo;information (rappels, bilans, lettres d&rsquo;information) doit permettre au destinataire de se désinscrire simplement, et vous devez traiter cette demande rapidement. Gmail et Yahoo exigent d&rsquo;ailleurs la désinscription en un clic pour les envois en volume : Zendou vous permet d&rsquo;ajouter les en-têtes <code>List-Unsubscribe</code> et <code>List-Unsubscribe-Post</code>, comme expliqué dans la <Link href="/docs/envoyer-un-email" className="text-[#8AA4FF] underline underline-offset-2">référence d&rsquo;envoi</Link>.
        </P>
        <H2>Contenus interdits</H2>
        <P>
          Il est interdit d&rsquo;envoyer avec Zendou :
        </P>
        <ul className="mb-4 flex list-disc flex-col gap-2 pl-5 text-[15px] leading-[1.7] text-[#9BA1A8]">
          <li>de l&rsquo;hameçonnage (messages cherchant à obtenir des mots de passe, des codes ou des informations bancaires) ;</li>
          <li>des logiciels malveillants ou des liens vers de tels logiciels ;</li>
          <li>des messages usurpant l&rsquo;identité d&rsquo;une personne, d&rsquo;une entreprise ou d&rsquo;une institution ;</li>
          <li>des arnaques, de fausses offres ou de faux gains ;</li>
          <li>tout contenu illégal en République de Guinée ou dans le pays du destinataire ;</li>
          <li>des messages utilisant un expéditeur ou un domaine qui n&rsquo;est pas le vôtre.</li>
        </ul>
        <H2>Liste de suppression automatique</H2>
        <P>
          Quand un email rebondit définitivement (adresse inexistante) ou fait l&rsquo;objet d&rsquo;une plainte, l&rsquo;adresse est ajoutée automatiquement à une liste de suppression : les envois suivants vers cette adresse sont bloqués et ne sont pas facturés. Un rebond temporaire (boîte pleine, serveur indisponible) est seulement enregistré.
        </P>
        <H2>Seuils de réputation et suspension automatique</H2>
        <P>
          Les mauvais résultats d&rsquo;un client pénalisent tous les autres, car la réputation d&rsquo;envoi est partagée. Zendou mesure donc, sur les 30 derniers jours, la part de vos envois qui ont rebondi définitivement et la part qui ont fait l&rsquo;objet d&rsquo;une plainte :
        </P>
        <ul className="mb-4 flex list-disc flex-col gap-2 pl-5 text-[15px] leading-[1.7] text-[#9BA1A8]">
          <li>au-delà de 5 % de rebonds définitifs, ou de 0,1 % de plaintes, votre compte est suspendu automatiquement ;</li>
          <li>à partir de 60 % de ces seuils (3 % de rebonds, 0,06 % de plaintes), un avertissement interne est enregistré, sans sanction ;</li>
          <li>aucune sanction n&rsquo;est prise sous 50 envois, volume trop faible pour que les taux soient significatifs.</li>
        </ul>
        <P>
          Un compte suspendu ne peut plus envoyer. Pour demander un réexamen, écrivez à <a href="mailto:contact@zendou.app" className="text-[#8AA4FF] underline underline-offset-2">contact@zendou.app</a>.
        </P>
        <H2>Signaler un abus</H2>
        <P>
          Si vous recevez un message envoyé via Zendou qui enfreint cette politique, écrivez à <a href="mailto:contact@zendou.app" className="text-[#8AA4FF] underline underline-offset-2">contact@zendou.app</a> en joignant l&rsquo;email complet avec ses en-têtes. Nous examinons chaque signalement.
        </P>
        <H2>Sanctions</H2>
        <P>
          Selon la gravité et la répétition des faits, Zendou peut avertir le titulaire du compte, limiter ses envois, suspendre ou fermer son compte sans préavis, et conserver les crédits restants en cas de fraude avérée. Nous pouvons aussi transmettre les informations nécessaires aux autorités compétentes.
        </P>
      </main>

      <Footer />
    </div>
  );
}
