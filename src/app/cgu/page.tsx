import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation - Zendou",
  description:
    "Conditions d'utilisation du service d'email transactionnel Zendou : compte, crédits prépayés, usage acceptable, suspension, responsabilité.",
  alternates: { canonical: "/cgu" },
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

export default function CguPage() {
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
          CGU
        </div>
        <h1 className="mb-3 font-heading text-[28px] font-semibold tracking-[-0.02em] text-[#EDEEF0] sm:text-[32px]">
          Conditions générales d&rsquo;utilisation
        </h1>
        <p className="mb-10 text-[13px] text-[#70767D]">
          Dernière mise à jour : 18 octobre 2026.
        </p>

        <P>
          Les présentes conditions générales d&rsquo;utilisation (CGU) encadrent l&rsquo;usage du site zendou.app, de l&rsquo;API api.zendou.app et du relais SMTP de Zendou. En créant un compte, vous les acceptez. Ce texte est en cours de relecture et peut évoluer.
        </P>
        <H2>Éditeur du service</H2>
        <P>
          Zendou est exploité à titre individuel par <strong className="text-[#EDEEF0]">Souleymane Diallo</strong>, personne physique, en République de Guinée. Aucune société n&rsquo;est aujourd&rsquo;hui immatriculée pour l&rsquo;exploitation du service ; cette mention sera mise à jour dès qu&rsquo;une immatriculation sera effectuée. Contact : <a href="mailto:contact@zendou.app" className="text-[#8AA4FF] underline underline-offset-2">contact@zendou.app</a>.
        </P>
        <H2>Le service</H2>
        <P>
          Zendou permet d&rsquo;envoyer des emails transactionnels (codes de connexion, reçus, notifications) depuis vos applications. Le service comprend une API HTTP (<code></code>), un relais SMTP, la vérification de vos domaines d&rsquo;envoi, un journal des envois conservé 6 mois et un tableau de bord. La <Link href="/docs" className="text-[#8AA4FF] underline underline-offset-2">documentation</Link> décrit le fonctionnement en détail. Zendou n&rsquo;est pas un outil de campagnes d&rsquo;emailing.
        </P>
        <H2>Votre compte</H2>
        <P>
          Pour utiliser le service, vous créez un compte avec une adresse email, que vous devez confirmer. Une personne, physique ou morale, est responsable de chaque compte et de tous les envois effectués avec ses clés API et ses identifiants SMTP. Vous gardez vos identifiants secrets, vous nous informez sans délai de toute utilisation non autorisée, et vous pouvez révoquer ou renouveler une clé API à tout moment depuis le tableau de bord. Les informations que vous fournissez doivent être exactes.
        </P>
        <H2>Crédits, prix et paiement</H2>
        <P>
          Zendou fonctionne par crédits prépayés : 1 crédit = 1 email accepté par l&rsquo;API ou le relais SMTP. Il n&rsquo;y a pas d&rsquo;abonnement. Les crédits n&rsquo;expirent pas et les recharges se cumulent. Un email bloqué par la liste de suppression n&rsquo;est pas facturé.
        </P>
        <P>
          Les packs aujourd&rsquo;hui proposés sont : Starter, 15 000 crédits pour 50 000 GNF, et Growth, 30 000 crédits pour 90 000 GNF. Un crédit de bienvenue de 1 000 emails est accordé après la confirmation de votre adresse email. Les prix sont en francs guinéens et peuvent évoluer pour les achats futurs ; le catalogue à jour est disponible dans le tableau de bord et via l&rsquo;API.
        </P>
        <P>
          La recharge se fait par Orange Money ou MTN MoMo : vous effectuez le transfert, puis vous déclarez votre paiement dans le tableau de bord. Un administrateur valide la demande manuellement, et les crédits sont ajoutés au solde à cette validation. Zendou ne s&rsquo;engage pas sur un délai de validation. Quand le solde atteint zéro, les envois sont refusés jusqu&rsquo;à la prochaine recharge.
        </P>
        <H2>Remboursement</H2>
        <P>
          Les crédits achetés ne sont pas remboursables, sauf en cas d&rsquo;erreur de facturation de notre part ou si Zendou met fin au service. Dans ces deux cas, écrivez à <a href="mailto:contact@zendou.app" className="text-[#8AA4FF] underline underline-offset-2">contact@zendou.app</a> : nous remboursons le montant correspondant aux crédits non consommés.
        </P>
        <H2>Usage acceptable</H2>
        <P>
          Vous vous engagez à n&rsquo;envoyer que des emails à des destinataires qui ont consenti à les recevoir, et à respecter la <Link href="/politique-anti-spam" className="text-[#8AA4FF] underline underline-offset-2">politique anti-spam</Link>, qui fait partie des présentes CGU. Il est interdit d&rsquo;utiliser Zendou pour des envois illégaux, de l&rsquo;hameçonnage, des logiciels malveillants, de l&rsquo;usurpation d&rsquo;identité ou des arnaques, d&rsquo;utiliser un domaine qui n&rsquo;est pas le vôtre, ou de tenter de contourner les limites et les protections du service.
        </P>
        <H2>Limites d&rsquo;envoi</H2>
        <P>
          Pour protéger la réputation d&rsquo;envoi de tous les clients, chaque compte a une limite journalière d&rsquo;envois. Un compte neuf est limité à 200 emails par jour ; la limite augmente avec l&rsquo;ancienneté et le volume réellement envoyé, jusqu&rsquo;à 20 000 emails par jour. Les paliers sont détaillés dans la page <Link href="/docs/facturation" className="text-[#8AA4FF] underline underline-offset-2">Facturation</Link>. L&rsquo;API applique aussi une limite de débit par minute (60 requêtes d&rsquo;envoi par minute par défaut) : au-delà, la requête est refusée avec le code 429. Ces valeurs peuvent évoluer.
        </P>
        <H2>Suspension</H2>
        <P>
          Pour qu&rsquo;un seul compte ne mette pas en danger les autres, Zendou surveille la réputation d&rsquo;envoi. Un compte est suspendu automatiquement quand, sur les 30 derniers jours et à partir de 50 envois, plus de 5 % de ses envois ont rebondi définitivement (adresse inexistante ou domaine mort) ou plus de 0,1 % ont fait l&rsquo;objet d&rsquo;une plainte pour spam. Zendou se réserve aussi le droit de suspendre ou de fermer manuellement un compte en cas d&rsquo;abus, de non-respect des présentes CGU ou de la politique anti-spam, ou d&rsquo;usage frauduleux. Un compte suspendu ne peut plus envoyer. Vous pouvez contester une suspension en écrivant à <a href="mailto:contact@zendou.app" className="text-[#8AA4FF] underline underline-offset-2">contact@zendou.app</a>.
        </P>
        <H2>Disponibilité</H2>
        <P>
          Zendou est fourni sans garantie de disponibilité chiffrée. Nous faisons le nécessaire pour que le service fonctionne de manière continue, mais il peut être interrompu pour maintenance ou en cas de panne, y compris chez nos prestataires. La livraison d&rsquo;un email dépend aussi du fournisseur du destinataire : Zendou s&rsquo;engage à transmettre le message, pas à ce qu&rsquo;il arrive en boîte de réception.
        </P>
        <H2>Responsabilité</H2>
        <P>
          Dans les limites permises par la loi, Zendou n&rsquo;est pas responsable des dommages indirects (perte d&rsquo;exploitation, de clientèle ou de données) liés à l&rsquo;usage ou à l&rsquo;indisponibilité du service, ni du contenu des emails que vous envoyez, dont vous restez seul responsable. Notre responsabilité totale envers vous est limitée au montant que vous avez payé au cours des 12 mois précédant le fait générateur.
        </P>
        <H2>Données personnelles</H2>
        <P>
          Le traitement des données personnelles est décrit dans la <Link href="/confidentialite" className="text-[#8AA4FF] underline underline-offset-2">politique de confidentialité</Link>. Vous restez responsable des données de vos propres destinataires que vous nous confiez en envoyant des emails.
        </P>
        <H2>Fermeture de compte et inactivité</H2>
        <P>
          Vous pouvez demander à tout moment la fermeture ou l&rsquo;anonymisation de votre compte en écrivant à <a href="mailto:contact@zendou.app" className="text-[#8AA4FF] underline underline-offset-2">contact@zendou.app</a>. Un compte sans connexion ni envoi depuis 24 mois est prévenu par email environ un mois avant, puis anonymisé au moins 30 jours après cet avertissement. Les comptes qui ont encore des crédits achetés (au moins une recharge et un solde de crédits positif) ne sont jamais anonymisés automatiquement pour inactivité. Le détail figure dans la <Link href="/confidentialite" className="text-[#8AA4FF] underline underline-offset-2">politique de confidentialité</Link>.
        </P>
        <H2>Modification des CGU</H2>
        <P>
          Nous pouvons modifier les présentes CGU. Les changements importants vous sont annoncés par email avant leur entrée en vigueur. Continuer à utiliser le service après cette date vaut acceptation de la nouvelle version.
        </P>
        <H2>Droit applicable et litiges</H2>
        <P>
          Les présentes CGU sont soumises au droit guinéen. En cas de litige, les parties cherchent d&rsquo;abord une solution amiable en écrivant à <a href="mailto:contact@zendou.app" className="text-[#8AA4FF] underline underline-offset-2">contact@zendou.app</a>. À défaut d&rsquo;accord, les tribunaux de Conakry sont compétents.
        </P>
      </main>

      <Footer />
    </div>
  );
}
