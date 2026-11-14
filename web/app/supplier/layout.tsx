import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { Suspense } from "react";
import { MobileTopBar, SupplierSidebar } from "@/components/supplier/sidebar";
import { DEMO_DISCLOSURE } from "@/components/supplier/demo-badge";
import { api } from "@/lib/api";

const sans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"] });
const serif = DM_Serif_Display({ variable: "--font-dm-serif", subsets: ["latin", "latin-ext"], weight: "400" });

export const metadata: Metadata = { title: { default: "Supplier portal", template: "%s · Supplier portal" } };

async function MobileBar() {
  const o = await api.supplier.overview().catch(() => null);
  return <MobileTopBar attention={(o?.totals.awaitingConfirmation ?? 0) + (o?.totals.pendingPayment ?? 0)} />;
}

export default function SupplierLayout({ children }: LayoutProps<"/supplier">) {
  return (
    <div className={`${sans.variable} ${serif.variable} sp-root min-h-screen bg-sp-bg lg:flex`}>
      <Suspense fallback={<div className="hidden w-[248px] shrink-0 border-r border-sp-border bg-sp-warm lg:block" />}>
        <SupplierSidebar />
      </Suspense>
      <div className="min-w-0 flex-1">
        <Suspense fallback={<div className="h-16 border-b border-sp-border bg-sp-warm lg:hidden" />}>
          <MobileBar />
        </Suspense>
        <main className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          {children}
          <p className="mt-10 text-center text-xs text-sp-text3">{DEMO_DISCLOSURE}</p>
        </main>
      </div>
    </div>
  );
}
