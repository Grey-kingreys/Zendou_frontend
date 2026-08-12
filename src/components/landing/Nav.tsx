"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Nav de la landing. En dessous de `md`, les 4 liens centraux (Produit,
 * Documentation, Tarifs, Changelog) n'ont plus de place dans la barre : ils
 * passent dans un panneau repliable ouvert par un bouton hamburger, seul
 * menu mobile de la page (les trois autres — dashboard/docs/admin — sont des
 * bandeaux non repliables adaptés à une sidebar, pattern qui ne marche pas
 * pour une barre de nav horizontale déjà pleine). « Créer un compte » reste
 * dans la barre, visible sans ouvrir le menu : c'est l'action principale de
 * la page. « Connexion » rejoint le panneau, en plus du bouton.
 */
export default function Nav() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <nav className="relative mx-auto max-w-[1240px] px-6 py-5 sm:px-8 sm:py-[26px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-[linear-gradient(150deg,#8AA4FF,#3D5CE8)] font-heading text-sm font-bold text-[#0B0B0C]">
            Z
          </div>
          <span className="font-heading text-lg font-semibold tracking-[-0.02em]">
            Zendou
          </span>
        </div>

        <div className="hidden items-center gap-7 text-sm text-[#9BA1A8] md:flex">
          <Link href="#fonctionnalites" className="text-[#9BA1A8]">
            Produit
          </Link>
          <Link href="/docs" className="text-[#9BA1A8]">
            Documentation
          </Link>
          <Link href="#tarifs" className="text-[#9BA1A8]">
            Tarifs
          </Link>
          <a href="#" className="text-[#9BA1A8]">
            Changelog
          </a>
        </div>

        <div className="flex items-center gap-1 text-sm sm:gap-3 md:gap-4">
          <Link href="/connexion" className="hidden text-[#9BA1A8] md:inline">
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="rounded-lg bg-[#F2F3F4] px-2.5 py-[9px] font-semibold text-[#0B0B0C] sm:px-4"
          >
            Créer un compte
          </Link>
          <button
            type="button"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="landing-mobile-menu"
            onClick={() => setOpen((prev) => !prev)}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-white/[0.10] text-[#EDEEF0] md:hidden"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              {open ? (
                <path
                  d="M4 4L14 14M14 4L4 14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M2.5 5H15.5M2.5 9H15.5M2.5 13H15.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="landing-mobile-menu"
          className="mt-4 flex flex-col gap-1 border-t border-white/[0.06] pt-4 md:hidden"
        >
          <Link
            href="#fonctionnalites"
            onClick={closeMenu}
            className="rounded-lg px-3 py-2.5 text-[15px] text-[#EDEEF0]"
          >
            Produit
          </Link>
          <Link
            href="/docs"
            onClick={closeMenu}
            className="rounded-lg px-3 py-2.5 text-[15px] text-[#EDEEF0]"
          >
            Documentation
          </Link>
          <Link
            href="#tarifs"
            onClick={closeMenu}
            className="rounded-lg px-3 py-2.5 text-[15px] text-[#EDEEF0]"
          >
            Tarifs
          </Link>
          {/* Placeholder assumé du design (href="#") : pas de onClick, sinon
              eslint-plugin-jsx-a11y (anchor-is-valid) le traite comme un
              bouton déguisé — cf. Défaut 1 du plan, ne pas lui inventer de
              destination ni de comportement. */}
          <a
            href="#"
            className="rounded-lg px-3 py-2.5 text-[15px] text-[#EDEEF0]"
          >
            Changelog
          </a>
          <div className="my-1 h-px bg-white/[0.06]" />
          <Link
            href="/connexion"
            onClick={closeMenu}
            className="rounded-lg px-3 py-2.5 text-[15px] text-[#9BA1A8]"
          >
            Connexion
          </Link>
        </div>
      )}
    </nav>
  );
}
