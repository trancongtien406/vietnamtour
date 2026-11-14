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

export type BookingWithImage = Booking & { image: string };

export interface DayRevenue {
  day: string;
  grossUsd: number;
  revenueUsd: number;
  commissionUsd: number;
  netUsd: number;
  bookings: number;
}

export interface SupplierOverview {
  totals: {
    bookings: number;
    grossUsd: number;
    refundsUsd: number;
    revenueUsd: number;
    commissionUsd: number;
    payoutUsd: number;
    guests: number;
    upcoming: number;
    upcomingGuests: number;
    awaitingConfirmation: number;
    pendingPayment: number;
    cancelled: number;
  };
  deltas: { revenuePct: number | null; bookingsPct: number | null };
  rangeDays: number;
  revenueByDay: DayRevenue[];
  topTours: { slug: string; title: string; image: string; bookings: number; guests: number; revenueUsd: number }[];
  tourRevenue: SupplierOverview["topTours"];
  nextDepartures: BookingWithImage[];
  recentBookings: BookingWithImage[];
}

export type FieldErrors = Record<string, string>;

export interface FinanceTx {
  id: string;
  type: "payment" | "refund";
  at: string;
  bookingCode: string;
  tourTitle: string;
  guest: string;
  grossUsd: number;
  commissionUsd: number;
  netUsd: number;
}

export interface Payout {
  id: string;
  periodStart: string;
  periodEnd: string;
  payoutDate: string;
  status: "completed" | "scheduled" | "processing";
  method: string;
  transactions: number;
  grossUsd: number;
  refundsUsd: number;
  commissionUsd: number;
  netUsd: number;
}

export interface SupplierSettings {
  companyName: string;
  legalName: string;
  licenseNo: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  languages: string[];
  cutoffHours: number;
  payout: { bankName: string; accountName: string; accountLast4: string; schedule: "weekly" };
  notifications: { newBooking: boolean; cancellation: boolean; newReview: boolean; dailySummary: boolean };
}

export interface SupplierFinance {
  commissionRate: number;
  periodDays: number;
  totals: { grossUsd: number; refundsUsd: number; commissionUsd: number; netUsd: number; bookings: number; paidOutUsd: number };
  deltas: { grossPct: number | null; netPct: number | null; bookingsPct: number | null; commissionPct: number | null };
  balance: { availableUsd: number; pendingUsd: number; minimumPayoutUsd: number };
  nextPayout: { date: string; amountUsd: number; status: "scheduled" | "collecting" };
  payoutAccount: SupplierSettings["payout"];
  series: { day: string; grossUsd: number; netUsd: number; commissionUsd: number }[];
  payouts: Payout[];
  transactions: FinanceTx[];
}

export interface SupplierReview {
  id: string;
  tourSlug: string;
  tourTitle: string;
  author: string;
  country: string;
  rating: number;
  date: string;
  comment: string;
  reply?: { text: string; at: string };
}

export interface SupplierReviews {
  summary: { count: number; average: number; replied: number; distribution: { stars: number; count: number }[] };
  items: SupplierReview[];
}
