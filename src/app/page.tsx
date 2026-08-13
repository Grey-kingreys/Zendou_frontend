import type { Metadata } from "next";
import Hero from "@/components/landing/Hero";
import IntegrationSection from "@/components/landing/IntegrationSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Canonical propre à la landing : volontairement absent du layout racine
// pour ne pas être hérité tel quel par les pages qui n'en définissent pas
// (voir src/app/docs/*/page.tsx pour le même principe appliqué à /docs).
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// JSON-LD (Organization + SoftwareApplication), motif recommandé par
// Next.js (node_modules/next/dist/docs/01-app/02-guides/json-ld.md) : un
// <script type="application/ld+json"> rendu dans la page elle-même. Pas de
// `logo` sur l'Organization : aucun asset de marque n'existe encore dans
// `public/` (seuls les SVG par défaut du template Next.js y sont présents),
// et publier une URL de logo qui ne pointe vers rien serait une donnée
// structurée trompeuse.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      description:
        "Infrastructure d'email transactionnel pour les équipes ouest-africaines : API, relais SMTP, paiement Orange Money et MTN MoMo.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Conakry",
        addressCountry: "GN",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "API d'envoi d'email transactionnel (OTP, reçus, notifications) pour les équipes ouest-africaines, avec facturation en franc guinéen (GNF).",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "GNF",
        description:
          "Forfait Découverte : 1 000 emails offerts, sans carte bancaire internationale.",
      },
    },
  ],
};

export default function Home() {
  return (
    <div className="bg-[#08090A]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      <IntegrationSection />
      <FeaturesSection />
      <PricingSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
