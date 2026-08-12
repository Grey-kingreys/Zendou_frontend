import ResendConfirmationControl from "@/components/confirmation/ResendConfirmationControl";

/**
 * Affiché tant que `user.emailVerifiedAt` est `null` (voir DashboardLayout).
 * Rappel doux plutôt qu'un blocage : l'envoi et la création de clés API
 * renvoient 403 côté API tant que le compte n'est pas confirmé (voir les
 * messages dédiés sur ces écrans), ce bandeau donne le moyen d'agir.
 */
export default function UnconfirmedEmailBanner() {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#F5A623]/30 bg-[#F5A623]/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="mb-1 text-[14px] font-medium text-[#EDEEF0]">
          Confirmez votre adresse email
        </p>
        <p className="text-[13px] leading-relaxed text-[#C5CACF] text-pretty">
          Tant qu&rsquo;elle n&rsquo;est pas confirmée, l&rsquo;envoi
          d&rsquo;emails et la création de clés API restent bloqués.
        </p>
      </div>
      <ResendConfirmationControl />
    </div>
  );
}
