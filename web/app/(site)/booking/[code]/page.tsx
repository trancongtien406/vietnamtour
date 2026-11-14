import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { Suspense } from "react";
import { CheckIcon, ClockIcon, PinIcon, UsersIcon } from "@/components/icons";
import { BookingTimeline } from "@/components/booking-timeline";
import { RememberEmail } from "@/components/remember-email";
import { Steps } from "@/components/steps";
import { api } from "@/lib/api";
import { cancelBookingAction } from "@/lib/actions";
import { STATUS_LABEL, STATUS_STYLE, duration, longDate, usd } from "@/lib/format";

export const metadata: Metadata = { title: "Your booking" };

export default function BookingPage({ params }: PageProps<"/booking/[code]">) {
  return (
    <div className="container-x max-w-4xl py-10">
      <Suspense fallback={<div className="h-[600px] animate-pulse rounded-3xl bg-mist/60" />}>
        <Voucher params={params} />
      </Suspense>
    </div>
  );
}

async function Voucher({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const b = await api.booking(code).catch(() => notFound());
  const tour = await api.tour(b.tourSlug);
  const valid = b.status === "confirmed" || b.status === "checked_in";
  const qr = valid
    ? await QRCode.toString(`VIETNAMTOUR|${b.code}|${b.tourSlug}|${b.date}|${b.time}`, { type: "svg", margin: 0, color: { dark: "#12211d", light: "#ffffff" } })
    : null;
  const refundable = Boolean(b.refundable);
  const canCancel = ["pending_payment", "awaiting_supplier", "confirmed"].includes(b.status);

  return (
    <>
      <RememberEmail email={b.email} />
      {b.status !== "cancelled" && <Steps current={3} />}
      {b.status === "confirmed" && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-900">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-600 text-white"><CheckIcon /></span>
          <div>
            <p className="font-semibold">You’re all set, {b.fullName}!</p>
            <p className="text-sm">We sent the voucher to {b.email}. Show the QR code to your guide.</p>
          </div>
        </div>
      )}
      {b.status === "awaiting_supplier" && (
        <div className="mb-6 rounded-2xl bg-sky-50 p-4 text-sky-900">
          <p className="font-semibold">Payment received, waiting for the operator</p>
          <p className="text-sm">The operator confirms within 24 hours. If they can’t run the tour you get a full refund automatically.</p>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-mist bg-white shadow-xl shadow-ink/5">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-jade px-6 py-5 text-white">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/70">Booking reference</p>
            <p className="font-mono text-2xl font-bold">{b.code}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_STYLE[b.status]}`}>{STATUS_LABEL[b.status]}</span>
        </div>
        <div className="grid gap-8 p-6 md:grid-cols-[1fr_220px]">
          <div className="space-y-4">
            <h1 className="font-display text-2xl font-bold leading-snug">{b.tourTitle}</h1>
            <ul className="space-y-2.5 text-sm">
              <li className="flex gap-2"><ClockIcon className="h-5 w-5 text-jade" />{longDate(b.date)} at {b.time} · {duration(tour.durationDays)}</li>
              <li className="flex gap-2"><UsersIcon className="h-5 w-5 text-jade" />{b.adults} adult{b.adults > 1 ? "s" : ""}{b.children ? `, ${b.children} child${b.children > 1 ? "ren" : ""}` : ""} · Lead traveller {b.fullName}</li>
              <li className="flex gap-2"><PinIcon className="h-5 w-5 text-jade" />{tour.meetingPoint}</li>
            </ul>
            <dl className="grid grid-cols-2 gap-3 rounded-2xl bg-sand p-4 text-sm">
              <div><dt className="text-ink/55">Total paid</dt><dd className="font-semibold">{b.payment ? usd(b.totalUsd) : "Not paid"}</dd></div>
              <div><dt className="text-ink/55">Payment</dt><dd className="font-semibold">{b.payment ? `${b.payment.brand} •••• ${b.payment.last4}` : "Pending"}</dd></div>
              {b.refundUsd > 0 && <div><dt className="text-ink/55">Refunded</dt><dd className="font-semibold text-emerald-700">{usd(b.refundUsd)}</dd></div>}
              <div><dt className="text-ink/55">Cancellation</dt><dd className="font-semibold">{b.freeCancellation ? "Free until 24h before" : "Non-refundable"}</dd></div>
            </dl>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-mist p-4 text-center">
            {qr ? (
              <>
                <div className="w-full max-w-[180px]" dangerouslySetInnerHTML={{ __html: qr }} />
                <p className="mt-3 text-xs text-ink/55">Scan at check-in</p>
              </>
            ) : (
              <p className="text-sm text-ink/55">{b.status === "cancelled" ? "This voucher is no longer valid." : "Your QR voucher appears once the booking is confirmed."}</p>
            )}
          </div>
        </div>
        <div className="border-t border-mist px-6 py-4">
          <h2 className="text-sm font-semibold">Booking timeline</h2>
          <BookingTimeline booking={b} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {b.status === "pending_payment" && <Link href={`/booking/${b.code}/pay`} className="btn-primary">Complete payment</Link>}
        <Link href="/account" className="btn-ghost">View all my trips</Link>
        {canCancel && (
          <form action={cancelBookingAction} className="ml-auto flex items-center gap-3">
            <input type="hidden" name="code" value={b.code} />
            <span className="text-sm text-ink/60">{b.payment ? (refundable ? `Full refund of ${usd(b.totalUsd)}` : "No refund (less than 24h or non-refundable)") : "Release your seats"}</span>
            <button className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Cancel booking</button>
          </form>
        )}
      </div>
    </>
  );
}
