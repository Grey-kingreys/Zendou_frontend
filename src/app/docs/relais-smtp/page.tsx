import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import PageHeader from "@/components/docs/PageHeader";
import CodeTabs from "@/components/docs/CodeTabs";
import DocsTable from "@/components/docs/DocsTable";
import Callout from "@/components/docs/Callout";

export const metadata: Metadata = {
  title: "Relais SMTP - Documentation Zendou",
  description:
    "Connectez WordPress, Laravel, Django ou tout logiciel SMTP à Zendou : hôte, ports, identifiants dédiés, exemples de configuration copiables et codes de réponse.",
  alternates: { canonical: "/docs/relais-smtp" },
};

const CONNECTION_ROWS = [
  {
    port: "587",
    mode: "STARTTLS",
    usage:
      "Port principal, recommandé par défaut - celui qu'utilisent WP Mail SMTP, PHPMailer, Laravel, Django, Rails et Nodemailer sans configuration particulière.",
  },
  {
    port: "465",
    mode: "TLS implicite",
    usage:
      "À utiliser si votre hébergeur l'impose (ex. SMTPSecure = 'ssl' côté PHP).",
  },
  {
    port: "2525",
    mode: "STARTTLS (alternative)",
    usage:
      "À essayer si le port 587 est bloqué par votre hébergeur ou votre opérateur réseau.",
  },
];

const SMTP_EXAMPLES = [
  {
    label: "WP Mail SMTP",
    code: `Mailer          : Other SMTP
SMTP Host       : smtp.zendou.app
Encryption      : STARTTLS   (TLS pour le port 465)
SMTP Port       : 587
Auto TLS        : Activé
Authentication  : Activé
SMTP Username   : zdu_votre_identifiant
SMTP Password   : zd_smtp_votre_mot_de_passe
From Email      : une adresse de votre domaine vérifié dans Zendou`,
  },
  {
    label: "Laravel (.env)",
    code: `MAIL_MAILER=smtp
MAIL_HOST=smtp.zendou.app
MAIL_PORT=587
MAIL_USERNAME=zdu_votre_identifiant
MAIL_PASSWORD=zd_smtp_votre_mot_de_passe
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="no-reply@votre-domaine-verifie.gn"
MAIL_FROM_NAME="\${APP_NAME}"`,
  },
  {
    label: "Django (settings.py)",
    code: `EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.zendou.app"
EMAIL_PORT = 587
EMAIL_USE_TLS = True   # STARTTLS sur le port 587
EMAIL_HOST_USER = "zdu_votre_identifiant"
EMAIL_HOST_PASSWORD = "zd_smtp_votre_mot_de_passe"
DEFAULT_FROM_EMAIL = "no-reply@votre-domaine-verifie.gn"`,
  },
  {
    label: "Nodemailer",
    code: `import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.zendou.app",
  port: 587,
  secure: false, // false = STARTTLS (587 ou 2525) ; true = TLS implicite (465)
  auth: {
    user: process.env.ZENDOU_SMTP_USERNAME, // zdu_...
    pass: process.env.ZENDOU_SMTP_PASSWORD, // zd_smtp_...
  },
});

await transporter.sendMail({
  from: '"Boutique Awa" <no-reply@boutique-awa.gn>',
  to: "cliente@exemple.gn",
  subject: "Votre commande est confirmée",
  html: "<p>Merci pour votre commande, elle est en préparation.</p>",
});`,
  },
];

