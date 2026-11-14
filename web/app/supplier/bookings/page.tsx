import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingsTable } from "@/components/supplier/bookings-table";
import { PageHeader } from "@/components/supplier/page-header";
import { api } from "@/lib/api";

export const metadata: Metadata = { title: "Bookings" };

export default function BookingsPage({ searchParams }: PageProps<"/supplier/bookings">) {
  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" subtitle="Manage reservations, guest details and departure readiness." />
      <Suspense fallback={<div className="h-[640px] animate-pulse rounded-2xl bg-sp-muted" />}>
        <Bookings searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Bookings({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const [bookings, tours] = await Promise.all([api.supplier.bookings(), api.supplier.products()]);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  return (
    <BookingsTable
      bookings={bookings}
      tours={tours}
      today={today}
      initial={{ status: one("status"), q: one("q"), booking: one("booking"), tour: one("tour") }}
    />
  );
}
