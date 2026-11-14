"use client";

import { Wallet, X } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { requestPayoutAction, type FormState } from "@/lib/actions";

const fmt = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function RequestPayout({ available, minimum, account }: { available: number; minimum: number; account: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"amount" | "confirm">("amount");
  const [amount, setAmount] = useState(available.toFixed(2));
  const [state, action, pending] = useActionState<FormState, FormData>(requestPayoutAction, {});
  const dialog = useRef<HTMLDialogElement>(null);
  const value = Number(amount);
  const error =
    !Number.isFinite(value) || value <= 0
      ? "Enter an amount."
      : value < minimum
        ? `Minimum payout is ${fmt(minimum)}.`
        : value > available
          ? `You can withdraw up to ${fmt(available)}.`
          : state.errors?.amountUsd;

  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);

  const done = state.message && !state.errors;
  return (
    <>
      <button type="button" disabled={available < minimum} onClick={() => { setStep("amount"); setAmount(available.toFixed(2)); setOpen(true); }} className="sp-btn sp-btn-primary h-11 rounded-full px-5">
        Request payout
      </button>
      <dialog ref={dialog} onClose={() => setOpen(false)} className="m-auto w-[min(440px,calc(100vw-2rem))] rounded-[20px] border border-sp-border p-0 text-sp-text shadow-2xl backdrop:bg-[rgba(20,40,32,.32)]">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-light text-orange"><Wallet className="h-5 w-5" /></span>
              <div>
                <h3 className="sp-h2">Request payout</h3>
                <p className="text-xs text-sp-text2">To {account}</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="sp-focus grid h-8 w-8 place-items-center rounded-lg hover:bg-sp-muted"><X className="h-4 w-4" /></button>
          </div>
          {done ? (
            <div className="mt-5 space-y-4">
              <p role="status" className="rounded-xl bg-[#DDF5E9] p-3 text-sm text-[#08734D]">{state.message}</p>
              <button type="button" onClick={() => setOpen(false)} className="sp-btn sp-btn-forest w-full">Done</button>
            </div>
          ) : step === "amount" ? (
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold">Amount (USD)</span>
                <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} aria-invalid={Boolean(error)} className={`sp-input mt-1.5 h-12 text-lg font-semibold ${error ? "!border-[#BE3C36]" : ""}`} />
                <span className={`mt-1 block text-xs ${error ? "text-[#BE3C36]" : "text-sp-text2"}`}>{error ?? `Available ${fmt(available)} · minimum ${fmt(minimum)}`}</span>
              </label>
              <button type="button" disabled={Boolean(error)} onClick={() => setStep("confirm")} className="sp-btn sp-btn-primary w-full">Continue</button>
            </div>
          ) : (
            <form action={action} className="mt-5 space-y-4">
              <input type="hidden" name="amountUsd" value={value} />
              <dl className="space-y-2 rounded-xl bg-sp-muted p-4 text-sm">
                <div className="flex justify-between"><dt className="text-sp-text2">Amount</dt><dd className="sp-num font-semibold">{fmt(value)}</dd></div>
                <div className="flex justify-between"><dt className="text-sp-text2">Destination</dt><dd className="font-medium">{account}</dd></div>
                <div className="flex justify-between"><dt className="text-sp-text2">Arrives</dt><dd className="font-medium">Within 2 business days</dd></div>
              </dl>
              {state.message && state.errors && <p className="text-sm text-[#BE3C36]">{state.errors.amountUsd ?? state.message}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("amount")} className="sp-btn sp-btn-outline flex-1">Back</button>
                <button disabled={pending} className="sp-btn sp-btn-primary flex-1">{pending ? "Requesting…" : "Confirm payout"}</button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
