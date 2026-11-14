import { FlaskConical } from "lucide-react";

export const DEMO_DISCLOSURE = "Portfolio Demo · Sample Data · Sandbox Payments";

/** Disclosure shown on every supplier screen: the data and payments are not real. */
export function DemoBadge({ variant = "card" }: { variant?: "card" | "strip" }) {
  if (variant === "strip") {
    return (
      <p className="flex h-7 items-center justify-center gap-1.5 border-b border-[#F3DEB1] bg-[#FFF2D9] text-[11px] font-semibold text-[#A76812] lg:hidden">
        <FlaskConical className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        {DEMO_DISCLOSURE}
      </p>
    );
  }
  return (
    <p className="flex items-start gap-2 rounded-xl border border-[#F3DEB1] bg-[#FFF2D9] px-3 py-2 text-[11px] leading-4 text-[#A76812]">
      <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
      <span>
        <span className="block font-bold">Portfolio Demo</span>
        Sample Data · Sandbox Payments
      </span>
    </p>
  );
}
