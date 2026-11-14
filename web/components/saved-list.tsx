"use client";

import Image from "next/image";
import Link from "next/link";
import { duration, usd } from "@/lib/format";
import type { TourSummary } from "@/lib/types";
import { Rating } from "./rating";
import { SaveButton } from "./save-button";
import { useSaved } from "./use-saved";

export function SavedList({ tours }: { tours: TourSummary[] }) {
  const saved = useSaved();
  const list = tours.filter((t) => saved.includes(t.slug));
  if (!list.length) {
    return (
      <div className="rounded-2xl border border-dashed border-mist bg-white p-12 text-center">
        <p className="font-display text-2xl font-bold">Nothing saved yet</p>
        <p className="mt-2 text-ink/60">Save experiences you like and compare them here.</p>
        <Link href="/tours" className="btn-primary mt-6">Browse experiences</Link>
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((t) => (
        <Link key={t.slug} href={`/tours/${t.slug}`} className="group overflow-hidden rounded-2xl border border-mist bg-white">
          <div className="relative aspect-[4/3]">
            <Image src={t.images[0]} alt={t.title} fill sizes="400px" className="object-cover" />
            <SaveButton slug={t.slug} className="absolute right-3 top-3" />
          </div>
          <div className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{t.destinationName}</p>
            <h3 className="mt-1 font-semibold group-hover:text-jade">{t.title}</h3>
            <div className="mt-3 flex items-center justify-between text-sm">
              <Rating value={t.rating} count={t.reviewCount} />
              <span>{duration(t.durationDays)} · <b>{usd(t.priceUsd)}</b></span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
