import { ArrowLeft, Clock3, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductEditor } from "@/components/product-editor";
import { Badge } from "@/components/supplier/status-badge";
import { api } from "@/lib/api";
import { duration } from "@/lib/format";

export default function EditProductPage({ params }: PageProps<"/supplier/products/[slug]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-sp-muted" />}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tour = await api.supplier.product(slug).catch(() => notFound());
  return (
    <div className="space-y-6">
      <Link href="/supplier/products" className="sp-focus inline-flex items-center gap-1.5 rounded text-sm font-medium text-sp-text2 hover:text-forest"><ArrowLeft className="h-4 w-4" /> All products</Link>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        <div>
          <h1 className="sp-h1">Edit product</h1>
          <p className="mt-1 text-sp-text2">Changes go live on the website and mobile app immediately.</p>
          <div className="mt-6"><ProductEditor tour={tour} /></div>
        </div>
        <aside className="sp-card h-fit overflow-hidden">
          <div className="relative aspect-[16/10]"><Image src={tour.images[0]} alt="" fill sizes="340px" className="object-cover" /></div>
          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider text-orange">{tour.destinationName}</p><Badge tone={tour.published ? "confirmed" : "neutral"}>{tour.published ? "Live" : "Draft"}</Badge></div>
            <p className="font-[family-name:var(--font-sp-serif)] text-xl leading-snug">{tour.title}</p>
            <ul className="space-y-1.5 text-[13px] text-sp-text2">
              <li className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> {tour.rating} · {tour.reviewCount} reviews</li>
              <li className="flex items-center gap-2"><Clock3 className="h-4 w-4" /> {duration(tour.durationDays)} · starts {tour.startTimes.join(", ")}</li>
              <li className="flex items-center gap-2"><Users className="h-4 w-4" /> Up to {tour.maxGroupSize} guests</li>
            </ul>
            <Link href={`/supplier/calendar?tour=${tour.slug}`} className="sp-btn sp-btn-outline w-full">View availability</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
