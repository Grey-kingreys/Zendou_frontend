import type { DomainStatus, EmailStatus, TopUpMethod } from "./types";
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
