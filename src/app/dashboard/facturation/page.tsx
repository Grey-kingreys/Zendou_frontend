"use client";

import { useEffect, useState, type FormEvent } from "react";
import Badge from "@/components/dashboard/Badge";
import CopyField from "@/components/dashboard/CopyField";
import { api, ApiError } from "@/lib/api";
import {
  formatDateTimeShortFr,
  formatGnf,
  formatNumberFr,
} from "@/lib/format";
import {
  creditReasonLabelFr,
  topUpMethodMeta,
  topUpStatusMeta,
} from "@/lib/status";
import type {
  BalanceSummary,
  CreditPack,
  PaginatedCreditEntries,
  PaymentMethodItem,
  TopUpMethod,
  TopUpRequestItem,
} from "@/lib/types";

const LEDGER_LIMIT = 25;
const TRANSACTION_REF_MIN_LENGTH = 4;
const TRANSACTION_REF_MAX_LENGTH = 64;

/**
 * Retrouve le libellé d'un pack à partir du catalogue chargé (GET
 * /v1/billing/packs, déjà disponible sur cet écran, contrairement à
 * /admin/recharges qui n'a que le `packId` brut). Repli sur une
 * capitalisation de confort si le pack a depuis disparu du catalogue.
 */
function packLabel(packs: CreditPack[] | null, packId: string): string {
  const found = packs?.find((pack) => pack.id === packId);
  if (found) return found.label;
  if (!packId) return packId;
  return packId.charAt(0).toUpperCase() + packId.slice(1);
}

/**
 * Fonctions pures hors composant (React Compiler) : le chargement initial
 * (solde, packs, méthodes de paiement, historique des demandes) et le
 * chargement du ledger paginé sont tous les deux appelés à la fois depuis
 * l'effet de montage et après une action utilisateur (nouvelle demande,
 * changement de page de ledger), sans jamais faire passer un appel de
 * setState par l'argument d'un useEffect.
 */
async function loadOverview(): Promise<{
  balance: BalanceSummary;
  packs: CreditPack[];
  paymentMethods: PaymentMethodItem[];
  topUpRequests: TopUpRequestItem[];
}> {
  const [balance, packs, paymentMethods, topUpRequests] = await Promise.all([
    api.get<BalanceSummary>("/v1/billing/balance"),
    api.get<CreditPack[]>("/v1/billing/packs"),
    api.get<PaymentMethodItem[]>("/v1/billing/payment-methods"),
    api.get<TopUpRequestItem[]>("/v1/billing/topup-requests"),
  ]);
  return { balance, packs, paymentMethods, topUpRequests };
}

function loadLedger(page: number): Promise<PaginatedCreditEntries> {
  return api.get<PaginatedCreditEntries>(
    `/v1/billing/entries?page=${page}&limit=${LEDGER_LIMIT}`
  );
}

