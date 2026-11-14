import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductEditor } from "@/components/product-editor";
import { api } from "@/lib/api";

export default function EditProductPage({ params }: PageProps<"/supplier/products/[slug]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-mist/60" />}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tour = await api.supplier.product(slug).catch(() => notFound());
  return (
    <div className="max-w-4xl">
      <Link href="/supplier/products" className="text-sm text-ink/60 hover:text-jade">← All products</Link>
      <div className="mt-3 flex items-center gap-4">
        <div className="relative h-16 w-24 overflow-hidden rounded-xl"><Image src={tour.images[0]} alt="" fill sizes="96px" className="object-cover" /></div>
        <div>
          <h1 className="font-display text-2xl font-bold">{tour.title}</h1>
          <Link href={`/tours/${tour.slug}`} className="text-sm font-semibold text-jade hover:underline">View on website →</Link>
        </div>
      </div>
      <div className="mt-6"><ProductEditor tour={tour} /></div>
    </div>
  );
}
