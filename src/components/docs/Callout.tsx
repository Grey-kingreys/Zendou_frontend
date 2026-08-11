import type { ReactNode } from "react";

const VARIANT_CLASSES = {
  info: "border-[#5B7CFA]/30 bg-[#5B7CFA]/10 text-[#C5CACF]",
  warning: "border-[#F5A623]/30 bg-[#F5A623]/10 text-[#F5C177]",
  success: "border-[#35D07F]/30 bg-[#35D07F]/10 text-[#8CE6B4]",
  danger: "border-[#E5484D]/30 bg-[#E5484D]/10 text-[#FF9592]",
} as const;

/** Encadré d'avertissement/conseil, décliné en 4 variantes de couleur. */
export default function Callout({
  variant = "info",
  title,
  children,
}: {
  variant?: keyof typeof VARIANT_CLASSES;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3.5 text-[13.5px] leading-relaxed ${VARIANT_CLASSES[variant]}`}
    >
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <div className="text-pretty [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </div>
    </div>
  );
}
