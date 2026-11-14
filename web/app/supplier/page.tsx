import { AlertCircle, CalendarCheck, CalendarDays, Coins, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { RevenueChart } from "@/components/supplier/charts";
import { KpiCard } from "@/components/supplier/kpi-card";
import { PageHeader } from "@/components/supplier/page-header";
import { RangeSelect } from "@/components/supplier/range-select";
import { BookingBadge } from "@/components/supplier/status-badge";
import { SupplierBookingButton } from "@/components/supplier/booking-button";
import { api } from "@/lib/api";
import { longDate, usd } from "@/lib/format";

function greeting() {
  const h = Number(new Date().toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Ho_Chi_Minh" }));
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function SupplierDashboard({ searchParams }: PageProps<"/supplier">) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 w-96 animate-pulse rounded-xl bg-sp-muted" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-[104px] sm:h-[124px] animate-pulse rounded-2xl bg-sp-muted" />)}</div>
      <div className="h-80 animate-pulse rounded-2xl bg-sp-muted" />
    </div>
  );
}

async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const days = Number(sp.days) || 14;
  const o = await api.supplier.overview(days);
  const t = o.totals;
  const attention = t.awaitingConfirmation + t.pendingPayment;
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={<>{greeting()}, Lotus Trails <span aria-hidden>👋</span></>} subtitle="Here’s how your experiences are performing." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard icon={Coins} label="Gross revenue" value={usd(t.grossUsd)} sub={`${t.bookings} bookings · ${t.guests} guests`} />
        <KpiCard icon={Wallet} label="Net earnings" value={usd(t.payoutUsd)} sub={`After 20% commission ${usd(t.commissionUsd)} · refunds ${usd(t.refundsUsd)}`} />
        <KpiCard icon={CalendarDays} label="Upcoming departures" value={t.upcoming} sub={`${t.upcomingGuests} guests booked`} />
        <KpiCard
          icon={AlertCircle}
          label="Needs your action"
          value={attention}
          sub={`${t.awaitingConfirmation} to confirm · ${t.pendingPayment} awaiting payment`}
          attention={attention > 0}
          href="/supplier/bookings?status=attention"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="sp-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="sp-h2">Revenue, last {o.rangeDays} days</h2>
              <p className="text-xs text-sp-text2">
                {usd(o.revenueByDay.reduce((s, d) => s + d.grossUsd, 0))} gross
                {o.deltas.revenuePct !== null && (
                  <span className={o.deltas.revenuePct >= 0 ? "text-[#08734D]" : "text-[#BE3C36]"}> · {o.deltas.revenuePct >= 0 ? "+" : ""}{o.deltas.revenuePct}% vs. previous {o.rangeDays} days</span>
                )}
              </p>
            </div>
            <RangeSelect value={o.rangeDays} options={[[7, "Last 7 days"], [14, "Last 14 days"], [30, "Last 30 days"]]} />
          </div>
          <div className="mt-4"><RevenueChart data={o.revenueByDay} /></div>
        </section>
        <section className="sp-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="sp-h2">Top experiences</h2>
            <Link href="/supplier/products" className="text-sm font-semibold text-forest hover:underline">View all</Link>
          </div>
          <ul className="mt-4 divide-y divide-sp-border">
            {o.topTours.map((tt, i) => (
              <li key={tt.slug} className="flex items-center gap-3 py-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sp-muted text-xs font-bold">{i + 1}</span>
                <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg"><Image src={tt.image} alt="" fill sizes="56px" className="object-cover" /></div>
                <span className="min-w-0 flex-1 truncate font-medium">{tt.title}</span>
                <span className="hidden text-xs text-sp-text2 sm:inline">{tt.bookings} bookings</span>
                <span className="sp-num w-24 text-right font-semibold">{usd(tt.revenueUsd)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.6fr_1fr]">
        <section className="sp-card overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 sm:px-6">
            <h2 className="sp-h2">Upcoming departures</h2>
            <Link href="/supplier/bookings" className="text-sm font-semibold text-forest hover:underline">View all bookings →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="sp-table min-w-[820px]">
              <thead><tr><th>Date</th><th>Experience</th><th>Lead traveller</th><th>Guests</th><th>Status</th><th className="text-right">Action</th></tr></thead>
              <tbody>
                {o.nextDepartures.map((b) => (
                  <tr key={b.code}>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <CalendarCheck className="h-4 w-4 text-sp-text3" />
                        <div>{longDate(b.date)}<span className="block text-xs text-sp-text2">{b.time}</span></div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-12 shrink-0 overflow-hidden rounded-md"><Image src={b.image} alt="" fill sizes="48px" className="object-cover" /></div>
                        <span className="max-w-64 truncate">{b.tourTitle}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">{b.fullName}</td>
                    <td className="sp-num">{b.adults + b.children}</td>
                    <td><BookingBadge booking={b} /></td>
                    <td className="text-right">
                      {b.status === "confirmed" ? (
                        <SupplierBookingButton code={b.code} action="check-in" label="Check in" />
                      ) : (
                        <Link href={`/supplier/bookings?booking=${b.code}`} className="sp-btn sp-btn-outline h-9 border-orange/60 text-orange">View details</Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="sp-card p-5 sm:p-6">
          <h2 className="sp-h2">Recent bookings</h2>
          <ul className="mt-3 divide-y divide-sp-border">
            {o.recentBookings.map((b) => (
              <li key={b.code}>
                <Link href={`/supplier/bookings?booking=${b.code}`} className="sp-focus -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-[#FFFAF5]">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest-light text-sm font-semibold text-forest">{b.fullName[0]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{b.fullName}</p>
                    <p className="truncate text-xs text-sp-text2">{b.tourTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="sp-num font-semibold">{usd(b.totalUsd)}</p>
                    <p className="font-mono text-[11px] text-sp-text3">{b.code}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
