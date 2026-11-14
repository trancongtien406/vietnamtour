import type { Metadata } from "next";
import { Suspense } from "react";
import { SavedList } from "@/components/saved-list";
import { TourGridSkeleton } from "@/components/tour-card";
import { api } from "@/lib/api";

export const metadata: Metadata = { title: "Saved tours" };

export default function SavedPage() {
  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-bold md:text-4xl">Saved tours</h1>
      <p className="mt-2 text-ink/60">Tap the heart on any experience to keep it here for later.</p>
      <div className="mt-8">
        <Suspense fallback={<TourGridSkeleton count={3} />}>
          <Saved />
        </Suspense>
      </div>
    </div>
  );
}

async function Saved() {
  const { items } = await api.tours();
  return <SavedList tours={items} />;
}
