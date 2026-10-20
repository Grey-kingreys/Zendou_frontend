"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Badge from "@/components/dashboard/Badge";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import CopyAllButton from "@/components/dashboard/CopyAllButton";
import CopyField from "@/components/dashboard/CopyField";
import DnsDiagnostic from "@/components/dashboard/DnsDiagnostic";
import DnsProviderGuide from "@/components/dashboard/DnsProviderGuide";
import { api, ApiError } from "@/lib/api";
import {
  buildSummary,
  DnsCheckRateLimitError,
  fetchDomainDnsCheck,
  formatRetryAfterFr,
  SUMMARY_TONE_CLASSES,
  type SummaryTone,
} from "@/lib/dns-check";
import { formatDateTimeFr } from "@/lib/format";
import { domainStatusMeta } from "@/lib/status";
import type {
  DnsRecord,
  MailFromStatus,
  DomainCheckResult,
  DomainDetail,
  DomainDnsCheckResult,
  DomainRemoveResult,
  DomainUsage,
} from "@/lib/types";

/** Texte tabulé (type, nom, valeur) pour le bouton « Tout copier » (B12). */
const MAIL_FROM_STATUS_LABELS: Record<MailFromStatus, string> = {
  PENDING: "En attente de vérification par Amazon SES",
  SUCCESS: "Actif",
  FAILED: "Échec : vérifiez les enregistrements MX et SPF",
  TEMPORARY_FAILURE: "Échec temporaire : Amazon SES réessaiera",
};

function mailFromStatusLabel(status: MailFromStatus | null): string {
  return status
    ? MAIL_FROM_STATUS_LABELS[status]
    : "Pas encore vérifié (enregistrements facultatifs)";
}

function buildDkimCopyText(records: DnsRecord[]): string {
  const header = "Type\tNom\tValeur";
  const rows = records.map((record) => `${record.type}\t${record.name}\t${record.value}`);
  return [header, ...rows].join("\n");
}

