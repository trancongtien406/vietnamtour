import { BarChart3, CalendarClock, Landmark, Layers, ReceiptText, Users, Wallet } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { EarningsChart } from "@/components/supplier/charts";
import { KpiCard } from "@/components/supplier/kpi-card";
import { PageHeader } from "@/components/supplier/page-header";
import { RangeSelect } from "@/components/supplier/range-select";
import { RequestPayout } from "@/components/supplier/request-payout";
import { Badge, PayoutBadge } from "@/components/supplier/status-badge";
import { api } from "@/lib/api";
import { usd } from "@/lib/format";

export const metadata: Metadata = { title: "Finance & payouts" };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const d = (iso: string, year = false) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}${year ? `, ${iso.slice(0, 4)}` : ""}`;
const stamp = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" });

export default function FinancePage({ searchParams }: PageProps<"/supplier/finance">) {
  return (
    <Suspense fallback={<div className="h-[700px] animate-pulse rounded-2xl bg-sp-muted" />}>
      <Finance searchParams={searchParams} />
    </Suspense>
  );
}

async function Finance({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const f = await api.supplier.finance(Number(sp.days) || 30);
  const acct = f.payoutAccount;
  const label = `vs. previous ${f.periodDays} days`;
  return (
    <div className="space-y-6">
      <PageHeader title="Finance & payouts" subtitle="Track your earnings, manage payouts and review transaction history.">
        <RangeSelect value={f.periodDays} options={[[7, "Last 7 days"], [30, "Last 30 days"], [90, "Last 90 days"]]} />
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard icon={BarChart3} label="Gross revenue" value={usd(f.totals.grossUsd)} sub={`Refunds ${usd(f.totals.refundsUsd)}`} delta={f.deltas.grossPct} />
        <KpiCard icon={Layers} label={`Commission (${Math.round(f.commissionRate * 100)}%)`} value={usd(f.totals.commissionUsd)} sub="Charged on revenue after refunds" />
        <KpiCard icon={Wallet} label="Net earnings" value={usd(f.totals.netUsd)} sub="Gross − commission − refunds" delta={f.deltas.netPct} />
        <KpiCard icon={Users} label="Bookings" value={f.totals.bookings} sub={`Paid in the last ${f.periodDays} days`} delta={f.deltas.bookingsPct} />
      </div>
      <p className="sr-only">Changes are {label}.</p>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="sp-card p-5 sm:p-6">
          <h2 className="sp-h2">Earnings over time</h2>
          <p className="text-xs text-sp-text2">Daily net earnings and gross revenue, last {f.periodDays} days</p>
          <div className="mt-3"><EarningsChart data={f.series} /></div>
        </section>
        <div className="grid gap-6">
          <section className="sp-card flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-light text-orange"><Wallet className="h-5 w-5" strokeWidth={1.8} /></span>
              <div>
                <h2 className="sp-h2">Available balance</h2>
                <p className="sp-num text-[30px] font-bold leading-9">{usd(f.balance.availableUsd)}</p>
                <p className="text-xs text-sp-text2">
                  This week’s net earnings, not yet scheduled
                  {f.balance.pendingUsd > 0 && <> · excludes {usd(f.balance.pendingUsd)} already scheduled or processing</>}
                </p>
              </div>
            </div>
            <RequestPayout available={f.balance.availableUsd} minimum={f.balance.minimumPayoutUsd} account={`${acct.bankName} •••• ${acct.accountLast4}`} />
          </section>
          <section className="sp-card flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-light text-orange"><CalendarClock className="h-5 w-5" strokeWidth={1.8} /></span>
              <div>
                {f.nextPayout.status === "scheduled" ? (
                  <>
                    <h2 className="sp-h2">Upcoming payout</h2>
                    <p className="sp-num text-[30px] font-bold leading-9">{usd(f.nextPayout.amountUsd)}</p>
                    <p className="text-xs text-sp-text2">Scheduled for {d(f.nextPayout.date, true)} · locked, can’t be requested again</p>
                  </>
                ) : (
                  <>
                    <h2 className="sp-h2">Next automatic payout</h2>
                    <p className="text-[30px] font-bold leading-9">{d(f.nextPayout.date, true)}</p>
                    <p className="text-xs text-sp-text2">Any balance you don’t withdraw is paid then · weekly settlement</p>
                  </>
                )}
              </div>
            </div>
            <PayoutBadge status={f.nextPayout.status} />
          </section>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.9fr_1fr]">
        <section className="sp-card overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 sm:px-6">
            <h2 className="sp-h2">Payout history</h2>
            <span className="text-xs text-sp-text2">{usd(f.totals.paidOutUsd)} paid out to date</span>
          </div>
          <div className="overflow-x-auto">
            <table className="sp-table min-w-[700px]">
              <thead><tr><th>Payout ID</th><th>Period</th><th className="text-right">Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {f.payouts.map((p) => (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap font-mono text-[13px] font-semibold underline decoration-sp-strong underline-offset-4">{p.id}</td>
                    <td className="whitespace-nowrap">{p.periodStart === p.periodEnd ? "On-demand" : `${d(p.periodStart)} – ${d(p.periodEnd)}`}<span className="block text-xs text-sp-text2">{p.transactions ? `${p.transactions} transactions` : "Manual request"}</span></td>
                    <td className="sp-num text-right font-semibold">{usd(p.netUsd)}</td>
                    <td className="whitespace-nowrap text-sp-text2">Bank transfer</td>
                    <td><PayoutBadge status={p.status} /></td>
                    <td className="whitespace-nowrap">{d(p.payoutDate, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid content-start gap-6">
          <section className="sp-card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="sp-h2 flex items-center gap-2"><Landmark className="h-5 w-5 text-sp-text2" strokeWidth={1.8} /> Bank account</h2>
              <a href="/supplier/settings" className="text-sm font-semibold underline underline-offset-4">Edit</a>
            </div>
            <div className="mt-4 rounded-2xl border border-sp-border bg-sp-warm p-5">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold">{acct.bankName}</p>
                <span className="rounded-md bg-forest-light px-2 py-0.5 text-[11px] font-bold text-forest">VERIFIED</span>
              </div>
              <p className="mt-4 text-xs text-sp-text2">Account holder</p>
              <p className="font-medium">{acct.accountName}</p>
              <p className="mt-3 text-xs text-sp-text2">Account number</p>
              <p className="sp-num font-medium tracking-wider">•••• •••• {acct.accountLast4}</p>
              <p className="mt-3 text-xs text-sp-text2">Weekly payouts every Wednesday for the previous Monday–Sunday.</p>
            </div>
          </section>
          <section className="sp-card p-5 sm:p-6">
            <h2 className="sp-h2 flex items-center gap-2"><ReceiptText className="h-5 w-5 text-sp-text2" strokeWidth={1.8} /> Recent transactions</h2>
            <ul className="mt-3 divide-y divide-sp-border">
              {f.transactions.slice(0, 6).map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{t.tourTitle}</p>
                    <p className="text-xs text-sp-text2">{stamp(t.at)} · <span className="font-mono">{t.bookingCode}</span></p>
                  </div>
                  <div className="text-right">
                    <p className={`sp-num font-semibold ${t.netUsd < 0 ? "text-[#BE3C36]" : ""}`}>{t.netUsd < 0 ? "−" : "+"}{usd(Math.abs(t.netUsd))}</p>
                    {t.type === "refund" ? <Badge tone="refunded">Refund</Badge> : <p className="text-[11px] text-sp-text3">net of {usd(t.commissionUsd)} fee</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
