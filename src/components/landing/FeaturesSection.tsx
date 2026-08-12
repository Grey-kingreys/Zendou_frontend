const FEATURES = [
  {
    icon: "{ }",
    iconFont: "font-mono text-sm",
    title: "API simple",
    body: "Un endpoint, quatre champs. Clés scopées, révocables, et un relais SMTP si tu préfères.",
  },
  {
    icon: "↗",
    iconFont: "text-[15px]",
    title: "Délivrabilité tenue",
    body: "Vérification DKIM guidée, liste de suppression automatique, surveillance des bounces et plaintes.",
  },
  {
    icon: "▤",
    iconFont: "text-[15px]",
    title: "Tableau de bord",
    body: "Chaque envoi tracé : livré, bounce, plainte. Webhooks pour brancher tes propres alertes.",
  },
  {
    icon: "₵",
    iconFont: "text-[15px]",
    title: "Paiement local",
    body: "Orange Money et MTN MoMo, factures en GNF. Aucune carte bancaire internationale requise.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="fonctionnalites"
      className="border-y border-white/[0.06] bg-[#0A0B0C]"
    >
      <div className="mx-auto max-w-[1160px] px-6 py-16 sm:px-8 sm:py-20 lg:py-[110px]">
        <div className="mb-4 font-mono text-xs tracking-[0.08em] text-[#5B7CFA]">
          02 — CE QUE ÇA FAIT
        </div>
        <h2 className="mb-3 max-w-[620px] font-heading text-[32px] leading-[1.12] font-semibold tracking-[-0.03em] text-balance sm:text-[38px]">
          Le strict nécessaire, fait sérieusement
        </h2>
        <p className="mb-12 max-w-[560px] text-base text-[#9BA1A8] sm:mb-[52px]">
          {
            "Pas de constructeur de campagnes, pas d'usine à gaz. De l'envoi transactionnel qui arrive."
          }
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[14px] border border-white/[0.08] bg-[#0E1013] p-6"
            >
              <div
                className={
                  "mb-[18px] flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-[rgba(91,124,250,0.25)] bg-[rgba(91,124,250,0.12)] text-[#8AA4FF] " +
                  feature.iconFont
                }
              >
                {feature.icon}
              </div>
              <h3 className="mb-2.5 font-heading text-[17px] font-semibold">
                {feature.title}
              </h3>
              <p className="text-[14.5px] leading-[1.65] text-[#8A9099] text-pretty">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