const REPLY_ROWS: {
  code: string;
  status: string;
  cause: string;
  message: string;
  action: ReactNode;
}[] = [
  {
    code: "550",
    status: "5.7.1",
    cause: "Domaine d'expédition non vérifié",
    message:
      "Le domaine d'envoi n'est pas vérifié : ajoutez-le à votre compte et validez ses enregistrements DNS avant d'envoyer.",
    action: (
      <>
        Vérifiez le domaine de l&rsquo;adresse <code>From:</code> dans Zendou
        avant d&rsquo;envoyer - voir{" "}
        <Link href="/docs/verifier-un-domaine" className="text-[#8AA4FF]">
          Vérifier un domaine
        </Link>
        .
      </>
    ),
  },
  {
    code: "550",
    status: "5.7.1",
    cause: "Domaine de l'adresse de réponse (Reply-To:) non vérifié",
    message:
      "L'adresse de réponse (reply-to) doit utiliser un domaine vérifié de votre compte : ajoutez-le et validez ses enregistrements DNS avant d'envoyer.",
    action: (
      <>
        Même règle que pour <code>From:</code>, vérifiez le domaine de
        l&rsquo;adresse <code>Reply-To:</code> dans Zendou avant
        d&rsquo;envoyer, voir{" "}
        <Link href="/docs/verifier-un-domaine" className="text-[#8AA4FF]">
          Vérifier un domaine
        </Link>
        .
      </>
    ),
  },
  {
    code: "550",
    status: "5.7.1",
    cause: "Compte suspendu",
    message: "Ce compte est suspendu",
    action:
      "Suspension automatique pour protéger la réputation d'envoi (taux de rebonds ou de plaintes trop élevé). Définitif tant qu'un administrateur ne réactive pas le compte - contactez le support.",
  },
  {
    code: "550",
    status: "5.7.1",
    cause: "Adresse du compte non confirmée",
    message:
      "Adresse email non confirmée : confirmez votre adresse pour activer l'envoi d'emails et la création de clés API. Un lien vous a été envoyé à l'inscription ; vous pouvez en demander un nouveau depuis votre tableau de bord.",
    action:
      "Confirmez l'adresse email de votre compte (lien envoyé à l'inscription, renvoyable depuis le tableau de bord).",
  },
  {
    code: "550",
    status: "5.7.1",
    cause: "Adresse de test vers un destinataire tiers",
    message:
      "Depuis l'adresse de test, vous ne pouvez écrire qu'à l'adresse email de votre compte. Vérifiez un domaine pour écrire à vos utilisateurs.",
    action:
      "Depuis l'adresse de test, n'écrivez qu'à l'adresse email de votre propre compte, ou vérifiez un domaine pour écrire à vos utilisateurs.",
  },
  {
    code: "450",
    status: "4.7.0",
    cause: "Crédits épuisés",
    message:
      "Crédits insuffisants : rechargez votre compte pour continuer à envoyer.",
    action: (
      <>
        Rechargez votre solde (voir{" "}
        <Link href="/docs/facturation" className="text-[#8AA4FF]">
          Facturation
        </Link>
        ). Réponse <strong>temporaire</strong> : votre logiciel d&rsquo;envoi
        relivre normalement le message tout seul une fois le solde
        reconstitué.
      </>
    ),
  },
  {
    code: "451",
    status: "4.7.0",
    cause: "Quota journalier atteint",
    message:
      "Limite journalière atteinte : réessayez demain ou demandez une augmentation de quota.",
    action:
      "Temporaire, se réinitialise à minuit UTC - la plupart des logiciels SMTP relivrent automatiquement.",
  },
  {
    code: "451",
    status: "4.7.0",
    cause: "Trop de messages en peu de temps (rafale)",
    message: "Trop de messages en peu de temps ; réessayez dans un instant.",
    action:
      "Ralentissez la cadence d'envoi - temporaire, réessayez après quelques instants.",
  },
  {
    code: "452",
    status: "4.5.3",
    cause: "Trop de destinataires pour ce message",
    message: "Trop de destinataires pour ce message.",
    action:
      "10 destinataires maximum par message (To + Cc + Bcc confondus), ou solde/quota insuffisant pour couvrir tous les destinataires du message. Répartissez sur plusieurs messages si nécessaire.",
  },
  {
    code: "535",
    status: "5.7.8",
    cause: "Identifiant ou mot de passe SMTP invalide",
    message: "Authentification refusée : identifiant ou mot de passe invalide.",
    action: (
      <>
        Vérifiez l&rsquo;identifiant (<code>zdu_…</code>) et le mot de passe (
        <code>zd_smtp_…</code>) sur{" "}
        <Link href="/dashboard/smtp" className="text-[#8AA4FF]">
          /dashboard/smtp
        </Link>{" "}
        - même message que l&rsquo;identifiant soit inconnu, révoqué, ou le
        mot de passe faux (aucun indice n&rsquo;est donné sur la cause
        exacte).
      </>
    ),
  },
  {
    code: "552",
    status: "5.3.4",
    cause: "Message trop volumineux",
    message:
      "Message trop volumineux : la taille dépasse la limite autorisée par ce relais.",
    action: "Réduisez la taille du message, pièces jointes comprises - 10 Mo maximum.",
  },
  {
    code: "554",
    status: "5.6.0",
    cause: "En-têtes MIME illisibles, plusieurs From:, ou plusieurs Reply-To:",
    message: "Message MIME invalide, ou plusieurs en-têtes « From: ».",
    action:
      "Vérifiez que le message est un MIME valide avec un seul en-tête From: et un seul Reply-To: bien formés.",
  },
  {
    code: "554",
    status: "5.6.0",
    cause: "Contenu non encodé en UTF-8",
    message:
      "Message refusé : son contenu n'est pas encodé en UTF-8. Encodez le corps et les pièces jointes avec un transfer-encoding standard (quoted-printable ou base64).",
    action:
      "Encodez le corps et les pièces jointes en quoted-printable ou en base64 - la quasi-totalité des clients SMTP le font par défaut dès qu'un jeu de caractères non-ASCII est déclaré.",
  },
];

