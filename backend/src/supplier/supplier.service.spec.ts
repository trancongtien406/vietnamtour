import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingsService } from '../bookings/bookings.service';
import { BookingsStore } from '../bookings/bookings.store';
import { CatalogService } from '../catalog/catalog.service';
import { SupplierService } from './supplier.service';

describe('SupplierService', () => {
  process.env.BOOKINGS_FILE = '';
  const now = new Date('2026-11-14T05:00:00Z');
  const card = { cardNumber: '4242424242424242', expiry: '12/30', cvc: '123' };
  let bookings: BookingsService;
  let supplier: SupplierService;

  beforeEach(() => {
    const catalog = new CatalogService();
    const store = new BookingsStore();
    bookings = new BookingsService(catalog, store);
    supplier = new SupplierService(store, catalog);
  });

  const book = (date: string, paidAt: Date) =>
    bookings.pay(
      bookings.create(
        {
          tourSlug: 'hoi-an-lantern-food-walk',
          date,
          time: '17:00',
          adults: 2,
          children: 0,
          fullName: 'Lê Văn B',
          email: 'b@example.com',
          phone: '+84 905 000 111',
        },
        paidAt,
      ).code,
      card,
      paidAt,
    );

  it('splits revenue 80/20 and reconciles payouts with transactions', () => {
    book('2026-12-01', new Date('2026-11-03T03:00:00Z'));
    const b = book('2026-12-05', new Date('2026-11-12T03:00:00Z'));
    bookings.cancel(b.code, new Date('2026-11-13T03:00:00Z'));
    const f = supplier.finance(now);
    expect(f.totals.grossUsd).toBe(78);
    expect(f.totals.commissionUsd).toBeCloseTo(15.6);
    expect(f.totals.netUsd).toBeCloseTo(62.4);
    expect(f.totals.refundsUsd).toBe(78);
    expect(f.payouts.map((p) => p.status)).toEqual(['open', 'paid']);
    const sum = f.payouts.reduce((s, p) => s + p.netUsd, 0);
    expect(sum).toBeCloseTo(f.totals.netUsd);
  });

  it('summarises reviews and stores replies', () => {
    const r = supplier.reviews();
    expect(r.summary.count).toBe(r.items.length);
    expect(r.summary.distribution.reduce((s, d) => s + d.count, 0)).toBe(
      r.summary.count,
    );
    const target = r.items.find((i) => !i.reply)!;
    expect(supplier.reply(target.id, ' Thank you! ')?.reply?.text).toBe(
      'Thank you!',
    );
    expect(() => supplier.reply(target.id, 'x')).toThrow(BadRequestException);
    expect(() => supplier.reply('nope', 'Thanks')).toThrow(NotFoundException);
    expect(
      supplier.reviews({ rating: 3 }).items.every((i) => i.rating === 3),
    ).toBe(true);
  });

  it('validates and updates settings', () => {
    const s = supplier.updateSettings({
      phone: '+84 236 000 000',
      languages: 'English, Korean',
      cutoffHours: '12',
      notifications: { dailySummary: 'on', newReview: false },
    });
    expect(s.languages).toEqual(['English', 'Korean']);
    expect(s.cutoffHours).toBe(12);
    expect(s.notifications.dailySummary).toBe(true);
    expect(s.notifications.newReview).toBe(false);
    expect(() => supplier.updateSettings({ email: 'bad' })).toThrow(
      BadRequestException,
    );
  });
});
