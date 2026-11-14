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
    <form action={action} className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-mist">
      <input type="hidden" name="slug" value={tour.slug} />
      {state.message && <p role="status" className={`rounded-xl p-3 text-sm ${ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{state.message}</p>}
      <Field label="Title" name="title" defaultValue={tour.title} error={e.title} />
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Adult price (USD)" name="priceUsd" type="number" min={1} defaultValue={tour.priceUsd} error={e.priceUsd} />
        <Field label="Capacity per departure" name="maxGroupSize" type="number" min={1} max={60} defaultValue={tour.maxGroupSize} error={e.maxGroupSize} />
        <Field label="Start times (HH:MM, comma separated)" name="startTimes" defaultValue={tour.startTimes.join(", ")} error={e.startTimes} />
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" name="published" defaultChecked={tour.published} className="h-5 w-5 accent-jade" />
        <span><b>Published</b> · visible and bookable on the website</span>
      </label>
      <button disabled={pending} className="btn-primary">{pending ? "Saving…" : "Save changes"}</button>
    </form>
  );
}
