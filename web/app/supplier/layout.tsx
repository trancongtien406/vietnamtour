import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { SupplierNav } from "@/components/supplier-nav";

export const metadata: Metadata = { title: { default: "Supplier portal", template: "%s · Supplier portal" } };

export default function SupplierLayout({ children }: LayoutProps<"/supplier">) {
  return (
    <div className="min-h-screen bg-[#f7f6f2] lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-b border-mist bg-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <Logo />
          <p className="text-xs font-semibold uppercase tracking-wider text-lotus lg:mt-1 lg:pl-11">Supplier</p>
        </div>
        <Suspense fallback={<div className="h-12" />}>
          <SupplierNav />
        </Suspense>
        <div className="mx-4 mt-6 hidden rounded-2xl bg-sand p-4 text-sm lg:block">
          <p className="font-semibold">Lotus Trails Vietnam</p>
          <p className="text-ink/60">Licensed tour operator · Đà Nẵng</p>
          <Link href="/" className="mt-3 inline-block font-semibold text-jade hover:underline">View website →</Link>
        </div>
      </aside>
      <div className="min-w-0 px-5 py-8 md:px-8">{children}</div>
    </div>
  );
}