export default function DashboardFacturationPage() {
  // `=== null` sert d'indicateur de chargement, comme sur les autres pages
  // du tableau de bord (voir /dashboard/cles-api, /admin/recharges).
  const [balance, setBalance] = useState<BalanceSummary | null>(null);
  const [packs, setPacks] = useState<CreditPack[] | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<
    PaymentMethodItem[] | null
  >(null);
  const [topUpRequests, setTopUpRequests] = useState<
    TopUpRequestItem[] | null
  >(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledger, setLedger] = useState<PaginatedCreditEntries | null>(null);
  const [ledgerError, setLedgerError] = useState<string | null>(null);

  const [selectedMethod, setSelectedMethod] = useState<TopUpMethod | null>(
    null
  );
  const [selectedPackId, setSelectedPackId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    loadOverview()
      .then((data) => {
        if (!active) return;
        setBalance(data.balance);
        setPacks(data.packs);
        setPaymentMethods(data.paymentMethods);
        setTopUpRequests(data.topUpRequests);
        setOverviewError(null);

        const firstPurchasable = data.packs.find((pack) => pack.purchasable);
        if (firstPurchasable) setSelectedPackId(firstPurchasable.id);
        if (data.paymentMethods.length > 0) {
          setSelectedMethod(data.paymentMethods[0].method);
        }
      })
      .catch((err) => {
        if (!active) return;
        setOverviewError(
          err instanceof ApiError
            ? err.message
            : "Impossible de joindre le serveur."
        );
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    loadLedger(ledgerPage)
      .then((data) => {
        if (!active) return;
        setLedger(data);
        setLedgerError(null);
      })
      .catch((err) => {
        if (!active) return;
        setLedgerError(
          err instanceof ApiError
            ? err.message
            : "Impossible de joindre le serveur."
        );
      });

    return () => {
      active = false;
    };
  }, [ledgerPage]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMethod || !selectedPackId) return;

    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitting(true);

    try {
      const created = await api.post<TopUpRequestItem>(
        "/v1/billing/topup-requests",
        {
          packId: selectedPackId,
          method: selectedMethod,
          phoneNumber: phoneNumber.trim(),
          transactionRef: transactionRef.trim(),
        }
      );
      setTopUpRequests((prev) => (prev ? [created, ...prev] : [created]));
      setSubmitSuccess(
        "Demande envoyée. Elle apparaît dans l'historique ci-dessous, en attente de validation."
      );
      setPhoneNumber("");
      setTransactionRef("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setSubmitError(
          "Cette référence de transaction a déjà été déclarée : une demande est déjà en attente avec cette référence. Vérifiez le SMS de l'opérateur, ou utilisez une autre référence si ce transfert est différent."
        );
      } else if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Impossible de joindre le serveur.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const purchasablePacks = packs?.filter((pack) => pack.purchasable) ?? [];
  const selectedPaymentMethod =
    paymentMethods?.find((pm) => pm.method === selectedMethod) ?? null;

  const refLength = transactionRef.trim().length;
  const formValid =
    Boolean(selectedMethod) &&
    Boolean(selectedPackId) &&
    phoneNumber.trim().length > 0 &&
    refLength >= TRANSACTION_REF_MIN_LENGTH &&
    refLength <= TRANSACTION_REF_MAX_LENGTH;

  return (
    <div className="mx-auto max-w-[960px]">
      <div className="mb-8">
        <h1 className="mb-1.5 font-heading text-2xl font-semibold text-[#EDEEF0]">
          Facturation
        </h1>
        <p className="text-sm text-[#9BA1A8]">
          Solde de crédits, recharge par Mobile Money et historique des
          mouvements.
        </p>
      </div>

      {overviewError && (
        <p className="mb-6 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
          {overviewError}
        </p>
      )}

      {/* --- Solde --------------------------------------------------------- */}
      <section className="mb-8">
        {balance === null && !overviewError && (
          <p className="text-sm text-[#9BA1A8]">Chargement...</p>
        )}
        {balance && (
          <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-6 sm:p-8">
            <p className="mb-1 text-[13px] text-[#9BA1A8]">Solde actuel</p>
            <p className="mb-6 font-heading text-[32px] font-semibold tracking-[-0.02em] text-[#EDEEF0] sm:text-[36px]">
              {formatNumberFr(balance.balance)}{" "}
              <span className="text-[15px] font-normal text-[#9BA1A8]">
                crédits
              </span>
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <BalanceStat label="Acheté" value={balance.totalPurchased} />
              <BalanceStat label="Offert" value={balance.totalGifted} />
              <BalanceStat label="Consommé" value={balance.totalConsumed} />
            </div>
          </div>
        )}
      </section>

      {/* --- Packs ----------------------------------------------------------- */}
      {packs && packs.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 font-heading text-lg font-semibold text-[#EDEEF0]">
            Packs de crédits
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {packs.map((pack) => {
              const unitPricePer1000 =
                pack.credits > 0
                  ? Math.round((pack.amountGnf / pack.credits) * 1000)
                  : 0;
              return (
                <div
                  key={pack.id}
                  className={`rounded-2xl border p-5 ${
                    pack.purchasable
                      ? "border-white/[0.09] bg-[#0C0D0F]"
                      : "border-dashed border-white/[0.13] bg-white/[0.015]"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="font-heading text-base font-semibold text-[#EDEEF0]">
                      {pack.label}
                    </h3>
                    {!pack.purchasable && (
                      <Badge color="gray" label="Non achetable" />
                    )}
                  </div>
                  <p className="mb-1 font-mono text-[20px] text-[#EDEEF0]">
                    {formatGnf(pack.amountGnf)}
                  </p>
                  <p className="mb-3 text-[13px] text-[#9BA1A8]">
                    {formatNumberFr(pack.credits)} crédits
                  </p>
                  {pack.purchasable && unitPricePer1000 > 0 && (
                    <p className="text-[12px] text-[#70767D]">
                      soit {formatGnf(unitPricePer1000)} pour 1 000 crédits
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* --- Recharger ------------------------------------------------------- */}
      <section className="mb-8">
        <h2 className="mb-4 font-heading text-lg font-semibold text-[#EDEEF0]">
          Recharger
        </h2>

        {paymentMethods === null && !overviewError && (
          <p className="text-sm text-[#9BA1A8]">Chargement...</p>
        )}

        {paymentMethods !== null && paymentMethods.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/[0.13] bg-white/[0.015] px-6 py-12 text-center">
            <h3 className="mb-2 font-heading text-base font-semibold text-[#EDEEF0]">
              La recharge par Mobile Money n&rsquo;est pas encore ouverte
            </h3>
            <p className="mx-auto max-w-[440px] text-[13.5px] leading-relaxed text-[#9BA1A8] text-pretty">
              Aucun moyen d&rsquo;encaissement n&rsquo;est configuré pour le
              moment. Contactez le support Zendou pour recharger votre
              compte.
            </p>
          </div>
        )}

        {paymentMethods !== null &&
          paymentMethods.length > 0 &&
          purchasablePacks.length === 0 && (
            <p className="rounded-lg border border-[#F5A623]/30 bg-[#F5A623]/10 px-3.5 py-2.5 text-[13.5px] text-[#F5C177]">
              Aucun pack n&rsquo;est disponible à l&rsquo;achat pour le
              moment.
            </p>
          )}

        {paymentMethods !== null &&
          paymentMethods.length > 0 &&
          purchasablePacks.length > 0 && (
            <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5 sm:p-6">
              {paymentMethods.length > 1 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {paymentMethods.map((pm) => {
                    const meta = topUpMethodMeta(pm.method);
                    const active = selectedMethod === pm.method;
                    return (
                      <button
                        key={pm.method}
                        type="button"
                        onClick={() => setSelectedMethod(pm.method)}
                        className={`rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                          active
                            ? "border-[#5B7CFA]/50 bg-[#5B7CFA]/10 text-[#EDEEF0]"
                            : "border-white/[0.09] text-[#9BA1A8] hover:text-[#EDEEF0]"
                        }`}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedPaymentMethod && (
                <div className="mb-5 rounded-lg border border-white/[0.09] bg-[#0E1013] p-4">
                  <p className="mb-2 text-[12.5px] text-[#9BA1A8]">
                    Transférez le montant du pack vers ce numéro{" "}
                    {topUpMethodMeta(selectedPaymentMethod.method).label} :
                  </p>
                  <div className="mb-1 rounded-lg border border-white/[0.07] bg-white/[0.02] p-1">
                    <CopyField
                      value={selectedPaymentMethod.number}
                      className="w-full"
                    />
                  </div>
                  {selectedPaymentMethod.accountName && (
                    <div className="mt-2 rounded-lg border border-white/[0.07] bg-white/[0.02] p-1">
                      <CopyField
                        value={selectedPaymentMethod.accountName}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}

              <ol className="mb-6 flex flex-col gap-3">
                <RechargeStep number={1} title="Effectuez le transfert">
                  Depuis votre application Mobile Money, transférez le
                  montant du pack choisi vers le numéro Zendou ci-dessus.
                </RechargeStep>
                <RechargeStep number={2} title="Récupérez la référence">
                  Conservez la référence de transaction fournie par
                  l&rsquo;opérateur (SMS de confirmation).
                </RechargeStep>
                <RechargeStep number={3} title="Déclarez la recharge">
                  Renseignez le formulaire ci-dessous. Un administrateur
                  valide la demande après rapprochement avec le transfert
                  reçu, et les crédits sont ajoutés à votre solde.
                </RechargeStep>
              </ol>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <div>
                  <label
                    htmlFor="topup-pack"
                    className="mb-1.5 block text-[12.5px] font-medium text-[#C5CACF]"
                  >
                    Pack
                  </label>
                  <select
                    id="topup-pack"
                    value={selectedPackId}
                    onChange={(event) => setSelectedPackId(event.target.value)}
                    className="w-full rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2.5 text-[16px] text-[#EDEEF0] outline-none focus:border-[#5B7CFA]"
                  >
                    {purchasablePacks.map((pack) => (
                      <option key={pack.id} value={pack.id}>
                        {pack.label} ({formatNumberFr(pack.credits)} crédits,{" "}
                        {formatGnf(pack.amountGnf)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="topup-phone"
                    className="mb-1.5 block text-[12.5px] font-medium text-[#C5CACF]"
                  >
                    Votre numéro de téléphone
                  </label>
                  <input
                    id="topup-phone"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    placeholder="+224 620 00 00 00"
                    className="w-full rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2.5 text-[16px] text-[#EDEEF0] placeholder:text-[#5E646B] outline-none focus:border-[#5B7CFA]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="topup-ref"
                    className="mb-1.5 block text-[12.5px] font-medium text-[#C5CACF]"
                  >
                    Référence de transaction
                  </label>
                  <input
                    id="topup-ref"
                    type="text"
                    required
                    minLength={TRANSACTION_REF_MIN_LENGTH}
                    maxLength={TRANSACTION_REF_MAX_LENGTH}
                    value={transactionRef}
                    onChange={(event) => setTransactionRef(event.target.value)}
                    placeholder="Ex. : OM.2601.2201.A12345"
                    className="w-full rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2.5 font-mono text-[15px] text-[#EDEEF0] placeholder:text-[#5E646B] outline-none focus:border-[#5B7CFA]"
                  />
                  <p className="mt-1.5 text-[12px] text-[#70767D]">
                    Reçue par SMS de l&rsquo;opérateur, entre 4 et 64
                    caractères.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!formValid || submitting}
                  className="self-start rounded-lg bg-[#5B7CFA] px-5 py-2.5 text-[13.5px] font-semibold text-[#F7F9FF] transition-opacity disabled:opacity-60"
                >
                  {submitting ? "Envoi..." : "Déclarer la recharge"}
                </button>

                {submitError && (
                  <p className="rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
                    {submitError}
                  </p>
                )}
                {submitSuccess && (
                  <p className="rounded-lg border border-[#35D07F]/30 bg-[#35D07F]/10 px-3.5 py-2.5 text-[13.5px] text-[#35D07F]">
                    {submitSuccess}
                  </p>
                )}
              </form>
            </div>
          )}
      </section>

      {/* --- Historique des demandes ------------------------------------------ */}
      <section className="mb-8">
        <h2 className="mb-4 font-heading text-lg font-semibold text-[#EDEEF0]">
          Historique des demandes
        </h2>

        {topUpRequests === null && !overviewError && (
          <p className="text-sm text-[#9BA1A8]">Chargement...</p>
        )}

        {topUpRequests !== null && topUpRequests.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/[0.13] bg-white/[0.015] px-8 py-16 text-center">
            <h3 className="font-heading text-lg font-semibold text-[#EDEEF0]">
              Aucune demande de recharge pour l&rsquo;instant.
            </h3>
          </div>
        )}

        {topUpRequests !== null && topUpRequests.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0C0D0F] md:block">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-[13.5px]">
                  <thead>
                    <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
                      <th className="px-4 py-3 font-medium">Pack</th>
                      <th className="px-3 py-3 font-medium whitespace-nowrap">
                        Montant
                      </th>
                      <th className="px-3 py-3 font-medium whitespace-nowrap">
                        Méthode
                      </th>
                      <th className="px-3 py-3 font-medium whitespace-nowrap">
                        Référence
                      </th>
                      <th className="px-3 py-3 font-medium whitespace-nowrap">
                        Statut
                      </th>
                      <th className="px-3 py-3 font-medium whitespace-nowrap">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUpRequests.map((item) => {
                      const methodMeta = topUpMethodMeta(item.method);
                      const statusMeta = topUpStatusMeta(item.status);
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-white/[0.05] last:border-b-0"
                        >
                          <td className="px-4 py-3.5 whitespace-nowrap text-[#EDEEF0]">
                            {packLabel(packs, item.packId)}
                          </td>
                          <td className="px-3 py-3.5 font-mono whitespace-nowrap text-[#EDEEF0]">
                            {formatGnf(item.amountGnf)}
                          </td>
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <Badge
                              color={methodMeta.color}
                              label={methodMeta.label}
                            />
                          </td>
                          <td className="px-3 py-3.5 font-mono whitespace-nowrap text-[#9BA1A8]">
                            {item.transactionRef}
                          </td>
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <Badge
                              color={statusMeta.color}
                              label={statusMeta.label}
                            />
                            {item.status === "REJECTED" &&
                              item.rejectionReason && (
                                <p className="mt-1.5 max-w-[220px] text-[12px] leading-snug text-[#FF9592] text-pretty">
                                  {item.rejectionReason}
                                </p>
                              )}
                          </td>
                          <td className="px-3 py-3.5 whitespace-nowrap text-[#9BA1A8]">
                            {formatDateTimeShortFr(item.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {topUpRequests.map((item) => {
                const methodMeta = topUpMethodMeta(item.method);
                const statusMeta = topUpStatusMeta(item.status);
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <span className="truncate text-[14px] font-medium text-[#EDEEF0]">
                        {packLabel(packs, item.packId)}
                      </span>
                      <Badge color={statusMeta.color} label={statusMeta.label} />
                    </div>

                    <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-[13px]">
                      <div>
                        <dt className="text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
                          Montant
                        </dt>
                        <dd className="font-mono text-[#EDEEF0]">
                          {formatGnf(item.amountGnf)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
                          Méthode
                        </dt>
                        <dd>
                          <Badge
                            color={methodMeta.color}
                            label={methodMeta.label}
                          />
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
                          Référence
                        </dt>
                        <dd className="font-mono break-all text-[#9BA1A8]">
                          {item.transactionRef}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
                          Date
                        </dt>
                        <dd className="text-[#9BA1A8]">
                          {formatDateTimeShortFr(item.createdAt)}
                        </dd>
                      </div>
                    </dl>

                    {item.status === "REJECTED" && item.rejectionReason && (
                      <p className="mt-3 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3 py-2 text-[12.5px] leading-snug text-[#FF9592] text-pretty">
                        {item.rejectionReason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* --- Ledger ------------------------------------------------------------ */}
      <section>
        <h2 className="mb-4 font-heading text-lg font-semibold text-[#EDEEF0]">
          Mouvements de crédits
        </h2>

        {ledgerError && (
          <p className="mb-6 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
            {ledgerError}
          </p>
        )}

        {ledger === null && !ledgerError && (
          <p className="text-sm text-[#9BA1A8]">Chargement...</p>
        )}

        {ledger && ledger.items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/[0.13] bg-white/[0.015] px-8 py-16 text-center">
            <h3 className="font-heading text-lg font-semibold text-[#EDEEF0]">
              Aucun mouvement de crédits pour l&rsquo;instant.
            </h3>
          </div>
        )}

        {ledger && ledger.items.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0C0D0F] md:block">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-[13.5px]">
                  <thead>
                    <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-3 py-3 font-medium whitespace-nowrap">
                        Motif
                      </th>
                      <th className="px-3 py-3 font-medium whitespace-nowrap">
                        Référence
                      </th>
                      <th className="px-3 py-3 font-medium whitespace-nowrap">
                        Mouvement
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.items.map((entry, index) => (
                      <tr
                        key={`${entry.createdAt}-${index}`}
                        className="border-b border-white/[0.05] last:border-b-0"
                      >
                        <td className="px-4 py-3.5 whitespace-nowrap text-[#9BA1A8]">
                          {formatDateTimeShortFr(entry.createdAt)}
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap text-[#C5CACF]">
                          {creditReasonLabelFr(entry.reason)}
                        </td>
                        <td className="px-3 py-3.5 font-mono whitespace-nowrap text-[#9BA1A8]">
                          {entry.reference ?? "-"}
                        </td>
                        <td
                          className={`px-3 py-3.5 font-mono whitespace-nowrap ${
                            entry.delta >= 0 ? "text-[#35D07F]" : "text-[#FF9592]"
                          }`}
                        >
                          {entry.delta >= 0 ? "+" : "-"}
                          {formatNumberFr(Math.abs(entry.delta))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {ledger.items.map((entry, index) => (
                <div
                  key={`${entry.createdAt}-${index}`}
                  className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-4"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className="text-[13.5px] text-[#C5CACF]">
                      {creditReasonLabelFr(entry.reason)}
                    </span>
                    <span
                      className={`font-mono text-[14px] ${
                        entry.delta >= 0 ? "text-[#35D07F]" : "text-[#FF9592]"
                      }`}
                    >
                      {entry.delta >= 0 ? "+" : "-"}
                      {formatNumberFr(Math.abs(entry.delta))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[12px] text-[#70767D]">
                    <span className="truncate font-mono">
                      {entry.reference ?? "-"}
                    </span>
                    <span className="shrink-0">
                      {formatDateTimeShortFr(entry.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-[#9BA1A8]">
              <span>{ledger.total} mouvement(s) au total</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
                  disabled={ledger.page <= 1}
                  className="rounded-lg border border-white/[0.14] px-3 py-1.5 text-[12.5px] font-medium text-[#EDEEF0] transition-opacity disabled:opacity-40"
                >
                  Précédent
                </button>
                <span>
                  Page {ledger.page} sur {Math.max(1, ledger.totalPages)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setLedgerPage((p) => Math.min(ledger.totalPages, p + 1))
                  }
                  disabled={ledger.page >= ledger.totalPages}
                  className="rounded-lg border border-white/[0.14] px-3 py-1.5 text-[12.5px] font-medium text-[#EDEEF0] transition-opacity disabled:opacity-40"
                >
                  Suivant
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function BalanceStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 py-3">
      <p className="mb-1 text-[11px] tracking-[0.02em] text-[#70767D] uppercase">
        {label}
      </p>
      <p className="font-mono text-[18px] text-[#EDEEF0]">
        {formatNumberFr(value)}
      </p>
    </div>
  );
}

function RechargeStep({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: string;
}) {
  return (
    <li className="flex gap-3.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(91,124,250,0.14)] font-mono text-[13px] font-semibold text-[#8AA4FF]">
        {number}
      </span>
      <div className="text-[13px] leading-relaxed text-[#9BA1A8]">
        <span className="mb-0.5 block font-medium text-[#C5CACF]">
          {title}
        </span>
        {children}
      </div>
    </li>
  );
}
