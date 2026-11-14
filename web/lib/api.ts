import "server-only";
import type {
  Booking,
  Destination,
  SupplierFinance,
  SupplierOverview,
  SupplierReview,
  SupplierReviews,
  SupplierSettings,
  Tour,
  TourSummary,
} from "./types";

const API = `${process.env.API_URL ?? "http://localhost:4000"}/api`;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors: Record<string, string> = {},
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    cache: "no-store",
    headers: { "content-type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = typeof body.message === "string" ? body.message : `Request failed (${res.status})`;
    throw new ApiError(res.status, message, body.errors ?? {});
  }
  return body as T;
}

export const api = {
  destinations: () => request<Destination[]>("/destinations"),
  destination: (slug: string) =>
    request<Destination & { tours: TourSummary[] }>(`/destinations/${encodeURIComponent(slug)}`),
  tours: (query: Record<string, string | undefined> = {}) => {
    const qs = new URLSearchParams(
      Object.entries(query).filter((e): e is [string, string] => Boolean(e[1])),
    ).toString();
    return request<{ total: number; items: TourSummary[] }>(`/tours${qs ? `?${qs}` : ""}`);
  },
  tour: (slug: string) => request<Tour>(`/tours/${encodeURIComponent(slug)}`),
  stats: () =>
    request<{ tours: number; destinations: number; reviews: number; averageRating: number }>("/stats"),
  booking: (code: string) => request<Booking>(`/bookings/${encodeURIComponent(code)}`),
  createBooking: (data: Record<string, unknown>) =>
    request<Booking>("/bookings", { method: "POST", body: JSON.stringify(data) }),
  pay: (code: string, data: Record<string, unknown>) =>
    request<Booking>(`/bookings/${encodeURIComponent(code)}/pay`, { method: "POST", body: JSON.stringify(data) }),
  cancel: (code: string) =>
    request<Booking>(`/bookings/${encodeURIComponent(code)}/cancel`, { method: "POST" }),
  supplier: {
    overview: (days = 14) => request<SupplierOverview>(`/supplier/overview?days=${days}`),
    bookings: (status?: string) =>
      request<Booking[]>(`/supplier/bookings${status ? `?status=${encodeURIComponent(status)}` : ""}`),
    booking: (code: string) => request<Booking>(`/supplier/bookings/${encodeURIComponent(code)}`),
    act: (code: string, action: string) =>
      request<Booking>(`/supplier/bookings/${encodeURIComponent(code)}/${action}`, { method: "POST" }),
    products: () => request<TourSummary[]>("/supplier/products"),
    product: (slug: string) => request<Tour>(`/supplier/products/${encodeURIComponent(slug)}`),
    updateProduct: (slug: string, data: Record<string, unknown>) =>
      request<Tour>(`/supplier/products/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    calendar: (tour: string, days = 14) =>
      request<{ date: string; slots: { time: string; capacity: number; booked: number; remaining: number }[] }[]>(
        `/supplier/calendar?tour=${encodeURIComponent(tour)}&days=${days}`,
      ),
    finance: (days = 30) => request<SupplierFinance>(`/supplier/finance?days=${days}`),
    requestPayout: (amountUsd: number) =>
      request<SupplierFinance>("/supplier/payouts", { method: "POST", body: JSON.stringify({ amountUsd }) }),
    reviews: (rating?: string) =>
      request<SupplierReviews>(`/supplier/reviews${rating ? `?rating=${encodeURIComponent(rating)}` : ""}`),
    reply: (id: string, text: string) =>
      request<SupplierReview>(`/supplier/reviews/${encodeURIComponent(id)}/reply`, {
        method: "POST",
        body: JSON.stringify({ text }),
      }),
    settings: () => request<SupplierSettings>("/supplier/settings"),
    updateSettings: (data: Record<string, unknown>) =>
      request<SupplierSettings>("/supplier/settings", { method: "PATCH", body: JSON.stringify(data) }),
  },
};
