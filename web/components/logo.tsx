import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Vietnamtour home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-lotus text-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path d="M12 3c1.8 2.7 2.7 5.1 2.7 7.2 0 1.6-.5 3-1.4 4.2 2.6-.6 4.9-2.3 6.7-5-.2 5.6-3.7 9.6-8 9.6S4.2 15 4 9.4c1.8 2.7 4.1 4.4 6.7 5-.9-1.2-1.4-2.6-1.4-4.2C9.3 8.1 10.2 5.7 12 3z" />
        </svg>
      </span>
      <span className={`font-display text-xl font-bold tracking-tight ${light ? "text-white" : "text-ink"}`}>
        Vietnamtour
      </span>
    </Link>
  );
}
