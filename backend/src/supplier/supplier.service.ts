import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { BookingsStore } from '../bookings/bookings.store';
import { CatalogService } from '../catalog/catalog.service';

export const COMMISSION_RATE = 0.2;
const DAY = 864e5;
const round2 = (n: number) => Math.round(n * 100) / 100;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  payout: {
    bankName: string;
    accountName: string;
    accountLast4: string;
    schedule: 'weekly';
  };
  notifications: {
    newBooking: boolean;
    cancellation: boolean;
    newReview: boolean;
    dailySummary: boolean;
  };
}

interface SupplierState {
  settings: SupplierSettings;
  replies: Record<string, { text: string; at: string }>;
}

const DEFAULT_SETTINGS: SupplierSettings = {
  companyName: 'Lotus Trails Vietnam',
  legalName: 'Lotus Trails Travel Co., Ltd',
  licenseNo: 'International Tour Operator Licence 79-123/2024/TCDL-GP LHQT',
  address: '68 Bạch Đằng, Hải Châu, Đà Nẵng',
  email: 'ops@lotustrails.demo',
  phone: '+84 236 3888 406',
  website: 'https://lotustrails.demo',
  languages: ['English', 'Vietnamese', 'French'],
  cutoffHours: 24,
  payout: {
    bankName: 'Vietcombank',
    accountName: 'LOTUS TRAILS TRAVEL CO LTD',
    accountLast4: '4068',
    schedule: 'weekly',
  },
  notifications: {
    newBooking: true,
    cancellation: true,
    newReview: true,
    dailySummary: false,
  },
};

export const reviewId = (slug: string, author: string, date: string) =>
  `${slug}-${date}-${author
    .normalize('NFD')
    .toLowerCase()
    .replace(/[^a-z]/g, '')}`;

/** Monday 00:00 UTC of the week containing `d`. */
function weekStart(d: Date): Date {
  const day = new Date(`${isoDay(d)}T00:00:00Z`);
  const dow = (day.getUTCDay() + 6) % 7;
  return new Date(day.getTime() - dow * DAY);
}

/**
 * Finance, reviews and settings for the supplier portal. Figures are derived
 * from the same bookings the dashboard uses, so totals always reconcile.
 */
@Injectable()
export class SupplierService {
  private readonly file = process.env.BOOKINGS_FILE
    ? join(dirname(process.env.BOOKINGS_FILE), 'supplier.json')
    : process.env.BOOKINGS_FILE === ''
      ? ''
      : 'data/supplier.json';
  private state: SupplierState = this.load();

  constructor(
    private readonly store: BookingsStore,
    private readonly catalog: CatalogService,
  ) {}

  finance(now = new Date()) {
    const tx: {
      id: string;
      type: 'payment' | 'refund';
      at: string;
      bookingCode: string;
      tourTitle: string;
      guest: string;
      grossUsd: number;
      commissionUsd: number;
      netUsd: number;
    }[] = [];
    for (const b of this.store.all()) {
      if (!b.payment) continue;
      tx.push({
        id: b.payment.transactionId,
        type: 'payment',
        at: b.payment.paidAt,
        bookingCode: b.code,
        tourTitle: b.tourTitle,
        guest: b.fullName,
        grossUsd: b.totalUsd,
        commissionUsd: round2(b.totalUsd * COMMISSION_RATE),
        netUsd: round2(b.totalUsd * (1 - COMMISSION_RATE)),
      });
      if (b.refundUsd > 0) {
        const at =
          [...b.history].reverse().find((h) => h.status === 'cancelled')?.at ??
          b.payment.paidAt;
        tx.push({
          id: `RF-${b.code}`,
          type: 'refund',
          at,
          bookingCode: b.code,
          tourTitle: b.tourTitle,
          guest: b.fullName,
          grossUsd: -b.refundUsd,
          commissionUsd: -round2(b.refundUsd * COMMISSION_RATE),
          netUsd: -round2(b.refundUsd * (1 - COMMISSION_RATE)),
        });
      }
    }
    tx.sort((a, b) => b.at.localeCompare(a.at));

    const current = weekStart(now).getTime();
    const weeks = new Map<number, (typeof tx)[number][]>();
    for (const t of tx) {
      const k = weekStart(new Date(t.at)).getTime();
      weeks.set(k, [...(weeks.get(k) ?? []), t]);
    }
    const payouts = [...weeks.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([start, list]) => {
        const sum = (f: 'grossUsd' | 'commissionUsd' | 'netUsd') =>
          round2(list.reduce((s, t) => s + t[f], 0));
        const payoutDate = new Date(start + 9 * DAY); // Wednesday after the week closes
        const status =
          start >= current
            ? 'open'
            : payoutDate.getTime() <= now.getTime()
              ? 'paid'
              : 'scheduled';
        return {
          id: `PO-${isoDay(new Date(start)).replace(/-/g, '')}`,
          periodStart: isoDay(new Date(start)),
          periodEnd: isoDay(new Date(start + 6 * DAY)),
          payoutDate: isoDay(payoutDate),
          status,
          transactions: list.length,
          grossUsd: sum('grossUsd'),
          commissionUsd: sum('commissionUsd'),
          netUsd: sum('netUsd'),
        };
      });
    const total = (f: 'grossUsd' | 'commissionUsd' | 'netUsd') =>
      round2(tx.reduce((s, t) => s + t[f], 0));
    const byStatus = (s: string) =>
      round2(
        payouts.filter((p) => p.status === s).reduce((a, p) => a + p.netUsd, 0),
      );
    const next = [...payouts]
      .reverse()
      .find((p) => p.status === 'scheduled' || p.status === 'open');
    return {
      commissionRate: COMMISSION_RATE,
      totals: {
        grossUsd: total('grossUsd'),
        commissionUsd: total('commissionUsd'),
        netUsd: total('netUsd'),
        refundsUsd: round2(
          -tx
            .filter((t) => t.type === 'refund')
            .reduce((s, t) => s + t.grossUsd, 0),
        ),
        paidOutUsd: byStatus('paid'),
        scheduledUsd: byStatus('scheduled'),
        openUsd: byStatus('open'),
      },
      nextPayout: next
        ? { date: next.payoutDate, amountUsd: next.netUsd, status: next.status }
        : null,
      payoutAccount: this.state.settings.payout,
      payouts,
      transactions: tx,
    };
  }

