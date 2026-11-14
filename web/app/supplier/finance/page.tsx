import type { Metadata } from "next";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { longDate, usd } from "@/lib/format";

export const metadata: Metadata = { title: "Finance" };

const PAYOUT_STYLE = {
  paid: "bg-emerald-50 text-emerald-700",
  scheduled: "bg-sky-50 text-sky-700",
  open: "bg-amber-50 text-amber-800",
} as const;
const PAYOUT_LABEL = { paid: "Paid", scheduled: "Scheduled", open: "Collecting" } as const;

export default function FinancePage() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold">Finance</h1>
      <p className="mt-1 text-ink/60">Weekly payouts every Wednesday for the previous Monday–Sunday. Vietnamtour keeps a 20% commission.</p>
      <Suspense fallback={<div className="mt-8 h-[600px] animate-pulse rounded-2xl bg-mist/60" />}>
        <Finance />
      </Suspense>
    </>
  );
}

const time = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" });

async function Finance() {
  const f = await api.supplier.finance();
  const kpis = [
    { label: "Gross sales", value: usd(f.totals.grossUsd), sub: `Refunds ${usd(f.totals.refundsUsd)}` },
    { label: "Commission (20%)", value: usd(f.totals.commissionUsd), sub: "Net of refunds" },
    { label: "Paid out", value: usd(f.totals.paidOutUsd), sub: `${f.payouts.filter((p) => p.status === "paid").length} payouts` },
    {
      label: "Next payout",
      value: f.nextPayout ? usd(f.nextPayout.amountUsd) : "–",
      sub: f.nextPayout ? `${longDate(f.nextPayout.date)} · ${f.payoutAccount.bankName} ••${f.payoutAccount.accountLast4}` : "Nothing pending",
      highlight: true,
    },
  ];
  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-2xl p-5 ${k.highlight ? "bg-jade text-white" : "bg-white ring-1 ring-mist"}`}>
            <p className={`text-sm ${k.highlight ? "text-white/80" : "text-ink/60"}`}>{k.label}</p>
            <p className="mt-1 text-3xl font-bold">{k.value}</p>
            <p className={`mt-1 text-xs ${k.highlight ? "text-white/80" : "text-ink/50"}`}>{k.sub}</p>
          </div>
        ))}
      </div>

      <section className="overflow-x-auto rounded-2xl bg-white ring-1 ring-mist">
        <h2 className="px-5 pt-5 font-semibold">Payouts</h2>
        <table className="mt-3 w-full min-w-[760px] text-sm">
          <thead className="border-y border-mist bg-sand/50 text-left text-xs uppercase tracking-wide text-ink/55">
            <tr><th className="px-5 py-3">Payout</th><th className="px-4 py-3">Period</th><th className="px-4 py-3">Payout date</th><th className="px-4 py-3 text-right">Gross</th><th className="px-4 py-3 text-right">Commission</th><th className="px-4 py-3 text-right">Net payout</th><th className="px-5 py-3">Status</th></tr>
          </thead>
          <tbody>
            {f.payouts.map((p) => (
              <tr key={p.id} className="border-b border-mist/70 last:border-0">
                <td className="whitespace-nowrap px-5 py-3 font-mono text-xs font-semibold">{p.id}<span className="block font-sans font-normal text-ink/50">{p.transactions} transactions</span></td>
                <td className="whitespace-nowrap px-4 py-3">{longDate(p.periodStart).replace(/^\w+, /, "")} – {longDate(p.periodEnd).replace(/^\w+, /, "")}</td>
                <td className="whitespace-nowrap px-4 py-3">{longDate(p.payoutDate)}</td>
                <td className="px-4 py-3 text-right">{usd(p.grossUsd)}</td>
                <td className="px-4 py-3 text-right text-ink/60">−{usd(p.commissionUsd)}</td>
                <td className="px-4 py-3 text-right font-semibold">{usd(p.netUsd)}</td>
                <td className="px-5 py-3"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${PAYOUT_STYLE[p.status]}`}>{PAYOUT_LABEL[p.status]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded-2xl bg-white ring-1 ring-mist">
        <h2 className="px-5 pt-5 font-semibold">Recent transactions</h2>
        <table className="mt-3 w-full min-w-[760px] text-sm">
          <thead className="border-y border-mist bg-sand/50 text-left text-xs uppercase tracking-wide text-ink/55">
            <tr><th className="px-5 py-3">Date</th><th className="px-4 py-3">Booking</th><th className="px-4 py-3">Experience</th><th className="px-4 py-3">Type</th><th className="px-4 py-3 text-right">Gross</th><th className="px-4 py-3 text-right">Commission</th><th className="px-5 py-3 text-right">Net</th></tr>
          </thead>
          <tbody>
            {f.transactions.slice(0, 15).map((t) => (
              <tr key={t.id} className="border-b border-mist/70 last:border-0">
                <td className="whitespace-nowrap px-5 py-3">{time(t.at)}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold">{t.bookingCode}<span className="block font-sans font-normal text-ink/50">{t.guest}</span></td>
                <td className="max-w-60 truncate px-4 py-3">{t.tourTitle}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${t.type === "refund" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{t.type === "refund" ? "Refund" : "Payment"}</span></td>
                <td className={`px-4 py-3 text-right ${t.grossUsd < 0 ? "text-red-700" : ""}`}>{usd(t.grossUsd)}</td>
                <td className="px-4 py-3 text-right text-ink/60">{usd(t.commissionUsd)}</td>
                <td className={`px-5 py-3 text-right font-semibold ${t.netUsd < 0 ? "text-red-700" : ""}`}>{usd(t.netUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
