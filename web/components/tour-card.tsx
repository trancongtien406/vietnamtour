import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABEL, duration, usd } from "@/lib/format";
import type { TourSummary } from "@/lib/types";
import { BoltIcon, ClockIcon } from "./icons";
import { Rating } from "./rating";
import { SaveButton } from "./save-button";

export function TourCard({ tour, priority = false }: { tour: TourSummary; priority?: boolean }) {
  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-mist bg-white transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ink/5"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={tour.images[0]}
          alt={tour.title}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-jade">
          {CATEGORY_LABEL[tour.category]}
        </span>
        <SaveButton slug={tour.slug} className="absolute right-3 top-3" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{tour.destinationName}</p>
        <h3 className="mt-1 line-clamp-2 font-semibold leading-snug group-hover:text-jade">{tour.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/65">
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="h-4 w-4" /> {duration(tour.durationDays)}
          </span>
          {tour.instantConfirmation && (
            <span className="inline-flex items-center gap-1 text-jade">
              <BoltIcon className="h-3.5 w-3.5" /> Instant
            </span>
          )}
          {tour.freeCancellation && <span className="text-jade">Free cancellation</span>}
        </div>
        <div className="mt-auto flex items-end justify-between pt-4">
          <Rating value={tour.rating} count={tour.reviewCount} />
          <div className="text-right">
            {tour.originalPriceUsd && (
              <span className="mr-1 text-sm text-ink/45 line-through">{usd(tour.originalPriceUsd)}</span>
            )}
            <span className="text-xs text-ink/55">from </span>
            <span className="text-lg font-bold">{usd(tour.priceUsd)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function TourGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-mist bg-white">
          <div className="aspect-[4/3] animate-pulse bg-mist/60" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-mist" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-mist" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-mist" />
          </div>
        </div>
      ))}
    </div>
  );
}
