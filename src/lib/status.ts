import type {
  AdminAccountRole,
  AdminAccountStatus,
  AdminActionType,
  DnsRecordCheckStatus,
  DomainStatus,
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
      return { label: "Rejeté (bounce)", color: "red" };
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

export const EMAIL_STATUS_OPTIONS: { value: EmailStatus; label: string }[] = [
  { value: "QUEUED", label: "En file" },
  { value: "SENT", label: "Envoyé" },
  { value: "DELIVERED", label: "Délivré" },
  { value: "BOUNCED", label: "Rejeté (bounce)" },
  { value: "COMPLAINED", label: "Plainte" },
  { value: "REJECTED", label: "Rejeté" },
  { value: "FAILED", label: "Échec" },
  { value: "SUPPRESSED", label: "Supprimé" },
];
