"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function RangeSelect({ value, options, param = "days" }: { value: number; options: [number, string][]; param?: string }) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  return (
    <label className="relative inline-flex items-center">
      <CalendarDays className="pointer-events-none absolute left-3 h-4 w-4 text-sp-text2" />
      <select
        aria-label="Date range"
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(sp.toString());
          next.set(param, e.target.value);
          router.push(`${path}?${next.toString()}`, { scroll: false });
        }}
        className="sp-input h-10 appearance-none pl-9 pr-9 font-semibold"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-sp-text2" />
    </label>
  );
}
