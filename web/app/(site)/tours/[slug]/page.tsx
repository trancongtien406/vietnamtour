import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingWidget } from "@/components/booking-widget";
import { CheckIcon, ClockIcon, PinIcon, UsersIcon, XIcon } from "@/components/icons";
import { Rating } from "@/components/rating";
import { SaveButton } from "@/components/save-button";
import { TourCard } from "@/components/tour-card";
import { ApiError, api } from "@/lib/api";
import { CATEGORY_LABEL, duration } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/tours/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  try {
    const t = await api.tour(slug);
    return { title: t.title, description: t.summary };
  } catch {
    return { title: "Tour not found" };
  }
}

export default function TourPage({ params }: PageProps<"/tours/[slug]">) {
  return (
    <Suspense fallback={<div className="container-x py-10"><div className="h-[460px] animate-pulse rounded-3xl bg-mist/60" /></div>}>
      <TourDetail params={params} />
    </Suspense>
  );
}

async function TourDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tour = await api.tour(slug).catch((e) => {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  });

  return (
    <article className="container-x py-8">
      <nav className="mb-4 text-sm text-ink/55" aria-label="Breadcrumb">
        <Link href="/tours" className="hover:text-jade">Experiences</Link> /{" "}
        <Link href={`/destinations/${tour.destinationSlug}`} className="hover:text-jade">{tour.destinationName}</Link>
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-lotus">{CATEGORY_LABEL[tour.category]}</p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight md:text-5xl">{tour.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink/70">
            <Rating value={tour.rating} count={tour.reviewCount} />
            <span className="inline-flex items-center gap-1"><PinIcon className="h-4 w-4" />{tour.destinationName}</span>
            <span className="inline-flex items-center gap-1"><ClockIcon className="h-4 w-4" />{duration(tour.durationDays)}</span>
            <span className="inline-flex items-center gap-1"><UsersIcon className="h-4 w-4" />Max {tour.maxGroupSize} guests</span>
          </div>
        </div>
        <SaveButton slug={tour.slug} className="border border-mist" />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3 md:grid-rows-2">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[440px]">
          <Image src={tour.images[0]} alt={tour.title} fill priority sizes="(min-width: 768px) 66vw, 100vw" className="object-cover" />
        </div>
        {tour.images.slice(1, 3).map((src) => (
          <div key={src} className="relative hidden aspect-[16/10] overflow-hidden rounded-2xl md:block md:aspect-auto">
            <Image src={src} alt="" fill sizes="33vw" className="object-cover" />
          </div>
        ))}
        {tour.images.length < 3 && (
          <div className="hidden flex-col justify-center rounded-2xl bg-sand p-6 md:flex">
            <p className="text-sm font-semibold uppercase tracking-wider text-jade">Languages</p>
            <p className="mt-1 font-semibold">{tour.languages.join(" · ")}</p>
            <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-jade">Starts at</p>
            <p className="mt-1 font-semibold">{tour.startTimes.join(" · ")}</p>
          </div>
        )}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          <section>
            <p className="text-lg leading-relaxed text-ink/80">{tour.summary}</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {tour.highlights.map((h) => (
                <li key={h} className="flex gap-3 rounded-xl bg-sand p-3 text-sm"><CheckIcon className="h-5 w-5 text-jade" />{h}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Itinerary</h2>
            <ol className="mt-5 space-y-0">
              {tour.itinerary.map((d, i) => (
                <li key={d.day} className="relative flex gap-4 pb-6">
                  {i < tour.itinerary.length - 1 && <span className="absolute left-[17px] top-9 h-full w-px bg-mist" aria-hidden />}
                  <span className="z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-jade text-sm font-bold text-white">{d.day}</span>
                  <div>
                    <h3 className="font-semibold">Day {d.day}: {d.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink/70">{d.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="font-display text-xl font-bold">What’s included</h2>
              <ul className="mt-3 space-y-2 text-sm">{tour.included.map((x) => <li key={x} className="flex gap-2"><CheckIcon className="h-5 w-5 text-jade" />{x}</li>)}</ul>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Not included</h2>
              <ul className="mt-3 space-y-2 text-sm">{tour.excluded.map((x) => <li key={x} className="flex gap-2"><XIcon className="h-5 w-5 text-ink/40" />{x}</li>)}</ul>
            </div>
          </section>

          <section className="rounded-2xl border border-mist bg-white p-5">
            <h2 className="font-display text-xl font-bold">Meeting point & policy</h2>
            <p className="mt-1 text-sm text-ink/60">Operated by <span className="font-semibold text-ink">{tour.operator}</span> · licensed local operator</p>
            <p className="mt-3 flex gap-2 text-sm"><PinIcon className="h-5 w-5 text-lotus" />{tour.meetingPoint}</p>
            <p className="mt-2 text-sm text-ink/70">
              {tour.freeCancellation
                ? "Cancel up to 24 hours before the start time for a full refund. Later cancellations and no-shows are non-refundable."
                : "This experience is non-refundable once confirmed by the operator."}
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Reviews</h2>
            <div className="mt-2"><Rating value={tour.rating} count={tour.reviewCount} className="text-base" /></div>
            <div className="mt-5 grid gap-4">
              {tour.reviews.map((r) => (
                <figure key={r.author + r.date} className="rounded-2xl bg-sand p-5">
                  <div className="flex items-center justify-between">
                    <figcaption className="font-semibold">{r.author} <span className="font-normal text-ink/55">· {r.country}</span></figcaption>
                    <Rating value={r.rating} />
                  </div>
                  <blockquote className="mt-2 text-sm leading-relaxed text-ink/75">“{r.comment}”</blockquote>
                  <p className="mt-2 text-xs text-ink/45">{new Date(r.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
                </figure>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start" id="book">
          <BookingWidget
            slug={tour.slug}
            priceUsd={tour.priceUsd}
            originalPriceUsd={tour.originalPriceUsd}
            maxGroupSize={tour.maxGroupSize}
            freeCancellation={tour.freeCancellation}
            instantConfirmation={tour.instantConfirmation}
          />
        </aside>
      </div>

      {tour.related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold">You might also like</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{tour.related.map((t) => <TourCard key={t.slug} tour={t} />)}</div>
        </section>
      )}
    </article>
  );
}
