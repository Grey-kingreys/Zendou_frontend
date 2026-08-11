export type BadgeColor = "green" | "orange" | "red" | "gray" | "blue";

const COLOR_CLASSES: Record<BadgeColor, string> = {
  green: "border-[#35D07F]/25 bg-[#35D07F]/10 text-[#35D07F]",
  orange: "border-[#F5A623]/25 bg-[#F5A623]/10 text-[#F5A623]",
  red: "border-[#E5484D]/30 bg-[#E5484D]/10 text-[#FF9592]",
  gray: "border-white/[0.12] bg-white/[0.05] text-[#9BA1A8]",
  blue: "border-[#5B7CFA]/30 bg-[#5B7CFA]/10 text-[#8AA4FF]",
};

export default function Badge({
  color,
  label,
}: {
  color: BadgeColor;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[12px] font-medium whitespace-nowrap ${COLOR_CLASSES[color]}`}
    >
      {label}
    </span>
  );
}
