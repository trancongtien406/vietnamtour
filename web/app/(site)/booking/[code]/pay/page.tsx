import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { BookingSummary } from "@/components/booking-summary";
import { PaymentForm } from "@/components/payment-form";
import { Steps } from "@/components/steps";
import { api } from "@/lib/api";
import { usd } from "@/lib/format";

export const metadata: Metadata = { title: "Payment" };

export default function PayPage({ params }: PageProps<"/booking/[code]/pay">) {
  return (
    <div className="container-x max-w-5xl py-10">
      <Steps current={2} />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-mist/60" />}>
        <Pay params={params} />
      </Suspense>
    </div>
  );
}

async function Pay({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const booking = await api.booking(code).catch(() => notFound());
  if (booking.status !== "pending_payment") redirect(`/booking/${booking.code}`);
  const tour = await api.tour(booking.tourSlug);
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section className="rounded-2xl border border-mist bg-white p-6">
        <h1 className="font-display text-2xl font-bold">Payment</h1>
        <p className="mb-6 mt-1 text-sm text-ink/60">Booking <span className="font-mono font-semibold">{booking.code}</span> for {booking.fullName}</p>
        <PaymentForm code={booking.code} total={usd(booking.totalUsd)} name={booking.fullName} />
      </section>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <BookingSummary title={booking.tourTitle} image={tour.images[0]} date={booking.date} time={booking.time} durationDays={tour.durationDays} adults={booking.adults} kids={booking.children} unitPriceUsd={booking.unitPriceUsd} totalUsd={booking.totalUsd} meetingPoint={tour.meetingPoint} />
      </aside>
    </div>
  );
}
