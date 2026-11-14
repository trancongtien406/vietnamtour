"use client";

import { useFormStatus } from "react-dom";
import { supplierBookingAction } from "@/lib/actions";

function Submit({ label, variant }: { label: string; variant: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={`sp-btn h-9 ${variant}`}>
      {pending ? "Saving…" : label}
    </button>
  );
}

export function SupplierBookingButton({ code, action, label, variant = "sp-btn-primary" }: { code: string; action: string; label: string; variant?: string }) {
  return (
    <form action={supplierBookingAction} className="inline">
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="action" value={action} />
      <Submit label={label} variant={variant} />
    </form>
  );
}
