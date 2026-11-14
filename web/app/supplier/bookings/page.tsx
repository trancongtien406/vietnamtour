import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SupplierActions } from "@/components/supplier-actions";
import { api } from "@/lib/api";
import { STATUS_LABEL, STATUS_STYLE, longDate, usd } from "@/lib/format";
import type { BookingStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Bookings" };

export default function SupplierBookings({ searchParams }: PageProps<"/supplier/bookings">) {
  return (
    <>
      <h1 className="font-display text-3xl font-bold">Bookings</h1>
      <p className="mt-1 text-ink/60">Confirm requests, check guests in by voucher code and track refunds.</p>
      <Suspense fallback={<div className="mt-8 h-96 animate-pulse rounded-2xl bg-mist/60" />}>
        <Table searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Table({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const [all, rows] = await Promise.all([api.supplier.bookings(), api.supplier.bookings(status)]);
  const filters: (BookingStatus | undefined)[] = [undefined, "awaiting_supplier", "confirmed", "checked_in", "pending_payment", "cancelled"];
  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link key={f ?? "all"} href={f ? `/supplier/bookings?status=${f}` : "/supplier/bookings"} className={`rounded-full px-4 py-2 text-sm font-semibold ${status === f ? "bg-ink text-white" : "bg-white text-ink/70 ring-1 ring-mist"}`}>
            {f ? STATUS_LABEL[f] : "All"} <span className="opacity-60">{f ? all.filter((b) => b.status === f).length : all.length}</span>
          </Link>
        ))}
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl bg-white ring-1 ring-mist">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b border-mist bg-sand/50 text-left text-xs uppercase tracking-wide text-ink/55">
            <tr><th className="px-4 py-3">Ref</th><th className="px-4 py-3">Departure</th><th className="px-4 py-3">Experience</th><th className="px-4 py-3">Guest</th><th className="px-4 py-3">Pax</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.code} className="border-b border-mist/70 last:border-0">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold">{b.code}</td>
                <td className="whitespace-nowrap px-4 py-3">{longDate(b.date)}<span className="block text-xs text-ink/50">{b.time}</span></td>
                <td className="max-w-52 truncate px-4 py-3">{b.tourTitle}</td>
                <td className="whitespace-nowrap px-4 py-3">{b.fullName}<span className="block text-xs text-ink/50">{b.phone}</span></td>
                <td className="whitespace-nowrap px-4 py-3">{b.adults}A{b.children ? ` ${b.children}C` : ""}</td>
                <td className="px-4 py-3 font-semibold">{usd(b.totalUsd)}{b.refundUsd > 0 && <span className="block text-xs font-normal text-emerald-700">−{usd(b.refundUsd)} refunded</span>}</td>
                <td className="px-4 py-3"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[b.status]}`}>{STATUS_LABEL[b.status]}</span></td>
                <td className="px-4 py-3"><SupplierActions booking={b} /></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-ink/55">No bookings with this status.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