const CONNECTION_REPLY_ROWS = [
  {
    code: "530 5.7.0",
    cause: "MAIL FROM envoyé sans authentification réussie au préalable",
  },
  {
    code: "538 5.7.11",
    cause: "AUTH tenté avant le chiffrement (avant STARTTLS)",
  },
  {
    code: "421 4.7.0",
    cause:
      "Trop de connexions depuis la même IP, trop d'échecs d'authentification, trop de messages sur une même connexion, ou trop de destinataires refusés - la connexion est fermée dans les quatre cas.",
  },
];

function Th({ children }: { children: ReactNode }) {
  return <th className="px-5 py-3 font-medium">{children}</th>;
}

function Td({ children }: { children: ReactNode }) {
  return <td className="px-5 py-3 align-top">{children}</td>;
}

export default function RelaisSmtpPage() {
  return (
    <div className="mx-auto max-w-[820px]">
      <PageHeader
        eyebrow="GUIDE"
        title="Relais SMTP"
        description="Connectez WordPress, Laravel, Django, un ERP ou tout logiciel qui parle SMTP à Zendou, sans changer son code d'envoi. Même solde de crédits, même journal, mêmes règles de délivrabilité que l'API - juste un port SMTP à la place d'un appel HTTP."
      />

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Paramètres de connexion
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Hôte unique, trois ports possibles selon ce que votre hébergeur
        autorise :
      </p>
      <div className="mb-2">
        <DocsTable minWidth={680}>
          <thead>
            <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
              <Th>Port</Th>
              <Th>Mode</Th>
              <Th>Quand l&rsquo;utiliser</Th>
            </tr>
          </thead>
          <tbody>
            {CONNECTION_ROWS.map((row) => (
              <tr
                key={row.port}
                className="border-b border-white/[0.05] last:border-b-0"
              >
                <Td>
                  <span className="font-mono text-[#EDEEF0]">{row.port}</span>
                </Td>
                <Td>
                  <span className="font-mono text-[#9BA1A8]">{row.mode}</span>
                </Td>
                <Td>
                  <span className="text-[#9BA1A8]">{row.usage}</span>
                </Td>
              </tr>
            ))}
          </tbody>
        </DocsTable>
      </div>
      <p className="mb-8 text-[13px] leading-relaxed text-[#70767D]">
        Hôte : <code>smtp.zendou.app</code>, pour les trois ports. Le port 25
        n&rsquo;est jamais écouté - c&rsquo;est un port de transit entre
        serveurs de messagerie, pas de soumission depuis un logiciel client.
      </p>

      <Callout variant="info" title="Authentification uniquement sur canal chiffré">
        <code>AUTH PLAIN</code> et <code>AUTH LOGIN</code> ne sont acceptées
        qu&rsquo;une fois la connexion chiffrée - après <code>STARTTLS</code>{" "}
        sur les ports 587/2525, ou d&rsquo;emblée sur le port 465 (TLS
        implicite). Une tentative d&rsquo;authentification avant chiffrement
        est refusée.
      </Callout>

      <h2 className="mt-12 mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Créer un identifiant SMTP
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Le relais utilise des identifiants dédiés, distincts de votre clé API
        (<code>zd_live_…</code>) - créés depuis le tableau de bord,{" "}
        <Link href="/dashboard/smtp" className="text-[#8AA4FF]">
          Relais SMTP
        </Link>
        . Chaque identifiant se compose d&rsquo;un nom d&rsquo;utilisateur
        opaque et d&rsquo;un mot de passe généré :
      </p>
      <ul className="mb-4 flex flex-col gap-2 text-[14px] leading-relaxed text-[#C5CACF]">
        <li>
          <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[13px]">
            zdu_…
          </code>{" "}
          - nom d&rsquo;utilisateur (16 caractères hexadécimaux), sans lien
          avec votre adresse email.
        </li>
        <li>
          <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[13px]">
            zd_smtp_…
          </code>{" "}
          - mot de passe généré, affiché une seule fois à la création.
        </li>
      </ul>
      <Callout variant="warning" title="Copiez le mot de passe avant de fermer l'écran">
        Comme pour une clé API, Zendou ne stocke que l&rsquo;empreinte du mot
        de passe, jamais sa valeur en clair : si vous le perdez, révoquez
        l&rsquo;identifiant et créez-en un nouveau. Révoquer un identifiant
        n&rsquo;affecte ni votre clé API ni vos autres identifiants SMTP.
      </Callout>

      <h2 className="mt-12 mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Exemples de configuration
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Remplacez <code>zdu_votre_identifiant</code> et{" "}
        <code>zd_smtp_votre_mot_de_passe</code> par les valeurs affichées à la
        création de votre identifiant.
      </p>
      <div className="mb-8">
        <CodeTabs tabs={SMTP_EXAMPLES} />
      </div>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Domaine d&rsquo;expédition et adresse de test
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Le relais applique exactement les mêmes règles que l&rsquo;API :
        l&rsquo;adresse indiquée dans l&rsquo;en-tête <code>From:</code> doit
        appartenir à un domaine vérifié de votre compte, et il en va de même
        pour l&rsquo;en-tête <code>Reply-To:</code>, s&rsquo;il est présent.
      </p>
      <Callout variant="success" title="L'adresse de test fonctionne aussi en SMTP">
        Pas encore de domaine vérifié ? L&rsquo;adresse d&rsquo;expédition de
        test de votre compte (copiable sur{" "}
        <Link href="/dashboard/cles-api">Clés API</Link>) est utilisable pour
        vos identifiants SMTP, avec la même restriction que sur
        l&rsquo;API :{" "}
        <Link href="/docs/verifier-un-domaine">
          vérifiez un domaine
        </Link>{" "}
        pour écrire à vos vrais utilisateurs.
      </Callout>

      <h2 className="mt-12 mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Limites et facturation
      </h2>
      <ul className="mb-8 flex flex-col gap-3 text-[14px] leading-relaxed text-[#C5CACF]">
        <li className="flex gap-3">
          <span className="text-[#35D07F]">✓</span>
          <span>
            <strong>1 crédit par destinataire</strong> réellement remis. Le
            relais accepte le champ <code>Cc:</code> et la copie cachée
            (Bcc) : chaque adresse que votre logiciel soumet en{" "}
            <code>RCPT TO</code> - que ce soit via <code>To:</code>,{" "}
            <code>Cc:</code> ou un champ Bcc de votre bibliothèque - consomme
            un crédit, exactement comme un appel API distinct par
            destinataire. L&rsquo;en-tête <code>Bcc:</code> lui-même est
            retiré des octets transmis (les destinataires en copie ne se
            voient jamais entre eux), mais un destinataire mis en Bcc reste
            un destinataire à part entière : il reçoit le message et il est
            facturé.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="text-[#35D07F]">✓</span>
          <span>
            <strong>10 destinataires maximum</strong> par message (
            <code>To</code> + <code>Cc</code> + Bcc confondus). Le 11ᵉ est
            refusé, les précédents restent acceptés.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="text-[#35D07F]">✓</span>
          <span>
            <strong>10 Mo maximum</strong> par message, pièces jointes
            comprises - annoncé dans la poignée de main SMTP et vérifié à la
            réception.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="text-[#35D07F]">✓</span>
          <span>
            <strong>Crédits épuisés → réponse temporaire</strong>. La quasi
            totalité des logiciels d&rsquo;envoi (WordPress, Laravel, Django,
            ERP) relivrent automatiquement un message refusé en 4xx après une
            recharge, sans intervention de votre part.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="text-[#35D07F]">✓</span>
          <span>
            <strong>Même journal</strong>. Chaque envoi par SMTP apparaît
            dans le{" "}
            <Link href="/dashboard/emails" className="text-[#8AA4FF]">
              Journal
            </Link>{" "}
            au même titre qu&rsquo;un envoi API, avec le canal SMTP
            renseigné, et suit le même cycle de statuts - voir{" "}
            <Link href="/docs/envoyer-un-email" className="text-[#8AA4FF]">
              Envoyer un email
            </Link>
            .
          </span>
        </li>
      </ul>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Codes de réponse SMTP
      </h2>
      <Callout variant="info" title="Une seule réponse 250 pour tout le message">
        Avec plusieurs destinataires, dès qu&rsquo;au moins un destinataire
        est accepté (ou reconnu supprimé), le message entier reçoit{" "}
        <code>250</code> - le texte détaille alors chaque destinataire
        (accepté avec son identifiant, supprimé sans expédition, ou refusé
        avec son motif). Un code de refus (4xx/5xx) n&rsquo;est renvoyé que si{" "}
        <strong>tous</strong> les destinataires sont refusés - sans quoi le
        logiciel client rejouerait tout le message et dupliquerait les
        destinataires déjà servis.
      </Callout>

      <div className="mt-6 mb-4">
        <DocsTable minWidth={780}>
          <thead>
            <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
              <Th>Code</Th>
              <Th>Cas</Th>
              <Th>Message renvoyé</Th>
              <Th>Marche à suivre</Th>
            </tr>
          </thead>
          <tbody>
            {REPLY_ROWS.map((row, index) => (
              <tr
                key={`${row.code}-${index}`}
                className="border-b border-white/[0.05] last:border-b-0"
              >
                <Td>
                  <span className="font-mono font-semibold text-[#FF9592]">
                    {row.code}
                  </span>
                  <span className="ml-1 font-mono text-[11px] text-[#70767D]">
                    {row.status}
                  </span>
                </Td>
                <Td>
                  <span className="text-[#C5CACF]">{row.cause}</span>
                </Td>
                <Td>
                  <span className="font-mono text-[12.5px] text-[#9BA1A8]">
                    « {row.message} »
                  </span>
                </Td>
                <Td>
                  <span className="text-[#9BA1A8]">{row.action}</span>
                </Td>
              </tr>
            ))}
          </tbody>
        </DocsTable>
      </div>

      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        D&rsquo;autres refus, plus rares, protègent la connexion elle-même
        plutôt qu&rsquo;un message précis - vous ne les rencontrerez pas avec
        un logiciel correctement configuré :
      </p>
      <div className="mb-8">
        <DocsTable minWidth={480}>
          <thead>
            <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
              <Th>Code</Th>
              <Th>Cas</Th>
            </tr>
          </thead>
          <tbody>
            {CONNECTION_REPLY_ROWS.map((row) => (
              <tr
                key={row.code}
                className="border-b border-white/[0.05] last:border-b-0"
              >
                <Td>
                  <span className="font-mono font-semibold text-[#FF9592]">
                    {row.code}
                  </span>
                </Td>
                <Td>
                  <span className="text-[#9BA1A8]">{row.cause}</span>
                </Td>
              </tr>
            ))}
          </tbody>
        </DocsTable>
      </div>

      <p className="text-[13px] leading-relaxed text-[#70767D]">
        Voir aussi{" "}
        <Link href="/docs/erreurs" className="text-[#8AA4FF]">
          Erreurs
        </Link>{" "}
        pour la référence complète des codes HTTP de l&rsquo;API - le canal
        SMTP a sa propre table de codes, ci-dessus, parce qu&rsquo;un serveur
        SMTP répond en codes à trois chiffres, pas en HTTP.
      </p>
    </div>
  );
}
