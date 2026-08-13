"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Badge from "@/components/dashboard/Badge";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import CopyField from "@/components/dashboard/CopyField";
import DnsDiagnostic from "@/components/dashboard/DnsDiagnostic";
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
  DomainCheckResult,
  DomainDetail,
  DomainDnsCheckResult,
} from "@/lib/types";

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

  // Diagnostic DNS (B2) — état levé ici plutôt que dans `DnsDiagnostic` : le
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
   * rouge — on retombe silencieusement sur le bouton manuel.
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
  // la règle `react-hooks/set-state-in-effect` (react-compiler, ESLint) —
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

    // 1) Diagnostic DNS d'abord (gratuit, 30/h) — bloc indépendant du bloc
    // SES ci-dessous : un échec ou un 429 ici ne doit jamais empêcher
    // l'appel SES, ni effacer le résultat qu'il produira.
    const diagnostic = await runDnsDiagnostic();

    // 2) SES ensuite (coûte un appel AWS, 10/h) — bloc try séparé du
    // précédent, pour la même raison en sens inverse : un échec ici ne doit
    // pas effacer le diagnostic déjà obtenu.
    try {
      const result = await api.post<DomainCheckResult>(
        `/v1/domains/${id}/check`
      );
      setDomain((current) =>
        current
          ? { ...current, status: result.status, verifiedAt: result.verifiedAt }
          : current
      );
      // Garde le panneau de diagnostic (juste au-dessus) synchronisé avec le
      // statut SES tout frais — sinon son propre résumé (`buildSummary`,
      // basé sur le `sesStatus` du diagnostic, capturé *avant* cet appel)
      // pourrait rester sur « en attente d'Amazon » un instant après que ce
      // bandeau annonce déjà « Domaine vérifié ».
      setDnsResult((current) =>
        current ? { ...current, sesStatus: result.status } : current
      );

      if (result.status === "VERIFIED") {
        // Cas 3 — inchangé.
        setCheckMessage("Domaine vérifié.");
        setCheckTone("success");
      } else if (diagnostic) {
        // Cas 1 (écarts ou absence) ou cas 2 (corrects, en attente
        // d'Amazon) — classification réutilisée telle quelle depuis le
        // panneau de diagnostic (`buildSummary`), pas une seconde logique.
        const summary = buildSummary({ ...diagnostic, sesStatus: result.status });
        setCheckMessage(summary.text);
        setCheckTone(summary.tone);
      } else if (result.status === "PENDING") {
        // Cas dégradé : diagnostic indisponible (429, panne réseau...), on
        // retombe sur le comportement actuel — message SES seul.
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

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.del(`/v1/domains/${id}`);
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
            onClick={() => setDeleteOpen(true)}
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
        <h2 className="mb-1.5 font-heading text-base font-semibold text-[#EDEEF0]">
          1. Enregistrements DKIM (obligatoires)
        </h2>
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
          2. Enregistrements recommandés (SPF, DMARC)
        </h2>
        <p className="mb-4 text-[13.5px] text-[#9BA1A8] text-pretty">
          Facultatifs pour la vérification, fortement conseillés pour la
          délivrabilité.
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
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-[#9BA1A8] text-pretty">
                {record.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      <ConfirmDialog
        open={deleteOpen}
        title="Supprimer ce domaine ?"
        description={`« ${domain.name} » sera retiré de votre compte et l’identité SES associée sera supprimée. Les emails déjà envoyés ne sont pas affectés.`}
        confirmLabel="Supprimer"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
      {deleteError && (
        <p className="mt-4 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
          {deleteError}
        </p>
      )}
    </div>
  );
}
