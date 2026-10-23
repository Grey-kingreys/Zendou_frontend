import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import Callout from "@/components/docs/Callout";
import DocsTable from "@/components/docs/DocsTable";

export const metadata: Metadata = {
  title: "Clés API - Documentation Zendou",
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
        <CodeBlock code="zd_live_9fQ2mR7xL0pK4wT8nB1vD6sH3jY5cZ2aE9uI7oP4rN8" />
      </div>
      <p className="mb-8 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Utilisez-la dans l&rsquo;en-tête <code>Authorization</code> de vos
        appels à l&rsquo;API :
      </p>
      <div className="mb-10">
        <CodeBlock
          code={`Authorization: Bearer zd_live_9fQ2mR7xL0pK4wT8nB1vD6sH3jY5cZ2aE9uI7oP4rN8`}
        />
      </div>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Portée par domaine
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        À la création, vous choisissez les domaines depuis lesquels la clé
        peut envoyer :
      </p>
      <ul className="mb-4 flex flex-col gap-3">
        <li className="flex gap-3 text-[14px] leading-relaxed text-[#C5CACF]">
          <span className="text-[#35D07F]">✓</span>
          <span>
            <strong>Tous les domaines vérifiés</strong> (par défaut) : la clé
            peut envoyer depuis n&rsquo;importe quel domaine vérifié de votre
            compte, y compris ceux que vous vérifierez plus tard.
          </span>
        </li>
        <li className="flex gap-3 text-[14px] leading-relaxed text-[#C5CACF]">
          <span className="text-[#35D07F]">✓</span>
          <span>
            <strong>Domaines choisis</strong> : un ou plusieurs domaines
            vérifiés de votre compte. La clé ne peut envoyer que depuis
            ceux-là. Une clé qui fuite n&rsquo;expose alors que ces domaines.
          </span>
        </li>
      </ul>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        La portée est fixée à la création et ne peut plus être modifiée :
        pour la changer, créez une nouvelle clé et révoquez l&rsquo;ancienne.
        La réinitialisation (rotation) d&rsquo;une clé conserve sa portée.
        Côté API, <code>POST /v1/api-keys</code> accepte un champ optionnel{" "}
        <code>domainIds</code> (liste d&rsquo;identifiants de domaines
        vérifiés, sans doublon) ; absent ou vide, la portée est « tous les
        domaines ». La réponse et la liste des clés renvoient{" "}
        <code>domainScope</code> (<code>ALL</code> ou <code>SELECTED</code>)
        et <code>domains</code> (<code>id</code> et <code>name</code>).
      </p>
      <h3 className="mb-3 font-heading text-base font-semibold text-[#EDEEF0]">
        Envoi hors de la portée
      </h3>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Si l&rsquo;adresse <code>from</code> appartient à un domaine que la
        clé n&rsquo;est pas autorisée à utiliser, l&rsquo;API répond{" "}
        <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[12.5px]">
          403
        </code>{" "}
        avec le code <code className="[overflow-wrap:anywhere]">CREDENTIAL_DOMAIN_OUT_OF_SCOPE</code> et un
        message qui nomme les domaines autorisés :
      </p>
      <div className="mb-4">
        <CodeBlock
          code={`{
  "message": "Cette clé API n'est autorisée que pour le domaine boutique-awa.gn.",
  "error": "Forbidden",
  "statusCode": 403,
  "code": "CREDENTIAL_DOMAIN_OUT_OF_SCOPE",
  "errors": [
    "Cette clé API n'est autorisée que pour le domaine boutique-awa.gn."
  ]
}`}
        />
      </div>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Avec plusieurs domaines, le message devient «&nbsp;Cette clé API
        n&rsquo;est autorisée que pour les domaines A, B.&nbsp;».
      </p>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Une clé dont tous les domaines ont disparu n&rsquo;est autorisée pour
        aucun domaine : tout envoi est refusé avec le même code{" "}
        <code>403</code>, et le message «&nbsp;Cette clé API n&rsquo;est
        autorisée pour aucun domaine : créez-en une nouvelle avec la portée
        voulue.&nbsp;». Une sélection est limitée à 50 domaines : au-delà, la
        création est refusée avec un <code>400</code> et le message «&nbsp;Une
        portée ne peut pas contenir plus de 50 domaines&nbsp;».
      </p>
      <Callout variant="success" title="Le bac à sable reste permis">
        L&rsquo;adresse d&rsquo;expédition de test de votre compte reste
        utilisable avec toute clé, quelle que soit sa portée, avec la
        restriction habituelle : vous ne pouvez écrire qu&rsquo;à
        l&rsquo;adresse email de votre compte.
      </Callout>
      <h3 className="mt-10 mb-3 font-heading text-base font-semibold text-[#EDEEF0]">
        Supprimer un domaine
      </h3>
      <p className="mb-10 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Avant de supprimer un domaine, le tableau de bord liste les clés API
        et identifiants SMTP qui lui sont liés. Une clé dont c&rsquo;est le
        dernier domaine est <strong>révoquée</strong> à la suppression
        (jamais élargie à d&rsquo;autres domaines) ; une clé qui garde
        d&rsquo;autres domaines continue de fonctionner pour ceux-là. Après la
        suppression, le tableau de bord affiche ce qui a été révoqué.
      </p>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Permission de lecture
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Par défaut, une clé sert à envoyer des emails et à lire le solde. À la
        création, vous pouvez en plus cocher «&nbsp;Autoriser la lecture&nbsp;», par exemple pour le{" "}
        <Link
          href="/docs/mcp"
          className="text-[#8AA4FF] underline underline-offset-2"
        >
          serveur MCP
        </Link>{" "}
        ou un tableau de bord interne. Côté API, <code>POST /v1/api-keys</code>{" "}
        accepte un champ optionnel <code>canRead</code> (booléen,{" "}
        <code>false</code> par défaut). La réponse de création et la liste des
        clés renvoient <code>canRead</code>.
      </p>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Ce réglage est <strong>immuable</strong>, comme la portée : il ne peut
        pas être modifié après la création, mais la réinitialisation
        (rotation) le conserve. Pour changer, créez une nouvelle clé et
        révoquez l&rsquo;ancienne.
      </p>
      <h3 className="mb-3 font-heading text-base font-semibold text-[#EDEEF0]">
        Routes lisibles par une clé avec lecture
      </h3>
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
                GET /v1/emails
              </td>
              <td className="px-5 py-3 text-[#9BA1A8]">
                Journal des envois, avec filtres et pagination.
              </td>
            </tr>
            <tr className="border-b border-white/[0.05]">
              <td className="px-5 py-3 font-mono text-[13px] text-[#EDEEF0]">
                GET /v1/emails/:publicId
              </td>
              <td className="px-5 py-3 text-[#9BA1A8]">
                Détail et état de livraison d&rsquo;un email.
              </td>
            </tr>
            <tr className="border-b border-white/[0.05]">
              <td className="px-5 py-3 font-mono text-[13px] text-[#EDEEF0]">
                GET /v1/domains
              </td>
              <td className="px-5 py-3 text-[#9BA1A8]">
                Domaines du compte et leur statut.
              </td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-mono text-[13px] text-[#EDEEF0]">
                GET /v1/domains/:id
              </td>
              <td className="px-5 py-3 text-[#9BA1A8]">
                Statut d&rsquo;un domaine et enregistrements DNS à créer.
              </td>
            </tr>
          </tbody>
        </DocsTable>
      </div>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        La lecture est limitée à la portée par domaine de la clé : les listes
        sont filtrées, <code>total</code> et la pagination ne comptent que les
        éléments de la portée, et un détail hors portée répond{" "}
        <code>404</code>.
      </p>
      <h3 className="mb-3 font-heading text-base font-semibold text-[#EDEEF0]">
        Clé sans permission de lecture
      </h3>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Sur ces quatre routes, une clé créée sans lecture reçoit un{" "}
        <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[12.5px]">
          403
        </code>{" "}
        :
      </p>
      <div className="mb-4">
        <CodeBlock
          code={`{
  "message": "Cette clé API n'a pas l'autorisation de lecture : créez une clé avec la lecture autorisée.",
  "error": "Forbidden",
  "statusCode": 403,
  "errors": [
    "Cette clé API n'a pas l'autorisation de lecture : créez une clé avec la lecture autorisée."
  ]
}`}
        />
      </div>
      <div className="mb-4">
        <Callout variant="info" title="Le solde reste lisible par toute clé">
          <code>GET /v1/billing/balance</code> ne demande pas la permission de
          lecture : toute clé active peut lire le solde.
        </Callout>
      </div>
      <div className="mb-10">
        <Callout
          variant="warning"
          title="Une clé avec lecture expose des données"
        >
          Si une clé avec lecture fuit, les destinataires et les sujets des
          envois de sa portée sont exposés. Activez la lecture seulement si
          vous en avez besoin, et limitez la portée aux domaines utiles.
        </Callout>
      </div>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Affichage unique
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        La clé complète n&rsquo;apparaît qu&rsquo;au moment de sa création.
        Une fois l&rsquo;écran quitté, seul son préfixe (les 12 premiers
        caractères, ex. <code>zd_live_9fQ2</code>) reste visible dans la
        liste - suffisant pour identifier une clé, jamais pour l&rsquo;utiliser.
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
        Une clé API donne un accès direct à l&rsquo;envoi d&rsquo;emails -
        traitez-la comme un mot de passe.
      </p>
      <ul className="mb-8 flex flex-col gap-3">
        <li className="flex gap-3 text-[14px] leading-relaxed text-[#C5CACF]">
          <span className="text-[#35D07F]">✓</span>
          <span>
            Stockez-la dans des variables d&rsquo;environnement (
            <code>.env</code>, secret manager, variables d&rsquo;environnement
            de votre plateforme de déploiement) - jamais en dur dans le code
            source.
          </span>
        </li>
        <li className="flex gap-3 text-[14px] leading-relaxed text-[#C5CACF]">
          <span className="text-[#35D07F]">✓</span>
          <span>
            Ne la committez jamais dans le dépôt Git, y compris dans
            l&rsquo;historique - un secret poussé une seule fois doit être
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
        Lire son solde avec une clé
      </h2>
      <p className="mb-8 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Une clé API permet aussi de lire le solde de crédits du compte avec{" "}
        <code>GET /v1/billing/balance</code> (toute clé active suffit, quelle que
        soit sa portée par domaine). Voir{" "}
        <Link
          href="/docs/facturation"
          className="text-[#8AA4FF] underline underline-offset-2"
        >
          Facturation
        </Link>{" "}
        pour la réponse et un exemple.
      </p>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Révocation
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Depuis la liste des clés, « Révoquer » désactive la clé
        immédiatement et définitivement - l&rsquo;action est irréversible.
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
                Crée une clé. Corps : <code>{"{ name, domainIds?, canRead? }"}</code>.
                La clé complète n&rsquo;est renvoyée que dans cette réponse,
                avec sa portée (<code>domainScope</code>,{" "}
                <code>domains</code>) et <code>canRead</code>.
              </td>
            </tr>
            <tr className="border-b border-white/[0.05]">
              <td className="px-5 py-3 font-mono text-[13px] text-[#EDEEF0]">
                GET /v1/api-keys
              </td>
              <td className="px-5 py-3 text-[#9BA1A8]">
                Liste vos clés (nom, préfixe, dates, statut, portée, lecture) - jamais
                la clé complète.
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
        bord (cookie), pas par une clé API - c&rsquo;est elle qui les gère,
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
