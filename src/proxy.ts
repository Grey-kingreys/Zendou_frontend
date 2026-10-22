import { NextResponse, type NextRequest } from "next/server";

/**
 * Garde de session cote serveur pour les zones privees (`/dashboard/*`,
 * `/admin/*`) et pour l'ecran de confirmation d'email. Convention Next 16 :
 * `src/proxy.ts` avec une fonction exportee `proxy` (l'ancien
 * `middleware.ts` est deprecie, voir node_modules/next/dist/docs/01-app/
 * 03-api-reference/03-file-conventions/proxy.md).
 *
 * PREREQUIS BACKEND : le cookie `zendou_session` n'est lisible ici que si
 * l'API le pose sur le domaine parent (`Domain=zendou.app`). Pose sans
 * attribut `Domain`, il reste attache a `api.zendou.app` et n'est jamais
 * envoye a `zendou.app` : le proxy le verrait toujours absent et renverrait
 * tout le monde vers /connexion. C'est l'objet de `SESSION_COOKIE_DOMAIN`
 * cote backend (lot D). En developpement le probleme ne se pose pas :
 * front et API partagent l'hote `localhost`.
 *
 * POLITIQUE DE PANNE : fail-open. Erreur reseau, delai depasse, 5xx ou JSON
 * illisible laissent passer la requete. Une panne de l'API ne doit pas se
 * transformer en deconnexion generale, et la coquille servie ne contient
 * aucune donnee privee : tout le contenu du tableau de bord vient d'appels
 * API authentifies, qui echoueront proprement de leur cote.
 *
 * PREMIERE LIGNE, PAS LA SEULE : la garde client de `DashboardLayoutClient`
 * (et `AdminLayoutClient`) reste en place. C'est elle qui traite les cas que
 * ce proxy laisse volontairement passer (compte suspendu, email non
 * confirme, panne de l'API). La vraie barriere, elle, est cote backend sur
 * les routes `/v1/*`.
 */
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/confirmez-votre-email"],
};

const SESSION_COOKIE_NAME = "zendou_session";

/**
 * Appel serveur a serveur : `API_INTERNAL_URL` permet de viser l'API par son
 * nom de service dans le reseau Docker (Dokploy) sans repasser par Internet.
 * Lu a l'execution, jamais inline au build, contrairement a
 * `NEXT_PUBLIC_API_URL`.
 */
function apiBaseUrl(): string {
  return (
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000"
  );
}

/**
 * Toute reponse produite par ce proxy, redirections comprises, doit etre
 * incacheable : une redirection 307 vers /connexion mise en cache par un CDN
 * serait ensuite servie a un utilisateur connecte.
 */
function noStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 303 pour un POST natif (formulaire soumis avant hydratation) : le
  // navigateur refait un GET et ne renvoie pas le corps a la destination.
  const redirectStatus =
    request.method === "GET" || request.method === "HEAD" ? 307 : 303;

  const loginRedirect = () =>
    noStore(
      NextResponse.redirect(
        new URL(
          `/connexion?next=${encodeURIComponent(pathname + search)}`,
          request.url
        ),
        redirectStatus
      )
    );

  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!session) {
    return loginRedirect();
  }

  try {
    const response = await fetch(`${apiBaseUrl()}/v1/auth/me`, {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${session}` },
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });

    if (response.status === 401) {
      // Session absente, expiree ou revoquee.
      return loginRedirect();
    }

    if (response.status === 403) {
      // Compte suspendu : laisser passer, la garde client affiche la branche
      // dediee. Rediriger ici creerait une boucle vers /connexion, ou la
      // session reste valide.
      return noStore(NextResponse.next());
    }

    if (!response.ok) {
      // 5xx ou statut inattendu : fail-open.
      return noStore(NextResponse.next());
    }

    if (pathname.startsWith("/admin")) {
      const me = (await response.json()) as { role?: string };
      if (me.role !== "ADMIN") {
        return noStore(
          NextResponse.redirect(new URL("/dashboard", request.url), redirectStatus)
        );
      }
    }

    return noStore(NextResponse.next());
  } catch (error) {
    // Erreur reseau, delai de 2 s depasse ou JSON illisible : fail-open.
    // Jamais la valeur du cookie dans le journal.
    console.warn(
      `[proxy] validation de session impossible pour ${pathname}, requete laissee passer:`,
      error instanceof Error ? error.message : error
    );
    return noStore(NextResponse.next());
  }
}
