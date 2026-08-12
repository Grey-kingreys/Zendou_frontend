export type UserRole = string;
export type UserStatus = string;

export interface User {
  id: string;
  email: string;
  name: string;
  company: string | null;
  declaredUsage: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  dailySendLimit: number;
  /** `null` tant que l'adresse email n'a pas été confirmée (lien reçu par email). */
  emailVerifiedAt: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  company?: string;
  declaredUsage?: string;
  /** Jeton Cloudflare Turnstile — envoyé uniquement si le widget est actif (voir /inscription). */
  captchaToken?: string;
}

// --- Clés API ---------------------------------------------------------

export interface ApiKeySummary {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

/** Réponse à la création : `key` (clé complète) n'apparaît qu'ici. */
export interface CreateApiKeyResponse {
  id: string;
  name: string;
  prefix: string;
  key: string;
  createdAt: string;
}

/**
 * Réponse à la rotation d'une clé API : `id`, `name` et `createdAt` sont
 * inchangés par rapport à la clé d'origine ; `prefix` et `key` (clé complète,
 * n'apparaît qu'ici) sont nouveaux. `rotatedAt` trace le geste.
 */
export interface RotateApiKeyResponse {
  id: string;
  name: string;
  prefix: string;
  key: string;
  createdAt: string;
  rotatedAt: string;
}

// --- Domaines -----------------------------------------------------------

export type DomainStatus =
  | "PENDING"
  | "VERIFIED"
  | "FAILED"
  | "TEMPORARY_FAILURE";

export interface DomainSummary {
  id: string;
  name: string;
  status: DomainStatus;
  verifiedAt: string | null;
  createdAt: string;
}

export interface DnsRecord {
  type: "CNAME" | "TXT";
  name: string;
  value: string;
}

export interface RecommendedDnsRecord extends DnsRecord {
  purpose: "SPF" | "DMARC";
  note: string;
}

export interface DomainDetail extends DomainSummary {
  dkimRecords: DnsRecord[];
  recommendedRecords: RecommendedDnsRecord[];
}

export interface DomainCheckResult {
  id: string;
  status: DomainStatus;
  verifiedAt: string | null;
}

// --- Domaines : diagnostic DNS (GET /v1/domains/:id/dns-check) ------------

export type DnsRecordCheckStatus = "ok" | "introuvable" | "valeur_differente";

/** Erreurs DNS classiques nommées par le backend, DKIM uniquement. */
export type DkimDnsDiagnostic =
  | "proxy_cloudflare"
  | "domaine_duplique"
  | "cname_aplati";

export interface DkimDnsRecordCheck {
  token: string;
  /** Nom interrogé : `<token>._domainkey.<domaine>`. */
  name: string;
  status: DnsRecordCheckStatus;
  attendu: string;
  trouve: string | null;
  ttl: number | null;
  diagnostic?: DkimDnsDiagnostic;
  /** Explication en français du diagnostic ciblé, fournie par le backend. */
  message?: string;
}

/** Vérification SPF ou DMARC (enregistrement TXT). */
export interface TxtDnsRecordCheck {
  name: string;
  status: DnsRecordCheckStatus;
  attendu: string;
  trouve: string | null;
  ttl: number | null;
}

export interface DomainDnsCheckResult {
  domainId: string;
  domainName: string;
  checkedAt: string;
  /**
   * Dernier statut connu côté SES (aucun appel SES déclenché par cet
   * endpoint) — sert à distinguer « enregistrements corrects, en attente de
   * la validation d'Amazon » d'un véritable écart : les deux peuvent
   * diverger légitimement le temps qu'AWS refasse son propre contrôle.
   */
  sesStatus: DomainStatus;
  dkim: DkimDnsRecordCheck[];
  spf: TxtDnsRecordCheck;
  dmarc: TxtDnsRecordCheck;
}

// --- Journal des envois ---------------------------------------------------

export type EmailStatus =
  | "QUEUED"
  | "SENT"
  | "DELIVERED"
  | "BOUNCED"
  | "COMPLAINED"
  | "REJECTED"
  | "FAILED"
  | "SUPPRESSED";

export interface EmailListItem {
  publicId: string;
  fromAddress: string;
  toAddress: string;
  subject: string;
  status: EmailStatus;
  queuedAt: string;
  sentAt: string | null;
  deliveredAt: string | null;
  lastEventAt: string | null;
}

export interface EmailDetail extends EmailListItem {
  errorMessage: string | null;
  sesMessageId: string | null;
}

export interface PaginatedEmails {
  items: EmailListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- Réputation -----------------------------------------------------------

export type ReputationVerdict = "OK" | "WARNING" | "SUSPEND";

export interface ReputationOverview {
  sent: number;
  bounces: number;
  hardBounces: number;
  transientBounces: number;
  complaints: number;
  bounceRate: number;
  complaintRate: number;
  verdict: ReputationVerdict;
  dailySendLimit: number;
  status: UserStatus;
}

// --- Facturation ------------------------------------------------------------

/**
 * Solde de crédits : `totalPurchased` = crédits payés (recharges TOPUP) ;
 * `totalGifted` = crédits offerts (bienvenue, crédits accordés à la main
 * par un administrateur), jamais encaissés. Identité :
 * `balance === totalPurchased + totalGifted - totalConsumed`.
 */
export interface BalanceSummary {
  balance: number;
  totalPurchased: number;
  totalGifted: number;
  totalConsumed: number;
}

// --- Admin : recharges Mobile Money ----------------------------------------

export type TopUpStatus = "PENDING" | "APPROVED" | "REJECTED";
export type TopUpMethod = "ORANGE_MONEY" | "MTN_MOMO";

export interface AdminTopUpRequestUser {
  id: string;
  email: string;
  name: string;
}

export interface AdminTopUpRequestItem {
  id: string;
  user: AdminTopUpRequestUser;
  packId: string;
  credits: number;
  amountGnf: number;
  method: TopUpMethod;
  phoneNumber: string;
  transactionRef: string;
  status: TopUpStatus;
  createdAt: string;
}

export interface AdminTopUpRequestReviewResult {
  id: string;
  status: TopUpStatus;
}

// --- Admin : comptes clients ------------------------------------------------

export type AdminAccountRole = "CUSTOMER" | "ADMIN";
export type AdminAccountStatus = "ACTIVE" | "SUSPENDED";

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  company: string | null;
  role: AdminAccountRole;
  status: AdminAccountStatus;
  dailySendLimit: number;
  createdAt: string;
  suspendedAt: string | null;
  creditBalance: number;
  emailsSent30d: number;
}

export interface PaginatedAdminUsers {
  items: AdminUserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type AdminActionType =
  | "SUSPEND_USER"
  | "REACTIVATE_USER"
  | "ADJUST_QUOTA"
  | "GRANT_CREDITS"
  | "PROMOTE_ADMIN"
  | "DEMOTE_ADMIN"
  | "APPROVE_TOPUP"
  | "REJECT_TOPUP";

export interface AdminActionItem {
  id: string;
  type: AdminActionType;
  reason: string | null;
  details: unknown;
  createdAt: string;
  admin: { id: string; email: string; name: string };
}

/** Détail d'un compte : la ligne de liste, enrichie du contexte du dossier. */
export interface AdminUserDetail extends AdminUserListItem {
  suspensionReason: string | null;
  reputationResetAt: string | null;
  declaredUsage: string | null;
  domainsCount: number;
  verifiedDomainsCount: number;
  activeApiKeysCount: number;
  recentActions: AdminActionItem[];
}

/** Réponse commune à `.../suspend` et `.../reactivate`. */
export interface AdminUserActionResult {
  id: string;
  status: AdminAccountStatus;
  suspendedAt: string | null;
  suspensionReason: string | null;
  reputationResetAt: string | null;
  actionId: string;
}

export interface AdminQuotaResult {
  id: string;
  dailySendLimit: number;
  previousDailySendLimit: number;
  actionId: string;
}

export interface AdminCreditResult {
  id: string;
  delta: number;
  creditBalance: number;
  actionId: string;
}
