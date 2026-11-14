import Link from "next/link";
import { Suspense } from "react";
import { SupplierActions } from "@/components/supplier-actions";
import { api } from "@/lib/api";
import { STATUS_LABEL, STATUS_STYLE, longDate, usd } from "@/lib/format";

export default function SupplierDashboard() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold">Good afternoon, Lotus Trails 👋</h1>
      <p className="mt-1 text-ink/60">Here’s how your experiences are performing.</p>
      <Suspense fallback={<div className="mt-8 h-96 animate-pulse rounded-2xl bg-mist/60" />}>
        <Overview />
      </Suspense>
    </>
  );
}

async function Overview() {
  const o = await api.supplier.overview();
  const max = Math.max(...o.revenueByDay.map((d) => d.revenueUsd), 1);
  const kpis = [
    { label: "Gross revenue", value: usd(o.totals.revenueUsd), sub: `${o.totals.guests} guests` },
    { label: "Your payout (80%)", value: usd(o.totals.payoutUsd), sub: `Commission ${usd(o.totals.commissionUsd)}` },
    { label: "Upcoming departures", value: o.totals.upcoming, sub: `${o.totals.bookings} bookings total` },
    { label: "Needs your action", value: o.totals.awaitingConfirmation, sub: `${o.totals.cancelled} cancelled`, highlight: o.totals.awaitingConfirmation > 0 },
  ];
  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-2xl p-5 ${k.highlight ? "bg-lotus text-white" : "bg-white ring-1 ring-mist"}`}>
            <p className={`text-sm ${k.highlight ? "text-white/80" : "text-ink/60"}`}>{k.label}</p>
            <p className="mt-1 text-3xl font-bold">{k.value}</p>
            <p className={`mt-1 text-xs ${k.highlight ? "text-white/80" : "text-ink/50"}`}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl bg-white p-5 ring-1 ring-mist">
          <h2 className="font-semibold">Revenue, last 14 days</h2>
          <div className="mt-6 flex h-48 items-end gap-2" role="img" aria-label="Daily revenue bar chart">
            {o.revenueByDay.map((d) => (
              <div key={d.day} className="group flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-md bg-jade/80 transition group-hover:bg-lotus" style={{ height: `${Math.max(2, (d.revenueUsd / max) * 100)}%` }} title={`${d.day}: ${usd(d.revenueUsd)}`} />
                </div>
                <span className="text-[10px] text-ink/45">{d.day.slice(8)}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl bg-white p-5 ring-1 ring-mist">
          <h2 className="font-semibold">Top experiences</h2>
          <ul className="mt-4 space-y-3">
            {o.topTours.map((t, i) => (
              <li key={t.slug} className="flex items-center gap-3 text-sm">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-sand text-xs font-bold">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">{t.title}</span>
                <span className="text-ink/55">{t.bookings} bk</span>
                <span className="w-20 text-right font-semibold">{usd(t.revenueUsd)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl bg-white ring-1 ring-mist">
        <div className="flex items-center justify-between p-5">
          <h2 className="font-semibold">Next departures</h2>
          <Link href="/supplier/bookings" className="text-sm font-semibold text-jade hover:underline">All bookings →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-y border-mist bg-sand/50 text-left text-xs uppercase tracking-wide text-ink/55">
              <tr><th className="px-5 py-2.5">Date</th><th className="px-5 py-2.5">Experience</th><th className="px-5 py-2.5">Lead traveller</th><th className="px-5 py-2.5">Guests</th><th className="px-5 py-2.5">Status</th><th className="px-5 py-2.5">Action</th></tr>
            </thead>
            <tbody>
              {o.nextDepartures.map((b) => (
                <tr key={b.code} className="border-b border-mist/70 last:border-0">
                  <td className="whitespace-nowrap px-5 py-3">{longDate(b.date)}<span className="block text-xs text-ink/50">{b.time}</span></td>
                  <td className="max-w-64 truncate px-5 py-3">{b.tourTitle}</td>
                  <td className="px-5 py-3">{b.fullName}</td>
                  <td className="px-5 py-3">{b.adults + b.children}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[b.status]}`}>{STATUS_LABEL[b.status]}</span></td>
                  <td className="px-5 py-3"><SupplierActions booking={b} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
