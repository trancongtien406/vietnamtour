"use client";

import {
  Bell,
  CalendarDays,
  Layers,
  LayoutDashboard,
  MapPin,
  Menu,
  NotebookTabs,
  Settings,
  Star,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const GROUPS: { label: string; items: { href: string; label: string; icon: LucideIcon }[] }[] = [
  {
    label: "Operations",
    items: [
      { href: "/supplier", label: "Dashboard", icon: LayoutDashboard },
      { href: "/supplier/bookings", label: "Bookings", icon: NotebookTabs },
      { href: "/supplier/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/supplier/products", label: "Products", icon: Layers },
    ],
  },
  { label: "Financial", items: [{ href: "/supplier/finance", label: "Finance", icon: Wallet }] },
  { label: "Engagement", items: [{ href: "/supplier/reviews", label: "Reviews", icon: Star }] },
  { label: "Account", items: [{ href: "/supplier/settings", label: "Settings", icon: Settings }] },
];

function Brand() {
  return (
    <Link href="/supplier" className="sp-focus flex items-center gap-3 rounded-xl" aria-label="Supplier dashboard">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange text-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path d="M12 3c1.8 2.7 2.7 5.1 2.7 7.2 0 1.6-.5 3-1.4 4.2 2.6-.6 4.9-2.3 6.7-5-.2 5.6-3.7 9.6-8 9.6S4.2 15 4 9.4c1.8 2.7 4.1 4.4 6.7 5-.9-1.2-1.4-2.6-1.4-4.2C9.3 8.1 10.2 5.7 12 3z" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block font-[family-name:var(--font-sp-serif)] text-[19px] text-sp-text">Vietnamtour</span>
        <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-orange">Supplier portal</span>
      </span>
    </Link>
  );
}

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav aria-label="Supplier portal" className="space-y-5">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-sp-text3">{g.label}</p>
          <ul className="space-y-1">
            {g.items.map(({ href, label, icon: Icon }) => {
              const active = href === "/supplier" ? path === href : path.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`sp-focus flex h-[42px] items-center gap-3 rounded-xl px-3 text-[14.5px] font-medium transition ${
                      active ? "bg-forest text-white shadow-[0_4px_12px_rgba(13,91,76,.25)]" : "text-sp-text hover:bg-sp-muted"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function BusinessCard() {
  return (
    <div className="relative">
      <div className="relative -mx-4 h-40 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_45%)]" aria-hidden>
        <Image src="/images/destinations/ha-long-bay-2.jpg" alt="" fill sizes="248px" className="object-cover opacity-80 saturate-[.8]" />
      </div>
      <div className="relative -mt-14 rounded-2xl border border-sp-border bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest-light text-forest">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M3 19l6-9 4 6 3-4 5 7z" strokeLinejoin="round" /></svg>
          </span>
          <div className="min-w-0">
            <p className="whitespace-nowrap text-[13.5px] font-semibold">Lotus Trails Vietnam</p>
            <p className="text-xs text-sp-text2">Licensed tour operator</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-sp-text2"><MapPin className="h-3.5 w-3.5" /> Đà Nẵng</p>
          </div>
        </div>
        <Link href="/" className="sp-focus mt-3 inline-block rounded text-sm font-semibold text-forest hover:underline">View public page →</Link>
      </div>
    </div>
  );
}

export function SupplierSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-sp-border bg-sp-warm px-4 pt-6 pb-4 lg:flex">
      <Brand />
      <div className="mt-8 min-h-0 flex-1 overflow-y-auto pr-1"><Nav /></div>
      <BusinessCard />
    </aside>
  );
}

export function MobileTopBar({ attention }: { attention: number }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-sp-border bg-sp-warm/95 px-4 backdrop-blur lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="sp-focus grid h-10 w-10 place-items-center rounded-xl hover:bg-sp-muted">
          <Menu className="h-5 w-5" />
        </button>
        <Brand />
        <Link href="/supplier/bookings?status=attention" aria-label="Notifications" className="sp-focus relative grid h-10 w-10 place-items-center rounded-xl hover:bg-sp-muted">
          <Bell className="h-5 w-5" strokeWidth={1.8} />
          {attention > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange" />}
        </Link>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-[rgba(20,40,32,.32)]" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-sp-warm px-4 pt-5 pb-4 shadow-2xl" key={path}>
            <div className="flex items-center justify-between">
              <Brand />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="sp-focus grid h-9 w-9 place-items-center rounded-lg hover:bg-sp-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-6 min-h-0 flex-1 overflow-y-auto"><Nav onNavigate={() => setOpen(false)} /></div>
            <BusinessCard />
          </div>
        </div>
      )}
    </>
  );
}
