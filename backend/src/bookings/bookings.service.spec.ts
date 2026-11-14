import {
  BadRequestException,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { CatalogService } from '../catalog/catalog.service';
import { BookingsService, DECLINED_TEST_CARD } from './bookings.service';
import { BookingsStore } from './bookings.store';

describe('BookingsService', () => {
  process.env.BOOKINGS_FILE = '';
  const now = new Date('2026-11-14T05:00:00Z');
  const card = {
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/30',
    cvc: '123',
  };
  let service: BookingsService;

  beforeEach(() => {
    service = new BookingsService(new CatalogService(), new BookingsStore());
  });

  const valid = {
    tourSlug: 'hoi-an-lantern-food-walk',
    date: '2026-12-01',
    time: '17:00',
    adults: 2,
    children: 1,
    fullName: 'Nguyễn Văn A',
    email: 'A@Example.com',
    phone: '+84 905 123 456',
  };

  it('creates a pending booking with child pricing', () => {
    const b = service.create(valid, now);
    expect(b.code).toMatch(/^VT-[0-9A-F]{6}$/);
    expect(b.status).toBe('pending_payment');
    expect(b.email).toBe('a@example.com');
    expect(b.totalUsd).toBe(39 * 2 + 39 * 0.7);
    expect(service.get(b.code.toLowerCase()).code).toBe(b.code);
  });

  it('confirms instantly after a sandbox payment and reserves seats', () => {
    const before = service.availability(valid.tourSlug, valid.date, now)[0]
      .remaining;
    const b = service.pay(service.create(valid, now).code, card, now);
    expect(b.status).toBe('confirmed');
    expect(b.payment?.last4).toBe('4242');
    expect(
      service.availability(valid.tourSlug, valid.date, now)[0].remaining,
    ).toBe(before - 3);
  });

  it('declines the sandbox decline card', () => {
    const b = service.create(valid, now);
    expect(() =>
      service.pay(b.code, { ...card, cardNumber: DECLINED_TEST_CARD }, now),
    ).toThrow(HttpException);
    expect(service.get(b.code).status).toBe('pending_payment');
  });

  it('rejects invalid card numbers', () => {
    const b = service.create(valid, now);
    expect(() =>
      service.pay(b.code, { ...card, cardNumber: '4242424242424241' }, now),
    ).toThrow(BadRequestException);
  });

  it('sends request-only tours to the supplier for confirmation', () => {
    const b = service.create(
      {
        ...valid,
        tourSlug: 'ha-giang-loop-easy-rider',
        time: '08:00',
        adults: 1,
        children: 0,
      },
      now,
    );
    service.pay(b.code, card, now);
    expect(service.get(b.code).status).toBe('awaiting_supplier');
    expect(service.supplierAction(b.code, 'confirm', now).status).toBe(
      'confirmed',
    );
    expect(service.supplierAction(b.code, 'check-in', now).status).toBe(
      'checked_in',
    );
  });

  it('refunds free cancellations more than 24h before departure', () => {
    const b = service.pay(service.create(valid, now).code, card, now);
    const cancelled = service.cancel(b.code, now);
    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.refundUsd).toBe(b.totalUsd);
    expect(() => service.cancel(b.code, now)).toThrow(ConflictException);
  });

  it('does not refund within 24h of departure', () => {
    const b = service.pay(service.create(valid, now).code, card, now);
    expect(
      service.cancel(b.code, new Date('2026-12-01T05:00:00Z')).refundUsd,
    ).toBe(0);
  });

  it('rejects same-day bookings and bad contact details', () => {
    try {
      service.create(
        { ...valid, date: '2026-11-14', email: 'x', phone: '12' },
        now,
      );
      fail('expected error');
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      const errors = (
        (e as BadRequestException).getResponse() as {
          errors: Record<string, string>;
        }
      ).errors;
      expect(Object.keys(errors).sort()).toEqual(['date', 'email', 'phone']);
    }
  });

  it('rejects start times the tour does not run', () => {
    expect(() => service.create({ ...valid, time: '03:00' }, now)).toThrow(
      BadRequestException,
    );
  });

  it('enforces the maximum group size', () => {
    expect(() =>
      service.create({ ...valid, adults: 11, children: 0 }, now),
    ).toThrow(BadRequestException);
  });

  it('lists bookings by email and builds the supplier overview', () => {
    service.pay(service.create(valid, now).code, card, now);
    expect(service.findByEmail('a@example.com')).toHaveLength(1);
    const o = service.supplierOverview(14, now);
    expect(o.totals.revenueUsd).toBe(105.3);
    expect(o.topTours[0].slug).toBe('hoi-an-lantern-food-walk');
    expect(o.totals.payoutUsd).toBeCloseTo(84.24);
    expect(o.revenueByDay).toHaveLength(14);
    expect(o.revenueByDay.at(-1)?.grossUsd).toBe(105.3);
  });
});
