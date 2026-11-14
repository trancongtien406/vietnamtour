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
const MIN_PAYOUT = 50;
export interface Tx {
  id: string;
  type: 'payment' | 'refund';
  at: string;
  bookingCode: string;
  tourTitle: string;
  guest: string;
  grossUsd: number;
  commissionUsd: number;
  netUsd: number;
}
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
  payoutRequests: { amountUsd: number; at: string }[];
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
    accountLast4: '8901',
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
  private state: SupplierState;

  constructor(
    private readonly store: BookingsStore,
    private readonly catalog: CatalogService,
  ) {
    this.state = this.load();
  }

  finance(days = 30, now = new Date()) {
    const tx = this.transactions();
    const period = Math.min(Math.max(Math.round(days) || 30, 7), 365);
    const since = now.getTime() - period * DAY;
    const prevSince = since - period * DAY;
    const sumTx = (list: Tx[]) => {
      const gross = round2(
        list
          .filter((t) => t.type === 'payment')
          .reduce((s, t) => s + t.grossUsd, 0),
      );
      const refunds = round2(
        -list
          .filter((t) => t.type === 'refund')
          .reduce((s, t) => s + t.grossUsd, 0),
      );
      const commission = round2(list.reduce((s, t) => s + t.commissionUsd, 0));
      return {
        grossUsd: gross,
        refundsUsd: refunds,
        commissionUsd: commission,
        // Net = Gross − Commission − Refunds
        netUsd: round2(gross - refunds - commission),
        bookings: list.filter((t) => t.type === 'payment').length,
      };
    };
    const at = (t: Tx) => new Date(t.at).getTime();
    const cur = sumTx(
      tx.filter((t) => at(t) >= since && at(t) <= now.getTime()),
    );
    const prev = sumTx(tx.filter((t) => at(t) >= prevSince && at(t) < since));
    const pct = (c: number, p: number) =>
      p > 0 ? Math.round(((c - p) / p) * 1000) / 10 : null;

    const series = Array.from({ length: period }, (_, i) => {
      const day = isoDay(new Date(now.getTime() - (period - 1 - i) * DAY));
      const t = sumTx(tx.filter((x) => x.at.slice(0, 10) === day));
      return {
        day,
        grossUsd: t.grossUsd,
        netUsd: t.netUsd,
        commissionUsd: t.commissionUsd,
      };
    });

    // Weekly settlement: Monday–Sunday, paid out on the following Wednesday.
    const current = weekStart(now).getTime();
    const weeks = new Map<number, Tx[]>();
    for (const t of tx) {
      const k = weekStart(new Date(t.at)).getTime();
      weeks.set(k, [...(weeks.get(k) ?? []), t]);
    }
    const method = `Bank transfer · ${this.state.settings.payout.bankName} ••${this.state.settings.payout.accountLast4}`;
    const weekly = [...weeks.entries()]
      .filter(([start]) => start < current)
      .sort((a, b) => a[0] - b[0])
      .map(([start, list], i) => {
        const t = sumTx(list);
        const payoutDate = new Date(start + 9 * DAY);
        return {
          id: `PO-2026-${String(31 + i).padStart(4, '0')}`,
          periodStart: isoDay(new Date(start)),
          periodEnd: isoDay(new Date(start + 6 * DAY)),
          payoutDate: isoDay(payoutDate),
          status:
            payoutDate.getTime() <= now.getTime() ? 'completed' : 'scheduled',
          method,
          transactions: list.length,
          grossUsd: t.grossUsd,
          refundsUsd: t.refundsUsd,
          commissionUsd: t.commissionUsd,
          netUsd: t.netUsd,
        };
      });
    const openWeek = sumTx(weeks.get(current) ?? []);
    const requested = this.state.payoutRequests.filter(
      (r) => r.at.slice(0, 10) >= isoDay(new Date(current)),
    );
    const requestedUsd = round2(requested.reduce((s, r) => s + r.amountUsd, 0));
    const manual = this.state.payoutRequests.map((r, i) => ({
      id: `PO-2026-R${String(i + 1).padStart(3, '0')}`,
      periodStart: r.at.slice(0, 10),
      periodEnd: r.at.slice(0, 10),
      payoutDate: isoDay(new Date(new Date(r.at).getTime() + 2 * DAY)),
      status: 'processing',
      method,
      transactions: 0,
      grossUsd: r.amountUsd,
      refundsUsd: 0,
      commissionUsd: 0,
      netUsd: r.amountUsd,
    }));
    const payouts = [...manual, ...weekly.reverse()];
    const scheduled = payouts.find((p) => p.status === 'scheduled');
    const available = round2(Math.max(0, openWeek.netUsd - requestedUsd));
    const nextWeekPayout = isoDay(new Date(current + 9 * DAY));
    return {
      commissionRate: COMMISSION_RATE,
      periodDays: period,
      totals: {
        ...cur,
        paidOutUsd: round2(
          payouts
            .filter((p) => p.status === 'completed')
            .reduce((a, p) => a + p.netUsd, 0),
        ),
      },
      deltas: {
        grossPct: pct(cur.grossUsd, prev.grossUsd),
        netPct: pct(cur.netUsd, prev.netUsd),
        bookingsPct: pct(cur.bookings, prev.bookings),
        commissionPct: pct(cur.commissionUsd, prev.commissionUsd),
      },
      balance: {
        availableUsd: available,
        pendingUsd: round2((scheduled?.netUsd ?? 0) + requestedUsd),
        minimumPayoutUsd: MIN_PAYOUT,
      },
      nextPayout: scheduled
        ? {
            date: scheduled.payoutDate,
            amountUsd: scheduled.netUsd,
            status: 'scheduled',
          }
        : { date: nextWeekPayout, amountUsd: available, status: 'collecting' },
      payoutAccount: this.state.settings.payout,
      series,
      payouts,
      transactions: tx,
    };
  }

  requestPayout(amount: unknown, now = new Date()) {
    const value = Number(amount);
    const { availableUsd } = this.finance(30, now).balance;
    const errors: Record<string, string> = {};
    if (!Number.isFinite(value) || value <= 0)
      errors.amountUsd = 'Enter an amount.';
    else if (value < MIN_PAYOUT)
      errors.amountUsd = `Minimum payout is $${MIN_PAYOUT}.`;
    else if (value > availableUsd)
      errors.amountUsd = `You can withdraw up to $${availableUsd.toFixed(2)}.`;
    if (Object.keys(errors).length)
      throw new BadRequestException({
        message: 'Invalid payout request',
        errors,
      });
    this.state.payoutRequests.push({
      amountUsd: round2(value),
      at: now.toISOString(),
    });
    this.save();
    return this.finance(30, now);
  }

  private transactions(): Tx[] {
    const tx: Tx[] = [];
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
    return tx.sort((a, b) => b.at.localeCompare(a.at));
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
      payoutRequests: [],
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
      const templates = [
        (name: string) =>
          `Thank you so much, ${name}! Our guides will be thrilled to read this. Hope to see you again in Vietnam.`,
        (name: string) =>
          `Cảm ơn ${name}! We are glad you enjoyed it and have shared your feedback with the whole team.`,
        (name: string) =>
          `Thanks for the honest feedback, ${name}. We have adjusted the schedule so the last stop is less rushed.`,
      ];
      let n = 0;
      for (const t of this.catalog.listAllTours()) {
        for (const r of this.catalog.findTour(t.slug).reviews) {
          n++;
          const id = reviewId(t.slug, r.author, r.date);
          if (s.replies[id] || n % 5 > 1) continue;
          const first = r.author.split(' ')[0];
          const text = (r.rating < 5 ? templates[2] : templates[n % 2])(first);
          const at = new Date(Date.parse(`${r.date}T10:00:00+07:00`) + 864e5);
          s.replies[id] = { text, at: at.toISOString() };
        }
      }
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
