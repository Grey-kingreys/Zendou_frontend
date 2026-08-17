import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sortie autonome pour l'image Docker (voir Dockerfile) : produit
  // .next/standalone avec un serveur node minimal + les dépendances tracées,
  // sans avoir besoin de node_modules complet à l'exécution.
  output: "standalone",

  // Migration de domaine : zendou.kingreys.fr -> zendou.app.
  // Redirection permanente en préservant le chemin et la query string.
  // Ne concerne pas api.zendou.kingreys.fr (autre service, autre host).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "zendou.kingreys.fr" }],
        destination: "https://zendou.app/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
