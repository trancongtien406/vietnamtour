import { Eye, Layers, Star, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { KpiCard } from "@/components/supplier/kpi-card";
import { PageHeader } from "@/components/supplier/page-header";
import { Badge } from "@/components/supplier/status-badge";
import { api } from "@/lib/api";
import { duration, usd } from "@/lib/format";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Products" subtitle="Edit pricing, capacity and departure times. Drafts are hidden from the website." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-sp-muted" />}>
        <List />
      </Suspense>
    </div>
  );
}

async function List() {
  const [products, overview] = await Promise.all([api.supplier.products(), api.supplier.overview(14)]);
  const live = products.filter((p) => p.published);
  const avg = products.reduce((s, p) => s + p.rating, 0) / Math.max(products.length, 1);
  const revenue = new Map(overview.tourRevenue.map((t) => [t.slug, t]));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard icon={Layers} label="Live products" value={`${live.length}/${products.length}`} sub={`${products.length - live.length} drafts`} />
        <KpiCard icon={Star} label="Average rating" value={avg.toFixed(2)} sub={`${products.reduce((s, p) => s + p.reviewCount, 0).toLocaleString("en-US")} sample reviews`} />
        <KpiCard icon={Users} label="Seats per day" value={products.reduce((s, p) => s + p.maxGroupSize * p.startTimes.length, 0)} sub="Across all departures" />
        <KpiCard icon={Eye} label="Top seller" value={<span className="text-xl">{overview.topTours[0]?.title.split(" ").slice(0, 3).join(" ") ?? "–"}</span>} sub={overview.topTours[0] ? `${usd(overview.topTours[0].revenueUsd)} revenue` : undefined} />
      </div>
      <section className="sp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="sp-table min-w-[960px]">
            <thead><tr><th>Experience</th><th>Duration</th><th className="text-right">Adult price</th><th>Capacity</th><th>Departures</th><th className="text-right">Revenue</th><th>Status</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.slug}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg"><Image src={p.images[0]} alt="" fill sizes="64px" className="object-cover" /></div>
                      <div className="min-w-0"><p className="max-w-72 truncate font-semibold">{p.title}</p><p className="text-xs text-sp-text2">{p.destinationName} · ★ {p.rating} · {p.operator}</p></div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap">{duration(p.durationDays)}</td>
                  <td className="sp-num text-right font-semibold">{usd(p.priceUsd)}</td>
                  <td className="whitespace-nowrap">{p.maxGroupSize} / departure</td>
                  <td className="whitespace-nowrap text-sp-text2">{p.startTimes.join(" · ")}</td>
                  <td className="sp-num text-right">{revenue.get(p.slug) ? usd(revenue.get(p.slug)!.revenueUsd) : <span className="text-sp-text3">–</span>}</td>
                  <td><Badge tone={p.published ? "confirmed" : "neutral"}>{p.published ? "Live" : "Draft"}</Badge></td>
                  <td className="text-right"><Link href={`/supplier/products/${p.slug}`} className="sp-btn sp-btn-outline h-9">Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
