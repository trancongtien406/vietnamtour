import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingSummary } from "@/components/booking-summary";
import { CheckoutForm } from "@/components/checkout-form";
import { Steps } from "@/components/steps";
import { api } from "@/lib/api";
import { usd } from "@/lib/format";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  return (
    <div className="container-x max-w-5xl py-10">
      <Steps current={1} />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-mist/60" />}>
        <Checkout searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Checkout({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]) ?? "";
  const slug = get("tour");
  if (!slug) notFound();
  const tour = await api.tour(slug).catch(() => notFound());
  const adults = Math.max(1, Number(get("adults")) || 1);
  const children = Math.max(0, Number(get("children")) || 0);
  const total = Math.round((tour.priceUsd * adults + tour.priceUsd * children * 0.7) * 100) / 100;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section className="rounded-2xl border border-mist bg-white p-6">
        <h1 className="font-display text-2xl font-bold">Who’s the lead traveller?</h1>
        <p className="mb-6 mt-1 text-sm text-ink/60">Your seats are held while you pay. <Link href={`/tours/${slug}#book`} className="font-semibold text-jade hover:underline">Change date or guests</Link></p>
        <CheckoutForm
          hidden={{ tourSlug: slug, date: get("date"), time: get("time"), adults: String(adults), children: String(children) }}
          total={usd(total)}
        />
      </section>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <BookingSummary
          title={tour.title}
          image={tour.images[0]}
          date={get("date")}
          time={get("time")}
          durationDays={tour.durationDays}
          adults={adults}
          kids={children}
          unitPriceUsd={tour.priceUsd}
          totalUsd={total}
          meetingPoint={tour.meetingPoint}
        />
      </aside>
    </div>
  );
}
