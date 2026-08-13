import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import DocsTable from "@/components/docs/DocsTable";
import Callout from "@/components/docs/Callout";

export const metadata: Metadata = {
  title: "Envoyer un email transactionnel — Documentation Zendou",
  description:
    "Référence complète de POST /v1/emails pour envoyer un email transactionnel avec Zendou : paramètres, exemple de requête et de réponse, codes d'erreur et cycle de vie d'un envoi.",
  alternates: { canonical: "/docs/envoyer-un-email" },
};

const REQUEST_EXAMPLE = `curl -X POST https://api.zendou.dev/v1/emails \\
  -H "Authorization: Bearer zd_live_votre_cle" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "Boutique Awa <no-reply@boutique-awa.gn>",
    "to": "cliente@exemple.gn",
    "subject": "Votre commande est confirmée",
    "html": "<p>Merci pour votre commande, elle est en préparation.</p>"
  }'`;

const RESPONSE_QUEUED = `{
  "id": "e_7f3a91c2b8d1",
  "status": "queued"
}`;

const RESPONSE_SUPPRESSED = `{
  "id": "e_1a2b3c4d5e6f",
  "status": "suppressed"
}`;

const PARAMS = [
  {
    name: "from",
    type: "string",
    required: "Oui",
    description:
      "Expéditeur. « adresse@domaine » ou « Nom <adresse@domaine> ». Le domaine doit être un domaine vérifié de votre compte.",
  },
  {
    name: "to",
    type: "string",
    required: "Oui",
    description:
      "Destinataire — une seule adresse nue (« client@exemple.gn »), sans nom affiché. Pas de liste ni de séparateur en v1.",
  },
  {
    name: "subject",
    type: "string",
    required: "Oui",
    description: "Sujet de l'email. Entre 1 et 300 caractères.",
  },
  {
    name: "html",
    type: "string",
    required: "Non*",
    description:
      "Corps HTML de l'email. Limité à 500 Ko (mesurés en octets UTF-8).",
  },
  {
    name: "text",
    type: "string",
    required: "Non*",
    description:
      "Corps texte brut de l'email. Limité à 500 Ko (mesurés en octets UTF-8).",
  },
];

const ERROR_ROWS: {
  code: string;
  cause: string;
  message: string;
  action: string;
}[] = [
  {
    code: "400",
    cause: "Adresse d'expédition illisible",
    message:
      "L'adresse d'expédition est invalide : utilisez « adresse@domaine » ou « Nom <adresse@domaine> ».",
    action: "Corrigez le format du champ from.",
  },
  {
    code: "400",
    cause: "Adresse destinataire illisible",
    message:
      "L'adresse du destinataire est invalide : indiquez une seule adresse comme « client@exemple.gn ».",
    action: "Le champ to n'accepte qu'une seule adresse nue, sans nom affiché.",
  },
  {
    code: "400",
    cause: "Sujet vide ou trop long",
    message:
      "Le sujet est obligatoire et ne doit pas dépasser 300 caractères.",
    action: "Renseignez subject avec 1 à 300 caractères.",
  },
  {
    code: "400",
    cause: "Ni html ni text fourni",
    message: "Fournissez au moins un contenu : « html » ou « text ».",
    action: "Ajoutez au moins l'un des deux champs dans le corps de la requête.",
  },
  {
    code: "400",
    cause: "Contenu trop volumineux",
    message: "Chaque contenu (« html », « text ») est limité à 500 Ko.",
    action:
      "Réduisez la taille du contenu — par exemple en hébergeant les images à part plutôt qu'en base64 inline.",
  },
  {
    code: "401",
    cause: "Clé API absente, inconnue ou révoquée",
    message: "Clé API invalide ou révoquée",
    action:
      "Vérifiez l'en-tête Authorization: Bearer zd_live_…. Générez une nouvelle clé si nécessaire.",
  },
  {
    code: "402",
    cause: "Solde de crédits insuffisant",
    message:
      "Crédits insuffisants : rechargez votre compte pour continuer à envoyer.",
    action: "Rechargez votre solde (voir Facturation).",
  },
  {
    code: "403",
    cause: "Domaine d'envoi non vérifié",
    message:
      "Le domaine d'envoi n'est pas vérifié : ajoutez-le à votre compte et validez ses enregistrements DNS avant d'envoyer.",
    action: "Suivez le guide de vérification de domaine avant de réessayer.",
  },
  {
    code: "403",
    cause: "Compte suspendu",
    message: "Ce compte est suspendu",
    action:
      "Le compte a été suspendu automatiquement pour protéger la réputation d'envoi (taux de rebonds ou de plaintes trop élevé). Contactez le support.",
  },
  {
    code: "429",
    cause: "Limite journalière atteinte",
    message:
      "Limite journalière atteinte : réessayez demain ou demandez une augmentation de quota.",
    action:
      "Réessayez le lendemain (minuit UTC) — la limite augmente automatiquement avec l'ancienneté et le volume du compte.",
  },
];

