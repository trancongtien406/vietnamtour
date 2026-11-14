import type { Metadata } from "next";
import Image from "next/image";
import credits from "@/lib/photo-credits.json";

export const metadata: Metadata = { title: "Photo credits" };

export default function CreditsPage() {
  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-bold md:text-4xl">Photo credits</h1>
      <p className="mt-2 max-w-2xl text-ink/60">
        Destination photos come from Wikimedia Commons under Creative Commons or public-domain licences. They were resized and cropped for this demo.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {credits.map((c) => (
          <li key={c.file} className="flex gap-3 rounded-2xl border border-mist bg-white p-3 text-sm">
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
              <Image src={c.file} alt="" fill sizes="96px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <a href={c.source} target="_blank" rel="noreferrer" className="line-clamp-1 font-semibold hover:text-jade">{c.title}</a>
              <p className="text-ink/60">{c.author}</p>
              <p className="text-xs text-ink/50">{c.license}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
