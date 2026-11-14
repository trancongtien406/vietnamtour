import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { duration, usd } from "@/lib/format";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold">Products</h1>
      <p className="mt-1 text-ink/60">Edit pricing, capacity and departure times. Unpublished products are hidden from the website.</p>
      <Suspense fallback={<div className="mt-8 h-96 animate-pulse rounded-2xl bg-mist/60" />}>
        <List />
      </Suspense>
    </>
  );
}

async function List() {
  const products = await api.supplier.products();
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl bg-white ring-1 ring-mist">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="border-b border-mist bg-sand/50 text-left text-xs uppercase tracking-wide text-ink/55">
          <tr><th className="px-4 py-3">Experience</th><th className="px-4 py-3">Duration</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Capacity</th><th className="px-4 py-3">Departures</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.slug} className="border-b border-mist/70 last:border-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg"><Image src={p.images[0]} alt="" fill sizes="64px" className="object-cover" /></div>
                  <div className="min-w-0"><p className="truncate font-semibold">{p.title}</p><p className="text-xs text-ink/50">{p.destinationName} · ★ {p.rating}</p></div>
                </div>
              </td>
              <td className="px-4 py-3">{duration(p.durationDays)}</td>
              <td className="px-4 py-3 font-semibold">{usd(p.priceUsd)}</td>
              <td className="px-4 py-3">{p.maxGroupSize} / departure</td>
              <td className="px-4 py-3">{p.startTimes.join(", ")}</td>
              <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.published ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"}`}>{p.published ? "Live" : "Draft"}</span></td>
              <td className="px-4 py-3 text-right"><Link href={`/supplier/products/${p.slug}`} className="font-semibold text-jade hover:underline">Edit</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