export default function DashboardDomainDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [domain, setDomain] = useState<DomainDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);
  const [checkTone, setCheckTone] = useState<SummaryTone | null>(null);

  // Diagnostic DNS (B2) - état levé ici plutôt que dans `DnsDiagnostic` : le
  // même résultat alimente à la fois le panneau de diagnostic et le bandeau
  // du bouton « Vérifier maintenant » (B14), pour ne jamais raconter deux
  // histoires différentes sur la même question.
  const [dnsResult, setDnsResult] = useState<DomainDnsCheckResult | null>(null);
  const [dnsLoading, setDnsLoading] = useState(false);
  const [dnsError, setDnsError] = useState<string | null>(null);
  // Garde d'auto-lancement : une ref plutôt qu'un tableau de dépendances,
  // pour survivre au double-appel d'effet du mode strict de React en dev
  // (setup → cleanup → setup, sur la même instance de composant : la ref
  // n'est pas réinitialisée entre les deux).
  const dnsAutoRanRef = useRef(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Aperçu d'impact (B27) : `null` tant qu'il charge ou s'il est indisponible
  // (ancien backend : 404) - la confirmation actuelle s'affiche alors seule.
  const [usage, setUsage] = useState<DomainUsage | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  // Résultat de la suppression quand des clés ou identifiants ont été révoqués.
  const [removed, setRemoved] = useState<{
    name: string;
    result: DomainRemoveResult;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;

    (async () => {
      try {
        const data = await api.get<DomainDetail>(`/v1/domains/${id}`);
        if (!active) return;
        setDomain(data);
        setError(null);
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
          return;
        }
        setError(
          err instanceof ApiError
            ? err.message
            : "Impossible de joindre le serveur."
        );
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  /**
   * Diagnostic DNS partagé : utilisé par l'auto-lancement, par le bouton
   * manuel du panneau `DnsDiagnostic`, et par `handleCheck` ci-dessous.
   * `silent` couvre le cas de l'auto-lancement : un 429 (ou toute autre
   * panne) au chargement de la page ne doit jamais afficher de bandeau
   * rouge - on retombe silencieusement sur le bouton manuel.
   */
  const runDnsDiagnostic = useCallback(
    async ({
      silent = false,
    }: { silent?: boolean } = {}): Promise<DomainDnsCheckResult | null> => {
      setDnsLoading(true);
      if (!silent) setDnsError(null);
      try {
        const data = await fetchDomainDnsCheck(id);
        setDnsResult(data);
        setDnsError(null);
        return data;
      } catch (err) {
        if (!silent) {
          if (err instanceof DnsCheckRateLimitError) {
            setDnsError(
              `Vous avez atteint la limite de vérifications (30 par heure). Réessayez dans ${formatRetryAfterFr(err.retryAfterSeconds)}.`
            );
          } else if (err instanceof ApiError) {
            setDnsError(err.message);
          } else {
            setDnsError("Impossible de joindre le serveur.");
          }
        }
        return null;
      } finally {
        setDnsLoading(false);
      }
    },
    [id]
  );

  // Auto-lancement du diagnostic au premier affichage d'un domaine qui n'est
  // pas encore vérifié (B14) : sinon, l'information reste cachée derrière un
  // bouton que personne ne presse. `dnsAutoRanRef` garantit un seul appel
  // par montage, y compris sous le double-appel d'effet de StrictMode (la
  // ref n'est pas réinitialisée entre le premier « setup → cleanup » simulé
  // et le second « setup » réel, contrairement à un state ou un tableau de
  // dépendances).
  //
  // N'appelle pas `runDnsDiagnostic` directement : cette fonction capture
  // des setters de state (setDnsLoading...), et un effet qui appelle,
  // même indirectement, une fonction qui appelle `setState` est rejeté par
  // la règle `react-hooks/set-state-in-effect` (react-compiler, ESLint) -
  // rendus en cascade. Le fetch est donc dupliqué ici en miniature, à
  // l'identique du patron déjà utilisé par l'effet de chargement du domaine
  // ci-dessus ; la classification (`buildSummary`) reste elle strictement
  // partagée, seule la plomberie fetch+setState est locale à chaque effet.
  useEffect(() => {
    if (!domain) return;
    if (dnsAutoRanRef.current) return;
    if (domain.status === "VERIFIED") return;
    dnsAutoRanRef.current = true;

    let active = true;
    fetchDomainDnsCheck(id)
      .then((data) => {
        if (!active) return;
        setDnsResult(data);
        setDnsError(null);
      })
      .catch(() => {
        // Silencieux à dessein (429 ou toute autre panne) : on retombe sur
        // le bouton manuel du panneau de diagnostic, jamais de bandeau
        // rouge à l'ouverture de la page.
      });

    return () => {
      active = false;
    };
  }, [domain, id]);

  async function handleCheck() {
    setChecking(true);
    setCheckMessage(null);
    setCheckTone(null);

    // 1) Diagnostic DNS d'abord (gratuit, 30/h) - bloc indépendant du bloc
    // SES ci-dessous : un échec ou un 429 ici ne doit jamais empêcher
    // l'appel SES, ni effacer le résultat qu'il produira.
    const diagnostic = await runDnsDiagnostic();

    // 2) SES ensuite (coûte un appel AWS, 10/h) - bloc try séparé du
    // précédent, pour la même raison en sens inverse : un échec ici ne doit
    // pas effacer le diagnostic déjà obtenu.
    try {
      const result = await api.post<DomainCheckResult>(
        `/v1/domains/${id}/check`
      );
      setDomain((current) =>
        current
          ? {
              ...current,
              status: result.status,
              verifiedAt: result.verifiedAt,
              mailFromStatus: result.mailFromStatus,
            }
          : current
      );
      // Garde le panneau de diagnostic (juste au-dessus) synchronisé avec le
      // statut SES tout frais - sinon son propre résumé (`buildSummary`,
      // basé sur le `sesStatus` du diagnostic, capturé *avant* cet appel)
      // pourrait rester sur « en attente d'Amazon » un instant après que ce
      // bandeau annonce déjà « Domaine vérifié ».
      setDnsResult((current) =>
        current ? { ...current, sesStatus: result.status } : current
      );

      if (result.status === "VERIFIED") {
        // Cas 3 - inchangé.
        setCheckMessage("Domaine vérifié.");
        setCheckTone("success");
      } else if (diagnostic) {
        // Cas 1 (écarts ou absence) ou cas 2 (corrects, en attente
        // d'Amazon) - classification réutilisée telle quelle depuis le
        // panneau de diagnostic (`buildSummary`), pas une seconde logique.
        const summary = buildSummary({ ...diagnostic, sesStatus: result.status });
        setCheckMessage(summary.text);
        setCheckTone(summary.tone);
      } else if (result.status === "PENDING") {
        // Cas dégradé : diagnostic indisponible (429, panne réseau...), on
        // retombe sur le comportement actuel - message SES seul.
        setCheckMessage(
          "Vérification en cours chez AWS, cela peut prendre jusqu’à 72 h."
        );
        setCheckTone("waiting");
      } else {
        setCheckMessage(
          "La vérification a échoué. Contrôlez les enregistrements DNS ci-dessous."
        );
        setCheckTone("issue");
      }
    } catch (err) {
      setCheckMessage(
        err instanceof ApiError
          ? err.message
          : "Impossible de joindre le serveur."
      );
      setCheckTone("issue");
    } finally {
      setChecking(false);
    }
  }

  async function openDelete() {
    setDeleteOpen(true);
    setUsage(null);
    setUsageLoading(true);
    try {
      const data = await api.get<DomainUsage>(`/v1/domains/${id}/usage`);
      setUsage(data);
    } catch {
      // Aperçu indisponible (404 d'un ancien backend, réseau...) : on garde
      // la confirmation sans liste plutôt que de bloquer la suppression.
      setUsage(null);
    } finally {
      setUsageLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      // 204 sans corps (ancien backend) ou 200 avec la liste des révocations.
      const result = await api.del<DomainRemoveResult | undefined>(
        `/v1/domains/${id}`
      );
      const revokedCount =
        (result?.revokedApiKeys?.length ?? 0) +
        (result?.revokedSmtpCredentials?.length ?? 0);
      if (result && revokedCount > 0 && domain) {
        setDeleteOpen(false);
        setRemoved({ name: domain.name, result });
        setDeleting(false);
        return;
      }
      router.push("/dashboard/domaines");
    } catch (err) {
      setDeleteError(
        err instanceof ApiError
          ? err.message
          : "Impossible de joindre le serveur."
      );
      setDeleting(false);
    }
  }

  if (removed) {
    const keys = removed.result.revokedApiKeys ?? [];
    const creds = removed.result.revokedSmtpCredentials ?? [];
    return (
      <div className="mx-auto max-w-[880px]">
        <div className="rounded-2xl border border-[#35D07F]/25 bg-[#35D07F]/10 p-6">
          <h1 className="mb-2 font-heading text-lg font-semibold text-[#EDEEF0]">
            Domaine « {removed.name} » supprimé
          </h1>
          <p className="mb-4 text-[13.5px] leading-relaxed text-[#9BA1A8] text-pretty">
            Ce domaine était le dernier autorisé pour les clés et identifiants
            ci-dessous : ils ont été révoqués et ne peuvent plus envoyer
            d’emails.
          </p>
          {keys.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
                Clés API révoquées
              </p>
              <ul className="space-y-1 text-[13.5px] text-[#EDEEF0]">
                {keys.map((key) => (
                  <li key={key.id} className="break-words">
                    {key.name}{" "}
                    <span className="font-mono text-[#9BA1A8]">
                      ({key.prefix}…)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {creds.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
                Identifiants SMTP révoqués
              </p>
              <ul className="space-y-1 text-[13.5px] text-[#EDEEF0]">
                {creds.map((cred) => (
                  <li key={cred.id} className="break-words">
                    {cred.name}{" "}
                    <span className="font-mono break-all text-[#9BA1A8]">
                      ({cred.username})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link
            href="/dashboard/domaines"
            className="mt-2 inline-block rounded-lg bg-[#5B7CFA] px-4 py-2.5 text-[13.5px] font-semibold text-[#F7F9FF] transition-opacity hover:opacity-90"
          >
            Retour aux domaines
          </Link>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-[880px]">
        <div className="rounded-2xl border border-dashed border-white/[0.13] bg-white/[0.015] px-8 py-16 text-center">
          <h1 className="mb-2 font-heading text-lg font-semibold text-[#EDEEF0]">
            Domaine introuvable
          </h1>
          <p className="mb-4 text-sm text-[#9BA1A8]">
            Ce domaine n’existe pas ou a été supprimé.
          </p>
          <Link
            href="/dashboard/domaines"
            className="text-sm font-medium text-[#8AA4FF]"
          >
            Retour aux domaines
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[880px]">
        <p className="rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
          {error}
        </p>
      </div>
    );
  }

  if (!domain) {
    return (
      <div className="mx-auto max-w-[880px]">
        <p className="text-sm text-[#9BA1A8]">Chargement…</p>
      </div>
    );
  }

  const meta = domainStatusMeta(domain.status);

  return (
    <div className="mx-auto max-w-[880px]">
      <Link
        href="/dashboard/domaines"
        className="mb-6 inline-block text-[13.5px] text-[#9BA1A8] hover:text-[#8AA4FF]"
      >
        ← Domaines
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="font-heading text-2xl font-semibold text-[#EDEEF0]">
              {domain.name}
            </h1>
            <Badge color={meta.color} label={meta.label} />
          </div>
          <p className="text-sm text-[#9BA1A8]">
            Ajouté le {formatDateTimeFr(domain.createdAt)}
            {domain.verifiedAt &&
              ` · Vérifié le ${formatDateTimeFr(domain.verifiedAt)}`}
          </p>
          {domain.mailFromDomain && (
            <p className="mt-1 text-sm text-[#9BA1A8]">
              Domaine MAIL FROM :{" "}
              <span className="font-mono break-all">
                {domain.mailFromDomain}
              </span>
              {" · "}
              {mailFromStatusLabel(domain.mailFromStatus ?? null)}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={handleCheck}
            disabled={checking}
            className="rounded-lg bg-[#5B7CFA] px-4 py-2.5 text-[13.5px] font-semibold text-[#F7F9FF] transition-opacity disabled:opacity-60"
          >
            {checking ? "Vérification…" : "Vérifier maintenant"}
          </button>
          <button
            type="button"
            onClick={openDelete}
            className="rounded-lg border border-white/[0.14] px-4 py-2.5 text-[13.5px] font-medium text-[#EDEEF0] transition-opacity hover:opacity-90"
          >
            Supprimer
          </button>
        </div>
      </div>

      {checkMessage && checkTone && (
        <div
          className={`mb-8 rounded-lg border px-3.5 py-2.5 text-[13.5px] leading-relaxed text-pretty ${SUMMARY_TONE_CLASSES[checkTone]}`}
        >
          {checkMessage}
        </div>
      )}

      <DnsDiagnostic
        result={dnsResult}
        loading={dnsLoading}
        error={dnsError}
        onRun={() => void runDnsDiagnostic()}
      />

      <section className="mb-8">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-base font-semibold text-[#EDEEF0]">
            1. Enregistrements DKIM (obligatoires)
          </h2>
          <CopyAllButton text={buildDkimCopyText(domain.dkimRecords)} />
        </div>
        <p className="mb-4 text-[13.5px] text-[#9BA1A8] text-pretty">
          Publiez ces 3 enregistrements CNAME chez votre registrar DNS. Une
          fois propagés, Amazon SES vérifie automatiquement le domaine.
        </p>
        <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0C0D0F]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-white/[0.07] text-[12px] tracking-[0.02em] text-[#70767D] uppercase">
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Nom</th>
                  <th className="px-5 py-3 font-medium">Valeur</th>
                </tr>
              </thead>
              <tbody>
                {domain.dkimRecords.map((record, index) => (
                  <tr
                    key={`${record.name}-${index}`}
                    className="border-b border-white/[0.05] last:border-b-0"
                  >
                    <td className="px-5 py-2 font-mono text-[#9BA1A8]">
                      {record.type}
                    </td>
                    <td className="p-0">
                      <CopyField value={record.name} className="w-full" />
                    </td>
                    <td className="p-0">
                      <CopyField value={record.value} className="w-full" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-1.5 font-heading text-base font-semibold text-[#EDEEF0]">
          2. Enregistrements recommandés (MAIL FROM, SPF, DMARC)
        </h2>
        <p className="mb-4 text-[13.5px] text-[#9BA1A8] text-pretty">
          Facultatifs pour la vérification, fortement conseillés pour la
          délivrabilité. Sans le MX et le SPF du MAIL FROM, vos envois
          continuent normalement.
        </p>
        <div className="flex flex-col gap-4">
          {domain.recommendedRecords.map((record, index) => (
            <div
              key={`${record.purpose}-${index}`}
              className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-5"
            >
              <div className="mb-3 flex items-center gap-2.5">
                <Badge color="blue" label={record.purpose} />
                <span className="font-mono text-[12px] text-[#70767D]">
                  {record.type}
                </span>
              </div>
              <div className="mb-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-[11.5px] tracking-[0.02em] text-[#70767D] uppercase">
                    Nom
                  </p>
                  <CopyField value={record.name} />
                </div>
                <div>
                  <p className="mb-1 text-[11.5px] tracking-[0.02em] text-[#70767D] uppercase">
                    Valeur
                  </p>
                  <CopyField value={record.value} />
                </div>
                {record.priority !== undefined && (
                  <div>
                    <p className="mb-1 text-[11.5px] tracking-[0.02em] text-[#70767D] uppercase">
                      Priorité
                    </p>
                    <CopyField value={String(record.priority)} />
                  </div>
                )}
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-[#9BA1A8] text-pretty">
                {record.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-1.5 font-heading text-base font-semibold text-[#EDEEF0]">
          Publier ces enregistrements
        </h2>
        <p className="mb-4 text-[13.5px] text-[#9BA1A8] text-pretty">
          Marche à suivre chez les fournisseurs DNS les plus courants.
        </p>
        <DnsProviderGuide />
      </section>

      <ConfirmDialog
        open={deleteOpen}
        title="Supprimer ce domaine ?"
        description={`« ${domain.name} » sera retiré de votre compte et l’identité SES associée sera supprimée. Les emails déjà envoyés ne sont pas affectés.`}
        confirmLabel="Supprimer"
        danger
        loading={deleting}
        confirmDisabled={usageLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      >
        {usageLoading && (
          <p className="text-[13px] text-[#70767D]">
            Recherche des clés et identifiants liés…
          </p>
        )}
        {usage && <DomainUsagePreview usage={usage} />}
      </ConfirmDialog>
      {deleteError && (
        <p className="mt-4 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
          {deleteError}
        </p>
      )}
    </div>
  );
}

/**
 * Aperçu d'impact d'une suppression de domaine (B27) : distingue ce qui sera
 * révoqué (dernier domaine autorisé) de ce qui garde d'autres domaines.
 */
function DomainUsagePreview({ usage }: { usage: DomainUsage }) {
  const revoked = [
    ...usage.apiKeys
      .filter((key) => key.willBeRevoked)
      .map((key) => ({ id: key.id, label: `Clé API « ${key.name} »` })),
    ...usage.smtpCredentials
      .filter((cred) => cred.willBeRevoked)
      .map((cred) => ({
        id: cred.id,
        label: `Identifiant SMTP « ${cred.name} »`,
      })),
  ];
  const kept = [
    ...usage.apiKeys
      .filter((key) => !key.willBeRevoked)
      .map((key) => ({ id: key.id, label: `Clé API « ${key.name} »` })),
    ...usage.smtpCredentials
      .filter((cred) => !cred.willBeRevoked)
      .map((cred) => ({
        id: cred.id,
        label: `Identifiant SMTP « ${cred.name} »`,
      })),
  ];

  if (revoked.length === 0 && kept.length === 0) {
    return (
      <p className="text-[13px] text-[#9BA1A8]">
        Aucune clé API ni aucun identifiant SMTP n’est limité à ce domaine.
      </p>
    );
  }

  return (
    <div className="max-h-[240px] space-y-3 overflow-y-auto text-[13px]">
      {revoked.length > 0 && (
        <div className="rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5">
          <p className="mb-1.5 font-medium text-[#FF9592]">
            Seront révoqués (ce domaine est leur dernier)
          </p>
          <ul className="space-y-1 text-[#EDEEF0]">
            {revoked.map((item) => (
              <li key={item.id} className="break-words">
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}
      {kept.length > 0 && (
        <div className="rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2.5">
          <p className="mb-1.5 font-medium text-[#C5CACF]">
            Garderont leurs autres domaines
          </p>
          <ul className="space-y-1 text-[#9BA1A8]">
            {kept.map((item) => (
              <li key={item.id} className="break-words">
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
