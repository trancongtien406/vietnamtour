import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TourCard } from "@/components/tour-card";
import { api } from "@/lib/api";
import { REGION_LABEL } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const d = await api.destination(slug).catch(() => null);
  return { title: d ? `Things to do in ${d.name}` : "Destination" };
}

export default function DestinationPage({ params }: PageProps<"/destinations/[slug]">) {
  return (
    <Suspense fallback={<div className="h-[420px] animate-pulse bg-mist/60" />}>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await api.destination(slug).catch(() => notFound());
  return (
    <>
      <section className="relative isolate">
        <Image src={d.image} alt={d.name} fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/20" />
        <div className="container-x flex min-h-[380px] flex-col justify-end py-10 text-white">
          <Link href="/destinations" className="text-sm text-white/80 hover:text-white">← {REGION_LABEL[d.region]}</Link>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-6xl">{d.name}</h1>
          <p className="mt-2 max-w-2xl text-lg text-white/85">{d.tagline}</p>
        </div>
      </section>
      <div className="container-x py-10">
        <div className="grid gap-6 md:grid-cols-[1fr_260px]">
          <p className="text-lg leading-relaxed text-ink/75">{d.description}</p>
          <div className="rounded-2xl bg-sand p-5 text-sm">
            <p className="font-semibold text-jade">Best time to visit</p>
            <p className="mt-1 font-semibold">{d.bestTime}</p>
          </div>
        </div>
        <h2 className="mb-6 mt-12 font-display text-2xl font-bold">Things to do in {d.name}</h2>
        {d.tours.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{d.tours.map((t) => <TourCard key={t.slug} tour={t} />)}</div>
        ) : (
          <p className="text-ink/60">New experiences coming soon. <Link href="/tours" className="font-semibold text-jade">Browse all</Link></p>
        )}
      </div>
    </>
  );
}
