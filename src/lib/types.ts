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
  /**
   * Adresse d'expédition du mode bac à sable (`TEST_EMAIL_FROM` côté
   * serveur, vague B20) : permet d'envoyer immédiatement, sans domaine
   * vérifié, tant que le destinataire est l'adresse email de ce même
   * compte. `null` quand le mode n'est pas configuré côté serveur.
   *
   * ⚠️ Champ demandé au backend, pas encore renvoyé par `GET`/`PATCH
   * /v1/auth/me` au moment de l'écriture de ce commentaire (vague 11b) :
   * en son absence le champ vaut simplement `undefined` ici, et toute l'UI
   * qui en dépend se masque proprement plutôt que d'afficher une adresse
   * devinée - voir /dashboard/cles-api. Ne jamais construire cette adresse
   * côté client, même partiellement.
   */
  testSenderAddress?: string | null;
  /**
   * Connexion Google (vague B30, contrat figé `docs/plans/ACTIVE.md`) :
   * `hasPassword` distingue un compte avec mot de passe d'un compte créé (ou
   * rattaché) uniquement via Google, `googleLinked` indique qu'un compte
   * Google est associé. Optionnels pour tolérer un backend pas encore
   * déployé avec ces champs : absents, `/dashboard/profil` traite le compte
   * comme ayant un mot de passe et sans Google associé, jamais de plantage.
   */
  hasPassword?: boolean;
  googleLinked?: boolean;
}

