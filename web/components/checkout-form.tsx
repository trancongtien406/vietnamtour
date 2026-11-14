"use client";

import { useActionState } from "react";
import { createBookingAction, type FormState } from "@/lib/actions";
import { Field } from "./field";

type Hidden = { tourSlug: string; date: string; time: string; adults: string; children: string };

export function CheckoutForm({ hidden, total }: { hidden: Hidden; total: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createBookingAction, {});
  const v = state.values ?? {};
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-5">
      {Object.entries(hidden).map(([k, val]) => <input key={k} type="hidden" name={k} value={val} />)}
      {state.message && Object.keys(e).length === 0 && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.message}</p>}
      {(e.date || e.time || e.adults || e.tourSlug) && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{e.date ?? e.time ?? e.adults ?? e.tourSlug} Go back to change your selection.</p>
      )}
      <Field label="Full name" name="fullName" autoComplete="name" defaultValue={v.fullName} error={e.fullName} required />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={v.email} error={e.email} required />
        <Field label="Phone (WhatsApp / Zalo)" name="phone" type="tel" autoComplete="tel" placeholder="+84 905 123 456" defaultValue={v.phone} error={e.phone} required />
      </div>
      <label className="block">
        <span className="text-sm font-semibold">Special requests <span className="font-normal text-ink/50">(optional)</span></span>
        <textarea name="note" rows={3} defaultValue={v.note} placeholder="Dietary needs, hotel name for pick-up…" className="input mt-1.5" />
      </label>
      <button disabled={pending} className="btn-primary w-full !py-3.5 text-base">
        {pending ? "Reserving your seats…" : `Continue to payment · ${total}`}
      </button>
      <p className="text-center text-xs text-ink/55">No account needed. We’ll email your voucher and you can manage it under “My trips”.</p>
    </form>
  );
}
