import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { StarIcon } from "@/components/icons";
import { ReviewReply } from "@/components/review-reply";
import { PageHeader } from "@/components/supplier/page-header";
import { api } from "@/lib/api";
import { longDate } from "@/lib/format";

export const metadata: Metadata = { title: "Reviews" };

export default function ReviewsPage({ searchParams }: PageProps<"/supplier/reviews">) {
  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" subtitle="What travellers say about your experiences. Replies appear publicly under the review." />
      <Suspense fallback={<div className="h-[600px] animate-pulse rounded-2xl bg-sp-muted" />}>
        <Reviews searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="flex" aria-label={`${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} className={`h-4 w-4 ${i <= n ? "text-amber-400" : "text-sp-strong"}`} />)}
    </span>
  );
}

async function Reviews({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const rating = typeof sp.rating === "string" ? sp.rating : undefined;
  const { summary, items } = await api.supplier.reviews(rating);
  const max = Math.max(...summary.distribution.map((d) => d.count), 1);
  return (
    <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
      <aside className="h-fit space-y-5 sp-card p-5">
        <div>
          <p className="text-[13px] text-sp-text2">Average rating</p>
          <p className="mt-1 flex items-end gap-2"><span className="sp-num text-[40px] font-bold leading-none">{summary.average.toFixed(1)}</span><span className="pb-1 text-sp-text2">/ 5</span></p>
          <p className="text-xs text-sp-text2">{summary.count} reviews · {Math.round((summary.replied / Math.max(summary.count, 1)) * 100)}% replied</p>
        </div>
        <ul className="space-y-1.5">
          {summary.distribution.map((d) => (
            <li key={d.stars}>
              <Link href={rating === String(d.stars) ? "/supplier/reviews" : `/supplier/reviews?rating=${d.stars}`} className={`flex items-center gap-2 rounded-lg px-2 py-1 text-sm ${rating === String(d.stars) ? "bg-sp-muted" : "hover:bg-sp-muted/70"}`}>
                <span className="w-6">{d.stars}★</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-sp-muted"><span className="block h-full rounded-full bg-amber-400" style={{ width: `${(d.count / max) * 100}%` }} /></span>
                <span className="w-6 text-right text-sp-text2">{d.count}</span>
              </Link>
            </li>
          ))}
        </ul>
        {rating && <Link href="/supplier/reviews" className="text-sm font-semibold text-forest hover:underline">Show all reviews</Link>}
      </aside>
      <ul className="space-y-4">
        {items.map((r) => (
          <li key={r.id} className="sp-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-forest-light font-semibold text-forest">{r.author[0]}</span>
                <div>
                  <p className="font-semibold">{r.author} <span className="font-normal text-sp-text2">· {r.country}</span></p>
                  <p className="text-xs text-sp-text2">{longDate(r.date)} · {r.tourTitle}</p>
                </div>
              </div>
              <Stars n={Math.round(r.rating)} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-sp-text">{r.comment}</p>
            <div className="mt-3">
              {r.reply ? (
                <div className="rounded-xl border-l-4 border-forest bg-forest-light/50 p-3 text-sm">
                  <p className="text-xs font-semibold text-forest">Your reply</p>
                  <p className="mt-1 text-sp-text">{r.reply.text}</p>
                </div>
              ) : (
                <ReviewReply id={r.id} />
              )}
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="sp-card p-10 text-center text-sp-text2">No reviews with this rating yet.</li>}
      </ul>
    </div>
  );
}
