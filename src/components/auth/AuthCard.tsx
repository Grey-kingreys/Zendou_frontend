import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#08090A] px-6 py-12">
      <div className="w-full max-w-[420px]">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[linear-gradient(150deg,#8AA4FF,#3D5CE8)] font-heading text-base font-bold text-[#0B0B0C]">
            Z
          </div>
          <span className="font-heading text-xl font-semibold tracking-[-0.02em] text-[#EDEEF0]">
            Zendou
          </span>
        </Link>

        <div className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-8 shadow-[0_0_60px_rgba(91,124,250,0.06)]">
          <h1 className="mb-1.5 text-center font-heading text-2xl font-semibold tracking-[-0.02em] text-[#EDEEF0]">
            {title}
          </h1>
          <p className="mb-7 text-center text-sm text-[#9BA1A8] text-pretty">
            {description}
          </p>
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-[#9BA1A8]">{footer}</p>
      </div>
    </div>
  );
}
