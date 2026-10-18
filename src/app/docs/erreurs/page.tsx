import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import Callout from "@/components/docs/Callout";
import DocsTable from "@/components/docs/DocsTable";

export const metadata: Metadata = {
  title: "Erreurs - Documentation Zendou",
  description:
    "Référence de tous les codes HTTP renvoyés par l'API Zendou, la forme du corps d'erreur et leurs causes concrètes.",
  alternates: { canonical: "/docs/erreurs" },
};

const ERROR_BODY_EXAMPLE = `{
  "message": "L'adresse du destinataire est invalide : indiquez une seule adresse comme « client@exemple.gn ».",
  "error": "Bad Request",
  "statusCode": 400,
  "errors": [
    "L'adresse du destinataire est invalide : indiquez une seule adresse comme « client@exemple.gn »."
  ]
}`;

const VALIDATION_ERROR_EXAMPLE = `{
  "message": "L'adresse d'expédition est invalide : utilisez « adresse@domaine » ou « Nom <adresse@domaine> ». L'adresse du destinataire est invalide : indiquez une seule adresse comme « client@exemple.gn ». Le sujet est obligatoire et ne doit pas dépasser 300 caractères.",
  "error": "Bad Request",
  "statusCode": 400,
  "errors": [
    "L'adresse d'expédition est invalide : utilisez « adresse@domaine » ou « Nom <adresse@domaine> ».",
    "L'adresse du destinataire est invalide : indiquez une seule adresse comme « client@exemple.gn ».",
    "Le sujet est obligatoire et ne doit pas dépasser 300 caractères."
  ]
}`;

const SEND_ERROR_CODE_EXAMPLE = `{
  "message": "Le domaine d'envoi n'est pas vérifié : ajoutez-le à votre compte et validez ses enregistrements DNS avant d'envoyer.",
  "error": "Forbidden",
  "statusCode": 403,
  "code": "DOMAIN_NOT_VERIFIED",
  "errors": [
    "Le domaine d'envoi n'est pas vérifié : ajoutez-le à votre compte et validez ses enregistrements DNS avant d'envoyer."
  ]
}`;

const SEND_ERROR_CODES: { code: string; status: string; meaning: string }[] = [
  {
    code: "ACCOUNT_SUSPENDED",
    status: "403",
    meaning: "Compte suspendu (réputation d'envoi dégradée).",
  },
  {
    code: "EMAIL_NOT_VERIFIED",
    status: "403",
    meaning: "Adresse email du compte non confirmée.",
  },
  {
    code: "INVALID_FROM",
    status: "400",
    meaning: "Adresse d'expédition (from) illisible.",
  },
  {
    code: "INVALID_TO",
    status: "400",
    meaning: "Adresse destinataire (to) illisible.",
  },
  {
    code: "INVALID_REPLY_TO",
    status: "400",
    meaning: "Adresse de réponse (replyTo) illisible. Nouveau.",
  },
  {
    code: "MISSING_BODY",
    status: "400",
    meaning: "Ni html ni text fourni.",
  },
  {
    code: "BODY_TOO_LARGE",
    status: "400",
    meaning: "Un corps (html ou text) dépasse 500 Ko.",
  },
  {
    code: "DOMAIN_NOT_VERIFIED",
    status: "403",
    meaning:
      "Domaine de l'adresse d'expédition non vérifié ou non rattaché au compte.",
  },
  {
    code: "REPLY_TO_NOT_VERIFIED",
    status: "403",
    meaning:
      "Domaine de l'adresse de réponse (replyTo) non vérifié ou non rattaché au compte. Nouveau.",
  },
  {
    code: "TEST_SENDER_UNAVAILABLE",
    status: "503",
    meaning: "Mode bac à sable momentanément indisponible (configuration serveur).",
  },
  {
    code: "TEST_SENDER_RECIPIENT_RESTRICTED",
    status: "403",
    meaning:
      "Depuis l'adresse de test, destinataire autre que l'adresse du compte.",
  },
  {
    code: "INSUFFICIENT_CREDITS",
    status: "402",
    meaning: "Solde de crédits insuffisant.",
  },
  {
    code: "DAILY_LIMIT_REACHED",
    status: "429",
    meaning: "Quota journalier atteint.",
  },
];

