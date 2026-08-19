import type {
  AdminAccountRole,
  AdminAccountStatus,
  AdminActionType,
  DnsRecordCheckStatus,
  DomainStatus,
  EmailChannel,
  EmailStatus,
  TopUpMethod,
} from "./types";
import type { BadgeColor } from "@/components/dashboard/Badge";

export function domainStatusMeta(status: DomainStatus): {
  label: string;
  color: BadgeColor;
} {
  switch (status) {
    case "VERIFIED":
      return { label: "Vérifié", color: "green" };
    case "PENDING":
      return { label: "En attente", color: "orange" };
    case "FAILED":
      return { label: "Échec", color: "red" };
    case "TEMPORARY_FAILURE":
      return { label: "Échec temporaire", color: "red" };
  }
}

/** Pastille d'un enregistrement DNS individuel (diagnostic DKIM/SPF/DMARC). */
export function dnsRecordCheckStatusMeta(status: DnsRecordCheckStatus): {
  label: string;
  color: BadgeColor;
} {
  switch (status) {
    case "ok":
      return { label: "Conforme", color: "green" };
    case "introuvable":
      return { label: "Introuvable", color: "red" };
    case "valeur_differente":
      return { label: "Valeur différente", color: "orange" };
  }
}

export function emailStatusMeta(status: EmailStatus): {
  label: string;
  color: BadgeColor;
} {
  switch (status) {
    case "QUEUED":
      return { label: "En file", color: "gray" };
    case "SENT":
      return { label: "Envoyé", color: "blue" };
    case "DELIVERED":
      return { label: "Délivré", color: "green" };
    case "BOUNCED":
      return { label: "Rebond", color: "red" };
    case "COMPLAINED":
      return { label: "Plainte", color: "red" };
    case "REJECTED":
      return { label: "Rejeté", color: "red" };
    case "FAILED":
      return { label: "Échec", color: "red" };
    case "SUPPRESSED":
      return { label: "Supprimé", color: "gray" };
  }
}

/**
 * Badge discret pour le canal d'entrée d'un envoi (chantier B6). `gray` pour
 * l'API (canal historique, ne doit pas attirer l'œil) et `blue` pour SMTP,
 * même codage que les autres badges neutres/informatifs de cette table
 * (`emailStatusMeta("SENT")`, `adminActionTypeMeta("ADJUST_QUOTA")`).
 */
export function emailChannelMeta(channel: EmailChannel): {
  label: string;
  color: BadgeColor;
} {
  switch (channel) {
    case "API":
      return { label: "API", color: "gray" };
    case "SMTP":
      return { label: "SMTP", color: "blue" };
  }
}

export const EMAIL_CHANNEL_OPTIONS: { value: EmailChannel; label: string }[] =
  [
    { value: "API", label: "API" },
    { value: "SMTP", label: "SMTP" },
  ];

export function topUpMethodMeta(method: TopUpMethod): {
  label: string;
  color: BadgeColor;
} {
  switch (method) {
    case "ORANGE_MONEY":
      return { label: "Orange Money", color: "orange" };
    case "MTN_MOMO":
      return { label: "MTN MoMo", color: "blue" };
  }
}

export function adminAccountStatusMeta(status: AdminAccountStatus): {
  label: string;
  color: BadgeColor;
} {
  switch (status) {
    case "ACTIVE":
      return { label: "Actif", color: "green" };
    case "SUSPENDED":
      return { label: "Suspendu", color: "red" };
  }
}

export function adminAccountRoleMeta(role: AdminAccountRole): {
  label: string;
  color: BadgeColor;
} {
  switch (role) {
    case "CUSTOMER":
      return { label: "Client", color: "gray" };
    case "ADMIN":
      return { label: "Admin", color: "orange" };
  }
}

export const ADMIN_ACCOUNT_STATUS_OPTIONS: {
  value: AdminAccountStatus;
  label: string;
}[] = [
  { value: "ACTIVE", label: "Actif" },
  { value: "SUSPENDED", label: "Suspendu" },
];

export const ADMIN_ACCOUNT_ROLE_OPTIONS: {
  value: AdminAccountRole;
  label: string;
}[] = [
  { value: "CUSTOMER", label: "Client" },
  { value: "ADMIN", label: "Admin" },
];

/**
 * `recentActions` peut aussi remonter des types écrits ailleurs dans l'admin
 * (revue des recharges : APPROVE_TOPUP / REJECT_TOPUP) — le journal d'audit
 * d'un compte n'est pas limité aux 4 actions de cet écran.
 */
export function adminActionTypeMeta(type: AdminActionType): {
  label: string;
  color: BadgeColor;
} {
  switch (type) {
    case "SUSPEND_USER":
      return { label: "Suspension", color: "red" };
    case "REACTIVATE_USER":
      return { label: "Réactivation", color: "green" };
    case "ADJUST_QUOTA":
      return { label: "Quota modifié", color: "blue" };
    case "GRANT_CREDITS":
      return { label: "Mouvement de crédits", color: "orange" };
    case "PROMOTE_ADMIN":
      return { label: "Promotion admin", color: "blue" };
    case "DEMOTE_ADMIN":
      return { label: "Rétrogradation", color: "gray" };
    case "APPROVE_TOPUP":
      return { label: "Recharge approuvée", color: "green" };
    case "REJECT_TOPUP":
      return { label: "Recharge rejetée", color: "red" };
  }
}

const EMAIL_STATUS_VALUES: EmailStatus[] = [
  "QUEUED",
  "SENT",
  "DELIVERED",
  "BOUNCED",
  "COMPLAINED",
  "REJECTED",
  "FAILED",
  "SUPPRESSED",
];

/**
 * Dérivé de `emailStatusMeta` pour n'avoir qu'une seule source de libellés —
 * les deux listes avaient divergé (BOUNCED libellé différemment ici et dans
 * `emailStatusMeta`), ce qui a laissé vivre un doublon de texte quasi
 * identique à celui de REJECTED sur l'écran admin des statistiques.
 */
export const EMAIL_STATUS_OPTIONS: { value: EmailStatus; label: string }[] =
  EMAIL_STATUS_VALUES.map((value) => ({
    value,
    label: emailStatusMeta(value).label,
  }));
