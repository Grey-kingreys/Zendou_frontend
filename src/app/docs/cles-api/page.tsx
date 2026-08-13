import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import Callout from "@/components/docs/Callout";
import DocsTable from "@/components/docs/DocsTable";

export const metadata: Metadata = {
  title: "Clés API — Documentation Zendou",
  description:
    "Créer, stocker et révoquer une clé API Zendou : ce qu'il faut savoir avant de mettre une clé zd_live_… en production.",
  alternates: { canonical: "/docs/cles-api" },
};

export default function ClesApiPage() {
  return (
    <div className="mx-auto max-w-[780px]">
      <PageHeader
        eyebrow="RÉFÉRENCE API"
        title="Clés API"
        description="Une clé API authentifie vos appels serveur à serveur (POST /v1/emails). Elle est distincte de la session de votre compte, utilisée par le tableau de bord pour gérer domaines, clés et facturation."
      />

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Créer une clé
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Depuis le tableau de bord, Clés API → Nouvelle clé, donnez-lui un nom
        qui vous aidera à la reconnaître plus tard (ex. «&nbsp;Serveur de
        production&nbsp;», «&nbsp;Script de test&nbsp;»). La clé complète a
        la forme suivante :
      </p>
      <div className="mb-4">
        <CodeBlock code="zd_live_9fQ2mR7xL0pK4wT8nB1vD6sH3jY5cZ2aE9uI7oP" />
      </div>
      <p className="mb-8 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Utilisez-la dans l&rsquo;en-tête <code>Authorization</code> de vos
        appels à l&rsquo;API :
      </p>
      <div className="mb-10">
        <CodeBlock
          code={`Authorization: Bearer zd_live_9fQ2mR7xL0pK4wT8nB1vD6sH3jY5cZ2aE9uI7oP`}
        />
      </div>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Affichage unique
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        La clé complète n&rsquo;apparaît qu&rsquo;au moment de sa création.
        Une fois l&rsquo;écran quitté, seul son préfixe (les 12 premiers
        caractères, ex. <code>zd_live_9fQ2</code>) reste visible dans la
        liste — suffisant pour identifier une clé, jamais pour l&rsquo;utiliser.
        Zendou ne stocke que l&rsquo;empreinte de la clé, jamais la clé en
        clair : si vous la perdez, il n&rsquo;y a aucun moyen de la
        récupérer, seulement d&rsquo;en créer une nouvelle.
      </p>
      <Callout variant="warning" title="Copiez-la avant de fermer l'écran">
        Une fois quitté, l&rsquo;écran de création ne réaffichera plus jamais
        la clé complète. Si vous la perdez, révoquez-la et créez-en une
        nouvelle.
      </Callout>

      <h2 className="mt-12 mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Stockage sûr
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Une clé API donne un accès direct à l&rsquo;envoi d&rsquo;emails —
        traitez-la comme un mot de passe.
      </p>
      <ul className="mb-8 flex flex-col gap-3">
        <li className="flex gap-3 text-[14px] leading-relaxed text-[#C5CACF]">
          <span className="text-[#35D07F]">✓</span>
          <span>
            Stockez-la dans des variables d&rsquo;environnement (
            <code>.env</code>, secret manager, variables d&rsquo;environnement
            de votre plateforme de déploiement) — jamais en dur dans le code
            source.
          </span>
        </li>
        <li className="flex gap-3 text-[14px] leading-relaxed text-[#C5CACF]">
          <span className="text-[#35D07F]">✓</span>
          <span>
            Ne la committez jamais dans le dépôt Git, y compris dans
            l&rsquo;historique — un secret poussé une seule fois doit être
            considéré comme compromis et révoqué.
          </span>
        </li>
        <li className="flex gap-3 text-[14px] leading-relaxed text-[#C5CACF]">
          <span className="text-[#35D07F]">✓</span>
          <span>
            N&rsquo;appelez jamais <code>POST /v1/emails</code> depuis du
            code exécuté dans le navigateur : la clé serait visible dans le
            code source livré au client. Passez toujours par votre serveur.
          </span>
        </li>
        <li className="flex gap-3 text-[14px] leading-relaxed text-[#C5CACF]">
          <span className="text-[#35D07F]">✓</span>
          <span>
            Ajoutez <code>.env</code> à votre <code>.gitignore</code> avant
            d&rsquo;y écrire la moindre clé.
          </span>
        </li>
      </ul>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Une clé par environnement
      </h2>
      <p className="mb-8 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Créez une clé distincte pour chaque environnement (production, tests,
        script local) plutôt que de réutiliser la même partout. Ainsi, une
        fuite en environnement de test n&rsquo;expose pas la production, et
        révoquer une clé compromise n&rsquo;interrompt pas les autres.
      </p>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Révocation
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Depuis la liste des clés, « Révoquer » désactive la clé
        immédiatement et définitivement — l&rsquo;action est irréversible.
        Toute requête authentifiée avec une clé révoquée répond{" "}
        <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[12.5px]">
          401
        </code>
        , avec le message «&nbsp;Clé API invalide ou révoquée&nbsp;».
        Révoquer une clé n&rsquo;affecte pas les emails déjà en file ou déjà
        envoyés avec.
      </p>

      <div className="mb-4">
        <DocsTable minWidth={480}>
          <thead>
            <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
              <th className="px-5 py-3 font-medium">Endpoint</th>
              <th className="px-5 py-3 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/[0.05]">
              <td className="px-5 py-3 font-mono text-[13px] text-[#EDEEF0]">
                POST /v1/api-keys
              </td>
              <td className="px-5 py-3 text-[#9BA1A8]">
                Crée une clé. Corps : <code>{"{ name }"}</code>. La clé
                complète n&rsquo;est renvoyée que dans cette réponse.
              </td>
            </tr>
            <tr className="border-b border-white/[0.05]">
              <td className="px-5 py-3 font-mono text-[13px] text-[#EDEEF0]">
                GET /v1/api-keys
              </td>
              <td className="px-5 py-3 text-[#9BA1A8]">
                Liste vos clés (nom, préfixe, dates, statut) — jamais la clé
                complète.
              </td>
            </tr>
            <tr className="last:border-b-0">
              <td className="px-5 py-3 font-mono text-[13px] text-[#EDEEF0]">
                DELETE /v1/api-keys/:id
              </td>
              <td className="px-5 py-3 text-[#9BA1A8]">
                Révoque la clé.
              </td>
            </tr>
          </tbody>
        </DocsTable>
      </div>
      <p className="text-[13px] text-[#70767D]">
        Ces trois endpoints sont authentifiés par la session du tableau de
        bord (cookie), pas par une clé API — c&rsquo;est elle qui les gère,
        pas l&rsquo;inverse.
      </p>

      <p className="mt-10 text-[13px] leading-relaxed text-[#70767D]">
        Voir aussi{" "}
        <Link href="/docs/erreurs" className="text-[#8AA4FF]">
          Erreurs
        </Link>{" "}
        pour le détail des réponses <code>401</code> et{" "}
        <code>403</code>.
      </p>
    </div>
  );
}
