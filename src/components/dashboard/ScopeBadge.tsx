import type { CredentialScopeFields } from "@/lib/types";

const MAX_VISIBLE_DOMAINS = 2;

const CHIP_BASE =
  "inline-flex max-w-full items-center rounded-full border px-2.5 py-[3px] text-[12px] font-medium";

/**
 * Badge de portée d'une clé API ou d'un identifiant SMTP (B27) : « Tous les
 * domaines » ou les noms des domaines choisis, abrégés en « + N » au-delà de
 * deux. Un ancien backend ne renvoie pas `domainScope` : on lit alors « Tous
 * les domaines », qui était le comportement avant la vague 22.
 */
export default function ScopeBadge({
  domainScope,
  domains,
}: CredentialScopeFields) {
  if (domainScope !== "SELECTED") {
    return (
      <span
        className={`${CHIP_BASE} border-white/[0.12] bg-white/[0.05] whitespace-nowrap text-[#9BA1A8]`}
      >
        Tous les domaines
      </span>
    );
  }

  const list = domains ?? [];
  if (list.length === 0) {
    return (
      <span
        className={`${CHIP_BASE} border-white/[0.12] bg-white/[0.05] whitespace-nowrap text-[#9BA1A8]`}
      >
        Aucun domaine
      </span>
    );
  }

  const visible = list.slice(0, MAX_VISIBLE_DOMAINS);
  const hidden = list.slice(MAX_VISIBLE_DOMAINS);

  return (
    <span className="flex min-w-0 max-w-full flex-wrap gap-1">
      {visible.map((domain) => (
        <span
          key={domain.id}
          title={domain.name}
          className={`${CHIP_BASE} border-[#5B7CFA]/30 bg-[#5B7CFA]/10 text-[#8AA4FF]`}
        >
          <span className="truncate font-mono">{domain.name}</span>
        </span>
      ))}
      {hidden.length > 0 && (
        <span
          title={hidden.map((domain) => domain.name).join(", ")}
          className={`${CHIP_BASE} border-white/[0.12] bg-white/[0.05] whitespace-nowrap text-[#9BA1A8]`}
        >
          + {hidden.length}
        </span>
      )}
    </span>
  );
}