/** Réponse de GET /v1/auth/providers (public, sans session), vague B30. */
export interface AuthProvidersResponse {
  google?: boolean;
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
  /** Jeton Cloudflare Turnstile - envoyé uniquement si le widget est actif (voir /inscription). */
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

// --- Identifiants SMTP (relais entrant, B6) --------------------------------

/**
 * Élément de la liste des identifiants SMTP d'un utilisateur - jamais le
 * secret ni son hash. Contrairement à `RotateSmtpCredentialResponse`, cette
 * forme ne porte pas `rotatedAt` : le backend (`SmtpCredentialsService.
 * findAllForUser`) ne le sélectionne pas, exactement comme `ApiKeySummary`
 * ne porte pas non plus de trace de rotation dans la liste.
 */
export interface SmtpCredentialSummary {
  id: string;
  name: string;
  /** Nom d'utilisateur opaque et généré (ex. `zdu_…`), en clair - pas l'adresse email du compte. */
  username: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

/** Réponse à la création : `password` (`zd_smtp_…`, mot de passe complet) n'apparaît qu'ici. */
export interface CreateSmtpCredentialResponse {
  id: string;
  name: string;
  username: string;
  prefix: string;
  password: string;
  createdAt: string;
}

/**
 * Réponse à la rotation d'un identifiant SMTP : `id`, `name`, `username` et
 * `createdAt` sont inchangés par rapport à l'identifiant d'origine ; `prefix`
 * et `password` (mot de passe complet, n'apparaît qu'ici) sont nouveaux.
 * `rotatedAt` trace le geste.
 */
export interface RotateSmtpCredentialResponse {
  id: string;
  name: string;
  username: string;
  prefix: string;
  password: string;
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
  type: "CNAME" | "TXT" | "MX";
  name: string;
  value: string;
  /** Priorité, pour un enregistrement MX seulement. */
  priority?: number;
}

export interface RecommendedDnsRecord extends DnsRecord {
  purpose: "MX" | "SPF" | "DMARC";
  note: string;
}

/** `MailFromDomainStatus` d'Amazon SES. */
export type MailFromStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "TEMPORARY_FAILURE";

export interface DomainDetail extends DomainSummary {
  /** Domaine MAIL FROM personnalisé : `bounce.<domaine>`. */
  mailFromDomain?: string;
  /** Dernier statut MAIL FROM connu de SES, `null` avant le premier rafraîchissement. */
  mailFromStatus?: MailFromStatus | null;
  dkimRecords: DnsRecord[];
  recommendedRecords: RecommendedDnsRecord[];
}

export interface DomainCheckResult {
  id: string;
  status: DomainStatus;
  verifiedAt: string | null;
  mailFromStatus?: MailFromStatus | null;
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

/** Vérification du MX du MAIL FROM (`<priorité> <hôte>` attendu). */
export interface MxDnsRecordCheck {
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
   * endpoint) - sert à distinguer « enregistrements corrects, en attente de
   * la validation d'Amazon » d'un véritable écart : les deux peuvent
   * diverger légitimement le temps qu'AWS refasse son propre contrôle.
   */
  sesStatus: DomainStatus;
  /** Dernier `MailFromDomainStatus` connu de SES, `null` si jamais lu. */
  mailFromStatus?: MailFromStatus | null;
  dkim: DkimDnsRecordCheck[];
  /** MX du MAIL FROM personnalisé, sur `bounce.<domaine>`. */
  mailFromMx?: MxDnsRecordCheck;
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

/** Point d'entrée par lequel l'envoi est arrivé (chantier B6 - relais SMTP entrant). */
export type EmailChannel = "API" | "SMTP";

export interface EmailListItem {
  publicId: string;
  fromAddress: string;
  toAddress: string;
  subject: string;
  status: EmailStatus;
  channel: EmailChannel;
  queuedAt: string;
  sentAt: string | null;
  deliveredAt: string | null;
  lastEventAt: string | null;
}

export interface EmailDetail extends EmailListItem {
  errorMessage: string | null;
  sesMessageId: string | null;
  /**
   * Identifiant SMTP ayant expédié cet envoi - `null` pour le canal API, ou
   * pour un envoi SMTP dont l'identifiant a depuis été révoqué/supprimé.
   */
  smtpCredentialId: string | null;
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

// --- Facturation : recharge côté client (B22-B) ----------------------------

/** Pack de crédits du catalogue (GET /v1/billing/packs). */
export interface CreditPack {
  id: string;
  label: string;
  credits: number;
  amountGnf: number;
  /** Un pack non achetable est seulement informatif (ex. offre découverte). */
  purchasable: boolean;
}

/** Ligne du ledger de crédits (GET /v1/billing/entries). */
export interface CreditEntryItem {
  delta: number;
  reason: string;
  reference: string | null;
  createdAt: string;
}

export interface PaginatedCreditEntries {
  items: CreditEntryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Demande de recharge telle qu'exposée au client qui l'a créée. */
export interface TopUpRequestItem {
  id: string;
  packId: string;
  credits: number;
  amountGnf: number;
  method: TopUpMethod;
  phoneNumber: string;
  transactionRef: string;
  status: TopUpStatus;
  rejectionReason: string | null;
  createdAt: string;
}

/**
 * Coordonnées de paiement Mobile Money Zendou pour une méthode configurée
 * (GET /v1/billing/payment-methods). Seules les méthodes réellement
 * configurées sont renvoyées : un tableau vide signifie qu'aucun
 * encaissement Mobile Money n'est possible aujourd'hui.
 */
export interface PaymentMethodItem {
  method: TopUpMethod;
  label: string;
  number: string;
  accountName: string | null;
}

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
  /**
   * Date d'anonymisation (ANON-1), `null` pour un compte qui ne l'est pas.
   * Optionnel pour tolérer un backend pas encore déployé avec ce champ :
   * absent, l'écran admin traite le compte comme non anonymisé.
   */
  anonymizedAt?: string | null;
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
  | "REJECT_TOPUP"
  | "ANONYMIZE_USER";

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

/**
 * Réponse de `POST /v1/admin/users/:id/anonymize` (ANON-1).
 * `remainingActions` : ce qui n'a pas pu être fait hors de la base (identité
 * SES non détruite, sessions non révoquées), en français, à faire à la main.
 * Vide quand tout est fait.
 */
export interface AdminUserAnonymizeResult {
  anonymizedAt: string;
  remainingActions: string[];
}

// --- Admin : statistiques plateforme (GET /v1/admin/stats/emails) ---------

/**
 * Compteur ventilé système/client. `all` est toujours `system + client` -
 * jamais un troisième chiffre calculé indépendamment côté backend.
 */
export interface AdminPlatformCounts {
  all: number;
  system: number;
  client: number;
}

/**
 * Répartition du total **plateforme** (système inclus) par statut, sur
 * toute l'histoire. Les 8 valeurs de `EmailStatus` sont toujours présentes,
 * même à zéro.
 */
export type AdminStatusBreakdown = Record<EmailStatus, number>;

export interface AdminEmailStats {
  total: AdminPlatformCounts;
  today: AdminPlatformCounts;
  last7d: AdminPlatformCounts;
  last30d: AdminPlatformCounts;
  byStatus: AdminStatusBreakdown;
  generatedAt: string;
}
