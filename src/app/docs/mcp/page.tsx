import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import Callout from "@/components/docs/Callout";
import DocsTable from "@/components/docs/DocsTable";

export const metadata: Metadata = {
  title: "Serveur MCP - Documentation Zendou",
  description:
    "Connecter Claude Desktop, Claude Code ou Cursor à Zendou avec le serveur MCP : envoyer un email, lire son solde, consulter le journal des envois et l'état des domaines.",
  alternates: { canonical: "/docs/mcp" },
};

const CLAUDE_CODE_CLI = `claude mcp add --env ZENDOU_API_KEY=zd_live_VOTRE_CLE --transport stdio zendou -- npx -y @zendou/mcp`;

const CLAUDE_CODE_JSON = `{
  "mcpServers": {
    "zendou": {
      "command": "npx",
      "args": ["-y", "@zendou/mcp"],
      "env": { "ZENDOU_API_KEY": "\${ZENDOU_API_KEY}" }
    }
  }
}`;

const CLAUDE_DESKTOP_JSON = `{
  "mcpServers": {
    "zendou": {
      "command": "npx",
      "args": ["-y", "@zendou/mcp"],
      "env": { "ZENDOU_API_KEY": "zd_live_VOTRE_CLE" }
    }
  }
}`;

const CURSOR_JSON = `{
  "mcpServers": {
    "zendou": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@zendou/mcp"],
      "env": { "ZENDOU_API_KEY": "\${env:ZENDOU_API_KEY}" }
    }
  }
}`;

const READ_FORBIDDEN_EXAMPLE = `{
  "message": "Cette clé API n'a pas l'autorisation de lecture : créez une clé avec la lecture autorisée.",
  "error": "Forbidden",
  "statusCode": 403,
  "errors": [
    "Cette clé API n'a pas l'autorisation de lecture : créez une clé avec la lecture autorisée."
  ]
}`;

const OUT_OF_SCOPE_EXAMPLE = `{
  "message": "Cette clé API n'est autorisée que pour le domaine boutique-awa.gn.",
  "error": "Forbidden",
  "statusCode": 403,
  "code": "CREDENTIAL_DOMAIN_OUT_OF_SCOPE",
  "errors": [
    "Cette clé API n'est autorisée que pour le domaine boutique-awa.gn."
  ]
}`;

const TOOLS: { name: string; role: string; key: string }[] = [
  {
    name: "send_email",
    role: "Envoie un email (from, to, subject, html ou text, replyTo, headers).",
    key: "Toute clé active",
  },
  {
    name: "get_balance",
    role: "Lit le solde de crédits du compte.",
    key: "Toute clé active",
  },
  {
    name: "list_emails",
    role: "Liste le journal des envois, avec filtres (status, channel, from, to, q) et pagination.",
    key: "Clé avec lecture",
  },
  {
    name: "get_email",
    role: "Donne le détail et l'état de livraison d'un email.",
    key: "Clé avec lecture",
  },
  {
    name: "list_domains",
    role: "Liste les domaines du compte et leur statut.",
    key: "Clé avec lecture",
  },
  {
    name: "get_domain",
    role: "Donne le statut d'un domaine et les enregistrements DNS à créer.",
    key: "Clé avec lecture",
  },
];

const ERRORS: { status: string; cause: string; fix: string }[] = [
  {
    status: "401",
    cause: "Clé absente, inconnue ou révoquée.",
    fix: "Vérifiez ZENDOU_API_KEY dans la configuration du client MCP, puis redémarrez le client. Si la clé a été révoquée, créez-en une nouvelle.",
  },
  {
    status: "403 (lecture)",
    cause:
      "Outil de lecture appelé avec une clé créée sans la lecture. Message : « Cette clé API n'a pas l'autorisation de lecture : créez une clé avec la lecture autorisée. »",
    fix: "La lecture ne peut pas être ajoutée après coup : créez une nouvelle clé en cochant « Autoriser la lecture », puis remplacez la clé de la configuration.",
  },
  {
    status: "403 (hors portée)",
    cause:
      "Envoi depuis un domaine que la clé n'est pas autorisée à utiliser (code CREDENTIAL_DOMAIN_OUT_OF_SCOPE).",
    fix: "Utilisez une adresse d'un domaine de la portée de la clé, ou créez une clé couvrant ce domaine. En lecture, un domaine ou un email hors portée répond comme s'il n'existait pas (404).",
  },
  {
    status: "402",
    cause: "Solde de crédits insuffisant pour envoyer un email.",
    fix: "Rechargez vos crédits depuis le tableau de bord. La lecture du solde reste possible.",
  },
];

