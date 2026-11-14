"use client";

import { AlertCircle, CalendarDays, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3, Download, Layers, ListFilter, Search, ShieldCheck, Users, XCircle } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Booking, TourSummary } from "@/lib/types";
import { BookingDrawer } from "./booking-drawer";
import { BookingBadge } from "./status-badge";

const PAGE = 10;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const day = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${WD[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
const usd = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase();

type StatusKey = "all" | "confirmed" | "pending" | "checked_in" | "cancelled" | "attention";
const STATUS: Record<Exclude<StatusKey, "all">, (b: Booking) => boolean> = {
  confirmed: (b) => b.status === "confirmed",
  pending: (b) => b.status === "pending_payment",
  checked_in: (b) => b.status === "checked_in",
  cancelled: (b) => b.status === "cancelled",
  attention: (b) => b.status === "awaiting_supplier",
};
const CARDS: { key: StatusKey; label: string; icon: typeof Users; tone: string }[] = [
  { key: "all", label: "All", icon: Users, tone: "text-sp-text2 bg-sp-muted" },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2, tone: "text-[#08734D] bg-[#DDF5E9]" },
  { key: "pending", label: "Pending", icon: Clock3, tone: "text-[#A76812] bg-[#FFF2D9]" },
  { key: "checked_in", label: "Checked in", icon: ShieldCheck, tone: "text-forest bg-forest-light" },
  { key: "cancelled", label: "Cancelled", icon: XCircle, tone: "text-[#BE3C36] bg-[#FDE8E7]" },
  { key: "attention", label: "Needs action", icon: AlertCircle, tone: "text-orange bg-orange-light" },
];
type Range = "all" | "upcoming" | "next30" | "past";

function Select<T extends string>({ icon: Icon, label, value, onChange, options }: { icon: typeof Users; label: string; value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <label className="relative inline-flex min-w-0 items-center">
      <Icon className="pointer-events-none absolute left-3 h-4 w-4 text-sp-text2" />
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value as T)} className="sp-input h-10 max-w-full appearance-none truncate pl-9 pr-9 font-medium">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-sp-text2" />
    </label>
  );
}

