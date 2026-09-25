// Destinations autorisees apres connexion. Le proxy (src/proxy.ts) renvoie
// vers /connexion avec `?next=<chemin prive demande>` ; tout le reste est
// ignore. Partage entre /connexion, /inscription et le bouton "Continuer
// avec Google" (meme regle partout, pas de logique dupliquee qui pourrait
// diverger).
export const NEXT_PATH_PREFIXES = ["/dashboard", "/admin", "/confirmez-votre-email"];

/**
 * Resout le parametre `next` en chemin de redirection sur. Une liste blanche
 * de prefixes evite la redirection ouverte : un `next` fourni par un tiers ne
 * peut pas envoyer ailleurs que dans les zones privees du site. `//hote` et
 * `/\hote` sont rejetes explicitement car les navigateurs les traitent comme
 * des URL absolues malgre le `/` initial.
 */
export function resolveNextPath(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/dashboard";
  return NEXT_PATH_PREFIXES.some((prefix) => raw.startsWith(prefix))
    ? raw
    : "/dashboard";
}
