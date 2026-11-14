import { CalendarCheck, Gauge, Ticket, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AutoSubmitForm } from "@/components/auto-submit-form";
import { KpiCard } from "@/components/supplier/kpi-card";
import { PageHeader } from "@/components/supplier/page-header";
import { api } from "@/lib/api";

export const metadata: Metadata = { title: "Calendar" };

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function CalendarPage({ searchParams }: PageProps<"/supplier/calendar">) {
  return (
    <div className="space-y-6">
      <PageHeader title="Availability calendar" subtitle="Seats sold per departure for the next three weeks." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-sp-muted" />}>
        <Calendar searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Calendar({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const products = await api.supplier.products();
  const tour = typeof sp.tour === "string" && products.some((p) => p.slug === sp.tour) ? sp.tour : products[0].slug;
  const days = await api.supplier.calendar(tour, 21);
  const slots = days.flatMap((d) => d.slots);
  const sold = slots.reduce((s, x) => s + x.booked, 0);
  const cap = slots.reduce((s, x) => s + x.capacity, 0);
  const full = slots.filter((x) => x.remaining === 0).length;
  const busiest = [...days].sort((a, b) => b.slots.reduce((s, x) => s + x.booked, 0) - a.slots.reduce((s, x) => s + x.booked, 0))[0];
  const fmt = (iso: string) => {
    const d = new Date(`${iso}T00:00:00Z`);
    return { wd: WD[d.getUTCDay()], label: `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`, weekend: d.getUTCDay() % 6 === 0 };
  };
  return (
    <div className="space-y-6">
      <AutoSubmitForm action="/supplier/calendar" className="flex flex-wrap items-end gap-3">
        <label className="block w-full max-w-md">
          <span className="text-[13px] font-semibold">Experience</span>
          <select id="tour" name="tour" defaultValue={tour} className="sp-input mt-1.5">
            {products.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
          </select>
        </label>
        <div className="flex items-center gap-4 pb-2 text-xs text-sp-text2">
          <span className="flex items-center gap-1.5"><span className="h-2 w-5 rounded-full bg-forest" /> Seats sold</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-5 rounded-full bg-orange" /> 90%+ full</span>
        </div>
      </AutoSubmitForm>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Gauge} label="Occupancy" value={`${Math.round((sold / Math.max(cap, 1)) * 100)}%`} sub="Next 21 days" />
        <KpiCard icon={Ticket} label="Seats sold" value={sold} sub={`of ${cap} available`} />
        <KpiCard icon={TriangleAlert} label="Sold-out departures" value={full} sub={`${slots.length} departures scheduled`} />
        <KpiCard icon={CalendarCheck} label="Busiest day" value={busiest ? fmt(busiest.date).label : "–"} sub={busiest ? `${busiest.slots.reduce((s, x) => s + x.booked, 0)} guests` : undefined} />
      </div>

      <section className="sp-card p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {days.map((d) => {
            const f = fmt(d.date);
            return (
              <div key={d.date} className={`rounded-xl border p-3 ${f.weekend ? "border-sp-border bg-sp-warm" : "border-sp-border bg-white"}`}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-sp-text3">{f.wd}</p>
                <p className="font-semibold">{f.label}</p>
                <div className="mt-2 space-y-2">
                  {d.slots.map((s) => {
                    const pct = Math.round((s.booked / s.capacity) * 100);
                    return (
                      <div key={s.time}>
                        <div className="flex justify-between text-xs"><span className="font-medium">{s.time}</span><span className={`sp-num ${s.remaining === 0 ? "font-semibold text-orange" : "text-sp-text2"}`}>{s.remaining === 0 ? "Full" : `${s.booked}/${s.capacity}`}</span></div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sp-muted"><div className={`h-full rounded-full ${pct >= 90 ? "bg-orange" : "bg-forest"}`} style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
