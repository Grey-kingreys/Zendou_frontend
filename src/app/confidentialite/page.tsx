import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Politique de confidentialité - Zendou",
  description:
    "Quelles données Zendou traite (compte, connexion Google, emails envoyés, cookies), pourquoi, avec quels sous-traitants, et comment exercer vos droits.",
  alternates: { canonical: "/confidentialite" },
};

/** Marqueur visible pour une information que seul le porteur peut fournir : jamais inventée. */
function ToComplete({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 rounded-lg border border-[#F5A623]/30 bg-[#F5A623]/10 px-3.5 py-2.5 text-[13px] text-[#F5C177]">
      [À COMPLÉTER PAR LE PORTEUR : {children}]
    </p>
  );
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-12 mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
      {children}
    </h2>
  );
}

function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-7 mb-2.5 font-heading text-[15px] font-semibold text-[#EDEEF0]">
      {children}
    </h3>
  );
}

function P({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8] text-pretty">
      {children}
    </p>
  );
}

export default function ConfidentialitePage() {
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
          CONFIDENTIALITÉ
        </div>
        <h1 className="mb-3 font-heading text-[28px] font-semibold tracking-[-0.02em] text-[#EDEEF0] sm:text-[32px]">
          Politique de confidentialité
        </h1>
        <p className="mb-10 text-[13px] text-[#70767D]">
          Dernière mise à jour : 25 septembre 2026.
        </p>

        <P>
          Cette page décrit les données que Zendou traite lorsque vous
          utilisez le site <code>zendou.app</code> et l&rsquo;API{" "}
          <code>api.zendou.app</code> : création de compte, connexion
          (y compris avec le bouton « Continuer avec Google »), envoi
          d&rsquo;emails transactionnels via l&rsquo;API ou le relais SMTP,
          et gestion du tableau de bord. Elle est écrite à partir de ce que
          le service fait réellement, pas d&rsquo;un modèle générique : là
          où une information précise (durée de conservation, raison
          sociale...) n&rsquo;est pas encore fixée, un encadré orange
          l&rsquo;indique explicitement plutôt que de l&rsquo;inventer.
        </P>

        <H2>Qui traite vos données</H2>
        <P>
          Zendou est un service d&rsquo;email transactionnel opéré depuis la
          Guinée. Le contact pour toute question relative à vos données est{" "}
          <a
            href="mailto:contact@zendou.app"
            className="text-[#8AA4FF] underline underline-offset-2"
          >
            contact@zendou.app
          </a>
          .
        </P>
        <ToComplete>
          raison sociale exacte, forme juridique et numéro
          d&rsquo;immatriculation (RCCM) de l&rsquo;entité responsable du
          traitement
        </ToComplete>
        <ToComplete>
          adresse postale du siège de l&rsquo;entité responsable du
          traitement
        </ToComplete>
        <ToComplete>
          référence légale exacte (numéro, date) de la loi guinéenne
          applicable à la protection des données personnelles, et
          coordonnées de l&rsquo;autorité de contrôle compétente si elle
          existe
        </ToComplete>

        <H2>Données que nous collectons</H2>

        <H3>Données de compte</H3>
        <P>
          À l&rsquo;inscription et dans votre profil : adresse email, mot de
          passe (jamais stocké en clair, seulement sous forme hachée), nom,
          entreprise (facultatif), utilisation prévue (facultatif), rôle
          (client ou administrateur), statut du compte, date de création,
          limite d&rsquo;envoi journalière, date de confirmation de
          l&rsquo;adresse email. Si vous créez ou associez votre compte via
          Google, le mot de passe est facultatif : votre compte peut n&rsquo;en
          avoir aucun.
        </P>

        <H3>Données reçues via « Continuer avec Google »</H3>
        <P>
          Si vous utilisez le bouton « Continuer avec Google », Zendou reçoit
          de Google, via le protocole standard OpenID Connect, uniquement les
          informations nécessaires pour vous identifier : votre adresse
          email, son statut de vérification par Google, votre nom et
          l&rsquo;identifiant unique de votre compte Google. Cette connexion
          ne demande que votre identité : Zendou ne demande, ne reçoit et ne
          peut accéder ni à votre boîte Gmail, ni à vos contacts Google, ni
          à aucune autre donnée de votre compte Google.
        </P>

        <H3>Emails envoyés via l&rsquo;API ou le relais SMTP</H3>
        <P>
          Pour chaque email envoyé par votre compte, Zendou conserve les
          métadonnées nécessaires à la délivrabilité et au support :
          adresses d&rsquo;expéditeur et de destinataire, objet, statut de
          livraison (mis en file, envoyé, livré, rejeté...), horodatages, et
          l&rsquo;identifiant technique attribué par notre fournisseur
          d&rsquo;envoi. <strong>Le contenu (corps) de vos emails
          n&rsquo;est pas stocké</strong> par Zendou une fois l&rsquo;envoi
          traité.
        </P>

        <H3>Domaines, clés API et identifiants SMTP</H3>
        <P>
          Les domaines que vous vérifiez pour l&rsquo;envoi, ainsi que vos
          clés API et identifiants SMTP, sont associés à votre compte. Les
          secrets (clé API complète, mot de passe SMTP) ne sont jamais
          stockés en clair : seule une empreinte permettant de vérifier une
          présentation ultérieure est conservée, comme pour votre mot de
          passe de connexion.
        </P>

        <H3>Facturation</H3>
        <P>
          Le solde de crédits, l&rsquo;historique des mouvements et, pour une
          recharge Mobile Money (Orange Money ou MTN MoMo), le pack choisi,
          le numéro de téléphone utilisé et la référence de transaction
          déclarée sont conservés pour le rapprochement du paiement et la
          facturation.
        </P>

        <H3>Journaux techniques</H3>
        <P>
          Comme tout service en ligne, Zendou tient des journaux techniques
          applicatifs (erreurs, limitation de débit, événements de sécurité)
          nécessaires au fonctionnement et à la sécurité du service. La
          valeur de votre cookie de session n&rsquo;est jamais écrite dans
          ces journaux.
        </P>

        <H2>Cookies</H2>
        <P>
          Zendou utilise deux cookies techniques, strictement nécessaires au
          fonctionnement du service :
        </P>
        <ul className="mb-4 flex list-disc flex-col gap-2 pl-5 text-[15px] leading-[1.7] text-[#9BA1A8]">
          <li>
            <code>zendou_session</code> : maintient votre connexion au
            tableau de bord. Lisible uniquement par le serveur (
            <code>HttpOnly</code>), transmis uniquement en HTTPS en
            production, limité au site (<code>SameSite=Lax</code>), valable
            7 jours glissants et révocable à tout moment (déconnexion,
            changement de mot de passe).
          </li>
          <li>
            <code>zendou_oauth</code> : posé uniquement pendant les quelques
            minutes d&rsquo;un parcours de connexion avec Google, pour
            vérifier que le retour depuis Google correspond bien à une
            tentative de connexion initiée chez nous. Lisible uniquement par
            le serveur, limité au site, expire après 10 minutes.
          </li>
        </ul>
        <P>
          Zendou ne dépose aucun cookie publicitaire ni aucun cookie de
          mesure d&rsquo;audience tierce (pas de Google Analytics, pas de
          pixel publicitaire ou de réseau social) : aucune bibliothèque de ce
          type n&rsquo;est chargée par le site.
        </P>

        <H2>Pourquoi nous traitons ces données</H2>
        <P>
          Ces données sont traitées pour : créer et sécuriser votre compte,
          vous authentifier (par mot de passe ou via Google), fournir le
          service d&rsquo;envoi d&rsquo;email et son tableau de bord, calculer
          et facturer votre consommation de crédits, assurer la sécurité du
          service et la délivrabilité de la plateforme (limitation de débit,
          détection d&rsquo;abus), et répondre à vos demandes de support.
        </P>

        <H2>Sous-traitants et destinataires</H2>
        <P>Zendou fait appel aux prestataires suivants pour opérer le service :</P>
        <ul className="mb-4 flex list-disc flex-col gap-2 pl-5 text-[15px] leading-[1.7] text-[#9BA1A8]">
          <li>
            <strong className="text-[#EDEEF0]">Amazon Web Services (AWS SES)</strong>,
            région Europe (Paris, <code>eu-west-3</code>) : envoi effectif de
            vos emails et réception des événements de livraison (rebonds,
            plaintes).
          </li>
          <li>
            <strong className="text-[#EDEEF0]">Hébergement</strong> : le
            site et l&rsquo;API tournent sur un serveur privé virtuel (VPS)
            dédié à Zendou.
          </li>
          <li>
            <strong className="text-[#EDEEF0]">Cloudflare</strong> : gère le
            DNS du domaine <code>zendou.app</code>.
          </li>
          <li>
            <strong className="text-[#EDEEF0]">Google</strong> : uniquement
            si vous choisissez « Continuer avec Google », pour vérifier votre
            identité (voir ci-dessus).
          </li>
        </ul>
        <P>
          Zendou n&rsquo;a pas d&rsquo;accès automatisé aux systèmes
          d&rsquo;Orange Money ou de MTN MoMo : une recharge est rapprochée
          manuellement à partir de la référence de transaction que vous
          déclarez, ces opérateurs ne reçoivent donc aucune donnée de votre
          compte Zendou de notre part.
        </P>
        <ToComplete>
          localisation géographique précise (pays) du VPS d&rsquo;hébergement
        </ToComplete>

        <H2>Combien de temps nous conservons vos données</H2>
        <P>
          Le cookie de session est valable 7 jours glissants ; le cookie posé
          pendant une connexion Google expire après 10 minutes. Pour le
          reste (données de compte, journal des emails envoyés, journaux
          techniques), la durée de conservation n&rsquo;est pas encore
          fixée :
        </P>
        <ToComplete>
          durée de conservation des données de compte après suppression ou
          inactivité prolongée
        </ToComplete>
        <ToComplete>
          durée de conservation du journal des emails envoyés (métadonnées)
          et des journaux techniques
        </ToComplete>

        <H2>Sécurité</H2>
        <P>
          Votre mot de passe n&rsquo;est jamais stocké en clair. Vos clés API
          et identifiants SMTP ne sont, eux aussi, jamais stockés en clair :
          seule une empreinte permettant de vérifier une présentation
          ultérieure est conservée. La valeur de votre cookie de session
          n&rsquo;est jamais écrite dans nos journaux.
        </P>

        <H2>Vos droits</H2>
        <P>
          Vous pouvez consulter et corriger vos informations de compte (nom,
          entreprise, utilisation prévue) directement depuis votre{" "}
          <Link
            href="/dashboard/profil"
            className="text-[#8AA4FF] underline underline-offset-2"
          >
            profil
          </Link>
          . Pour toute autre demande concernant vos données personnelles
          (accès complet, suppression de compte, opposition), écrivez à{" "}
          <a
            href="mailto:contact@zendou.app"
            className="text-[#8AA4FF] underline underline-offset-2"
          >
            contact@zendou.app
          </a>
          . La suppression d&rsquo;un compte est aujourd&rsquo;hui traitée
          sur demande auprès de nous plutôt que par un bouton en libre-service
          dans le tableau de bord.
        </P>
        <ToComplete>
          délégué à la protection des données ou point de contact dédié, si
          désigné
        </ToComplete>
        <ToComplete>
          procédure et délai de traitement des demandes d&rsquo;exercice des
          droits (accès, rectification, suppression, opposition)
        </ToComplete>

        <H2>Contact</H2>
        <P>
          Pour toute question sur cette politique ou sur vos données :{" "}
          <a
            href="mailto:contact@zendou.app"
            className="text-[#8AA4FF] underline underline-offset-2"
          >
            contact@zendou.app
          </a>
          .
        </P>
      </main>

      <Footer />
    </div>
  );
}
