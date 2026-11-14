import { Bell, ChevronDown, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

export async function TopActions() {
  const o = await api.supplier.overview().catch(() => null);
  const attention = (o?.totals.awaitingConfirmation ?? 0) + (o?.totals.pendingPayment ?? 0);
  return (
    <div className="flex items-center gap-3">
      <form action="/supplier/bookings" className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sp-text3" />
        <input name="q" aria-label="Search bookings" placeholder="Search bookings, experiences…" className="sp-input h-11 w-64 rounded-full pl-9" />
      </form>
      <Link href="/supplier/bookings?status=attention" aria-label={`${attention} bookings need attention`} className="sp-focus relative grid h-11 w-11 place-items-center rounded-full border border-sp-border bg-white hover:bg-sp-muted">
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
        {attention > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-orange ring-2 ring-white" />}
      </Link>
      <Link href="/supplier/settings" className="sp-focus flex h-11 items-center gap-2 rounded-full border border-sp-border bg-white pl-1.5 pr-3 hover:bg-sp-muted">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-forest-light text-forest"><UserRound className="h-4 w-4" /></span>
        <span className="text-sm font-semibold">Lotus Trails</span>
        <ChevronDown className="h-4 w-4 text-sp-text2" />
      </Link>
    </div>
  );
}
