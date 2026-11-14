"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { STATUS_LABEL, STATUS_STYLE, longDate, usd } from "@/lib/format";
import type { Booking } from "@/lib/types";
import { HeartIcon } from "./icons";
import { useSaved } from "./use-saved";

type Tab = "upcoming" | "past" | "cancelled";

export function MyTrips() {
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [error, setError] = useState("");
  const [today, setToday] = useState("");
  const saved = useSaved();

  async function load(addr: string) {
    setError("");
    const res = await fetch(`/api/bookings?email=${encodeURIComponent(addr)}`);
    if (!res.ok) {
      setError("Please enter a valid email address.");
      return;
    }
    localStorage.setItem("vt:email", addr);
    setToday(new Date().toLocaleDateString("en-CA"));
    setBookings((await res.json()) as Booking[]);
  }

  useEffect(() => {
    const stored = localStorage.getItem("vt:email");
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage once
      setEmail(stored);
      void load(stored);
    }
  }, []);

  const groups: Record<Tab, Booking[]> = {
    upcoming: (bookings ?? []).filter((b) => b.status !== "cancelled" && b.date >= today),
    past: (bookings ?? []).filter((b) => b.status !== "cancelled" && b.date < today),
    cancelled: (bookings ?? []).filter((b) => b.status === "cancelled"),
  };

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
      <section>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void load(email.trim());
          }}
          className="flex flex-col gap-3 rounded-2xl border border-mist bg-white p-4 sm:flex-row"
        >
          <label htmlFor="email" className="sr-only">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" />
          <button className="btn-primary shrink-0">Find my bookings</button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        {bookings && (
          <>
            <div className="mt-6 flex gap-2" role="tablist">
              {(Object.keys(groups) as Tab[]).map((t) => (
                <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${tab === t ? "bg-ink text-white" : "bg-white text-ink/70 ring-1 ring-mist"}`}>
                  {t} <span className="ml-1 opacity-60">{groups[t].length}</span>
                </button>
              ))}
            </div>
            <ul className="mt-4 space-y-3">
              {groups[tab].map((b) => (
                <li key={b.code}>
                  <Link href={`/booking/${b.code}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-mist bg-white p-4 transition hover:border-jade/50">
                    <div>
                      <p className="font-semibold">{b.tourTitle}</p>
                      <p className="text-sm text-ink/60">{longDate(b.date)} · {b.time} · {b.adults + b.children} guests · <span className="font-mono">{b.code}</span></p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{usd(b.totalUsd)}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                    </div>
                  </Link>
                </li>
              ))}
              {groups[tab].length === 0 && (
                <li className="rounded-2xl border border-dashed border-mist bg-white p-8 text-center text-ink/60">
                  No {tab} trips. <Link href="/tours" className="font-semibold text-jade hover:underline">Find your next adventure</Link>
                </li>
              )}
            </ul>
          </>
        )}
      </section>
      <aside className="space-y-4">
        <Link href="/saved" className="flex items-center gap-3 rounded-2xl bg-sand p-5 hover:bg-mist/60">
          <HeartIcon className="h-6 w-6 text-lotus" filled />
          <div>
            <p className="font-semibold">Saved tours</p>
            <p className="text-sm text-ink/60">{saved.length} saved on this device</p>
          </div>
        </Link>
        <div className="rounded-2xl border border-mist bg-white p-5 text-sm">
          <p className="font-semibold">Need help?</p>
          <p className="mt-1 text-ink/60">Our Đà Nẵng team answers within an hour, 7am–10pm (GMT+7).</p>
          <p className="mt-3 font-semibold text-jade">support@vietnamtour.demo</p>
        </div>
      </aside>
    </div>
  );
}
