export default function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.13] bg-white/[0.015] px-8 py-16 text-center">
      <h1 className="mb-2 font-heading text-2xl font-semibold text-[#EDEEF0]">
        {title}
      </h1>
      <p className="mb-4 text-sm font-medium text-[#8AA4FF]">
        Bientôt disponible
      </p>
      <p className="mx-auto max-w-[440px] text-sm leading-relaxed text-[#9BA1A8] text-pretty">
        {description}
      </p>
    </div>
  );
}
