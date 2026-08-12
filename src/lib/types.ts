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

export interface BalanceSummary {
  balance: number;
  totalPurchased: number;
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
