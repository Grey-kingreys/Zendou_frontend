import type { Metadata } from "next";
import DocsHeader from "@/components/docs/DocsHeader";
import DocsSidebar from "@/components/docs/DocsSidebar";
import DocsMobileNav from "@/components/docs/DocsMobileNav";

export const metadata: Metadata = {
  title: "Documentation — Zendou",
  description:
    "Documentation développeur de l'API Zendou : envoi d'emails, vérification de domaine, clés API, erreurs et facturation.",
};

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="min-h-screen bg-[#08090A]">
      <DocsHeader />
      <div className="mx-auto flex max-w-[1240px]">
        <DocsSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DocsMobileNav />
          <main className="min-w-0 flex-1 px-6 py-10 sm:px-8 sm:py-12">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
