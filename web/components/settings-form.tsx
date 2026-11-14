"use client";

import { useActionState } from "react";
import { updateSettingsAction, type FormState } from "@/lib/actions";
import type { SupplierSettings } from "@/lib/types";
import { Field } from "./field";

const NOTIFY: [keyof SupplierSettings["notifications"], string, string][] = [
  ["newBooking", "New booking", "Email and push as soon as a traveller books"],
  ["cancellation", "Cancellations", "When a booking is cancelled or refunded"],
  ["newReview", "New review", "When a traveller leaves a review"],
  ["dailySummary", "Daily summary", "Tomorrow’s departures and guest lists at 18:00"],
];

export function SettingsForm({ settings: s }: { settings: SupplierSettings }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateSettingsAction, {});
  const e = state.errors ?? {};
  const ok = state.message && !Object.keys(e).length;
  return (
    <form action={action} className="space-y-6">
      {state.message && <p role="status" className={`rounded-xl p-3 text-sm ${ok ? "border border-[#B8E8D0] bg-[#DDF5E9] text-[#08734D]" : "border border-[#F5CFCC] bg-[#FDE8E7] text-[#BE3C36]"}`}>{state.message}</p>}
      <section className="space-y-5 sp-card p-6">
        <h2 className="sp-h2">Company profile</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field sp label="Display name" name="companyName" defaultValue={s.companyName} error={e.companyName} />
          <Field sp label="Legal name" name="legalName" defaultValue={s.legalName} error={e.legalName} />
          <Field sp label="Tour operator licence" name="licenseNo" defaultValue={s.licenseNo} error={e.licenseNo} className="md:col-span-2" />
          <Field sp label="Office address" name="address" defaultValue={s.address} error={e.address} className="md:col-span-2" />
          <Field sp label="Operations email" name="email" type="email" defaultValue={s.email} error={e.email} />
          <Field sp label="Phone" name="phone" defaultValue={s.phone} error={e.phone} />
          <Field sp label="Website" name="website" defaultValue={s.website} error={e.website} />
          <Field sp label="Guide languages (comma separated)" name="languages" defaultValue={s.languages.join(", ")} error={e.languages} />
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 sp-card p-6">
          <h2 className="sp-h2">Booking rules</h2>
          <Field sp label="Booking cut-off (hours before departure)" name="cutoffHours" type="number" min={0} max={168} defaultValue={s.cutoffHours} error={e.cutoffHours} />
          <div className="rounded-xl bg-sp-muted p-4 text-sm">
            <p className="font-semibold">Payout account</p>
            <p className="mt-1 text-sp-text">{s.payout.bankName} · {s.payout.accountName} · •••• {s.payout.accountLast4}</p>
            <p className="text-xs text-sp-text2">Weekly payouts every Wednesday. Bank details are verified by Vietnamtour support.</p>
          </div>
        </section>
        <section className="space-y-3 sp-card p-6">
          <h2 className="sp-h2">Notifications</h2>
          {NOTIFY.map(([k, label, hint]) => (
            <label key={k} className="flex items-start gap-3 rounded-xl p-2 hover:bg-sp-muted">
              <input type="checkbox" name={k} defaultChecked={s.notifications[k]} className="mt-0.5 h-5 w-5 accent-[#0D5B4C]" />
              <span className="text-sm"><b>{label}</b><span className="block text-sp-text2">{hint}</span></span>
            </label>
          ))}
        </section>
      </div>
      <button disabled={pending} className="sp-btn sp-btn-primary">{pending ? "Saving…" : "Save settings"}</button>
    </form>
  );
}
