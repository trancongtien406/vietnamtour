"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HeartIcon, MenuIcon, XIcon } from "./icons";
import { Logo } from "./logo";
import { useSaved } from "./use-saved";

const NAV = [
  { href: "/tours", label: "Experiences" },
  { href: "/destinations", label: "Destinations" },
  { href: "/account", label: "My trips" },
  { href: "/supplier", label: "For suppliers" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const saved = useSaved();

  return (
    <header className="sticky top-0 z-40 border-b border-mist/70 bg-[#fffdf9]/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition hover:bg-sand ${
                pathname.startsWith(n.href) ? "bg-sand text-jade" : "text-ink/80"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/saved"
            className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-sand"
            aria-label={`Saved tours (${saved.length})`}
          >
            <HeartIcon className="h-5 w-5" />
            {saved.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-lotus px-1 text-[11px] font-bold text-white">
                {saved.length}
              </span>
            )}
          </Link>
          <button
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Menu"
          >
            {open ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-mist bg-white md:hidden" aria-label="Mobile">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block px-5 py-3.5 font-medium">
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
