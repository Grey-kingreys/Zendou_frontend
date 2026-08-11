import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sortie autonome pour l'image Docker (voir Dockerfile) : produit
  // .next/standalone avec un serveur node minimal + les dépendances tracées,
  // sans avoir besoin de node_modules complet à l'exécution.
  output: "standalone",
};

export default nextConfig;
