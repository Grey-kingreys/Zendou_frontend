import type { Metadata } from "next";
import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import DocsTable from "@/components/docs/DocsTable";
import Callout from "@/components/docs/Callout";

export const metadata: Metadata = {
  title: "Facturation — Documentation Zendou",
  description:
    "Crédits, packs, recharge par Orange Money ou MTN MoMo, et limite journalière d'envoi de l'API Zendou.",
  alternates: { canonical: "/docs/facturation" },
};

const TOPUP_REQUEST_EXAMPLE = `curl -X POST https://api.zendou.dev/v1/billing/topup-requests \\
  -H "Content-Type: application/json" \\
  --cookie "zendou_session=..." \\
  -d '{
    "packId": "essentiel",
    "method": "ORANGE_MONEY",
    "phoneNumber": "+224 620 00 00 00",
    "transactionRef": "OM.2601.2201.A12345"
  }'`;

const TOPUP_RESPONSE_EXAMPLE = `{
  "id": "clx1a2b3c4d5",
  "packId": "essentiel",
  "credits": 15000,
  "amountGnf": 50000,
  "method": "ORANGE_MONEY",
  "phoneNumber": "+224 620 00 00 00",
  "transactionRef": "OM.2601.2201.A12345",
  "status": "PENDING",
  "rejectionReason": null,
  "createdAt": "2026-08-11T10:32:00.000Z"
}`;

const DAILY_LIMIT_TIERS = [
  {
    condition: "Compte nouvellement créé",
    limit: "200 emails / jour",
  },
  {
    condition: "3 jours d'ancienneté et 100 emails envoyés au total",
    limit: "1 000 emails / jour",
  },
  {
    condition: "7 jours d'ancienneté et 1 000 emails envoyés au total",
    limit: "5 000 emails / jour",
  },
  {
    condition: "30 jours d'ancienneté et 10 000 emails envoyés au total",
    limit: "20 000 emails / jour",
  },
];

