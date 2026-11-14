"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usd } from "@/lib/format";
import type { Slot } from "@/lib/types";
import { BoltIcon, ShieldIcon } from "./icons";

const CHILD_RATE = 0.7;

function tomorrow() {
  const d = new Date(Date.now() + 864e5);
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
}

type Props = {
  slug: string;
  priceUsd: number;
  originalPriceUsd?: number;
  maxGroupSize: number;
  freeCancellation: boolean;
  instantConfirmation: boolean;
};

export function BookingWidget({ slug, priceUsd, originalPriceUsd, maxGroupSize, freeCancellation, instantConfirmation }: Props) {
  const router = useRouter();
  const [min] = useState(tomorrow);
  const [date, setDate] = useState(() => new Date(Date.now() + 7 * 864e5).toLocaleDateString("en-CA"));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [time, setTime] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    fetch(`/api/tours/${slug}/availability?date=${date}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Could not load availability"))))
      .then((d: { slots: Slot[] }) => {
        if (cancelled) return;
        setError("");
        setSlots(d.slots);
        setTime(
          (prev) =>
            d.slots.find((s) => s.time === prev && s.remaining > 0)?.time ??
            [...d.slots].sort((a, b) => b.remaining - a.remaining).find((s) => s.remaining > 0)?.time ??
            "",
        );
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [slug, date]);

  const guests = adults + children;
  const slot = slots?.find((s) => s.time === time);
  const enough = slot ? slot.remaining >= guests : false;
  const total = Math.round((priceUsd * adults + priceUsd * children * CHILD_RATE) * 100) / 100;

  return (
    <div className="rounded-2xl border border-mist bg-white p-5 shadow-xl shadow-ink/5">
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-ink/60">From</span>
        {originalPriceUsd && <span className="text-ink/45 line-through">{usd(originalPriceUsd)}</span>}
        <span className="text-3xl font-bold">{usd(priceUsd)}</span>
        <span className="text-sm text-ink/60">/ adult</span>
      </div>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold">Date</span>
          <input type="date" min={min} value={date} onChange={(e) => setDate(e.target.value)} className="input mt-1.5" />
        </label>

        <div>
          <span className="text-sm font-semibold">Start time</span>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {slots === null && !error && <div className="col-span-2 h-14 animate-pulse rounded-xl bg-mist/60" />}
            {slots?.map((s) => (
              <button
                key={s.time}
                type="button"
                disabled={s.remaining === 0}
                onClick={() => setTime(s.time)}
                className={`rounded-xl border px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
                  time === s.time ? "border-jade bg-jade/5 ring-2 ring-jade/20" : "border-mist hover:border-jade/50"
                }`}
              >
                <span className="block font-semibold">{s.time}</span>
                <span className={`text-xs ${s.remaining <= 3 && s.remaining > 0 ? "font-semibold text-lotus" : "text-ink/55"}`}>
                  {s.remaining === 0 ? "Sold out" : `${s.remaining} of ${s.capacity} seats left`}
                </span>
              </button>
            ))}
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <Stepper label="Adults" hint="Age 12+" value={adults} min={1} max={maxGroupSize - children} onChange={setAdults} />
        <Stepper label="Children" hint="Age 2–11 · 30% off" value={children} min={0} max={maxGroupSize - adults} onChange={setChildren} />
      </div>

      <dl className="mt-5 space-y-1.5 border-t border-mist pt-4 text-sm">
        <div className="flex justify-between"><dt className="text-ink/65">{adults} × adult {usd(priceUsd)}</dt><dd>{usd(priceUsd * adults)}</dd></div>
        {children > 0 && (
          <div className="flex justify-between"><dt className="text-ink/65">{children} × child {usd(priceUsd * CHILD_RATE)}</dt><dd>{usd(priceUsd * CHILD_RATE * children)}</dd></div>
        )}
        <div className="flex justify-between pt-1 text-base font-bold"><dt>Total</dt><dd>{usd(total)}</dd></div>
      </dl>

      {slot && !enough && <p className="mt-3 text-sm font-medium text-lotus">Only {slot.remaining} seats left at {slot.time}. Reduce guests or pick another time.</p>}

      <button
        type="button"
        disabled={!time || !enough}
        onClick={() => router.push(`/checkout?tour=${slug}&date=${date}&time=${time}&adults=${adults}&children=${children}`)}
        className="btn-primary mt-4 w-full !py-3.5 text-base"
      >
        Continue to checkout
      </button>

      <ul className="mt-4 space-y-2 text-sm text-ink/70">
        {freeCancellation && <li className="flex gap-2"><ShieldIcon className="h-4 w-4 text-jade" /> Free cancellation up to 24 hours before</li>}
        <li className="flex gap-2">
          <BoltIcon className="h-4 w-4 text-jade" />
          {instantConfirmation ? "Instant confirmation with mobile voucher" : "Operator confirms within 24 hours"}
        </li>
      </ul>
    </div>
  );
}

function Stepper({ label, hint, value, min, max, onChange }: { label: string; hint: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-ink/55">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="grid h-9 w-9 place-items-center rounded-full border border-mist text-lg disabled:opacity-40">−</button>
        <span className="w-5 text-center font-semibold" aria-live="polite">{value}</span>
        <button type="button" aria-label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="grid h-9 w-9 place-items-center rounded-full border border-mist text-lg disabled:opacity-40">+</button>
      </div>
    </div>
  );
}