const CODES = [
  {
    code: "400",
    error: "Bad Request",
    summary: "Requête mal formée",
    causes: [
      "Paramètre manquant, mal typé ou hors bornes (POST /v1/emails : from, to, subject, html/text).",
      "Nom de domaine syntaxiquement invalide sur POST /v1/domains.",
      "Nom de clé API vide ou trop long sur POST /v1/api-keys.",
      "Pack de recharge inconnu, méthode de paiement invalide, ou numéro de téléphone mal formé sur POST /v1/billing/topup-requests.",
      "Paramètre de pagination (page, limit) non numérique ou hors bornes.",
      "Champ non déclaré dans le corps JSON, par exemple une faute de frappe dans un nom de paramètre : désormais refusé par un 400 (« Le champ « X » n'est pas accepté. »), là où il était auparavant ignoré silencieusement.",
    ],
  },
  {
    code: "401",
    error: "Unauthorized",
    summary: "Authentification manquante ou invalide",
    causes: [
      "En-tête Authorization absent, mal formé, ou clé API inconnue/révoquée (routes API key).",
      "Session absente ou expirée (routes tableau de bord, authentifiées par cookie).",
    ],
  },
  {
    code: "402",
    error: "Payment Required",
    summary: "Solde de crédits insuffisant",
    causes: [
      "POST /v1/emails alors que le solde de crédits du compte est inférieur à 1.",
    ],
  },
  {
    code: "403",
    error: "Forbidden",
    summary: "Action refusée malgré une authentification valide",
    causes: [
      "Domaine d'envoi non vérifié sur POST /v1/emails.",
      "Envoi depuis l'adresse de test (mode bac à sable) vers un destinataire autre que l'adresse email de votre compte sur POST /v1/emails.",
      "Compte suspendu (réputation d'envoi dégradée) - sur toute route authentifiée, API key ou session.",
    ],
  },
  {
    code: "404",
    error: "Not Found",
    summary: "Ressource introuvable",
    causes: [
      "Domaine, clé API ou email référencé par :id qui n'existe pas - ou qui appartient à un autre compte : Zendou renvoie volontairement la même 404 dans les deux cas, pour ne jamais révéler l'existence de la ressource d'un tiers.",
    ],
  },
  {
    code: "409",
    error: "Conflict",
    summary: "La requête entre en conflit avec l'état actuel des données",
    causes: [
      "Nom de domaine déjà enregistré (par vous ou par un autre compte) sur POST /v1/domains.",
      "Une demande de recharge est déjà en attente avec la même référence de transaction sur POST /v1/billing/topup-requests.",
    ],
  },
  {
    code: "429",
    error: "Too Many Requests",
    summary: "Limite journalière atteinte, rafale d'envoi trop rapide, ou trop d'échecs d'authentification",
    causes: [
      "Quota journalier : POST /v1/emails alors que le nombre d'emails envoyés depuis minuit UTC a atteint la limite journalière du compte (200 par défaut, relevée automatiquement avec l'ancienneté et le volume - voir Facturation). Message : « Limite journalière atteinte : réessayez demain ou demandez une augmentation de quota. »",
      "Rafale : plus de 60 requêtes par minute sur POST /v1/emails, indépendamment du quota journalier et du solde de crédits. Message : « Trop de requêtes. Réessayez dans quelques instants. »",
      "Trop d'échecs d'authentification depuis une même adresse IP sur POST /v1/emails (clé API inconnue ou révoquée présentée à répétition). Utile à savoir en intégration : tester avec une mauvaise clé peut donc, après plusieurs essais, renvoyer un 429 plutôt qu'un 401. Une clé valide n'est jamais concernée, même si l'IP est bloquée.",
    ],
  },
];

