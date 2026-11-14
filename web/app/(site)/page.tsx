import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { BoltIcon, ShieldIcon, StarIcon, UsersIcon } from "@/components/icons";
import { SearchBar } from "@/components/search-bar";
import { TourCard, TourGridSkeleton } from "@/components/tour-card";
import { api } from "@/lib/api";
import { CATEGORY_LABEL, usd } from "@/lib/format";
import type { Category } from "@/lib/types";

const CATEGORY_IMAGES: Record<Category, string> = {
  cruise: "/images/destinations/ha-long-bay-2.jpg",
  food: "/images/destinations/hoi-an-2.jpg",
  adventure: "/images/destinations/ha-giang-2.jpg",
  culture: "/images/destinations/hue-2.jpg",
  beach: "/images/destinations/phu-quoc-2.jpg",
  nature: "/images/destinations/sa-pa-2.jpg",
};

export default function Home() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <Image
          src="/images/destinations/ninh-binh-2.jpg"
          alt="Tour boats among limestone karsts at Tràng An, Ninh Bình"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-ink/35 to-ink/75" />
        <div className="container-x flex min-h-[560px] flex-col justify-center py-20 text-white md:min-h-[620px]">
          <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm backdrop-blur">
            <StarIcon className="h-4 w-4 text-amber-300" /> Rated 4.8/5 by travellers from 60+ countries
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.1] md:text-6xl">
            Discover Vietnam with people who call it home
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            Cruises, treks, food walks and cultural tours from licensed local operators. Book in minutes, cancel for free up to 24 hours before.
          </p>
          <div className="mt-8">
            <SearchBar />
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            {["Hạ Long", "Hội An", "Sa Pa", "Street food", "Cave"].map((q) => (
              <Link key={q} href={`/tours?q=${encodeURIComponent(q)}`} className="rounded-full bg-white/15 px-3 py-1 backdrop-blur hover:bg-white/25">
                {q}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-mist bg-white">
        <div className="container-x grid gap-6 py-8 sm:grid-cols-3">
          {[
            { icon: BoltIcon, title: "Instant confirmation", text: "Get your mobile voucher with QR code right after booking." },
            { icon: ShieldIcon, title: "Free cancellation", text: "Plans changed? Cancel up to 24 hours before for a full refund." },
            { icon: UsersIcon, title: "Small local groups", text: "Licensed guides, never more than 25 guests per departure." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-jade/10 text-jade">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-ink/65">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x pt-16">
        <SectionTitle eyebrow="Top picks" title="Most-loved experiences" href="/tours" />
        <Suspense fallback={<TourGridSkeleton />}>
          <FeaturedTours />
        </Suspense>
      </section>

      <section className="container-x pt-20">
        <SectionTitle eyebrow="Where to go" title="Popular destinations" href="/destinations" />
        <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-mist/60" />}>
          <Destinations />
        </Suspense>
      </section>

      <section className="container-x pt-20">
        <SectionTitle eyebrow="Travel your way" title="Browse by interest" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
            <Link key={c} href={`/tours?category=${c}`} className="group relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image src={CATEGORY_IMAGES[c]} alt="" fill sizes="(min-width: 1024px) 200px, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <span className="absolute bottom-3 left-3 right-3 font-semibold text-white">{CATEGORY_LABEL[c]}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-x pt-20">
        <div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-jade p-8 text-white md:grid-cols-2 md:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/70">For local operators</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Run your tours on Vietnamtour</h2>
            <p className="mt-4 text-white/80">
              Manage products, departures, capacity and bookings in one supplier portal. Scan vouchers at check-in and track your payouts.
            </p>
            <Link href="/supplier" className="btn-primary mt-6">Open supplier portal</Link>
          </div>
          <Suspense fallback={null}>
            <Stats />
          </Suspense>
        </div>
      </section>
    </>
  );
}

function SectionTitle({ eyebrow, title, href }: { eyebrow: string; title: string; href?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-lotus">{eyebrow}</p>
        <h2 className="mt-1 font-display text-3xl font-bold md:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="hidden shrink-0 text-sm font-semibold text-jade hover:underline sm:block">
          View all →
        </Link>
      )}
    </div>
  );
}

async function FeaturedTours() {
  const { items } = await api.tours({ featured: "true" });
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.slice(0, 6).map((t, i) => (
        <TourCard key={t.slug} tour={t} priority={i < 3} />
      ))}
    </div>
  );
}

async function Destinations() {
  const all = await api.destinations();
  const picks = ["ha-long-bay", "hoi-an", "sa-pa", "da-nang", "saigon"]
    .map((s) => all.find((d) => d.slug === s))
    .filter((d) => d !== undefined);
  return (
    <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
      {picks.map((d, i) => (
        <Link
          key={d.slug}
          href={`/destinations/${d.slug}`}
          className={`group relative min-h-56 overflow-hidden rounded-2xl ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
        >
          <Image src={d.image} alt={d.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
          <div className="absolute bottom-0 p-5 text-white">
            <h3 className={`font-display font-bold ${i === 0 ? "text-3xl" : "text-xl"}`}>{d.name}</h3>
            <p className="text-sm text-white/80">
              {d.tourCount} {d.tourCount === 1 ? "experience" : "experiences"}
              {d.fromPriceUsd !== null && ` · from ${usd(d.fromPriceUsd)}`}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

async function Stats() {
  const s = await api.stats();
  return (
    <dl className="grid grid-cols-2 gap-4">
      {[
        [s.tours, "Bookable experiences"],
        [s.destinations, "Destinations"],
        [s.reviews.toLocaleString("en-US"), "Verified reviews"],
        [`${s.averageRating}/5`, "Average rating"],
      ].map(([v, l]) => (
        <div key={String(l)} className="rounded-2xl bg-white/10 p-5">
          <dt className="text-sm text-white/70">{l}</dt>
          <dd className="mt-1 font-display text-3xl font-bold">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
