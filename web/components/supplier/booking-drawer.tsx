"use client";

import { CalendarDays, CheckCircle2, Circle, CreditCard, Download, Mail, MessageSquareText, UserRound, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { bookingSteps } from "@/components/booking-timeline";
import { supplierBookingAction } from "@/lib/actions";
import type { Booking, TourSummary } from "@/lib/types";
import { SupplierBookingButton } from "./booking-button";
import { BookingBadge } from "./status-badge";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const longDay = (iso: string) => {
  const dt = new Date(`${iso}T00:00:00Z`);
  return `${WD[dt.getUTCDay()]}, ${dt.getUTCDate()} ${MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
};
const stamp = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }) : "Pending";
const usd = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

function Section({ icon: Icon, title, children }: { icon: typeof CalendarDays; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-sp-border bg-white px-4 py-3">
      <h3 className="mb-1.5 flex items-center gap-2 text-[14px] font-semibold"><Icon className="h-4 w-4 text-sp-text2" strokeWidth={1.8} />{title}</h3>
      {children}
    </section>
  );
}

function Rows({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[112px_1fr] gap-x-3 gap-y-1 text-[13px] leading-5">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-sp-text2">{k}</dt>
          <dd className="font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function BookingDrawer({ booking: b, tour, onClose }: { booking: Booking; tour?: TourSummary; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const party = [`${b.adults} adult${b.adults > 1 ? "s" : ""}`, b.children ? `${b.children} child${b.children > 1 ? "ren" : ""}` : ""].filter(Boolean).join(", ");
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <button type="button" aria-label="Close booking details" onClick={onClose} className="absolute inset-0 cursor-default bg-[rgba(20,40,32,.22)]" />
      <aside className="absolute inset-y-0 right-0 flex w-full flex-col bg-sp-warm shadow-[-12px_0_40px_rgba(23,37,31,.10)] sm:w-[480px] sm:rounded-l-[20px]">
        <header className="flex items-start justify-between gap-3 border-b border-sp-border px-5 pt-4 pb-3">
          <div>
            <h2 id="drawer-title" className="sp-h2">Booking details</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-sm font-semibold">{b.code}</span>
              <BookingBadge booking={b} />
            </div>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="sp-focus grid h-9 w-9 place-items-center rounded-lg hover:bg-sp-muted"><X className="h-5 w-5" /></button>
        </header>
        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-5 py-3">
          <div className="flex items-center gap-3">
            {tour?.images[0] && <div className="relative h-12 w-[72px] shrink-0 overflow-hidden rounded-lg"><Image src={tour.images[0]} alt="" fill sizes="72px" className="object-cover" /></div>}
            <p className="font-[family-name:var(--font-sp-serif)] text-[17px] leading-snug">{b.tourTitle}</p>
          </div>
          <Section icon={CalendarDays} title="Departure">
            <Rows rows={[["Date & time", `${longDay(b.date)} · ${b.time}`], ["Duration", tour ? `${tour.durationDays} day${tour.durationDays > 1 ? "s" : ""}` : "–"], ["Meeting point", tour?.meetingPoint ?? "–"]]} />
          </Section>
          <Section icon={UserRound} title="Guest information">
            <Rows rows={[["Lead traveller", b.fullName], ["Email", <a key="e" href={`mailto:${b.email}`} className="text-forest hover:underline">{b.email}</a>], ["Phone", b.phone], ["Party", party]]} />
          </Section>
          <Section icon={CreditCard} title="Payment">
            <Rows
              rows={[
                ["Total", <span key="t" className="sp-num font-semibold">{usd(b.totalUsd)}</span>],
                ["Payment method", b.payment ? `${b.payment.brand} •••• ${b.payment.last4}` : "Not paid yet"],
                ["Net earnings", <span key="p" className="sp-num">{usd(Math.round((b.totalUsd - b.refundUsd) * 80) / 100)} (after 20% commission)</span>],
                ...(b.refundUsd > 0 ? [["Refunded", <span key="r" className="sp-num text-[#7852A5]">{usd(b.refundUsd)}</span>] as [string, React.ReactNode]] : []),
                ["Cancellation", b.freeCancellation ? "Free until 24h before" : "Non-refundable"],
              ]}
            />
          </Section>
          <Section icon={CheckCircle2} title="Booking timeline">
            <ol className="space-y-1 text-[13px] leading-5">
              {bookingSteps(b).map((s) => (
                <li key={s.label} className="flex items-center gap-2">
                  {s.done ? <CheckCircle2 className={`h-4 w-4 ${s.tone === "danger" ? "text-[#BE3C36]" : "text-[#08734D]"}`} /> : <Circle className="h-4 w-4 text-sp-strong" />}
                  <span className={s.done ? "font-medium" : "text-sp-text3"}>{s.label}</span>
                  <span className="ml-auto text-sp-text2">{s.at ? stamp(s.at) : s.note ?? ""}</span>
                </li>
              ))}
            </ol>
          </Section>
          <Section icon={MessageSquareText} title="Guest note">
            <p className="text-[13px] text-sp-text2">{b.note || "No special requests."}</p>
          </Section>
        </div>
        <footer className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-sp-border bg-sp-warm px-5 py-3">
          {b.status === "confirmed" && <SupplierBookingButton code={b.code} action="check-in" label="Check in" />}
          {b.status === "awaiting_supplier" && (
            <>
              <SupplierBookingButton code={b.code} action="confirm" label="Confirm booking" variant="sp-btn-forest" />
              <SupplierBookingButton code={b.code} action="decline" label="Decline" variant="sp-btn-outline text-[#BE3C36]" />
            </>
          )}
          <a href={`mailto:${b.email}?subject=${encodeURIComponent(`Your ${b.tourTitle} booking ${b.code}`)}`} className="sp-btn sp-btn-outline h-9"><Mail className="h-4 w-4" /> Message guest</a>
          {(b.status === "confirmed" || b.status === "checked_in") && (
            <a href={`/booking/${b.code}`} target="_blank" rel="noreferrer" className="sp-btn h-9 px-2 text-sp-text hover:bg-sp-muted"><Download className="h-4 w-4" /> Voucher</a>
          )}
          {["confirmed", "pending_payment"].includes(b.status) && (
            <form
              action={async (fd) => {
                if (!window.confirm(`Cancel ${b.code}? ${b.payment ? `The guest is refunded ${usd(b.totalUsd)}.` : ""}`)) return;
                await supplierBookingAction(fd);
              }}
              className="ml-auto"
            >
              <input type="hidden" name="code" value={b.code} />
              <input type="hidden" name="action" value="cancel" />
              <button className="sp-btn h-9 px-2 text-[#BE3C36] hover:bg-[#FDE8E7]">Cancel</button>
            </form>
          )}
        </footer>
      </aside>
    </div>
  );
}