export function BookingsTable({ bookings, tours, initial, today }: { bookings: Booking[]; tours: TourSummary[]; initial: { status?: string; q?: string; booking?: string; tour?: string }; today: string }) {
  const tourBySlug = useMemo(() => new Map(tours.map((t) => [t.slug, t])), [tours]);
  const [status, setStatus] = useState<StatusKey>((Object.keys(STATUS).includes(initial.status ?? "") ? initial.status : "all") as StatusKey);
  const [q, setQ] = useState(initial.q ?? "");
  const [tour, setTour] = useState(initial.tour ?? "all");
  const [range, setRange] = useState<Range>("all");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | undefined>(initial.booking?.toUpperCase());

  // Keep the URL shareable: ?status=…&q=…&booking=VT-…
  useEffect(() => {
    const p = new URLSearchParams();
    if (status !== "all") p.set("status", status);
    if (q) p.set("q", q);
    if (tour !== "all") p.set("tour", tour);
    if (open) p.set("booking", open);
    const qs = p.toString();
    window.history.replaceState(null, "", `/supplier/bookings${qs ? `?${qs}` : ""}`);
  }, [status, q, tour, open]);

  const base = useMemo(() => {
    const nq = norm(q.trim());
    const in30 = new Date(Date.parse(`${today}T00:00:00Z`) + 30 * 864e5).toISOString().slice(0, 10);
    return bookings.filter(
      (b) =>
        (tour === "all" || b.tourSlug === tour) &&
        (range === "all" || (range === "upcoming" ? b.date >= today : range === "past" ? b.date < today : b.date >= today && b.date <= in30)) &&
        (!nq || norm(`${b.code} ${b.fullName} ${b.email} ${b.tourTitle} ${b.phone}`).includes(nq)),
    );
  }, [bookings, q, tour, range, today]);
  const counts = useMemo(() => {
    const c: Record<StatusKey, number> = { all: base.length, confirmed: 0, pending: 0, checked_in: 0, cancelled: 0, attention: 0 };
    for (const b of base) for (const [k, f] of Object.entries(STATUS)) if (f(b)) c[k as StatusKey]++;
    return c;
  }, [base]);
  const rows = status === "all" ? base : base.filter(STATUS[status]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const current = Math.min(page, pages - 1);
  const visible = rows.slice(current * PAGE, current * PAGE + PAGE);
  const selected = open ? bookings.find((b) => b.code === open) : undefined;
  const close = useCallback(() => setOpen(undefined), []);

  const exportCsv = () => {
    const head = ["Booking ID", "Experience", "Lead traveller", "Email", "Phone", "Date", "Time", "Adults", "Children", "Total USD", "Refund USD", "Status"];
    const lines = rows.map((b) => [b.code, b.tourTitle, b.fullName, b.email, b.phone, b.date, b.time, b.adults, b.children, b.totalUsd, b.refundUsd, b.status]);
    const csv = [head, ...lines].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `bookings-${today}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Select<Range> icon={CalendarDays} label="Departure date" value={range} onChange={(v) => { setRange(v); setPage(0); }} options={[["all", "All dates"], ["upcoming", "Upcoming"], ["next30", "Next 30 days"], ["past", "Past departures"]]} />
        <Select icon={Layers} label="Experience" value={tour} onChange={(v) => { setTour(v); setPage(0); }} options={[["all", "All experiences"], ...tours.map((t) => [t.slug, t.title] as [string, string])]} />
        <Select<StatusKey> icon={ListFilter} label="Status" value={status} onChange={(v) => { setStatus(v); setPage(0); }} options={CARDS.map((c) => [c.key, c.key === "all" ? "All statuses" : c.label])} />
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sp-text3" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search booking ID, guest, experience…" aria-label="Search bookings" className="sp-input pl-9" />
        </label>
        <button type="button" onClick={exportCsv} className="sp-btn sp-btn-outline"><Download className="h-4 w-4" /> Export CSV</button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {CARDS.map(({ key, label, icon: Icon, tone }) => {
          const active = status === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => { setStatus(key); setPage(0); }}
              aria-pressed={active}
              className={`sp-focus flex items-center gap-3 rounded-2xl border p-4 text-left transition ${active ? "border-forest bg-forest-light/60 shadow-[0_0_0_1px_var(--color-forest)]" : "border-sp-border bg-white hover:shadow-[0_4px_14px_rgba(23,37,31,.07)]"}`}
            >
              <span className={`grid h-9 w-9 place-items-center rounded-full ${tone}`}><Icon className="h-[18px] w-[18px]" strokeWidth={1.8} /></span>
              <span>
                <span className="block text-[13px] text-sp-text2">{label}</span>
                <span className="sp-num block text-2xl font-bold leading-7">{counts[key]}</span>
              </span>
            </button>
          );
        })}
      </div>

      <section className="sp-card overflow-hidden">
        <div className="max-h-[720px] overflow-auto">
          <table className="sp-table min-w-[960px]">
            <thead>
              <tr><th>Booking ID</th><th>Experience</th><th>Date</th><th>Lead traveller</th><th>Guests</th><th className="text-right">Total</th><th>Status</th><th className="text-right">Action</th></tr>
            </thead>
            <tbody>
              {visible.map((b) => (
                <tr key={b.code} onClick={() => setOpen(b.code)} className={`cursor-pointer ${open === b.code ? "[&>td]:bg-forest-light/50" : ""}`}>
                  <td className="whitespace-nowrap font-mono text-[13px] font-semibold">{b.code}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      {tourBySlug.get(b.tourSlug)?.images[0] && (
                        <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg"><Image src={tourBySlug.get(b.tourSlug)!.images[0]} alt="" fill sizes="56px" className="object-cover" /></div>
                      )}
                      <span className="line-clamp-2 min-w-36 max-w-52 leading-5">{b.tourTitle}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap">{day(b.date)}<span className="block text-xs text-sp-text2">{b.time}</span></td>
                  <td className="whitespace-nowrap">{b.fullName}<span className="block max-w-44 truncate text-xs text-sp-text2">{b.email}</span></td>
                  <td className="sp-num">{b.adults + b.children}</td>
                  <td className="sp-num whitespace-nowrap text-right font-semibold">{usd(b.totalUsd)}</td>
                  <td><BookingBadge booking={b} /></td>
                  <td className="text-right">
                    <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(b.code); }} className="sp-btn sp-btn-outline h-9 whitespace-nowrap px-3">View</button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={8} className="!h-40 text-center text-sp-text2">No bookings match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sp-border px-5 py-3 text-sm text-sp-text2">
          <span>
            Showing {rows.length ? current * PAGE + 1 : 0}–{Math.min(rows.length, current * PAGE + PAGE)} of {rows.length} bookings
          </span>
          <div className="flex items-center gap-1">
            <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)} aria-label="Previous page" className="sp-btn sp-btn-outline h-9 w-9 px-0"><ChevronLeft className="h-4 w-4" /></button>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} type="button" onClick={() => setPage(i)} aria-current={i === current ? "page" : undefined} className={`sp-btn h-9 w-9 px-0 ${i === current ? "sp-btn-forest" : "hover:bg-sp-muted"}`}>{i + 1}</button>
            ))}
            <button type="button" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} aria-label="Next page" className="sp-btn sp-btn-outline h-9 w-9 px-0"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </section>

      {selected && <BookingDrawer booking={selected} tour={tourBySlug.get(selected.tourSlug)} onClose={close} />}
    </div>
  );
}
