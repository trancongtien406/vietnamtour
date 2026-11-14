import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { REGION_LABEL, usd } from "@/lib/format";
import type { Region } from "@/lib/types";

export const metadata: Metadata = { title: "Destinations" };

export default function DestinationsPage() {
  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-bold md:text-5xl">Destinations</h1>
      <p className="mt-2 max-w-2xl text-ink/60">From the karst seascapes of the north to the floating markets of the Mekong, explore Vietnam region by region.</p>
      <Suspense fallback={<div className="mt-10 h-96 animate-pulse rounded-2xl bg-mist/60" />}>
        <List />
      </Suspense>
    </div>
  );
}

async function List() {
  const all = await api.destinations();
  return (
    <div className="mt-10 space-y-14">
      {(Object.keys(REGION_LABEL) as Region[]).map((r) => (
        <section key={r}>
          <h2 className="mb-5 font-display text-2xl font-bold">{REGION_LABEL[r]}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {all.filter((d) => d.region === r).map((d) => (
              <Link key={d.slug} href={`/destinations/${d.slug}`} className="group overflow-hidden rounded-2xl border border-mist bg-white">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={d.image} alt={d.name} fill sizes="(min-width: 1024px) 400px, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <h3 className="font-display text-xl font-bold group-hover:text-jade">{d.name}</h3>
                  <p className="mt-1 text-sm text-ink/65">{d.tagline}</p>
                  <p className="mt-3 text-sm"><b>{d.tourCount}</b> experience{d.tourCount === 1 ? "" : "s"}{d.fromPriceUsd !== null && <> · from <b>{usd(d.fromPriceUsd)}</b></>} · Best {d.bestTime}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
