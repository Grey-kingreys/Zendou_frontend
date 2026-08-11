import type { Metadata } from "next";
import type { ReactNode } from "react";
import PageHeader from "@/components/docs/PageHeader";
import DocsTable from "@/components/docs/DocsTable";
import Callout from "@/components/docs/Callout";
import CodeBlock from "@/components/docs/CodeBlock";

export const metadata: Metadata = {
  title: "Vérifier un domaine — Documentation Zendou",
  description:
    "Ajoutez votre domaine, publiez les enregistrements DKIM, SPF et DMARC, et comprenez pourquoi ils comptent pour la délivrabilité.",
};

const EXAMPLE_DKIM_ROWS = [
  {
    type: "CNAME",
    name: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6._domainkey.boutique-awa.gn",
    value: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.dkim.amazonses.com",
  },
  {
    type: "CNAME",
    name: "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6a1._domainkey.boutique-awa.gn",
    value: "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6a1.dkim.amazonses.com",
  },
  {
    type: "CNAME",
    name: "c3d4e5f6g7h8i9j0k1l2m3n4o5p6a1b2._domainkey.boutique-awa.gn",
    value: "c3d4e5f6g7h8i9j0k1l2m3n4o5p6a1b2.dkim.amazonses.com",
  },
];

const STEPS = [
  {
    title: "Ajoutez le domaine à votre compte",
    body: "Depuis le tableau de bord, Domaines → Ajouter un domaine, saisissez le nom exact que vous utiliserez comme expéditeur (ex. boutique-awa.gn, sans « http:// » ni sous-chemin). Zendou crée l'identité correspondante et génère 3 jetons DKIM propres à ce domaine.",
  },
  {
    title: "Publiez les 3 enregistrements CNAME chez votre registrar",
    body: "Chaque jeton devient un enregistrement CNAME distinct, affiché sur la page du domaine dans le tableau de bord (avec bouton de copie). Ajoutez les 3, sans en modifier ni le nom ni la valeur.",
  },
  {
    title: "Attendez la propagation DNS",
    body: "La propagation prend généralement de quelques minutes à quelques heures selon votre registrar. Amazon SES interroge vos enregistrements en tâche de fond et peut mettre jusqu'à 72 h à confirmer la vérification.",
  },
  {
    title: "Cliquez sur « Vérifier maintenant »",
    body: "Ce bouton, sur la page du domaine, force une nouvelle interrogation immédiate côté SES au lieu d'attendre le prochain passage automatique. Le statut passe à « Vérifié » dès que SES confirme les 3 CNAME.",
  },
];

function Th({ children }: { children: ReactNode }) {
  return <th className="px-5 py-3 font-medium">{children}</th>;
}