export default function FacturationPage() {
  return (
    <div className="mx-auto max-w-[820px]">
      <PageHeader
        eyebrow="RÉFÉRENCE API"
        title="Facturation"
        description="Zendou fonctionne par crédits prépayés : 1 crédit = 1 email accepté par l'API. Pas d'abonnement, pas de carte bancaire internationale — la recharge se fait en Orange Money ou MTN MoMo."
      />

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        1 crédit = 1 email
      </h2>
      <p className="mb-10 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Chaque email accepté par <code>POST /v1/emails</code> (statut{" "}
        <code>queued</code>) débite un crédit au moment de l&rsquo;acceptation
        de la requête — pas à la livraison. Un email bloqué par la liste de
        suppression (statut <code>suppressed</code>) n&rsquo;est jamais
        facturé. Votre solde est simplement la somme de tous les mouvements
        de crédits de votre compte : recharges approuvées et crédits offerts,
        moins envois facturés.
      </p>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Packs disponibles
      </h2>
      <div className="mb-4">
        <DocsTable minWidth={560}>
          <thead>
            <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
              <th className="px-5 py-3 font-medium">Pack</th>
              <th className="px-5 py-3 font-medium">Crédits</th>
              <th className="px-5 py-3 font-medium">Prix</th>
              <th className="px-5 py-3 font-medium">Achetable</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/[0.05]">
              <td className="px-5 py-3 text-[#EDEEF0]">Découverte</td>
              <td className="px-5 py-3 font-mono text-[#9BA1A8]">1 000</td>
              <td className="px-5 py-3 text-[#9BA1A8]">Offert à la confirmation de l&rsquo;email</td>
              <td className="px-5 py-3 text-[#70767D]">Non</td>
            </tr>
            <tr className="border-b border-white/[0.05]">
              <td className="px-5 py-3 text-[#EDEEF0]">Essentiel</td>
              <td className="px-5 py-3 font-mono text-[#9BA1A8]">15 000</td>
              <td className="px-5 py-3 font-mono text-[#9BA1A8]">
                50 000 GNF
              </td>
              <td className="px-5 py-3 text-[#35D07F]">Oui</td>
            </tr>
            <tr className="last:border-b-0">
              <td className="px-5 py-3 text-[#EDEEF0]">Growth</td>
              <td className="px-5 py-3 font-mono text-[#9BA1A8]">30 000</td>
              <td className="px-5 py-3 font-mono text-[#9BA1A8]">
                90 000 GNF
              </td>
              <td className="px-5 py-3 text-[#35D07F]">Oui</td>
            </tr>
          </tbody>
        </DocsTable>
      </div>
      <p className="mb-10 text-[13px] text-[#70767D]">
        Prix indicatifs, susceptibles d&rsquo;évoluer. Le catalogue à jour
        est disponible via <code>GET /v1/billing/packs</code>.
      </p>

      <Callout variant="success" title="Les crédits n'expirent pas">
        Un crédit acheté ou offert reste valable jusqu&rsquo;à ce qu&rsquo;il
        soit consommé par un envoi — aucune date de péremption, aucun crédit
        perdu en fin de mois.
      </Callout>

      <h2 className="mt-12 mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Recharger par Orange Money ou MTN MoMo
      </h2>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Zendou n&rsquo;a pas d&rsquo;accès automatisé aux API Orange Money et
        MTN MoMo : la recharge se fait en trois temps.
      </p>
      <ol className="mb-6 flex flex-col gap-4">
        <li className="flex gap-4 rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(91,124,250,0.14)] font-mono text-[13px] font-semibold text-[#8AA4FF]">
            1
          </span>
          <div>
            <h3 className="mb-1 font-heading text-[15px] font-semibold text-[#EDEEF0]">
              Effectuez le transfert
            </h3>
            <p className="text-[13.5px] leading-relaxed text-[#9BA1A8] text-pretty">
              Depuis votre application Orange Money ou MTN MoMo, transférez
              le montant du pack choisi vers le numéro Zendou indiqué sur
              l&rsquo;écran de recharge du tableau de bord. Conservez la
              référence de transaction fournie par l&rsquo;opérateur (SMS de
              confirmation).
            </p>
          </div>
        </li>
        <li className="flex gap-4 rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(91,124,250,0.14)] font-mono text-[13px] font-semibold text-[#8AA4FF]">
            2
          </span>
          <div>
            <h3 className="mb-1 font-heading text-[15px] font-semibold text-[#EDEEF0]">
              Déclarez la recharge
            </h3>
            <p className="text-[13.5px] leading-relaxed text-[#9BA1A8] text-pretty">
              Renseignez le pack, la méthode, votre numéro et la référence de
              transaction. La demande est créée avec le statut{" "}
              <code>PENDING</code>.
            </p>
          </div>
        </li>
        <li className="flex gap-4 rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(91,124,250,0.14)] font-mono text-[13px] font-semibold text-[#8AA4FF]">
            3
          </span>
          <div>
            <h3 className="mb-1 font-heading text-[15px] font-semibold text-[#EDEEF0]">
              Un administrateur valide la demande
            </h3>
            <p className="text-[13.5px] leading-relaxed text-[#9BA1A8] text-pretty">
              Après rapprochement avec le transfert reçu, la demande passe à{" "}
              <code>APPROVED</code> et les crédits sont ajoutés à votre solde
              — ou à <code>REJECTED</code>, avec un motif, si le transfert
              n&rsquo;a pas pu être rapproché.
            </p>
          </div>
        </li>
      </ol>

      <div className="mb-3">
        <CodeBlock code={TOPUP_REQUEST_EXAMPLE} label="POST /v1/billing/topup-requests" />
      </div>
      <div className="mb-8">
        <CodeBlock code={TOPUP_RESPONSE_EXAMPLE} label="201 Created" />
      </div>
      <p className="mb-10 text-[13px] leading-relaxed text-[#70767D]">
        Une même référence de transaction ne peut avoir qu&rsquo;une seule
        demande en attente à la fois — une seconde tentative avec la même
        référence répond <code>409 Conflict</code>.
      </p>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Endpoints de facturation
      </h2>
      <div className="mb-12">
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
                GET /v1/billing/balance
              </td>
              <td className="px-5 py-3 text-[#9BA1A8]">
                Solde actuel, total acheté, total offert, total consommé.
              </td>
            </tr>
            <tr className="border-b border-white/[0.05]">
              <td className="px-5 py-3 font-mono text-[13px] text-[#EDEEF0]">
                GET /v1/billing/packs
              </td>
              <td className="px-5 py-3 text-[#9BA1A8]">
                Catalogue des packs disponibles.
              </td>
            </tr>
            <tr className="border-b border-white/[0.05]">
              <td className="px-5 py-3 font-mono text-[13px] text-[#EDEEF0]">
                GET /v1/billing/entries
              </td>
              <td className="px-5 py-3 text-[#9BA1A8]">
                Historique paginé des mouvements de crédits (recharges,
                envois).
              </td>
            </tr>
            <tr className="last:border-b-0">
              <td className="px-5 py-3 font-mono text-[13px] text-[#EDEEF0]">
                POST /v1/billing/topup-requests
              </td>
              <td className="px-5 py-3 text-[#9BA1A8]">
                Déclare une recharge Mobile Money en attente de validation.
              </td>
            </tr>
          </tbody>
        </DocsTable>
      </div>
      <p className="mb-12 text-[13px] text-[#70767D]">
        Ces endpoints sont authentifiés par la session du tableau de bord
        (cookie), pas par une clé API.
      </p>

      <h2 className="mb-4 font-heading text-xl font-semibold text-[#EDEEF0]">
        Limite journalière
      </h2>
      <p className="mb-5 text-[15px] leading-[1.7] text-[#9BA1A8]">
        Indépendamment du solde de crédits, chaque compte a une limite
        d&rsquo;envois par jour (comptés depuis minuit UTC), qui protège la
        réputation d&rsquo;envoi de la plateforme entière pendant qu&rsquo;un
        compte fait ses preuves. Elle monte automatiquement, sans démarche de
        votre part, dès que l&rsquo;ancienneté <strong>et</strong> le volume
        cumulé sont atteints :
      </p>
      <div className="mb-6">
        <DocsTable minWidth={560}>
          <thead>
            <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
              <th className="px-5 py-3 font-medium">Condition</th>
              <th className="px-5 py-3 font-medium">Limite journalière</th>
            </tr>
          </thead>
          <tbody>
            {DAILY_LIMIT_TIERS.map((tier, index) => (
              <tr
                key={index}
                className="border-b border-white/[0.05] last:border-b-0"
              >
                <td className="px-5 py-3 text-[#9BA1A8]">{tier.condition}</td>
                <td className="px-5 py-3 font-mono text-[#EDEEF0]">
                  {tier.limit}
                </td>
              </tr>
            ))}
          </tbody>
        </DocsTable>
      </div>
      <p className="text-[13.5px] leading-relaxed text-[#9BA1A8] text-pretty">
        La limite ne redescend jamais d&rsquo;elle-même ; seule une
        suspension du compte pour réputation dégradée coupe les envois. Si
        vous atteignez la limite du jour, <code>POST /v1/emails</code> répond{" "}
        <code>429</code> jusqu&rsquo;au lendemain.
      </p>
    </div>
  );
}
