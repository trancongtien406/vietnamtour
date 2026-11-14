export interface CreateBookingInput {
  tourSlug?: unknown;
  date?: unknown;
  time?: unknown;
  adults?: unknown;
  children?: unknown;
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  note?: unknown;
}

export type BookingStatus =
  | 'pending_payment'
  | 'awaiting_supplier'
  | 'confirmed'
  | 'checked_in'
  | 'cancelled';

export interface Payment {
  method: 'card';
  brand: string;
  last4: string;
  transactionId: string;
  paidAt: string;
}

export interface StatusChange {
  status: BookingStatus;
  at: string;
  note?: string;
}

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
  status: BookingStatus;
  instantConfirmation: boolean;
  freeCancellation: boolean;
  payment?: Payment;
  history: StatusChange[];
  createdAt: string;
}

export interface Slot {
  time: string;
  capacity: number;
  booked: number;
  remaining: number;
}
