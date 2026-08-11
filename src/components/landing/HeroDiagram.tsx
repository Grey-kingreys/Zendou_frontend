"use client";

import { useEffect, useState } from "react";

const BASES = [240, 310, 288] as const;

function jitter(base: number) {
  return Math.max(150, base + Math.round((Math.random() - 0.5) * 46));
}

export default function HeroDiagram() {
  const [ms, setMs] = useState<number[]>([...BASES]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.hidden) return;
      const i = Math.floor(Math.random() * 3);
      setMs((prev) => {
        const next = [...prev];
        next[i] = jitter(BASES[i]);
        return next;
      });
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Desktop / large-tablet diagram — faithful to the reference design. */}
      <div className="relative hidden aspect-[1200/360] min-h-[300px] w-full lg:block">
        <svg
          viewBox="0 0 1200 360"
          fill="none"
          preserveAspectRatio="none"
          className="absolute inset-0 block h-full w-full"
        >
          <defs>
            <linearGradient
              id="zdbeam-left"
              gradientUnits="userSpaceOnUse"
              x1="150"
              y1="0"
              x2="520"
              y2="0"
            >
              <stop offset="0%" stopColor="#5B7CFA" stopOpacity="0" />
              <stop offset="50%" stopColor="#8AA4FF" />
              <stop offset="100%" stopColor="#5B7CFA" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="zdbeam-right"
              gradientUnits="userSpaceOnUse"
              x1="680"
              y1="0"
              x2="1050"
              y2="0"
            >
              <stop offset="0%" stopColor="#5B7CFA" stopOpacity="0" />
              <stop offset="50%" stopColor="#8AA4FF" />
              <stop offset="100%" stopColor="#5B7CFA" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g stroke="rgba(255,255,255,0.08)" strokeWidth="1.25">
            <path d="M150,48 C330,48 400,180 520,180" />
            <path d="M150,180 L520,180" />
            <path d="M150,312 C330,312 400,180 520,180" />
            <path d="M680,180 C800,180 870,48 1050,48" />
            <path d="M680,180 L1050,180" />
            <path d="M680,180 C800,180 870,312 1050,312" />
          </g>
          <g
            stroke="url(#zdbeam-left)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="46 520"
          >
            <path
              d="M150,48 C330,48 400,180 520,180"
              className="[animation:zd-beam_3.2s_linear_infinite]"
            />
            <path
              d="M150,180 L520,180"
              className="[animation:zd-beam_3.2s_linear_infinite_.5s]"
            />
            <path
              d="M150,312 C330,312 400,180 520,180"
              className="[animation:zd-beam_3.2s_linear_infinite_1.1s]"
            />
          </g>
          <g
            stroke="url(#zdbeam-right)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="46 520"
          >
            <path
              d="M680,180 C800,180 870,48 1050,48"
              className="[animation:zd-beam_3.2s_linear_infinite_1.6s]"
            />
            <path
              d="M680,180 L1050,180"
              className="[animation:zd-beam_3.2s_linear_infinite_2.0s]"
            />
            <path
              d="M680,180 C800,180 870,312 1050,312"
              className="[animation:zd-beam_3.2s_linear_infinite_2.5s]"
            />
          </g>
        </svg>

        <div className="absolute top-[4.4%] left-0 flex h-[17.8%] min-h-[58px] w-[12.5%] min-w-[126px] flex-col justify-center rounded-xl border border-white/[0.09] bg-[#0E1013] px-3.5">
          <div className="font-mono text-xs text-[#5B7CFA]">POST /emails</div>
          <div className="mt-1 text-xs text-[#70767D]">Ton application</div>
        </div>
        <div className="absolute top-[41.1%] left-0 flex h-[17.8%] min-h-[58px] w-[12.5%] min-w-[126px] flex-col justify-center rounded-xl border border-white/[0.09] bg-[#0E1013] px-3.5">
          <div className="font-mono text-xs text-[#5B7CFA]">SMTP relay</div>
          <div className="mt-1 text-xs text-[#70767D]">Legacy &amp; frameworks</div>
        </div>
        <div className="absolute top-[77.8%] left-0 flex h-[17.8%] min-h-[58px] w-[12.5%] min-w-[126px] flex-col justify-center rounded-xl border border-white/[0.09] bg-[#0E1013] px-3.5">
          <div className="font-mono text-xs text-[#5B7CFA]">cron / worker</div>
          <div className="mt-1 text-xs text-[#70767D]">Jobs planifiés</div>
        </div>

        <div className="absolute top-[36.1%] left-[43.3%] flex h-[27.8%] min-h-[92px] w-[13.4%] min-w-[132px] flex-col items-center justify-center gap-1.5 rounded-[18px] border border-[rgba(91,124,250,0.35)] bg-[#0E1013] shadow-[0_0_60px_rgba(91,124,250,0.18)]">
          <div className="absolute -inset-3.5 rounded-[26px] border border-[rgba(91,124,250,0.16)] [animation:zd-pulse_3s_ease-in-out_infinite]" />
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[linear-gradient(150deg,#8AA4FF,#3D5CE8)] font-heading font-bold text-[#0B0B0C]">
            Z
          </div>
          <div className="font-heading text-sm font-semibold">Zendou</div>
          <div className="font-mono text-[11px] text-[#70767D]">
            queue · DKIM · SES
          </div>
        </div>

        <div className="absolute top-[4.4%] right-0 flex h-[17.8%] min-h-[58px] w-[12.5%] min-w-[126px] flex-col justify-center rounded-xl border border-white/[0.09] bg-[#0E1013] px-3.5">
          <div className="font-mono text-xs">gmail.com</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#35D07F]">
            <span className="h-[5px] w-[5px] flex-none rounded-full bg-[#35D07F] [animation:zd-blip_2.4s_ease-in-out_infinite]" />
            delivered · <span className="tabular-nums">{ms[0]}</span> ms
          </div>
        </div>
        <div className="absolute top-[41.1%] right-0 flex h-[17.8%] min-h-[58px] w-[12.5%] min-w-[126px] flex-col justify-center rounded-xl border border-white/[0.09] bg-[#0E1013] px-3.5">
          <div className="font-mono text-xs">outlook.com</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#35D07F]">
            <span className="h-[5px] w-[5px] flex-none rounded-full bg-[#35D07F] [animation:zd-blip_2.4s_ease-in-out_.8s_infinite]" />
            delivered · <span className="tabular-nums">{ms[1]}</span> ms
          </div>
        </div>
        <div className="absolute top-[77.8%] right-0 flex h-[17.8%] min-h-[58px] w-[12.5%] min-w-[126px] flex-col justify-center rounded-xl border border-white/[0.09] bg-[#0E1013] px-3.5">
          <div className="font-mono text-xs">yahoo.fr</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#35D07F]">
            <span className="h-[5px] w-[5px] flex-none rounded-full bg-[#35D07F] [animation:zd-blip_2.4s_ease-in-out_1.6s_infinite]" />
            delivered · <span className="tabular-nums">{ms[2]}</span> ms
          </div>
        </div>
      </div>

      {/* Small-screen fallback — same nodes, stacked vertically so nothing overflows. */}
      <div className="flex flex-col items-center gap-3 lg:hidden">
        <div className="grid w-full max-w-sm grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex min-h-[58px] flex-col justify-center rounded-xl border border-white/[0.09] bg-[#0E1013] px-3.5 py-3">
            <div className="font-mono text-xs text-[#5B7CFA]">POST /emails</div>
            <div className="mt-1 text-xs text-[#70767D]">Ton application</div>
          </div>
          <div className="flex min-h-[58px] flex-col justify-center rounded-xl border border-white/[0.09] bg-[#0E1013] px-3.5 py-3">
            <div className="font-mono text-xs text-[#5B7CFA]">SMTP relay</div>
            <div className="mt-1 text-xs text-[#70767D]">Legacy &amp; frameworks</div>
          </div>
          <div className="flex min-h-[58px] flex-col justify-center rounded-xl border border-white/[0.09] bg-[#0E1013] px-3.5 py-3">
            <div className="font-mono text-xs text-[#5B7CFA]">cron / worker</div>
            <div className="mt-1 text-xs text-[#70767D]">Jobs planifiés</div>
          </div>
        </div>

        <div className="h-8 w-px bg-white/[0.12]" />

        <div className="relative flex min-h-[92px] w-full max-w-[220px] flex-col items-center justify-center gap-1.5 rounded-[18px] border border-[rgba(91,124,250,0.35)] bg-[#0E1013] py-4 shadow-[0_0_60px_rgba(91,124,250,0.18)]">
          <div className="absolute -inset-3.5 rounded-[26px] border border-[rgba(91,124,250,0.16)] [animation:zd-pulse_3s_ease-in-out_infinite]" />
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[linear-gradient(150deg,#8AA4FF,#3D5CE8)] font-heading font-bold text-[#0B0B0C]">
            Z
          </div>
          <div className="font-heading text-sm font-semibold">Zendou</div>
          <div className="font-mono text-[11px] text-[#70767D]">
            queue · DKIM · SES
          </div>
        </div>

        <div className="h-8 w-px bg-white/[0.12]" />

        <div className="grid w-full max-w-sm grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex min-h-[58px] flex-col justify-center rounded-xl border border-white/[0.09] bg-[#0E1013] px-3.5 py-3">
            <div className="font-mono text-xs">gmail.com</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#35D07F]">
              <span className="h-[5px] w-[5px] flex-none rounded-full bg-[#35D07F] [animation:zd-blip_2.4s_ease-in-out_infinite]" />
              delivered · <span className="tabular-nums">{ms[0]}</span> ms
            </div>
          </div>
          <div className="flex min-h-[58px] flex-col justify-center rounded-xl border border-white/[0.09] bg-[#0E1013] px-3.5 py-3">
            <div className="font-mono text-xs">outlook.com</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#35D07F]">
              <span className="h-[5px] w-[5px] flex-none rounded-full bg-[#35D07F] [animation:zd-blip_2.4s_ease-in-out_.8s_infinite]" />
              delivered · <span className="tabular-nums">{ms[1]}</span> ms
            </div>
          </div>
          <div className="flex min-h-[58px] flex-col justify-center rounded-xl border border-white/[0.09] bg-[#0E1013] px-3.5 py-3">
            <div className="font-mono text-xs">yahoo.fr</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#35D07F]">
              <span className="h-[5px] w-[5px] flex-none rounded-full bg-[#35D07F] [animation:zd-blip_2.4s_ease-in-out_1.6s_infinite]" />
              delivered · <span className="tabular-nums">{ms[2]}</span> ms
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
