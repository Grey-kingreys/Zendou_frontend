import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  // Base des URL absolues pour toute metadata qui en a besoin (canonical,
  // og:image, sitemap...) — sans elle, ces champs restent relatifs et sont
  // inexploitables par les robots et les aperçus de partage (WhatsApp,
  // Twitter/X). Voir src/lib/site.ts pour la source de NEXT_PUBLIC_SITE_URL
  // et son repli.
  metadataBase: new URL(SITE_URL),
  title: "Zendou — L'email transactionnel à la bonne taille",
  description:
    "Zendou est l'infrastructure d'email transactionnel pensée pour les équipes ouest-africaines : une API simple, une délivrabilité tenue, et un paiement en Orange Money ou MTN MoMo avec facturation en GNF.",
  // Pas de `title`/`description` explicites ici : Next.js les reprend
  // automatiquement du `title`/`description` résolu de chaque page si le
  // segment ne définit pas son propre openGraph (vérifié dans
  // node_modules/next/dist/lib/metadata/resolve-metadata.js,
  // postProcessMetadata). Chaque page garde donc son propre titre/résumé
  // dans les aperçus de partage, sans avoir à le dupliquer partout.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "fr_FR",
  },
  // Next.js réutilise automatiquement le titre/description/image d'openGraph
  // pour Twitter tant que `twitter` ne les redéfinit pas explicitement (même
  // fichier) — ne garder ici que ce qui est spécifique à Twitter.
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
