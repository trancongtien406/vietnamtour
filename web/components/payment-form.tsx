"use client";

import { useActionState, useState } from "react";
import { payAction, type FormState } from "@/lib/actions";
import { Field } from "./field";
import { ShieldIcon } from "./icons";

const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export function PaymentForm({ code, total, name }: { code: string; total: string; name: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(payAction, {});
  const [card, setCard] = useState(state.values?.cardNumber ?? "");
  const [expiry, setExpiry] = useState(state.values?.expiry ?? "");
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="code" value={code} />
      <div className="rounded-xl border border-dashed border-jade/40 bg-jade/5 p-4 text-sm">
        <p className="font-semibold text-jade">Sandbox mode, no real charge</p>
        <p className="mt-1 text-ink/70">
          Use <button type="button" className="font-mono font-semibold underline" onClick={() => { setCard("4242 4242 4242 4242"); setExpiry("12/30"); }}>4242 4242 4242 4242</button> to succeed
          or <span className="font-mono">4000 0000 0000 0002</span> to see a declined card. Any future expiry and CVC.
        </p>
      </div>
      {state.message && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.message}</p>}
      <Field label="Name on card" name="name" defaultValue={state.values?.name ?? name} autoComplete="cc-name" />
      <Field label="Card number" name="cardNumber" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" value={card} onChange={(ev) => setCard(formatCard(ev.target.value))} error={e.cardNumber} required />
      <div className="grid grid-cols-2 gap-5">
        <Field label="Expiry" name="expiry" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={expiry} onChange={(ev) => setExpiry(formatExpiry(ev.target.value))} error={e.expiry} required />
        <Field label="CVC" name="cvc" inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} defaultValue={state.values?.cvc} error={e.cvc} required />
      </div>
      <button disabled={pending} className="btn-primary w-full !py-3.5 text-base">{pending ? "Processing…" : `Pay ${total}`}</button>
      <p className="flex items-center justify-center gap-2 text-xs text-ink/55"><ShieldIcon className="h-4 w-4" /> Secured payment · Card details never stored</p>
    </form>
  );
}