export default function VerifierUnDomainePage() {
  return (
    <div className="mx-auto max-w-[820px]">
      <PageHeader
        eyebrow="GUIDE"
        title="Vérifier un domaine"
        description="Envoyer depuis votre propre domaine (plutôt qu'une adresse partagée) exige de prouver à Amazon SES que vous en êtes propriétaire, via des enregistrements DNS. C'est aussi ce qui protège vos destinataires de l'usurpation."
      />

      <h2 className="mb-5 font-heading text-xl font-semibold text-[#EDEEF0]">
        Étapes
      </h2>
      <ol className="mb-10 flex flex-col gap-4">
        {STEPS.map((step, index) => (
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
              <p className="text-[13.5px] leading-relaxed text-[#9BA1A8] text-pretty">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mb-3 font-heading text-xl font-semibold text-[#EDEEF0]">
        À quoi ressemblent les 3 CNAME DKIM
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Exemple pour un domaine <code>boutique-awa.gn</code> — vos valeurs
        réelles, propres à votre domaine, sont affichées (et copiables) sur
        la page du domaine dans le tableau de bord.
      </p>
      <div className="mb-8">
        <DocsTable minWidth={720}>
          <thead>
            <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
              <Th>Type</Th>
              <Th>Nom</Th>
              <Th>Valeur</Th>
            </tr>
          </thead>
          <tbody>
            {EXAMPLE_DKIM_ROWS.map((row, index) => (
              <tr
                key={index}
                className="border-b border-white/[0.05] last:border-b-0"
              >
                <td className="px-5 py-3 font-mono text-[#9BA1A8]">
                  {row.type}
                </td>
                <td className="px-5 py-3 font-mono text-[12px] text-[#C5CACF] break-all">
                  {row.name}
                </td>
                <td className="px-5 py-3 font-mono text-[12px] text-[#C5CACF] break-all">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </DocsTable>
      </div>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Chez votre registrar
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        La marche à suivre est la même partout dans son principe — ouvrir la
        gestion DNS du domaine et ajouter 3 enregistrements de type CNAME —
        mais l&rsquo;écran diffère selon le registrar :
      </p>
      <div className="mb-6 flex flex-col gap-4">
        <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5">
          <h3 className="mb-1.5 font-heading text-[14.5px] font-semibold text-[#EDEEF0]">
            Cloudflare
          </h3>
          <p className="text-[13.5px] leading-relaxed text-[#9BA1A8] text-pretty">
            DNS → Records → Add record, type <code>CNAME</code>. Collez le
            nom (sans le suffixe de votre domaine si Cloudflare l&rsquo;ajoute
            automatiquement) et la valeur telles quelles.
          </p>
        </div>
        <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5">
          <h3 className="mb-1.5 font-heading text-[14.5px] font-semibold text-[#EDEEF0]">
            GoDaddy
          </h3>
          <p className="text-[13.5px] leading-relaxed text-[#9BA1A8] text-pretty">
            Mes produits → DNS → Ajouter un enregistrement, type{" "}
            <code>CNAME</code>. GoDaddy affiche parfois le nom d&rsquo;hôte
            sans le domaine racine : dans ce cas, retirez{" "}
            <code>.boutique-awa.gn</code> de la fin du champ « Nom ».
          </p>
        </div>
        <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5">
          <h3 className="mb-1.5 font-heading text-[14.5px] font-semibold text-[#EDEEF0]">
            OVH
          </h3>
          <p className="text-[13.5px] leading-relaxed text-[#9BA1A8] text-pretty">
            Zone DNS → Ajouter une entrée → CNAME. Le sous-domaine attendu
            est la partie avant votre nom de domaine ; laissez un point final
            (<code>.</code>) à la fin de la valeur si l&rsquo;interface le
            demande.
          </p>
        </div>
      </div>

      <Callout variant="warning" title="Cloudflare : ne pas activer le proxy sur ces CNAME">
        Si votre domaine passe par Cloudflare, laissez le nuage en gris («
        DNS only ») sur les 3 enregistrements DKIM — pas orange (« Proxied »).
        Un CNAME proxié pointe vers l&rsquo;infrastructure Cloudflare au lieu
        de répondre avec la vraie valeur DKIM, et Amazon SES ne pourra jamais
        vérifier le domaine.
      </Callout>

      <div className="mt-8">
        <Callout variant="info" title="La vérification côté AWS peut prendre jusqu'à 72 h">
          Une fois les enregistrements publiés et propagés, Amazon SES les
          contrôle en tâche de fond. Cliquer sur « Vérifier maintenant »
          force une vérification immédiate, mais n&rsquo;accélère pas la
          propagation DNS elle-même si elle n&rsquo;est pas terminée.
        </Callout>
      </div>

      <h2 className="mt-14 mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Statuts d&rsquo;un domaine
      </h2>
      <div className="mb-10">
        <DocsTable minWidth={560}>
          <thead>
            <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
              <Th>Statut</Th>
              <Th>Signification</Th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/[0.05]">
              <td className="px-5 py-3 font-mono text-[#9BA1A8]">PENDING</td>
              <td className="px-5 py-3 text-[#9BA1A8]">
                En attente : les CNAME ne sont pas encore confirmés côté SES.
              </td>
            </tr>
            <tr className="border-b border-white/[0.05]">
              <td className="px-5 py-3 font-mono text-[#9BA1A8]">VERIFIED</td>
              <td className="px-5 py-3 text-[#9BA1A8]">
                Vérifié : le domaine peut être utilisé comme expéditeur.
              </td>
            </tr>
            <tr className="border-b border-white/[0.05]">
              <td className="px-5 py-3 font-mono text-[#9BA1A8]">FAILED</td>
              <td className="px-5 py-3 text-[#9BA1A8]">
                Échec : SES n&rsquo;a pas pu vérifier les enregistrements.
                Contrôlez qu&rsquo;ils sont publiés exactement comme affichés.
              </td>
            </tr>
            <tr className="last:border-b-0">
              <td className="px-5 py-3 font-mono text-[#9BA1A8]">
                TEMPORARY_FAILURE
              </td>
              <td className="px-5 py-3 text-[#9BA1A8]">
                Échec temporaire côté SES — sans action de votre part,
                réessayez « Vérifier maintenant » plus tard.
              </td>
            </tr>
          </tbody>
        </DocsTable>
      </div>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        SPF et DMARC, en clair
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Ils ne sont pas exigés par Amazon SES pour vérifier le domaine, mais
        ils sont fortement conseillés : sans eux, une part croissante des
        boîtes de réception (Gmail, Outlook, Yahoo…) classe vos emails en
        spam ou les rejette purement et simplement.
      </p>
      <div className="mb-4 rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5">
        <h3 className="mb-1.5 font-heading text-[14.5px] font-semibold text-[#EDEEF0]">
          SPF — qui a le droit d&rsquo;envoyer pour votre domaine
        </h3>
        <p className="mb-3 text-[13.5px] leading-relaxed text-[#9BA1A8] text-pretty">
          Un enregistrement TXT publié à la racine du domaine, qui liste les
          serveurs autorisés à envoyer en votre nom. Il autorise Amazon SES :
        </p>
        <CodeBlock
          code={`Nom  : boutique-awa.gn
Type : TXT
Valeur : v=spf1 include:amazonses.com ~all`}
        />
        <p className="mt-3 text-[13px] leading-relaxed text-[#70767D]">
          Si un enregistrement SPF existe déjà pour votre domaine, ne le
          dupliquez pas : ajoutez{" "}
          <code>include:amazonses.com</code> à celui en place.
        </p>
      </div>
      <div className="mb-8 rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5">
        <h3 className="mb-1.5 font-heading text-[14.5px] font-semibold text-[#EDEEF0]">
          DMARC — que faire des emails qui échouent SPF/DKIM
        </h3>
        <p className="mb-3 text-[13.5px] leading-relaxed text-[#9BA1A8] text-pretty">
          Un second enregistrement TXT qui indique aux serveurs receveurs la
          politique à appliquer si un email prétendant venir de votre
          domaine échoue les contrôles SPF et DKIM.
        </p>
        <CodeBlock
          code={`Nom  : _dmarc.boutique-awa.gn
Type : TXT
Valeur : v=DMARC1; p=none;`}
        />
        <p className="mt-3 text-[13px] leading-relaxed text-[#70767D]">
          <code>p=none</code> démarre en mode observation : rien n&rsquo;est
          bloqué, mais vous recevez des rapports. Une fois ces rapports
          propres, vous pouvez durcir la politique à{" "}
          <code>p=quarantine</code> puis <code>p=reject</code>.
        </p>
      </div>
    </div>
  );
}
