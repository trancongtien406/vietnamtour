import type { Booking } from "@/lib/types";
import { CheckIcon } from "@/components/icons";

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }) : undefined;

type Step = { label: string; at?: string; done: boolean; note?: string; tone?: "danger" };

/** Milestones derived from the booking so the voucher never shows contradictory states. */
export function bookingSteps(b: Booking): Step[] {
  const at = (s: Booking["status"]) => b.history.find((h) => h.status === s)?.at;
  const created = b.history[0]?.at;
  const paid = b.payment?.paidAt;
  const confirmed = at("confirmed");
  const steps: Step[] = [
    { label: "Booking created", at: created, done: true },
    { label: "Payment successful", at: paid, done: Boolean(paid), note: paid ? undefined : "Waiting for payment" },
  ];
  if (b.status === "awaiting_supplier" || (at("awaiting_supplier") && !confirmed && b.status !== "cancelled"))
    steps.push({ label: "Operator confirmation", done: false, note: "Usually within 24h" });
  else steps.push({ label: "Confirmed by operator", at: confirmed, done: Boolean(confirmed) });
  steps.push({ label: "Voucher issued", at: confirmed, done: Boolean(confirmed) && b.status !== "cancelled" });
  if (b.status === "checked_in") steps.push({ label: "Checked in", at: at("checked_in"), done: true });
  if (b.status === "cancelled")
    steps.push({ label: b.refundUsd > 0 ? "Cancelled · refunded" : "Cancelled", at: at("cancelled"), done: true, tone: "danger" });
  return steps;
}

export function BookingTimeline({ booking }: { booking: Booking }) {
  const steps = bookingSteps(booking);
  return (
    <ol className="mt-3 grid gap-3 sm:grid-flow-col sm:auto-cols-fr">
      {steps.map((s, i) => (
        <li key={s.label} className="flex items-start gap-2.5 sm:flex-col sm:gap-2">
          <div className="flex items-center gap-2 sm:w-full">
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                s.tone === "danger" ? "bg-red-600 text-white" : s.done ? "bg-jade text-white" : "border-2 border-dashed border-ink/25 text-ink/40"
              }`}
            >
              {s.done ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
            </span>
            {i < steps.length - 1 && <span className={`hidden h-0.5 flex-1 rounded sm:block ${steps[i + 1].done ? "bg-jade" : "bg-mist"}`} />}
          </div>
          <div className="text-xs">
            <p className={`font-semibold ${s.done ? "text-ink" : "text-ink/50"}`}>{s.label}</p>
            <p className="text-ink/50">{fmt(s.at) ?? s.note ?? "Pending"}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
