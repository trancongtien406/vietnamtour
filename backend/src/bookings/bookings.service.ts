import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { CatalogService } from '../catalog/catalog.service';
import { Tour } from '../catalog/catalog.types';
import { BookingsStore } from './bookings.store';
import {
  Booking,
  BookingStatus,
  CreateBookingInput,
  Slot,
} from './bookings.types';

const text = (v: unknown): string =>
  typeof v === 'string' || typeof v === 'number' ? String(v) : '';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9 ()-]{8,20}$/;
const CHILD_DISCOUNT = 0.7;
const FREE_CANCEL_HOURS = 24;
/** Sandbox card that always gets declined, like Stripe's test cards. */
export const DECLINED_TEST_CARD = '4000000000000002';
const ACTIVE: BookingStatus[] = [
  'pending_payment',
  'awaiting_supplier',
  'confirmed',
  'checked_in',
];

const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 864e5);
const round2 = (n: number) => Math.round(n * 100) / 100;

function luhn(num: string): boolean {
  let sum = 0;
  for (let i = 0; i < num.length; i++) {
    let d = Number(num[num.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

@Injectable()
export class BookingsService implements OnModuleInit {
  constructor(
    private readonly catalog: CatalogService,
    private readonly store: BookingsStore,
  ) {}

  onModuleInit() {
    if (this.store.isFresh && process.env.SEED_DEMO_BOOKINGS !== 'false')
      this.seedDemo();
  }

  /** Price for a party: children (under 12) pay 70% of the adult price. */
  quote(unitPriceUsd: number, adults: number, children: number): number {
    return round2(
      unitPriceUsd * adults + unitPriceUsd * children * CHILD_DISCOUNT,
    );
  }

  /**
   * Seats per departure. A deterministic "already sold" share keeps the demo
   * calendar realistic; real bookings in the store are subtracted on top.
   */
  availability(slug: string, date: string, now = new Date()): Slot[] {
    const tour = this.catalog.findTour(slug);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      throw new BadRequestException('date must be YYYY-MM-DD');
    if (date <= isoDay(now))
      return tour.startTimes.map((time) => ({
        time,
        capacity: tour.maxGroupSize,
        booked: tour.maxGroupSize,
        remaining: 0,
      }));
    return tour.startTimes.map((time) => {
      const seed = createHash('sha1')
        .update(`${slug}|${date}|${time}`)
        .digest()[0];
      const presold = Math.floor(((seed % 70) / 100) * tour.maxGroupSize);
      const real = this.store
        .all()
        .filter(
          (b) =>
            b.tourSlug === slug &&
            b.date === date &&
            b.time === time &&
            ACTIVE.includes(b.status),
        )
        .reduce((sum, b) => sum + b.adults + b.children, 0);
      const booked = Math.min(tour.maxGroupSize, presold + real);
      return {
        time,
        capacity: tour.maxGroupSize,
        booked,
        remaining: tour.maxGroupSize - booked,
      };
    });
  }

  create(input: CreateBookingInput, now = new Date()): Booking {
    const errors: Record<string, string> = {};
    const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
    const int = (v: unknown, fallback: number) =>
      v === undefined || v === '' ? fallback : Number(v);

    const tourSlug = str(input.tourSlug);
    const tour = tourSlug ? this.safeTour(tourSlug) : undefined;
    if (!tour || !tour.published)
      errors.tourSlug = 'Please choose a valid tour.';

    const date = str(input.date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
      errors.date = 'Please pick a departure date.';
    } else if (date <= isoDay(now)) {
      errors.date =
        'Bookings close the day before departure. Please pick a later date.';
    }
    const time = str(input.time) || tour?.startTimes[0] || '';
    if (tour && !tour.startTimes.includes(time))
      errors.time = 'Please pick an available start time.';

    const adults = int(input.adults, 1);
    const children = int(input.children, 0);
    if (!Number.isInteger(adults) || adults < 1)
      errors.adults = 'At least one adult is required.';
    if (!Number.isInteger(children) || children < 0)
      errors.children = 'Invalid number of children.';
    if (tour && adults + children > tour.maxGroupSize) {
      errors.adults = `This tour takes up to ${tour.maxGroupSize} guests.`;
    }

    const fullName = str(input.fullName);
    if (fullName.length < 2) errors.fullName = 'Please enter your full name.';
    const email = str(input.email).toLowerCase();
    if (!EMAIL.test(email)) errors.email = 'Please enter a valid email.';
    const phone = str(input.phone);
    if (!PHONE.test(phone)) errors.phone = 'Please enter a valid phone number.';
    const note = str(input.note).slice(0, 500);

    if (Object.keys(errors).length || !tour) {
      throw new BadRequestException({ message: 'Validation failed', errors });
    }

    const slot = this.availability(tour.slug, date, now).find(
      (s) => s.time === time,
    );
    if (!slot || slot.remaining < adults + children) {
      throw new ConflictException({
        message: 'Not enough seats left',
        errors: {
          time: slot?.remaining
            ? `Only ${slot.remaining} seats left at ${time}.`
            : `${time} is sold out.`,
        },
      });
    }

    return this.store.add({
      code: this.newCode(),
      tourSlug: tour.slug,
      tourTitle: tour.title,
      date,
      time,
      adults,
      children,
      fullName,
      email,
      phone,
      note,
      unitPriceUsd: tour.priceUsd,
      totalUsd: this.quote(tour.priceUsd, adults, children),
      refundUsd: 0,
      status: 'pending_payment',
      instantConfirmation: tour.instantConfirmation,
      freeCancellation: tour.freeCancellation,
      history: [{ status: 'pending_payment', at: now.toISOString() }],
      createdAt: now.toISOString(),
    });
  }

  /** Sandbox payment: any Luhn-valid card succeeds except the decline test card. */
  pay(
    code: string,
    card: {
      cardNumber?: unknown;
      expiry?: unknown;
      cvc?: unknown;
      name?: unknown;
    },
    now = new Date(),
  ): Booking {
    const booking = this.get(code);
    if (booking.status !== 'pending_payment')
      throw new ConflictException('This booking has already been paid.');
    const number = text(card.cardNumber).replace(/\D/g, '');
    const errors: Record<string, string> = {};
    if (number.length < 13 || number.length > 19 || !luhn(number))
      errors.cardNumber = 'Card number is invalid.';
    const expiry = text(card.expiry).trim();
    const m = /^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/.exec(expiry);
    if (!m) errors.expiry = 'Use MM/YY.';
    else {
      const end = new Date(Date.UTC(2000 + Number(m[2]), Number(m[1]), 1));
      if (end <= now) errors.expiry = 'This card has expired.';
    }
    if (!/^\d{3,4}$/.test(text(card.cvc)))
      errors.cvc = 'CVC must be 3–4 digits.';
    if (Object.keys(errors).length)
      throw new BadRequestException({ message: 'Validation failed', errors });
    if (number === DECLINED_TEST_CARD) {
      throw new HttpException(
        {
          message: 'Your card was declined (sandbox test card).',
          errors: { cardNumber: 'Card declined.' },
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
    booking.payment = {
      method: 'card',
      brand: number.startsWith('4')
        ? 'Visa'
        : number.startsWith('5')
          ? 'Mastercard'
          : 'Card',
      last4: number.slice(-4),
      transactionId: 'sbx_' + randomBytes(6).toString('hex'),
      paidAt: now.toISOString(),
    };
    this.transition(
      booking,
      booking.instantConfirmation ? 'confirmed' : 'awaiting_supplier',
      now,
    );
    return booking;
  }

  /** Customer cancellation: full refund up to 24h before departure on free-cancellation tours. */
  cancel(code: string, now = new Date()): Booking {
    const booking = this.get(code);
    if (
      !['pending_payment', 'awaiting_supplier', 'confirmed'].includes(
        booking.status,
      )
    ) {
      throw new ConflictException('This booking can no longer be cancelled.');
    }
    booking.refundUsd =
      booking.payment && this.isRefundable(booking, now) ? booking.totalUsd : 0;
    this.transition(
      booking,
      'cancelled',
      now,
      booking.refundUsd ? `Refunded $${booking.refundUsd}` : 'No refund',
    );
    return booking;
  }

  isRefundable(b: Booking, now = new Date()): boolean {
    if (!b.freeCancellation) return b.status === 'awaiting_supplier';
    const start = new Date(`${b.date}T${b.time}:00+07:00`);
    return start.getTime() - now.getTime() >= FREE_CANCEL_HOURS * 3600e3;
  }

  /** Supplier actions on a booking. */
  supplierAction(code: string, action: string, now = new Date()): Booking {
    const b = this.get(code);
    if (action === 'confirm' && b.status === 'awaiting_supplier')
      return this.transition(b, 'confirmed', now, 'Confirmed by supplier');
    if (action === 'decline' && b.status === 'awaiting_supplier') {
      b.refundUsd = b.totalUsd;
      return this.transition(
        b,
        'cancelled',
        now,
        'Declined by supplier, fully refunded',
      );
    }
    if (
      action === 'cancel' &&
      ['pending_payment', 'awaiting_supplier', 'confirmed'].includes(b.status)
    ) {
      b.refundUsd = b.payment ? b.totalUsd : 0;
      return this.transition(
        b,
        'cancelled',
        now,
        b.payment
          ? 'Cancelled by operator, fully refunded'
          : 'Cancelled by operator',
      );
    }
    if (action === 'check-in' && b.status === 'confirmed')
      return this.transition(b, 'checked_in', now, 'Voucher scanned');
    throw new ConflictException(
      `Cannot ${action} a booking that is ${b.status.replace('_', ' ')}.`,
    );
  }

  get(code: string): Booking {
    const booking = this.store.find(code);
    if (!booking) throw new NotFoundException(`Booking ${code} not found`);
    return booking;
  }

  findByEmail(email: string): Booking[] {
    const e = email.trim().toLowerCase();
    if (!EMAIL.test(e))
      throw new BadRequestException('A valid email is required');
    return this.store
      .all()
      .filter((b) => b.email === e)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  list(filter: { status?: string; tour?: string } = {}): Booking[] {
    return this.store
      .all()
      .filter(
        (b) =>
          (!filter.status || b.status === filter.status) &&
          (!filter.tour || b.tourSlug === filter.tour),
      )
      .sort((a, b) => {
        // Upcoming departures first (soonest on top), then past ones (latest first).
        const today = isoDay(new Date());
        const ka = `${a.date}${a.time}`;
        const kb = `${b.date}${b.time}`;
        const pa = a.date < today;
        const pb = b.date < today;
        if (pa !== pb) return pa ? 1 : -1;
        return pa ? kb.localeCompare(ka) : ka.localeCompare(kb);
      });
  }

  supplierOverview(days = 14, now = new Date()) {
    const n = [7, 14, 30].includes(days) ? days : 14;
    const all = this.store.all();
    const paid = all.filter((b) => b.payment);
    const gross = round2(paid.reduce((s, b) => s + b.totalUsd, 0));
    const refunds = round2(paid.reduce((s, b) => s + b.refundUsd, 0));
    const revenue = round2(gross - refunds);
    const today = isoDay(now);
    const upcoming = all.filter(
      (b) =>
        b.date >= today &&
        ['confirmed', 'awaiting_supplier'].includes(b.status),
    );
    const byTour = new Map<
      string,
      {
        slug: string;
        title: string;
        image: string;
        bookings: number;
        guests: number;
        revenueUsd: number;
      }
    >();
    for (const b of paid) {
      const row = byTour.get(b.tourSlug) ?? {
        slug: b.tourSlug,
        title: b.tourTitle,
        image: this.safeTour(b.tourSlug)?.images[0] ?? '',
        bookings: 0,
        guests: 0,
        revenueUsd: 0,
      };
      row.bookings += 1;
      row.guests += b.adults + b.children;
      row.revenueUsd = round2(row.revenueUsd + b.totalUsd - b.refundUsd);
      byTour.set(b.tourSlug, row);
    }
    const dayTotals = (day: string) => {
      const list = paid.filter((b) => b.payment!.paidAt.slice(0, 10) === day);
      const g = round2(list.reduce((s, b) => s + b.totalUsd, 0));
      const r = round2(list.reduce((s, b) => s + b.refundUsd, 0));
      return {
        day,
        grossUsd: g,
        revenueUsd: round2(g - r),
        commissionUsd: round2((g - r) * 0.2),
        netUsd: round2((g - r) * 0.8),
        bookings: list.length,
      };
    };
    const series = (from: number, len: number) =>
      Array.from({ length: len }, (_, i) =>
        dayTotals(isoDay(addDays(now, from + i))),
      );
    const last14 = series(1 - n, n);
    const prev14 = series(1 - 2 * n, n);
    const sum = (l: typeof last14, k: 'revenueUsd' | 'bookings') =>
      l.reduce((s, d) => s + d[k], 0);
    const pct = (cur: number, prev: number) =>
      prev > 0 ? Math.round(((cur - prev) / prev) * 1000) / 10 : null;
    const imageFor = (slug: string) => this.safeTour(slug)?.images[0] ?? '';
    return {
      totals: {
        bookings: all.length,
        grossUsd: gross,
        refundsUsd: refunds,
        revenueUsd: revenue,
        commissionUsd: round2(revenue * 0.2),
        payoutUsd: round2(revenue * 0.8),
        guests: paid.reduce((s, b) => s + b.adults + b.children, 0),
        upcoming: upcoming.length,
        upcomingGuests: upcoming.reduce((s, b) => s + b.adults + b.children, 0),
        awaitingConfirmation: all.filter(
          (b) => b.status === 'awaiting_supplier',
        ).length,
        pendingPayment: all.filter((b) => b.status === 'pending_payment')
          .length,
        cancelled: all.filter((b) => b.status === 'cancelled').length,
      },
      deltas: {
        revenuePct: pct(sum(last14, 'revenueUsd'), sum(prev14, 'revenueUsd')),
        bookingsPct: pct(sum(last14, 'bookings'), sum(prev14, 'bookings')),
      },
      rangeDays: n,
      revenueByDay: last14,
      topTours: [...byTour.values()]
        .sort((a, b) => b.revenueUsd - a.revenueUsd)
        .slice(0, 5),
      tourRevenue: [...byTour.values()],
      nextDepartures: upcoming
        .sort((a, b) =>
          `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`),
        )
        .slice(0, 6)
        .map((b) => ({ ...b, image: imageFor(b.tourSlug) })),
      recentBookings: [...all]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 6)
        .map((b) => ({ ...b, image: imageFor(b.tourSlug) })),
    };
  }

  private transition(
    b: Booking,
    status: BookingStatus,
    now: Date,
    note?: string,
  ): Booking {
    b.status = status;
    b.history.push({
      status,
      at: now.toISOString(),
      ...(note ? { note } : {}),
    });
    this.store.save();
    return b;
  }

  private safeTour(slug: string): Tour | undefined {
    try {
      return this.catalog.findTour(slug);
    } catch {
      return undefined;
    }
  }

  private newCode(): string {
    let code: string;
    do {
      code = 'VT-' + randomBytes(3).toString('hex').toUpperCase();
    } while (this.store.find(code));
    return code;
  }

  /** Realistic demo data for the supplier dashboard on first boot. */
  private seedDemo(now = new Date()) {
    const guests = [
      ['Emily Roberts', 'emily.roberts@example.com', '+61 412 555 019'],
      ['Jonas Keller', 'jonas.keller@example.com', '+49 151 5550 1234'],
      ['Sarah Mitchell', 'sarah.m@example.com', '+44 7700 900123'],
      ['Lucas Petit', 'lucas.petit@example.com', '+33 6 12 34 56 78'],
      ['Mei Lin', 'mei.lin@example.com', '+65 8123 4567'],
      ['Tom Harris', 'tom.harris@example.com', '+1 415 555 0142'],
      ['Nguyễn Minh Anh', 'minhanh@example.com', '+84 905 123 456'],
      ['Chris Duval', 'chris.duval@example.com', '+1 604 555 0199'],
      ['Hana Tanaka', 'hana.t@example.com', '+81 90 1234 5678'],
      ['Ana García', 'ana.garcia@example.com', '+34 612 345 678'],
      ['Mark Byrne', 'mark.byrne@example.com', '+353 85 123 4567'],
      ['Priya Sharma', 'priya.s@example.com', '+91 98765 43210'],
      ['Kim Ji-woo', 'jiwoo.kim@example.com', '+82 10 5555 0101'],
      ['Olivia Brown', 'olivia.b@example.com', '+1 212 555 0187'],
      ['Matteo Rossi', 'matteo.rossi@example.com', '+39 347 555 1290'],
      ['Sophie van Dijk', 'sophie.vd@example.com', '+31 6 5555 4321'],
      ['Lê Hoàng Nam', 'hoangnam@example.com', '+84 912 345 678'],
      ['Noah Wilson', 'noah.w@example.com', '+61 423 555 876'],
      ['Isabella Costa', 'isa.costa@example.com', '+55 11 95555 2233'],
      ['Ethan Clarke', 'ethan.c@example.com', '+44 7700 900456'],
      ['Trần Công Tiến', 'tien.demo@example.com', '+84 935 000 406'],
      ['Aiko Suzuki', 'aiko.s@example.com', '+81 80 5555 7788'],
      ["Liam O'Connor", 'liam.oc@example.com', '+353 87 555 3344'],
      ['Chloe Martin', 'chloe.martin@example.com', '+33 7 55 55 12 34'],
    ];
    const tours = this.catalog.listAllTours();
    const notes = [
      'Vegetarian meals for one guest, please.',
      '',
      'Celebrating our anniversary!',
      'Staying at Little Riverside Hội An, pick-up appreciated.',
      '',
      'One guest has a peanut allergy.',
      'First time in Vietnam, any tips welcome.',
    ];
    const total = 96;
    for (let i = 0; i < total; i++) {
      const [fullName, email, phone] = guests[i % guests.length];
      const tour = this.catalog.findTour(tours[(i * 5) % tours.length].slug);
      const createdAt = addDays(now, -55 + Math.floor((i * 56) / total));
      const date = isoDay(addDays(createdAt, 3 + ((i * 7) % 24)));
      try {
        const b = this.create(
          {
            tourSlug: tour.slug,
            date,
            time: tour.startTimes[i % tour.startTimes.length],
            adults: 1 + (i % 3) + (i % 7 === 0 ? 2 : 0),
            children: i % 4 === 0 ? 1 : 0,
            fullName,
            email,
            phone,
            note: notes[i % notes.length],
          },
          createdAt,
        );
        const past = date < isoDay(now);
        if (i % 13 === 11 && !past) continue; // left unpaid
        this.pay(
          b.code,
          { cardNumber: '4242424242424242', expiry: '12/30', cvc: '123' },
          createdAt,
        );
        if (i % 11 === 9) this.cancel(b.code, addDays(createdAt, 1));
        else if (past) {
          const day = new Date(`${date}T08:00:00+07:00`);
          if (b.status === 'awaiting_supplier')
            this.supplierAction(b.code, 'confirm', addDays(createdAt, 1));
          this.supplierAction(b.code, 'check-in', day);
        }
      } catch {
        /* a sold-out slot just skips one demo booking */
      }
    }
    // A couple of trips for the demo traveller so "My trips" has history.
    const mine: [string, number, number][] = [
      ['ha-long-bay-luxury-overnight-cruise', -40, -25],
      ['hue-imperial-city-heritage-tour', -6, 19],
    ];
    for (const [slug, created, depart] of mine) {
      const tour = this.catalog.findTour(slug);
      const createdAt = addDays(now, created);
      const date = isoDay(addDays(now, depart));
      try {
        const b = this.create(
          {
            tourSlug: slug,
            date,
            time: tour.startTimes[0],
            adults: 2,
            children: 0,
            fullName: 'Trần Công Tiến',
            email: 'tien.demo@example.com',
            phone: '+84 935 000 406',
          },
          createdAt,
        );
        this.pay(
          b.code,
          { cardNumber: '4242424242424242', expiry: '12/30', cvc: '123' },
          createdAt,
        );
        if (depart < 0)
          this.supplierAction(
            b.code,
            'check-in',
            new Date(`${date}T08:00:00+07:00`),
          );
      } catch {
        /* skip */
      }
    }
  }
}
