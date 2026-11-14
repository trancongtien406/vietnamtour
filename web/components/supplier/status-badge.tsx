import type { Booking } from "@/lib/types";

type Tone = "confirmed" | "pending" | "cancelled" | "completed" | "refunded" | "processing" | "attention" | "neutral";

const TONE: Record<Tone, string> = {
  confirmed: "bg-[#DDF5E9] text-[#08734D] border-[#B8E8D0]",
  pending: "bg-[#FFF2D9] text-[#A76812] border-[#F3DEB1]",
  cancelled: "bg-[#FDE8E7] text-[#BE3C36] border-[#F5CFCC]",
  completed: "bg-[#E8F2EE] text-[#0D5B4C] border-[#C8DFD5]",
  refunded: "bg-[#F0EAF9] text-[#7852A5] border-[#DFD2F0]",
  processing: "bg-[#E8F0FC] text-[#3566A8] border-[#D0DFF5]",
  attention: "bg-orange-light text-[#B4541F] border-[#F6D3BE]",
  neutral: "bg-[#EFEBE4] text-[#5C665F] border-[#DED7CB]",
};

export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex h-7 items-center whitespace-nowrap rounded-full border px-3 text-xs font-semibold ${TONE[tone]}`}>
      {children}
    </span>
  );
}

export function bookingTone(b: Pick<Booking, "status" | "refundUsd">): [Tone, string] {
  switch (b.status) {
    case "confirmed":
      return ["confirmed", "Confirmed"];
    case "pending_payment":
      return ["pending", "Pending payment"];
    case "awaiting_supplier":
      return ["attention", "Needs action"];
    case "checked_in":
      return ["completed", "Checked in"];
    case "cancelled":
      return b.refundUsd > 0 ? ["refunded", "Refunded"] : ["cancelled", "Cancelled"];
  }
}

export function BookingBadge({ booking }: { booking: Pick<Booking, "status" | "refundUsd"> }) {
  const [tone, label] = bookingTone(booking);
  return <Badge tone={tone}>{label}</Badge>;
}

export function PayoutBadge({ status }: { status: "completed" | "scheduled" | "processing" | "collecting" }) {
  const map = {
    completed: ["completed", "Completed"],
    scheduled: ["neutral", "Scheduled"],
    processing: ["processing", "Processing"],
    collecting: ["pending", "Collecting"],
  } as const;
  const [tone, label] = map[status];
  return <Badge tone={tone}>{label}</Badge>;
}
