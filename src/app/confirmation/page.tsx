import type { Metadata } from "next";
import ConfirmationView from "./ConfirmationView";

export const metadata: Metadata = {
  title: "Confirmation d'adresse email — Zendou",
};

/**
 * Server Component : lit `token` via le prop `searchParams` (promesse en
 * Next 16, voir node_modules/next/dist/docs/01-app/03-api-reference/
 * 03-file-conventions/page.md) plutôt que le hook client `useSearchParams`,
 * pour éviter d'avoir à envelopper la page dans un `<Suspense>` juste pour
 * satisfaire le bailout CSR au build — la logique interactive vit dans
 * ConfirmationView, un Client Component qui reçoit le jeton en prop.
 */
export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  const resolvedToken = Array.isArray(token) ? token[0] : token;

  return <ConfirmationView token={resolvedToken ?? null} />;
}