  reviews(filter: { rating?: number; tour?: string } = {}) {
    const all = this.catalog.listAllTours().flatMap((s) => {
      const tour = this.catalog.findTour(s.slug);
      return tour.reviews.map((r) => {
        const id = reviewId(tour.slug, r.author, r.date);
        return {
          id,
          tourSlug: tour.slug,
          tourTitle: tour.title,
          ...r,
          reply: this.state.replies[id],
        };
      });
    });
    all.sort((a, b) => b.date.localeCompare(a.date));
    const distribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: all.filter((r) => Math.round(r.rating) === stars).length,
    }));
    const avg = all.length
      ? round2(all.reduce((s, r) => s + r.rating, 0) / all.length)
      : 0;
    return {
      summary: {
        count: all.length,
        average: avg,
        replied: all.filter((r) => r.reply).length,
        distribution,
      },
      items: all.filter(
        (r) =>
          (!filter.rating || Math.round(r.rating) === filter.rating) &&
          (!filter.tour || r.tourSlug === filter.tour),
      ),
    };
  }

  reply(id: string, text: unknown, now = new Date()) {
    const exists = this.reviews().items.some((r) => r.id === id);
    if (!exists) throw new NotFoundException(`Review ${id} not found`);
    const t = typeof text === 'string' ? text.trim() : '';
    if (t.length < 2 || t.length > 600)
      throw new BadRequestException({
        message: 'Reply must be 2–600 characters',
        errors: { text: 'Write between 2 and 600 characters.' },
      });
    this.state.replies[id] = { text: t, at: now.toISOString() };
    this.save();
    return this.reviews().items.find((r) => r.id === id);
  }

  settings(): SupplierSettings {
    return this.state.settings;
  }

  updateSettings(input: Record<string, unknown>): SupplierSettings {
    const s = structuredClone(this.state.settings);
    const errors: Record<string, string> = {};
    const str = (k: keyof SupplierSettings, max = 120) => {
      if (input[k] === undefined) return;
      const v = typeof input[k] === 'string' ? input[k].trim() : '';
      if (!v || v.length > max) errors[k] = 'Required, max ' + max + ' chars.';
      else (s[k] as string) = v;
    };
    str('companyName');
    str('legalName');
    str('licenseNo');
    str('address', 200);
    str('phone', 40);
    str('website');
    str('email');
    if (input.email !== undefined && !EMAIL.test(s.email))
      errors.email = 'Enter a valid email.';
    if (input.languages !== undefined) {
      const langs = (
        Array.isArray(input.languages)
          ? input.languages
          : typeof input.languages === 'string'
            ? input.languages.split(',')
            : []
      )
        .map((l) => (typeof l === 'string' ? l.trim() : ''))
        .filter(Boolean);
      if (!langs.length) errors.languages = 'Add at least one language.';
      else s.languages = langs;
    }
    if (input.cutoffHours !== undefined) {
      const h = Number(input.cutoffHours);
      if (!Number.isInteger(h) || h < 0 || h > 168)
        errors.cutoffHours = 'Between 0 and 168 hours.';
      else s.cutoffHours = h;
    }
    if (input.notifications && typeof input.notifications === 'object') {
      const n = input.notifications as Record<string, unknown>;
      for (const k of Object.keys(
        s.notifications,
      ) as (keyof SupplierSettings['notifications'])[])
        if (k in n)
          s.notifications[k] =
            n[k] === true || n[k] === 'on' || n[k] === 'true';
    }
    if (Object.keys(errors).length)
      throw new BadRequestException({ message: 'Invalid settings', errors });
    this.state.settings = s;
    this.save();
    return s;
  }

  private load(): SupplierState {
    const fresh = (): SupplierState => ({
      settings: structuredClone(DEFAULT_SETTINGS),
      replies: {},
    });
    if (!this.file || !existsSync(this.file)) {
      const s = fresh();
      // A few replies so the reviews page looks like a real, active operator.
      s.replies['ha-long-bay-luxury-overnight-cruise-2026-10-02-emilyr'] = {
        text: 'Thank you Emily! Sunset kayaking in Lan Hạ is our favourite too. Hope to welcome you back.',
        at: '2026-10-03T09:12:00.000Z',
      };
      s.replies['hoi-an-lantern-food-walk-2026-11-01-pierrel'] = {
        text: 'Merci Pierre! Next time try the bánh mì stop first, before you get too full. See you again in Hội An.',
        at: '2026-11-01T14:40:00.000Z',
      };
      return s;
    }
    try {
      return {
        ...fresh(),
        ...(JSON.parse(readFileSync(this.file, 'utf8')) as SupplierState),
      };
    } catch {
      return fresh();
    }
  }

  private save() {
    if (!this.file) return;
    mkdirSync(dirname(this.file), { recursive: true });
    writeFileSync(this.file, JSON.stringify(this.state, null, 2));
  }
}