export default function ErreursPage() {
  return (
    <div className="mx-auto max-w-[820px]">
      <PageHeader
        eyebrow="RÉFÉRENCE API"
        title="Erreurs"
        description="L'API HTTP renvoie des codes HTTP standards. Toute erreur porte un corps JSON de la même forme, produite par le framework NestJS. Le relais SMTP a sa propre table de codes à trois chiffres, documentée séparément."
      />

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Forme du corps d&rsquo;erreur
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        <code>statusCode</code> reprend le code HTTP et <code>error</code> son
        libellé standard. <code>message</code> est <strong>toujours une
        chaîne</strong> : la phrase à afficher telle quelle.{" "}
        <code>errors</code> est <strong>toujours un tableau de chaînes non
        vide</strong> : le détail, un élément par champ invalide quand
        plusieurs champs sont en cause. Les deux sont liés par un invariant :
        <code> message === errors.join(&#39; &#39;)</code> -{" "}
        <code>message</code> n&rsquo;est que la concaténation de{" "}
        <code>errors</code>, séparée par un espace.
      </p>
      <div className="mb-3">
        <CodeBlock
          code={ERROR_BODY_EXAMPLE}
          label="400 Bad Request - un champ invalide"
        />
      </div>
      <div className="mb-4">
        <CodeBlock
          code={VALIDATION_ERROR_EXAMPLE}
          label="400 Bad Request - plusieurs champs invalides"
        />
      </div>
      <div className="mb-10">
        <Callout
          variant="info"
          title="Migration : message n'est plus jamais un tableau"
        >
          Avant ce correctif, <code>message</code> changeait de forme selon le
          chemin d&rsquo;échec : une chaîne pour une erreur levée à la main,
          un tableau pour les erreurs de validation agrégées par NestJS. Un
          code qui lisait <code>message[0]</code> pour afficher la phrase
          recevait donc, sans erreur visible, soit la phrase entière soit sa
          première lettre - selon le chemin emprunté. Remplacez{" "}
          <code>message[0]</code> par <code>errors[0]</code> :{" "}
          <code>message</code> est désormais toujours la chaîne complète à
          afficher, et <code>errors</code> porte le détail champ par champ.
        </Callout>
      </div>

      <h2 className="mb-5 font-heading text-xl font-semibold text-[#EDEEF0]">
        Codes HTTP
      </h2>
      <div className="mb-4 flex flex-col gap-5">
        {CODES.map((entry) => (
          <div
            key={entry.code}
            className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2.5">
              <span className="rounded bg-[#E5484D]/15 px-2 py-0.5 font-mono text-[13px] font-semibold text-[#FF9592]">
                {entry.code}
              </span>
              <span className="font-mono text-[12.5px] text-[#70767D]">
                {entry.error}
              </span>
              <span className="text-[13.5px] text-[#C5CACF]">
                {entry.summary}
              </span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {entry.causes.map((cause, index) => (
                <li
                  key={index}
                  className="flex gap-2 text-[13.5px] leading-relaxed text-[#9BA1A8] text-pretty"
                >
                  <span className="text-[#5E646B]">-</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mb-10">
        <Callout variant="info" title="En-têtes de limitation de débit">
          Toute réponse d&rsquo;une route soumise à une limite porte trois
          en-têtes : <code>X-RateLimit-Limit</code> (budget de la fenêtre),{" "}
          <code>X-RateLimit-Remaining</code> (requêtes encore acceptées dans
          cette fenêtre) et <code>X-RateLimit-Reset</code> (secondes avant
          remise à zéro). Un 429 porte en plus <code>Retry-After</code>{" "}
          (secondes avant de pouvoir réessayer), désormais aussi bien sur le
          429 de rafale que sur celui de quota journalier atteint. Quand
          plusieurs compteurs s&rsquo;appliquent à une même requête, ce sont
          les valeurs du compteur le plus contraignant, celui qui bloquera le
          client en premier, qui sont publiées.
        </Callout>
      </div>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Code d&rsquo;erreur machine (POST /v1/emails)
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Toute réponse d&rsquo;erreur 4xx de <code>POST /v1/emails</code> porte,
        en plus de <code>message</code> et <code>errors</code>, un champ{" "}
        <code>code</code> : une chaîne stable et lisible par machine, sur
        laquelle brancher la logique d&rsquo;un client plutôt que sur le texte
        français de <code>message</code>, susceptible d&rsquo;être reformulé.
      </p>
      <div className="mb-4">
        <CodeBlock
          code={SEND_ERROR_CODE_EXAMPLE}
          label="403 Forbidden - domaine d'envoi non vérifié"
        />
      </div>
      <div className="mb-4">
        <DocsTable minWidth={560}>
          <thead>
            <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 font-medium">Statut HTTP</th>
              <th className="px-5 py-3 font-medium">Signification</th>
            </tr>
          </thead>
          <tbody>
            {SEND_ERROR_CODES.map((row) => (
              <tr
                key={row.code}
                className="border-b border-white/[0.05] last:border-b-0"
              >
                <td className="px-5 py-3 align-top font-mono text-[12.5px] text-[#EDEEF0]">
                  {row.code}
                </td>
                <td className="px-5 py-3 align-top font-mono font-semibold text-[#FF9592]">
                  {row.status}
                </td>
                <td className="px-5 py-3 align-top text-[#9BA1A8]">
                  {row.meaning}
                </td>
              </tr>
            ))}
          </tbody>
        </DocsTable>
      </div>
      <p className="mb-10 text-[13px] leading-relaxed text-[#70767D]">
        <code>INVALID_REPLY_TO</code> et <code>REPLY_TO_NOT_VERIFIED</code>{" "}
        sont nouveaux, liés à la prise en charge du champ{" "}
        <code>replyTo</code>, voir{" "}
        <Link href="/docs/envoyer-un-email" className="text-[#8AA4FF]">
          Envoyer un email
        </Link>
        .
      </p>

      <p className="mt-8 text-[13px] leading-relaxed text-[#70767D]">
        Pour le détail des messages exacts renvoyés par{" "}
        <code>POST /v1/emails</code>, voir le tableau d&rsquo;erreurs de la
        page « Envoyer un email ».
      </p>
      <p className="mt-3 text-[13px] leading-relaxed text-[#70767D]">
        Ces codes ne couvrent que l&rsquo;API HTTP. Le{" "}
        <Link href="/docs/relais-smtp" className="text-[#8AA4FF]">
          relais SMTP
        </Link>{" "}
        répond en codes à trois chiffres (RFC 5321), pas en HTTP - sa propre
        table de correspondance est documentée sur cette page.
      </p>
    </div>
  );
}
