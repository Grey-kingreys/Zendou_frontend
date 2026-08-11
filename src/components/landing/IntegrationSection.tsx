"use client";

import { useState } from "react";

const API_DOMAIN = "api.zendou.dev";

const TABS = ["curl", "Node.js", "PHP"] as const;

const SNIPPETS = [
  `curl -X POST https://${API_DOMAIN}/v1/emails \\
  -H "Authorization: Bearer zd_live_x9f2…" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "Boutique Awa <no-reply@boutique.gn>",
    "to": "awa@exemple.gn",
    "subject": "Votre code de connexion",
    "html": "<p>Votre code : <b>498 217</b></p>"
  }'`,
  `import { Zendou } from "zendou";

const zendou = new Zendou(process.env.ZENDOU_API_KEY);

await zendou.emails.send({
  from: "Boutique Awa <no-reply@boutique.gn>",
  to: "awa@exemple.gn",
  subject: "Votre code de connexion",
  html: "<p>Votre code : <b>498 217</b></p>",
});`,
  `$zendou = new Zendou\\Client(getenv('ZENDOU_API_KEY'));

$zendou->emails->send([
  'from'    => 'Boutique Awa <no-reply@boutique.gn>',
  'to'      => 'awa@exemple.gn',
  'subject' => 'Votre code de connexion',
  'html'    => '<p>Votre code : <b>498 217</b></p>',
]);`,
];

export default function IntegrationSection() {
  const [tab, setTab] = useState(0);

  return (
    <section className="mx-auto grid max-w-[1160px] grid-cols-1 items-center gap-12 px-6 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:py-[110px]">
      <div>
        <div className="mb-4 font-mono text-xs tracking-[0.08em] text-[#5B7CFA]">
          01 — INTÉGRATION
        </div>
        <h2 className="mb-[18px] font-heading text-[32px] leading-[1.12] font-semibold tracking-[-0.03em] text-balance sm:text-[38px]">
          Cinq minutes entre la clé API et le premier email
        </h2>
        <p className="mb-[26px] text-base leading-[1.7] text-[#9BA1A8] text-pretty">
          {
            "Un seul endpoint REST, une réponse immédiate, un identifiant de suivi. Le reste — file d'attente, retries, signature DKIM, gestion des bounces — se passe chez nous."
          }
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2.5 text-[15px] text-[#C5CACF]">
            <span className="text-[#35D07F]">✓</span>
            SDK Node, PHP, Python — ou un simple{" "}
            <span className="font-mono text-[13px] text-[#EDEEF0]">curl</span>
          </div>
          <div className="flex items-baseline gap-2.5 text-[15px] text-[#C5CACF]">
            <span className="text-[#35D07F]">✓</span>
            Relais SMTP pour Laravel, Django, Rails
          </div>
          <div className="flex items-baseline gap-2.5 text-[15px] text-[#C5CACF]">
            <span className="text-[#35D07F]">✓</span>
            Documentation intégralement en français
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-white/[0.09] bg-[#0C0D0F] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        <div className="flex gap-1 border-b border-white/[0.07] px-2 py-1.5">
          {TABS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setTab(i)}
              className={
                "appearance-none rounded-[7px] border-0 px-3.5 py-1.5 font-mono text-[12.5px] cursor-pointer " +
                (tab === i
                  ? "bg-[rgba(91,124,250,0.13)] text-[#8AA4FF]"
                  : "bg-transparent text-[#70767D]")
              }
            >
              {label}
            </button>
          ))}
        </div>
        <pre className="m-0 overflow-x-auto px-6 py-[22px] font-mono text-[13.5px] leading-[1.85] text-[#C5CACF]">
          {SNIPPETS[tab]}
        </pre>
        <div className="flex gap-4 border-t border-white/[0.07] px-6 py-3.5 font-mono text-[12.5px] text-[#5E646B]">
          <span className="text-[#35D07F]">200 OK</span>
          <span>{'{ "id": "e_7f3a91c2", "status": "queued" }'}</span>
        </div>
      </div>
    </section>
  );
}