function ConfigBlock({
  title,
  intro,
  children,
}: {
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mb-8">
      <h3 className="mb-3 font-heading text-base font-semibold text-[#EDEEF0]">
        {title}
      </h3>
      <div className="mb-3 text-[15px] leading-[1.7] text-[#9BA1A8]">
        {intro}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

export default function McpPage() {
  return (
    <div className="mx-auto max-w-[780px]">
      <PageHeader
        eyebrow="INTÉGRATIONS"
        title="Serveur MCP"
        description="Le serveur MCP de Zendou permet à votre assistant IA (Claude Desktop, Claude Code, Cursor, tout client MCP) d'envoyer un email, de consulter votre solde, de relire le journal des envois et de vérifier l'état de vos domaines."
      />

      <div className="mb-10">
        <Callout variant="info" title="Bientôt disponible sur npm">
          Le paquet <code>@zendou/mcp</code> n&rsquo;est pas encore publié sur
          npm : les commandes ci-dessous ne fonctionneront qu&rsquo;une fois
          le paquet disponible. Cette page décrit la configuration prévue.
        </Callout>
      </div>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Qu&rsquo;est-ce que le serveur MCP Zendou&nbsp;?
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        MCP (Model Context Protocol) est un protocole qui permet à un
        assistant IA d&rsquo;utiliser des outils externes. Le serveur MCP
        Zendou tourne <strong>sur votre machine</strong>, avec votre clé API.
        Il ne fait que traduire les demandes de l&rsquo;assistant en appels à
        l&rsquo;API publique de Zendou : toutes les règles (domaine vérifié,
        portée de la clé, crédits) restent appliquées par le serveur Zendou.
      </p>
      <p className="mb-10 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Il nécessite Node.js 18 ou plus. Le client MCP le lance lui-même avec{" "}
        <code>npx</code> : il n&rsquo;y a rien à installer à la main.
      </p>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Créer une clé API
      </h2>
      <ol className="mb-4 flex flex-col gap-3">
        <li className="flex gap-3 text-[14px] leading-relaxed text-[#C5CACF]">
          <span className="text-[#8AA4FF]">1.</span>
          <span>
            Dans le tableau de bord, ouvrez <strong>Clés API</strong> puis{" "}
            <strong>Nouvelle clé</strong>.
          </span>
        </li>
        <li className="flex gap-3 text-[14px] leading-relaxed text-[#C5CACF]">
          <span className="text-[#8AA4FF]">2.</span>
          <span>
            Pour que l&rsquo;assistant puisse lire le journal des envois et
            les domaines, cochez{" "}
            <strong>
              Autoriser la lecture (journal des envois et domaines)
            </strong>
            . Sans cette case, la clé permet seulement d&rsquo;envoyer des
            emails et de lire le solde.
          </span>
        </li>
        <li className="flex gap-3 text-[14px] leading-relaxed text-[#C5CACF]">
          <span className="text-[#8AA4FF]">3.</span>
          <span>
            Copiez la clé : elle n&rsquo;est affichée qu&rsquo;une fois.
          </span>
        </li>
      </ol>
      <p className="mb-10 text-[15px] leading-[1.7] text-[#9BA1A8]">
        La permission de lecture se choisit à la création et ne peut pas être
        ajoutée ensuite : si vous avez oublié la case, créez une nouvelle clé.
        Voir{" "}
        <Link
          href="/docs/cles-api"
          className="text-[#8AA4FF] underline underline-offset-2"
        >
          Clés API
        </Link>{" "}
        pour le détail.
      </p>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Configuration des clients
      </h2>
      <p className="mb-2 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Remplacez <code>zd_live_VOTRE_CLE</code> par votre clé. Une variable
        facultative, <code>ZENDOU_API_URL</code>, permet de changer
        l&rsquo;adresse de l&rsquo;API ; par défaut, le serveur utilise{" "}
        <code>https://api.zendou.app</code>. Ne la renseignez que pour
        l&rsquo;API Zendou (voir la section Sécurité).
      </p>
      <p className="mb-6 text-[13px] leading-relaxed text-[#70767D]">
        Formats vérifiés le 23/10/2026 aux documentations officielles.
      </p>

      <ConfigBlock
        title="Claude Desktop"
        intro={
          <>
            Dans le menu <strong>Claude</strong> de la barre de menus du
            système (et non dans les réglages de la fenêtre), choisissez{" "}
            <strong>Settings...</strong>, onglet <strong>Developer</strong>,
            puis le bouton <strong>Edit Config</strong>. Le fichier{" "}
            <code>claude_desktop_config.json</code> se trouve à&nbsp;:
            <ul className="mt-2 mb-2 list-disc pl-5">
              <li>
                macOS&nbsp;:{" "}
                <code>
                  ~/Library/Application Support/Claude/claude_desktop_config.json
                </code>
              </li>
              <li>
                Windows&nbsp;:{" "}
                <code>%APPDATA%\Claude\claude_desktop_config.json</code>
              </li>
            </ul>
            Ajoutez&nbsp;:
          </>
        }
      >
        <CodeBlock
          code={CLAUDE_DESKTOP_JSON}
          label="claude_desktop_config.json"
        />
        <p className="text-[15px] leading-[1.7] text-[#9BA1A8]">
          Quittez complètement Claude Desktop, puis relancez-le. En cas de
          souci, consultez les journaux <code>mcp*.log</code> dans{" "}
          <code>~/Library/Logs/Claude</code> (macOS) ou{" "}
          <code>%APPDATA%\Claude\logs</code> (Windows).
        </p>
      </ConfigBlock>

      <ConfigBlock
        title="Claude Code"
        intro={<>Avec la ligne de commande&nbsp;:</>}
      >
        <CodeBlock code={CLAUDE_CODE_CLI} label="Terminal" />
        <p className="text-[15px] leading-[1.7] text-[#9BA1A8]">
          Les options de Claude Code viennent avant le nom du serveur, et{" "}
          <code>--</code> sépare la commande du serveur. Si une autre option
          suit <code>--env</code>, elle la sépare du nom.
        </p>
        <p className="text-[15px] leading-[1.7] text-[#9BA1A8]">
          Pour partager la configuration d&rsquo;un projet, un fichier{" "}
          <code>.mcp.json</code> à la racine, au même format{" "}
          <code>mcpServers</code> (une entrée sans <code>type</code> est lue
          comme stdio). Il accepte <code>{"${VAR}"}</code> et{" "}
          <code>{"${VAR:-defaut}"}</code> dans <code>command</code>,{" "}
          <code>args</code> et <code>env</code> : la clé y est lue dans votre
          environnement, ne la committez pas.
        </p>
        <CodeBlock code={CLAUDE_CODE_JSON} label=".mcp.json" />
      </ConfigBlock>

      <ConfigBlock
        title="Cursor"
        intro={
          <>
            Fichier <code>.cursor/mcp.json</code> (dans le projet) ou{" "}
            <code>~/.cursor/mcp.json</code> (global), avec l&rsquo;interpolation{" "}
            <code>{"${env:NOM}"}</code>&nbsp;:
          </>
        }
      >
        <CodeBlock code={CURSOR_JSON} label=".cursor/mcp.json" />
      </ConfigBlock>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Les six outils
      </h2>
      <div className="mb-4">
        <DocsTable minWidth={520}>
          <thead>
            <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
              <th className="px-5 py-3 font-medium">Outil</th>
              <th className="px-5 py-3 font-medium">Ce qu&rsquo;il permet</th>
              <th className="px-5 py-3 font-medium">Clé requise</th>
            </tr>
          </thead>
          <tbody>
            {TOOLS.map((tool) => (
              <tr key={tool.name} className="border-b border-white/[0.05]">
                <td className="px-5 py-3 font-mono text-[13px] text-[#EDEEF0]">
                  {tool.name}
                </td>
                <td className="px-5 py-3 text-[#9BA1A8]">{tool.role}</td>
                <td className="px-5 py-3 whitespace-nowrap text-[#9BA1A8]">
                  {tool.key}
                </td>
              </tr>
            ))}
          </tbody>
        </DocsTable>
      </div>
      <p className="mb-10 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Règles de <code>send_email</code> : un seul destinataire ;{" "}
        <code>Nom &lt;adresse&gt;</code> accepté (nom de 128 caractères au
        plus) ; domaine expéditeur vérifié ; <code>html</code> ou{" "}
        <code>text</code> requis ; <code>headers</code> limités à 20, parmi{" "}
        <code>List-Unsubscribe</code>, <code>List-Unsubscribe-Post</code> et{" "}
        <code>X-*</code> (hors <code>X-SES-*</code>), en ASCII imprimable.
      </p>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Sécurité
      </h2>
      <ul className="mb-6 flex flex-col gap-3">
        <li className="flex gap-3 text-[14px] leading-relaxed text-[#C5CACF]">
          <span className="text-[#35D07F]">✓</span>
          <span>
            <strong>La clé reste sur votre machine.</strong> Elle est lue dans
            l&rsquo;environnement du processus et envoyée uniquement à
            l&rsquo;API Zendou.
          </span>
        </li>
        <li className="flex gap-3 text-[14px] leading-relaxed text-[#C5CACF]">
          <span className="text-[#35D07F]">✓</span>
          <span>
            <strong>
              <code>ZENDOU_API_URL</code> reçoit votre clé.
            </strong>{" "}
            Ne la renseignez que pour l&rsquo;API Zendou, en{" "}
            <code>https://</code> seulement : le paquet refuse{" "}
            <code>http://</code>, sauf pour <code>localhost</code> et{" "}
            <code>127.0.0.1</code>. Une adresse tierce lirait votre clé.
          </span>
        </li>
        <li className="flex gap-3 text-[14px] leading-relaxed text-[#C5CACF]">
          <span className="text-[#35D07F]">✓</span>
          <span>
            <strong>La lecture est facultative.</strong> Elle se décide clé
            par clé, décochée par défaut. Une clé avec lecture qui fuit expose
            les destinataires et les sujets des emails de sa portée : ne
            l&rsquo;activez que si vous en avez besoin, et préférez une clé
            dédiée à l&rsquo;assistant.
          </span>
        </li>
        <li className="flex gap-3 text-[14px] leading-relaxed text-[#C5CACF]">
          <span className="text-[#35D07F]">✓</span>
          <span>
            <strong>Portée par domaine.</strong> Une clé limitée à certains
            domaines ne peut envoyer, ni lire, que pour ces domaines ; le reste
            répond comme s&rsquo;il n&rsquo;existait pas.
          </span>
        </li>
        <li className="flex gap-3 text-[14px] leading-relaxed text-[#C5CACF]">
          <span className="text-[#35D07F]">✓</span>
          <span>
            <strong>Aucune suppression ni création.</strong> Le serveur
            n&rsquo;écrit rien d&rsquo;autre que l&rsquo;envoi d&rsquo;un
            email : il ne peut ni créer ni supprimer un domaine, une clé ou un
            identifiant SMTP, ni recharger des crédits.
          </span>
        </li>
      </ul>
      <div className="mb-10">
        <Callout variant="warning" title="Ne committez jamais une clé">
          En cas de doute, révoquez-la depuis le tableau de bord.
        </Callout>
      </div>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Erreurs fréquentes
      </h2>
      <div className="mb-4">
        <DocsTable minWidth={560}>
          <thead>
            <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium">Cause</th>
              <th className="px-5 py-3 font-medium">Que faire</th>
            </tr>
          </thead>
          <tbody>
            {ERRORS.map((row) => (
              <tr
                key={row.status}
                className="border-b border-white/[0.05] align-top"
              >
                <td className="px-5 py-3 font-mono text-[13px] whitespace-nowrap text-[#EDEEF0]">
                  {row.status}
                </td>
                <td className="px-5 py-3 text-[#9BA1A8]">{row.cause}</td>
                <td className="px-5 py-3 text-[#9BA1A8]">{row.fix}</td>
              </tr>
            ))}
          </tbody>
        </DocsTable>
      </div>
      <p className="mb-3 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Le <code>403</code> d&rsquo;une clé sans lecture renvoie&nbsp;:
      </p>
      <div className="mb-6">
        <CodeBlock code={READ_FORBIDDEN_EXAMPLE} />
      </div>
      <p className="mb-3 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Le <code>403</code> d&rsquo;un envoi hors de la portée de la clé
        renvoie&nbsp;:
      </p>
      <div className="mb-4">
        <CodeBlock code={OUT_OF_SCOPE_EXAMPLE} />
      </div>

      <p className="mt-10 text-[13px] leading-relaxed text-[#70767D]">
        Voir aussi{" "}
        <Link href="/docs/cles-api" className="text-[#8AA4FF]">
          Clés API
        </Link>{" "}
        et{" "}
        <Link href="/docs/erreurs" className="text-[#8AA4FF]">
          Erreurs
        </Link>
        .
      </p>
    </div>
  );
}
