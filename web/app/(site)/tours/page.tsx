import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AutoSubmitForm } from "@/components/auto-submit-form";
import { SearchIcon } from "@/components/icons";
import { TourCard, TourGridSkeleton } from "@/components/tour-card";
import { api } from "@/lib/api";
import { CATEGORY_LABEL, REGION_LABEL } from "@/lib/format";
import type { Category, Region } from "@/lib/types";

export const metadata: Metadata = { title: "All experiences" };

type Search = Record<string, string | string[] | undefined>;
const KEYS = ["q", "region", "category", "maxPrice", "maxDays", "language", "minRating", "freeCancellation", "sort"] as const;

function pick(sp: Search) {
  const out: Record<string, string | undefined> = {};
  for (const k of KEYS) {
    const v = sp[k];
    out[k] = Array.isArray(v) ? v[0] : v;
  }
  return out;
}

export default function ToursPage({ searchParams }: PageProps<"/tours">) {
  return (
    <div className="container-x py-10">
      <Suspense fallback={<ToursSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function ToursSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <div className="hidden h-[520px] animate-pulse rounded-2xl bg-mist/50 lg:block" />
      <TourGridSkeleton />
    </div>
  );
}

async function Results({ searchParams }: { searchParams: Promise<Search> }) {
  const q = pick(await searchParams);
  const { items, total } = await api.tours(q);
  const active = KEYS.filter((k) => k !== "sort" && q[k]);

  return (
    <AutoSubmitForm action="/tours" className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div>
          <label htmlFor="q" className="text-sm font-semibold">Search</label>
          <div className="relative mt-2">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
            <input id="q" name="q" defaultValue={q.q} placeholder="Destination or activity" className="input !pl-9" />
          </div>
        </div>
        <details className="group rounded-2xl border border-mist bg-white p-4 lg:open" open>
          <summary className="cursor-pointer list-none text-sm font-semibold lg:pointer-events-none">
            Filters {active.length > 0 && <span className="ml-1 rounded-full bg-lotus px-2 py-0.5 text-xs text-white">{active.length}</span>}
          </summary>
          <div className="mt-4 space-y-5">
            <Select name="region" label="Region" value={q.region} options={Object.entries(REGION_LABEL) as [Region, string][]} />
            <Select name="category" label="Activity" value={q.category} options={Object.entries(CATEGORY_LABEL) as [Category, string][]} />
            <Select name="maxPrice" label="Max price" value={q.maxPrice} options={[["50", "Under $50"], ["100", "Under $100"], ["200", "Under $200"], ["300", "Under $300"]]} />
            <Select name="maxDays" label="Duration" value={q.maxDays} options={[["1", "Day trips"], ["2", "Up to 2 days"], ["3", "Up to 3 days"], ["4", "Up to 4 days"]]} />
            <Select name="language" label="Guide language" value={q.language} options={[["English", "English"], ["Tiếng Việt", "Tiếng Việt"], ["Français", "Français"], ["中文", "中文"], ["한국어", "한국어"], ["Español", "Español"], ["Русский", "Русский"]]} />
            <Select name="minRating" label="Rating" value={q.minRating} options={[["4.8", "4.8+ Exceptional"], ["4.5", "4.5+ Excellent"]]} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="freeCancellation" value="true" defaultChecked={q.freeCancellation === "true"} className="h-4 w-4 accent-jade" />
              Free cancellation only
            </label>
            <noscript><button className="btn-primary w-full">Apply</button></noscript>
            {active.length > 0 && (
              <Link href="/tours" className="block text-sm font-semibold text-jade hover:underline">Clear all filters</Link>
            )}
          </div>
        </details>
      </aside>

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">{q.q ? `Results for “${q.q}”` : "All experiences in Vietnam"}</h1>
            <p className="mt-1 text-sm text-ink/60">{total} {total === 1 ? "experience" : "experiences"} found</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-ink/60">Sort by</span>
            <select name="sort" defaultValue={q.sort ?? ""} className="input !w-auto !py-2">
              <option value="">Recommended</option>
              <option value="rating">Top rated</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="duration">Duration</option>
            </select>
          </label>
        </div>
        {items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((t, i) => <TourCard key={t.slug} tour={t} priority={i < 3} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-mist bg-white p-12 text-center">
            <p className="font-display text-2xl font-bold">No experiences match those filters</p>
            <p className="mt-2 text-ink/60">Try removing a filter or searching for another destination.</p>
            <Link href="/tours" className="btn-primary mt-6">Show all experiences</Link>
          </div>
        )}
      </section>
    </AutoSubmitForm>
  );
}

function Select({ name, label, value, options }: { name: string; label: string; value?: string; options: [string, string][] }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink/70">{label}</span>
      <select name={name} defaultValue={value ?? ""} className="input mt-1.5 !py-2">
        <option value="">Any</option>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
