"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/supplier", label: "Dashboard" },
  { href: "/supplier/bookings", label: "Bookings" },
  { href: "/supplier/calendar", label: "Calendar" },
  { href: "/supplier/products", label: "Products" },
];

export function SupplierNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:mt-4 lg:flex-col lg:pb-0" aria-label="Supplier">
      {ITEMS.map((i) => {
        const active = i.href === "/supplier" ? path === i.href : path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium ${active ? "bg-jade text-white" : "text-ink/75 hover:bg-sand"}`}>
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
