"use client";

import { HeartIcon } from "./icons";
import { toggleSaved, useSaved } from "./use-saved";

export function SaveButton({ slug, className = "" }: { slug: string; className?: string }) {
  const saved = useSaved().includes(slug);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(slug);
      }}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save tour"}
      className={`grid h-10 w-10 place-items-center rounded-full bg-white/95 shadow-sm transition hover:scale-105 ${
        saved ? "text-lotus" : "text-ink"
      } ${className}`}
    >
      <HeartIcon filled={saved} className="h-5 w-5" />
    </button>
  );
}
