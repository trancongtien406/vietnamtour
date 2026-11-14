import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";
import Link from "next/link";

export function Delta({ pct, label = "vs. prior period" }: { pct: number | null | undefined; label?: string }) {
  if (pct === null || pct === undefined) return null;
  const up = pct >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold ${up ? "text-[#08734D]" : "text-[#BE3C36]"}`}>
      <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
      {up ? "+" : ""}
      {pct.toFixed(1)}%<span className="font-medium text-sp-text3">{label}</span>
    </span>
  );
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  delta,
  attention,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  delta?: number | null;
  attention?: boolean;
  href?: string;
}) {
  const body = (
    <div
      className={`flex h-full min-h-[124px] items-start gap-4 rounded-2xl p-5 transition ${
        attention ? "bg-orange text-white shadow-[0_8px_24px_rgba(226,113,58,.25)]" : "sp-card hover:shadow-[0_4px_14px_rgba(23,37,31,.07)]"
      }`}
    >
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${attention ? "bg-white/20" : "bg-[#F3EEE4] text-forest"}`}>
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-[13px] ${attention ? "text-white/85" : "text-sp-text2"}`}>{label}</p>
        <p className="sp-num mt-1 text-[30px] font-bold leading-9 tracking-tight">{value}</p>
        {sub && <p className={`mt-0.5 text-xs ${attention ? "text-white/85" : "text-sp-text2"}`}>{sub}</p>}
        {delta !== undefined && <div className="mt-1"><Delta pct={delta} /></div>}
      </div>
      {attention && href && <ChevronRight className="mt-3 h-5 w-5 text-white/90" />}
    </div>
  );
  return href ? <Link href={href} className="sp-focus block rounded-2xl">{body}</Link> : body;
}
