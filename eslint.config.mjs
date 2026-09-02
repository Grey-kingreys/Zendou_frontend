import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The landing page intentionally uses href="#" as a placeholder for
      // pages that don't exist yet (per design spec). Keep the a11y checks
      // for missing hrefs / click-only anchors, just not this one.
      "jsx-a11y/anchor-is-valid": [
        "error",
        { aspects: ["noHref", "preferButton"] },
      ],
      // Garde anti-XSS : tout `dangerouslySetInnerHTML` doit etre justifie
      // par un commentaire de desactivation ligne a ligne, jamais glisse
      // dans un composant au fil d'une revue. Le seul usage legitime
      // aujourd'hui est le JSON-LD statique de la landing (src/app/page.tsx).
      // La regle vient d'eslint-plugin-react, fourni par eslint-config-next.
      "react/no-danger": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
