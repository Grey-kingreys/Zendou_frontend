"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Badge from "@/components/dashboard/Badge";
import { api, ApiError } from "@/lib/api";
import { formatDateTimeFr } from "@/lib/format";
import { emailStatusMeta } from "@/lib/status";
import type { EmailDetail } from "@/lib/types";

export default function DashboardEmailDetailPage() {
  const params = useParams<{ publicId: string }>();
  const publicId = params.publicId;

  const [email, setEmail] = useState<EmailDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicId) return;
    let active = true;

    api
      .get<EmailDetail>(`/v1/emails/${publicId}`)
      .then((data) => {
        if (active) setEmail(data);
      })
      .catch((err) => {
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
      });

    return () => {
      active = false;
    };
  }, [publicId]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-[720px]">
        <div className="rounded-2xl border border-dashed border-white/[0.13] bg-white/[0.015] px-8 py-16 text-center">
          <h1 className="mb-2 font-heading text-lg font-semibold text-[#EDEEF0]">
            Email introuvable
          </h1>
          <p className="mb-4 text-sm text-[#9BA1A8]">
            Cet email n’existe pas ou a été supprimé.
          </p>
          <Link
            href="/dashboard/emails"
            className="text-sm font-medium text-[#8AA4FF]"
          >
            Retour au journal
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[720px]">
        <p className="rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
          {error}
        </p>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="mx-auto max-w-[720px]">
        <p className="text-sm text-[#9BA1A8]">Chargement…</p>
      </div>
    );
  }

  const meta = emailStatusMeta(email.status);

  return (
    <div className="mx-auto max-w-[720px]">
      <Link
        href="/dashboard/emails"
        className="mb-6 inline-block text-[13.5px] text-[#9BA1A8] hover:text-[#8AA4FF]"
      >
        ← Emails
      </Link>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 font-heading text-xl font-semibold text-[#EDEEF0] text-pretty">
            {email.subject}
          </h1>
          <Badge color={meta.color} label={meta.label} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0C0D0F]">
        <dl className="divide-y divide-white/[0.06]">
          <Row label="Identifiant" value={email.publicId} mono />
          <Row label="De" value={email.fromAddress} mono />
          <Row label="À" value={email.toAddress} mono />
          <Row label="Statut" value={meta.label} />
          <Row label="Mis en file le" value={formatDateTimeFr(email.queuedAt)} />
          <Row label="Envoyé le" value={formatDateTimeFr(email.sentAt)} />
          <Row
            label="Délivré le"
            value={formatDateTimeFr(email.deliveredAt)}
          />
          <Row
            label="Dernier événement"
            value={formatDateTimeFr(email.lastEventAt)}
          />
          <Row
            label="Identifiant SES"
            value={email.sesMessageId ?? "—"}
            mono
          />
        </dl>
      </div>

      {email.errorMessage && (
        <div className="mt-6 rounded-2xl border border-[#E5484D]/30 bg-[#E5484D]/10 p-5">
          <p className="mb-1.5 text-[13px] font-medium text-[#FF9592]">
            Message d’erreur
          </p>
          <p className="font-mono text-[13px] leading-relaxed text-[#FFB3AF] text-pretty">
            {email.errorMessage}
          </p>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 px-5 py-3.5 sm:grid-cols-[180px_1fr] sm:items-center sm:gap-4">
      <dt className="text-[12.5px] text-[#70767D]">{label}</dt>
      <dd
        className={`text-[13.5px] break-all text-[#EDEEF0] ${mono ? "font-mono" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
