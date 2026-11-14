"use client";

import { useActionState } from "react";
import { updateProductAction, type FormState } from "@/lib/actions";
import type { Tour } from "@/lib/types";
import { Field } from "./field";

export function ProductEditor({ tour }: { tour: Tour }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProductAction, {});
  const e = state.errors ?? {};
  const ok = state.message && !Object.keys(e).length;
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="slug" value={tour.slug} />
      {state.message && <p role="status" className={`rounded-xl border p-3 text-sm ${ok ? "border-[#B8E8D0] bg-[#DDF5E9] text-[#08734D]" : "border-[#F5CFCC] bg-[#FDE8E7] text-[#BE3C36]"}`}>{state.message}</p>}
      <section className="sp-card space-y-5 p-6">
        <h2 className="sp-h2">Listing</h2>
        <Field sp label="Title" name="title" defaultValue={tour.title} error={e.title} />
        <label className="flex items-start gap-3 rounded-xl border border-sp-border bg-sp-warm p-4 text-sm">
          <input type="checkbox" name="published" defaultChecked={tour.published} className="mt-0.5 h-5 w-5 accent-[#0D5B4C]" />
          <span><b>Published</b><span className="block text-sp-text2">Visible and bookable on the website and mobile app.</span></span>
        </label>
      </section>
      <section className="sp-card space-y-5 p-6">
        <h2 className="sp-h2">Pricing & capacity</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field sp label="Adult price (USD)" name="priceUsd" type="number" min={1} defaultValue={tour.priceUsd} error={e.priceUsd} />
          <Field sp label="Capacity per departure" name="maxGroupSize" type="number" min={1} max={60} defaultValue={tour.maxGroupSize} error={e.maxGroupSize} />
          <Field sp label="Start times (HH:MM, comma separated)" name="startTimes" defaultValue={tour.startTimes.join(", ")} error={e.startTimes} />
        </div>
        <p className="text-xs text-sp-text2">Children (2–11) pay 70% of the adult price. Vietnamtour keeps a 20% commission on each booking.</p>
      </section>
      <div className="flex gap-3">
        <button disabled={pending} className="sp-btn sp-btn-primary">{pending ? "Saving…" : "Save changes"}</button>
        <a href={`/tours/${tour.slug}`} target="_blank" rel="noreferrer" className="sp-btn sp-btn-outline">Preview listing</a>
      </div>
    </form>
  );
}
