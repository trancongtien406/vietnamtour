import type { BookingStatus, Category, Region } from "./types";

export const usd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);

export const CATEGORY_LABEL: Record<Category, string> = {
  cruise: "Cruises",
  culture: "Culture & history",
  adventure: "Adventure",
  beach: "Beach & islands",
  nature: "Nature",
  food: "Food tours",
};

export const REGION_LABEL: Record<Region, string> = {
  north: "Northern Vietnam",
  central: "Central Vietnam",
  south: "Southern Vietnam",
};

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending_payment: "Awaiting payment",
  awaiting_supplier: "Awaiting confirmation",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  cancelled: "Cancelled",
};

export const STATUS_STYLE: Record<BookingStatus, string> = {
  pending_payment: "bg-amber-100 text-amber-800",
  awaiting_supplier: "bg-sky-100 text-sky-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  checked_in: "bg-jade/10 text-jade",
  cancelled: "bg-stone-200 text-stone-600",
};

export const duration = (days: number) => (days === 1 ? "1 day" : `${days} days`);

export const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
