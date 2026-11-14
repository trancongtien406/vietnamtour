import { supplierBookingAction } from "@/lib/actions";
import type { Booking } from "@/lib/types";

export function SupplierActions({ booking }: { booking: Booking }) {
  const actions: { action: string; label: string; style: string }[] = [];
  if (booking.status === "awaiting_supplier") {
    actions.push({ action: "confirm", label: "Confirm", style: "bg-jade text-white hover:bg-jade-dark" });
    actions.push({ action: "decline", label: "Decline", style: "border border-red-200 text-red-700 hover:bg-red-50" });
  }
  if (booking.status === "confirmed") actions.push({ action: "check-in", label: "Check in", style: "bg-lotus text-white hover:bg-lotus-dark" });
  if (!actions.length) return <span className="text-xs text-ink/40">—</span>;
  return (
    <div className="flex gap-2">
      {actions.map((a) => (
        <form key={a.action} action={supplierBookingAction}>
          <input type="hidden" name="code" value={booking.code} />
          <input type="hidden" name="action" value={a.action} />
          <button className={`rounded-full px-3 py-1.5 text-xs font-semibold ${a.style}`}>{a.label}</button>
        </form>
      ))}
    </div>
  );
}
