"use client";

import { useActionState, useState } from "react";
import { replyReviewAction, type FormState } from "@/lib/actions";

export function ReviewReply({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(replyReviewAction, {});
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-semibold text-forest hover:underline">
        Reply publicly
      </button>
    );
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      <textarea name="text" required minLength={2} maxLength={600} rows={3} defaultValue={state.values?.text} placeholder="Thank the traveller and answer any feedback…" className="sp-input w-full" />
      {state.errors?.text && <p className="text-sm text-red-600">{state.errors.text}</p>}
      <div className="flex gap-2">
        <button disabled={pending} className="sp-btn sp-btn-primary h-9">{pending ? "Publishing…" : "Publish reply"}</button>
        <button type="button" onClick={() => setOpen(false)} className="sp-btn sp-btn-outline h-9">Cancel</button>
      </div>
    </form>
  );
}
