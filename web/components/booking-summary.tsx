import Image from "next/image";
import { ClockIcon, PinIcon, UsersIcon } from "./icons";
import { duration, longDate, usd } from "@/lib/format";

type Props = {
  title: string;
  image: string;
  date: string;
  time: string;
  durationDays: number;
  adults: number;
  kids: number;
  unitPriceUsd: number;
  totalUsd: number;
  meetingPoint?: string;
};

export function BookingSummary(p: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-mist bg-white">
      <div className="relative aspect-[16/9]">
        <Image src={p.image} alt="" fill sizes="400px" className="object-cover" />
      </div>
      <div className="space-y-3 p-5 text-sm">
        <h2 className="font-display text-lg font-bold leading-snug">{p.title}</h2>
        <p className="flex gap-2"><ClockIcon className="h-4 w-4 text-jade" />{longDate(p.date)} · {p.time} · {duration(p.durationDays)}</p>
        <p className="flex gap-2"><UsersIcon className="h-4 w-4 text-jade" />{p.adults} adult{p.adults > 1 ? "s" : ""}{p.kids ? `, ${p.kids} child${p.kids > 1 ? "ren" : ""}` : ""}</p>
        {p.meetingPoint && <p className="flex gap-2"><PinIcon className="h-4 w-4 text-jade" />{p.meetingPoint}</p>}
        <div className="flex justify-between border-t border-mist pt-3 text-base font-bold"><span>Total</span><span>{usd(p.totalUsd)}</span></div>
      </div>
    </div>
  );
}
