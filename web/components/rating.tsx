import { StarIcon } from "./icons";

export function Rating({ value, count, className = "" }: { value: number; count?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-sm ${className}`}>
      <StarIcon className="h-4 w-4 text-amber-500" />
      <span className="font-semibold">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-ink/55">({count.toLocaleString("en-US")})</span>}
    </span>
  );
}
