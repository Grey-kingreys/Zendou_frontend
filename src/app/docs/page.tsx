import Link from "next/link";
import type { Metadata } from "next";
import PageHeader from "@/components/docs/PageHeader";
import CodeTabs from "@/components/docs/CodeTabs";
import Callout from "@/components/docs/Callout";

export const metadata: Metadata = {
  title: "Démarrage rapide — Documentation Zendou",
  description:
    "Vérifiez un domaine, créez une clé API et envoyez votre premier email transactionnel avec Zendou en trois étapes.",
  alternates: { canonical: "/docs" },
};

const QUICKSTART_STEPS = [
  {
    title: "Vérifiez un domaine",
    body: "Ajoutez votre domaine d'envoi depuis le tableau de bord et publiez les 3 enregistrements CNAME (DKIM) chez votre registrar DNS.",
    href: "/docs/verifier-un-domaine",
    linkLabel: "Guide de vérification",
  },
  {
    title: "Créez une clé API",
    body: "Générez une clé « zd_live_… » depuis le tableau de bord. Elle n'est affichée qu'une seule fois : copiez-la immédiatement dans vos variables d'environnement.",
    href: "/docs/cles-api",
    linkLabel: "Gérer ses clés API",
  },
  {
    title: "Envoyez votre premier email",
    body: "Un seul appel HTTP à POST /v1/emails, authentifié par votre clé API. La réponse arrive immédiatement ; l'envoi lui-même est traité en file.",
    href: "/docs/envoyer-un-email",
    linkLabel: "Référence de l'endpoint",
  },
];

const QUICKSTART_SNIPPETS = [
  {
    label: "curl",
    code: `curl -X POST https://api.zendou.dev/v1/emails \\
  -H "Authorization: Bearer zd_live_votre_cle" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "Boutique Awa <no-reply@boutique-awa.gn>",
    "to": "cliente@exemple.gn",
    "subject": "Votre commande est confirmée",
    "html": "<p>Merci pour votre commande, elle est en préparation.</p>"
  }'`,
  },
  {
    label: "Node.js",
    code: `const response = await fetch("https://api.zendou.dev/v1/emails", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.ZENDOU_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "Boutique Awa <no-reply@boutique-awa.gn>",
    to: "cliente@exemple.gn",
    subject: "Votre commande est confirmée",
    html: "<p>Merci pour votre commande, elle est en préparation.</p>",
  }),
});

const email = await response.json();
// { id: "e_7f3a91c2b8d1", status: "queued" }`,
  },
  {
    label: "PHP",
    code: `$ch = curl_init('https://api.zendou.dev/v1/emails');

curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => 'POST',
  CURLOPT_HTTPHEADER => [
    'Authorization: Bearer ' . getenv('ZENDOU_API_KEY'),
    'Content-Type: application/json',
  ],
  CURLOPT_POSTFIELDS => json_encode([
    'from'    => 'Boutique Awa <no-reply@boutique-awa.gn>',
    'to'      => 'cliente@exemple.gn',
    'subject' => 'Votre commande est confirmée',
    'html'    => '<p>Merci pour votre commande, elle est en préparation.</p>',
  ]),
]);

$email = json_decode(curl_exec($ch), true);
curl_close($ch);
// ["id" => "e_7f3a91c2b8d1", "status" => "queued"]`,
  },
];

const MORE_LINKS = [
  {
    href: "/docs/envoyer-un-email",
    title: "Envoyer un email",
    body: "Référence complète de POST /v1/emails : paramètres, réponses, codes d'erreur et cycle de vie d'un envoi.",
  },
  {
    href: "/docs/verifier-un-domaine",
    title: "Vérifier un domaine",
    body: "DKIM, SPF, DMARC : ce qu'il faut publier chez votre registrar et pourquoi ça compte pour la délivrabilité.",
  },
  {
    href: "/docs/cles-api",
    title: "Clés API",
    body: "Création, affichage unique, révocation et bonnes pratiques de stockage.",
  },
  {
    href: "/docs/erreurs",
    title: "Erreurs",
    body: "Tous les codes HTTP renvoyés par l'API, la forme du corps d'erreur et leurs causes concrètes.",
  },
  {
    href: "/docs/facturation",
    title: "Facturation",
    body: "Crédits, packs, recharge par Orange Money ou MTN MoMo, et limite journalière.",
  },
];

export default function DocsHomePage() {
  return (
    <div className="mx-auto max-w-[760px]">
      <PageHeader
        eyebrow="DOCUMENTATION"
        title="Documentation Zendou"
        description="L'API d'email transactionnel pensée pour les équipes ouest-africaines. Cette documentation couvre l'envoi d'emails, la vérification de domaine, les clés API, les erreurs et la facturation — tout ce qu'il faut pour intégrer Zendou à votre produit."
      />

      <h2 className="mb-5 font-heading text-xl font-semibold text-[#EDEEF0]">
        Démarrage rapide
      </h2>

      <ol className="mb-6 flex flex-col gap-4">
        {QUICKSTART_STEPS.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(91,124,250,0.14)] font-mono text-[13px] font-semibold text-[#8AA4FF]">
              {index + 1}
            </span>
            <div className="min-w-0">
              <h3 className="mb-1 font-heading text-[15px] font-semibold text-[#EDEEF0]">
                {step.title}
              </h3>
              <p className="mb-2 text-[13.5px] leading-relaxed text-[#9BA1A8] text-pretty">
                {step.body}
              </p>
              <Link
                href={step.href}
                className="text-[13px] font-medium text-[#8AA4FF]"
              >
                {step.linkLabel} →
              </Link>
            </div>
          </li>
        ))}
      </ol>

      <div className="mb-4">
        <CodeTabs tabs={QUICKSTART_SNIPPETS} />
      </div>

      <Callout variant="info" title="Base URL">
        En production, l&rsquo;API est servie sur{" "}
        <code className="rounded bg-white/[0.08] px-1 py-0.5 font-mono text-[12.5px]">
          https://api.zendou.dev/v1
        </code>
        . En local (backend lancé avec <code className="rounded bg-white/[0.08] px-1 py-0.5 font-mono text-[12.5px]">npm run start:dev</code>),
        remplacez-la par{" "}
        <code className="rounded bg-white/[0.08] px-1 py-0.5 font-mono text-[12.5px]">
          http://localhost:4000/v1
        </code>
        .
      </Callout>

      <h2 className="mt-14 mb-5 font-heading text-xl font-semibold text-[#EDEEF0]">
        Aller plus loin
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MORE_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-white/[0.08] bg-[#0E1013] p-5 transition-colors hover:border-white/[0.16]"
          >
            <h3 className="mb-1.5 font-heading text-[14.5px] font-semibold text-[#EDEEF0]">
              {link.title}
            </h3>
            <p className="text-[13px] leading-relaxed text-[#8A9099] text-pretty">
              {link.body}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
