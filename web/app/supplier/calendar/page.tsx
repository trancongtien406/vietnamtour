import type { Metadata } from "next";
import { Suspense } from "react";
import { AutoSubmitForm } from "@/components/auto-submit-form";
import { api } from "@/lib/api";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage({ searchParams }: PageProps<"/supplier/calendar">) {
  return (
    <>
      <h1 className="font-display text-3xl font-bold">Availability calendar</h1>
      <p className="mt-1 text-ink/60">Seats sold per departure for the next three weeks.</p>
      <Suspense fallback={<div className="mt-8 h-96 animate-pulse rounded-2xl bg-mist/60" />}>
        <Calendar searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Calendar({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const products = await api.supplier.products();
  const tour = typeof sp.tour === "string" && products.some((p) => p.slug === sp.tour) ? sp.tour : products[0].slug;
  const days = await api.supplier.calendar(tour, 21);
  return (
    <div className="mt-6">
      <AutoSubmitForm action="/supplier/calendar" className="max-w-md">
        <label className="text-sm font-semibold" htmlFor="tour">Experience</label>
        <select id="tour" name="tour" defaultValue={tour} className="input mt-1.5">
          {products.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
        </select>
      </AutoSubmitForm>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {days.map((d) => {
          const date = new Date(`${d.date}T00:00:00`);
          return (
            <div key={d.date} className="rounded-2xl bg-white p-3 ring-1 ring-mist">
              <p className="text-xs font-semibold uppercase text-ink/50">{date.toLocaleDateString("en-GB", { weekday: "short" })}</p>
              <p className="font-semibold">{date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
              <div className="mt-2 space-y-2">
                {d.slots.map((s) => {
                  const pct = Math.round((s.booked / s.capacity) * 100);
                  return (
                    <div key={s.time}>
                      <div className="flex justify-between text-xs"><span>{s.time}</span><span className={s.remaining === 0 ? "font-semibold text-lotus" : "text-ink/55"}>{s.remaining === 0 ? "Full" : `${s.booked}/${s.capacity}`}</span></div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-mist"><div className={`h-full rounded-full ${pct >= 90 ? "bg-lotus" : "bg-jade"}`} style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
