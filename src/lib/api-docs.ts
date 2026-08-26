/**
 * Constantes de l'hôte API public documenté aux clients (bug prod F6 —
 * l'ancien hôte documenté (TLD `.dev`) ne résolvait pas, la doc annonçait un
 * nom mort).
 *
 * ⚠️ Volontairement figées et NON dérivées de `process.env.NEXT_PUBLIC_API_URL` :
 * cette variable vaut `http://localhost:4000` en développement, ce qui
 * afficherait une URL locale dans la documentation publique. La doc doit
 * toujours pointer vers l'hôte de production, quel que soit l'environnement
 * de build du site.
 *
 * Regroupées ici pour que `/docs`, `/docs/envoyer-un-email`,
 * `/docs/facturation` et la section d'intégration de la landing partagent
 * une source unique plutôt que des littéraux dupliqués qui finissent par
 * diverger.
 */

/** Nom d'hôte public de l'API Zendou en production. */
export const API_HOST = "api.zendou.app";

/** URL de base de l'API (sans version). */
export const API_BASE_URL = `https://${API_HOST}`;

/** URL de base de l'API, préfixe de version `/v1` inclus. */
export const API_V1_BASE_URL = `${API_BASE_URL}/v1`;