const STATUS_ROWS: {
  status: string;
  meaning: string;
}[] = [
  {
    status: "QUEUED",
    meaning:
      "L'email a été accepté et débité d'un crédit. Il attend d'être traité par la file d'envoi.",
  },
  {
    status: "SENT",
    meaning: "L'email a été remis à Amazon SES pour distribution.",
  },
  {
    status: "DELIVERED",
    meaning:
      "Le serveur du destinataire a confirmé la réception. Fin normale du cycle.",
  },
  {
    status: "BOUNCED",
    meaning:
      "Le message a rebondi. Un rebond dur (adresse inexistante) ajoute automatiquement l'adresse à votre liste de suppression ; un rebond transitoire (boîte pleine, serveur indisponible) est seulement enregistré.",
  },
  {
    status: "COMPLAINED",
    meaning:
      "Le destinataire a signalé l'email comme spam. L'adresse est ajoutée automatiquement à la liste de suppression.",
  },
  {
    status: "SUPPRESSED",
    meaning:
      "L'envoi a été bloqué avant la mise en file car l'adresse est sur une liste de suppression (la vôtre ou globale à la plateforme). Non facturé.",
  },
  {
    status: "REJECTED / FAILED",
    meaning:
      "L'email n'a pas pu être délivré : message rejeté par Amazon SES, ou abandon après plusieurs tentatives d'envoi.",
  },
];

function Th({ children }: { children: ReactNode }) {
  return <th className="px-5 py-3 font-medium">{children}</th>;
}

function Td({ children }: { children: ReactNode }) {
  return <td className="px-5 py-3 align-top">{children}</td>;
}

