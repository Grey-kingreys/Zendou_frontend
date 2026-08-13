import { ImageResponse } from "next/og";

/**
 * Image de partage générée par le code (convention `opengraph-image`, voir
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/
 * 01-metadata/opengraph-image.md). Statiquement optimisée au build (pas de
 * fetch réseau ni de police externe ici, donc rien ne dépend de l'accès
 * réseau au moment de `next build`).
 *
 * Un seul fichier à la racine de `app/` : la convention Next.js le fait
 * s'appliquer par défaut à **toutes** les routes qui n'ont pas leur propre
 * `opengraph-image` (aucune autre n'est définie dans ce projet), donc à la
 * landing comme aux 6 pages /docs. Next.js réutilise cette même image pour
 * Twitter/X tant qu'aucun `twitter-image` ni `twitter.images` n'est défini
 * (comportement vérifié dans resolve-metadata.js, postProcessMetadata).
 */
export const alt =
  "Zendou — l'email transactionnel à la bonne taille pour les équipes ouest-africaines";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px 84px",
          backgroundColor: "#08090A",
          backgroundImage:
            "linear-gradient(135deg, rgba(91,124,250,0.16) 0%, rgba(8,9,10,0) 55%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 22,
            letterSpacing: 2,
            color: "#8AA4FF",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 12,
              height: 12,
              borderRadius: 999,
              backgroundColor: "#35D07F",
            }}
          />
          EMAIL TRANSACTIONNEL — AFRIQUE DE L&apos;OUEST
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 108,
              fontWeight: 700,
              color: "#F7F9FF",
              letterSpacing: -3,
            }}
          >
            Zendou
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: 36,
              fontWeight: 500,
              color: "#EDEEF0",
            }}
          >
            {"L'email transactionnel, "}
            <span style={{ color: "#5B7CFA", marginLeft: 12 }}>
              à la bonne taille.
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#9BA1A8",
          }}
        >
          <div style={{ display: "flex" }}>
            OTP · Reçus · Notifications — API + relais SMTP
          </div>
          <div style={{ display: "flex", color: "#5B7CFA" }}>
            zendou.kingreys.fr
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
