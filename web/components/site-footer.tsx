import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-white/80">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            Hand-picked tours and experiences across Vietnam, run by licensed local operators. Instant confirmation
            and free cancellation on most experiences.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/tours" className="hover:text-white">All experiences</Link></li>
            <li><Link href="/destinations" className="hover:text-white">Destinations</Link></li>
            <li><Link href="/saved" className="hover:text-white">Saved tours</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Company</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/account" className="hover:text-white">Manage a booking</Link></li>
            <li><Link href="/supplier" className="hover:text-white">Supplier portal</Link></li>
            <li><Link href="/credits" className="hover:text-white">Photo credits</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-white/50">
          <p>© 2026 Vietnamtour</p>
          <p className="rounded-full border border-white/15 px-3 py-1 tracking-wide text-white/60">Portfolio demo · Sample data · Sandbox payments</p>
        </div>
      </div>
    </footer>
  );
}
