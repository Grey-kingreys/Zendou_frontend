/**
 * Constantes du relais SMTP entrant de Zendou (chantier B6 — voir
 * `docs/plans/B6-RELAIS-SMTP.md` §1.2 pour les ports et §4.5/§4.7 pour les
 * limites). Regroupées ici pour que l'écran `/dashboard/smtp` (S12) et la
 * future doc client `/docs/relais-smtp` (S13, agent séparé) partagent la
 * même source plutôt que deux copies qui finissent par diverger.
 *
 * Le port 25 n'apparaît jamais ici : c'est du transit MX, pas de la
 * soumission, et il est explicitement refusé côté serveur (décision A6).
 */

/** Nom d'hôte annoncé au client — décision porteur B1 du 19/08/2026. */
export const SMTP_RELAY_HOST = "smtp.zendou.app";

export interface SmtpPort {
  /** Numéro de port. */
  port: number;
  /** Mode de chiffrement annoncé sur ce port. */
  mode: "STARTTLS" | "TLS implicite";
  /** Précision affichée sous ce port, le cas échéant. */
  note?: string;
}

/** Port principal, recommandé par défaut à tous les clients SMTP courants (WP Mail SMTP, PHPMailer, Nodemailer…). */
export const SMTP_PRIMARY_PORT: SmtpPort = {
  port: 587,
  mode: "STARTTLS",
};

/** Ports alternatifs — à proposer seulement si le port principal est bloqué par l'hébergeur du client. */
export const SMTP_ALTERNATE_PORTS: SmtpPort[] = [
  { port: 465, mode: "TLS implicite" },
  {
    port: 2525,
    mode: "STARTTLS",
    note: "si votre hébergeur bloque les autres",
  },
];

/**
 * Limites du canal SMTP (plan §4.5/§4.7, décisions A14/B4) : un crédit est
 * débité par destinataire (éventail multi-destinataires plafonné), et la
 * taille maximale couvre le message MIME brut en entier — pièces jointes
 * comprises, pas seulement le corps.
 */
export const SMTP_LIMITS = {
  creditsPerRecipient: 1,
  maxRecipients: 10,
  maxMessageSizeLabel: "10 Mo",
} as const;
