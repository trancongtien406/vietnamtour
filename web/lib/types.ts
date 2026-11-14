export type Region = "north" | "central" | "south";
export type Category = "cruise" | "culture" | "adventure" | "beach" | "nature" | "food";

export interface Destination {
  slug: string;
  name: string;
  region: Region;
  tagline: string;
  description: string;
  image: string;
  bestTime: string;
  tourCount: number;
  fromPriceUsd: number | null;
}

export interface TourSummary {
  slug: string;
  title: string;
  destinationSlug: string;
  destinationName: string;
  region: Region;
  category: Category;
  summary: string;
  durationDays: number;
  priceUsd: number;
  originalPriceUsd?: number;
  rating: number;
  reviewCount: number;
  maxGroupSize: number;
  languages: string[];
  featured: boolean;
  images: string[];
  meetingPoint: string;
  startTimes: string[];
  freeCancellation: boolean;
  instantConfirmation: boolean;
  published: boolean;
  operator: string;
}

export interface Tour extends TourSummary {
  highlights: string[];
  itinerary: { day: number; title: string; description: string }[];
  included: string[];
  excluded: string[];
  reviews: { author: string; country: string; rating: number; date: string; comment: string }[];
  related: TourSummary[];
}

export type BookingStatus =
  | "pending_payment"
  | "awaiting_supplier"
  | "confirmed"
  | "checked_in"
  | "cancelled";

export interface Booking {
  code: string;
  tourSlug: string;
  tourTitle: string;
  date: string;
  time: string;
  adults: number;
  children: number;
  fullName: string;
  email: string;
  phone: string;
  note: string;
  unitPriceUsd: number;
  totalUsd: number;
  refundUsd: number;
  /** Present on GET /bookings/:code: would cancelling now be refunded? */
  refundable?: boolean;
  status: BookingStatus;
  instantConfirmation: boolean;
  freeCancellation: boolean;
  payment?: { brand: string; last4: string; transactionId: string; paidAt: string };
  history: { status: BookingStatus; at: string; note?: string }[];
  createdAt: string;
}

export interface Slot {
  time: string;
  capacity: number;
  booked: number;
  remaining: number;
}

export interface SupplierOverview {
  totals: {
    bookings: number;
    revenueUsd: number;
    commissionUsd: number;
    payoutUsd: number;
    guests: number;
    upcoming: number;
    awaitingConfirmation: number;
    cancelled: number;
  };
  revenueByDay: { day: string; revenueUsd: number }[];
  topTours: { slug: string; title: string; bookings: number; guests: number; revenueUsd: number }[];
  nextDepartures: Booking[];
}

export type FieldErrors = Record<string, string>;