export default function EnvoyerUnEmailPage() {
  return (
    <div className="mx-auto max-w-[820px]">
      <PageHeader
        eyebrow="RÉFÉRENCE API"
        title="Envoyer un email"
        description="POST /v1/emails accepte l'envoi et répond immédiatement : la distribution effective est traitée en file d'attente, avec relances automatiques en cas d'échec temporaire."
      />

      <div className="mb-8 flex flex-wrap items-center gap-3 rounded-lg border border-white/[0.09] bg-white/[0.03] px-4 py-3 font-mono text-[13px]">
        <span className="rounded bg-[#35D07F]/15 px-2 py-0.5 font-semibold text-[#35D07F]">
          POST
        </span>
        <span className="text-[#C5CACF]">/v1/emails</span>
        <span className="text-[#5E646B]">
          — authentifié par clé API (Authorization: Bearer zd_live_…)
        </span>
      </div>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Paramètres du corps
      </h2>
      <div className="mb-8">
        <DocsTable minWidth={640}>
          <thead>
            <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
              <Th>Nom</Th>
              <Th>Type</Th>
              <Th>Requis</Th>
              <Th>Description</Th>
            </tr>
          </thead>
          <tbody>
            {PARAMS.map((param) => (
              <tr
                key={param.name}
                className="border-b border-white/[0.05] last:border-b-0"
              >
                <Td>
                  <code className="font-mono text-[#EDEEF0]">
                    {param.name}
                  </code>
                </Td>
                <Td>
                  <span className="font-mono text-[#9BA1A8]">
                    {param.type}
                  </span>
                </Td>
                <Td>
                  <span className="text-[#9BA1A8]">{param.required}</span>
                </Td>
                <Td>
                  <span className="text-[#9BA1A8]">{param.description}</span>
                </Td>
              </tr>
            ))}
          </tbody>
        </DocsTable>
        <p className="mt-3 text-[13px] text-[#70767D]">
          * Au moins l&rsquo;un des deux champs <code>html</code> ou{" "}
          <code>text</code> est obligatoire.
        </p>
      </div>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Exemple de requête
      </h2>
      <div className="mb-8">
        <CodeBlock code={REQUEST_EXAMPLE} label="curl" />
      </div>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Exemple de réponse
      </h2>
      <p className="mb-3 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Toute requête acceptée répond{" "}
        <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[13px]">
          202 Accepted
        </code>{" "}
        — y compris quand le destinataire est bloqué : l&rsquo;email est
        alors tracé avec le statut <code>suppressed</code>, sans être mis en
        file ni facturé.
      </p>
      <div className="mb-3">
        <CodeBlock code={RESPONSE_QUEUED} label="202 Accepted — mis en file" />
      </div>
      <div className="mb-8">
        <CodeBlock
          code={RESPONSE_SUPPRESSED}
          label="202 Accepted — adresse supprimée"
        />
      </div>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Codes d&rsquo;erreur
      </h2>
      <div className="mb-8">
        <DocsTable minWidth={760}>
          <thead>
            <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
              <Th>Code</Th>
              <Th>Cas</Th>
              <Th>Message renvoyé</Th>
              <Th>Marche à suivre</Th>
            </tr>
          </thead>
          <tbody>
            {ERROR_ROWS.map((row, index) => (
              <tr
                key={`${row.code}-${index}`}
                className="border-b border-white/[0.05] last:border-b-0"
              >
                <Td>
                  <span className="font-mono font-semibold text-[#FF9592]">
                    {row.code}
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
      <p className="mb-12 text-[13px] leading-relaxed text-[#70767D]">
        Voir <Link href="/docs/erreurs" className="text-[#8AA4FF]">Erreurs</Link>{" "}
        pour la référence complète de tous les codes HTTP de l&rsquo;API,
        toutes routes confondues.
      </p>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Statuts d&rsquo;un email
      </h2>
      <p className="mb-5 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Un envoi accepté suit normalement le cycle{" "}
        <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[12.5px]">
          QUEUED
        </code>{" "}
        →{" "}
        <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[12.5px]">
          SENT
        </code>{" "}
        →{" "}
        <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[12.5px]">
          DELIVERED
        </code>
        . Les statuts suivants marquent une sortie de ce cycle :
      </p>
      <div className="mb-6">
        <DocsTable minWidth={620}>
          <thead>
            <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
              <Th>Statut</Th>
              <Th>Signification</Th>
            </tr>
          </thead>
          <tbody>
            {STATUS_ROWS.map((row) => (
              <tr
                key={row.status}
                className="border-b border-white/[0.05] last:border-b-0"
              >
                <Td>
                  <span className="font-mono text-[#EDEEF0]">
                    {row.status}
                  </span>
                </Td>
                <Td>
                  <span className="text-[#9BA1A8]">{row.meaning}</span>
                </Td>
              </tr>
            ))}
          </tbody>
        </DocsTable>
      </div>

      <Callout variant="warning" title="Effet sur la réputation">
        Les rebonds durs et les plaintes alimentent le taux de rebond et de
        plainte de votre compte, surveillé en continu. Au-delà des seuils
        tolérés, le compte est suspendu automatiquement pour protéger la
        délivrabilité de tous les clients Zendou — mieux vaut nettoyer
        régulièrement ses listes de diffusion que d&rsquo;atteindre ce seuil.
      </Callout>
    </div>
  );
}
