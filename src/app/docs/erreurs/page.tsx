import type { Metadata } from "next";
import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

export const metadata: Metadata = {
  title: "Erreurs — Documentation Zendou",
  description:
    "Référence de tous les codes HTTP renvoyés par l'API Zendou, la forme du corps d'erreur et leurs causes concrètes.",
};

const ERROR_BODY_EXAMPLE = `{
  "statusCode": 403,
  "message": "Le domaine d'envoi n'est pas vérifié : ajoutez-le à votre compte et validez ses enregistrements DNS avant d'envoyer.",
  "error": "Forbidden"
}`;

const VALIDATION_ERROR_EXAMPLE = `{
  "statusCode": 400,
  "message": [
    "Le sujet est obligatoire et ne doit pas dépasser 300 caractères."
  ],
  "error": "Bad Request"
}`;

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
      "Compte suspendu (réputation d'envoi dégradée) — sur toute route authentifiée, API key ou session.",
    ],
  },
  {
    code: "404",
    error: "Not Found",
    summary: "Ressource introuvable",
    causes: [
      "Domaine, clé API ou email référencé par :id qui n'existe pas — ou qui appartient à un autre compte : Zendou renvoie volontairement la même 404 dans les deux cas, pour ne jamais révéler l'existence de la ressource d'un tiers.",
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
    summary: "Limite journalière d'envoi atteinte",
    causes: [
      "POST /v1/emails alors que le nombre d'emails envoyés depuis minuit UTC a atteint la limite journalière du compte (200 par défaut, relevée automatiquement avec l'ancienneté et le volume — voir Facturation).",
    ],
  },
];

export default function ErreursPage() {
  return (
    <div className="mx-auto max-w-[820px]">
      <PageHeader
        eyebrow="RÉFÉRENCE API"
        title="Erreurs"
        description="L'API renvoie des codes HTTP standards. Toute erreur porte un corps JSON de la même forme, produite par le framework NestJS."
      />

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Forme du corps d&rsquo;erreur
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        <code>statusCode</code> reprend le code HTTP, <code>error</code> son
        libellé standard, et <code>message</code> est soit une phrase en
        français décrivant la cause précise, soit — pour certaines erreurs de
        validation — un tableau de phrases (un message par champ invalide).
      </p>
      <div className="mb-3">
        <CodeBlock code={ERROR_BODY_EXAMPLE} label="403 Forbidden" />
      </div>
      <div className="mb-10">
        <CodeBlock code={VALIDATION_ERROR_EXAMPLE} label="400 Bad Request" />
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
                  <span className="text-[#5E646B]">–</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-8 text-[13px] leading-relaxed text-[#70767D]">
        Pour le détail des messages exacts renvoyés par{" "}
        <code>POST /v1/emails</code>, voir le tableau d&rsquo;erreurs de la
        page « Envoyer un email ».
      </p>
    </div>
  );
}
