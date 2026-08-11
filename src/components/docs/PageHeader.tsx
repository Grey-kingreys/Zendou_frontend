/** En-tête de page standard des sous-pages /docs : fil d'Ariane + titre + intro. */
export default function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-10">
      {eyebrow && (
        <div className="mb-3 font-mono text-xs tracking-[0.08em] text-[#5B7CFA]">
          {eyebrow}
        </div>
      )}
      <h1 className="mb-3 font-heading text-[28px] font-semibold tracking-[-0.02em] text-[#EDEEF0] sm:text-[32px]">
        {title}
      </h1>
      {description && (
        <p className="max-w-[680px] text-[15px] leading-[1.7] text-[#9BA1A8] text-pretty">
          {description}
        </p>
      )}
    </div>
  );
}
