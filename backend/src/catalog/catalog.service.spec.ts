import { NotFoundException } from '@nestjs/common';
import { CatalogService, normalize } from './catalog.service';

describe('CatalogService', () => {
  const service = new CatalogService();

  it('normalizes Vietnamese diacritics', () => {
    expect(normalize('Hạ Long Đà Nẵng')).toBe('ha long da nang');
  });

  it('searches without diacritics', () => {
    const { items } = service.listTours({ q: 'hoi an' });
    expect(items.map((t) => t.slug)).toContain('hoi-an-lantern-food-walk');
  });

  it('filters by region, category and price', () => {
    const { items } = service.listTours({
      region: 'north',
      category: 'adventure',
      maxPrice: '200',
    });
    expect(items.length).toBeGreaterThan(0);
    for (const t of items) {
      expect(t.region).toBe('north');
      expect(t.category).toBe('adventure');
      expect(t.priceUsd).toBeLessThanOrEqual(200);
    }
  });

  it('ignores unknown filter values', () => {
    expect(service.listTours({ region: 'mars' }).total).toBe(
      service.listTours().total,
    );
  });

  it('sorts by price ascending', () => {
    const prices = service
      .listTours({ sort: 'price-asc' })
      .items.map((t) => t.priceUsd);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('returns tour details with related tours', () => {
    const tour = service.getTour('ha-long-bay-luxury-overnight-cruise');
    expect(tour.destinationName).toBe('Hạ Long Bay');
    expect(tour.itinerary).toHaveLength(tour.durationDays);
    expect(tour.related.length).toBeGreaterThan(0);
    expect(tour.related.find((t) => t.slug === tour.slug)).toBeUndefined();
  });

  it('throws for unknown tours', () => {
    expect(() => service.getTour('nope')).toThrow(NotFoundException);
  });

  it('has an itinerary day for every tour day and existing images', () => {
    for (const t of service.listTours().items) {
      const full = service.getTour(t.slug);
      expect(full.itinerary.map((d) => d.day)).toEqual(
        Array.from({ length: full.durationDays }, (_, i) => i + 1),
      );
    }
  });

  it('filters by language and free cancellation', () => {
    const { items } = service.listTours({
      language: 'francais',
      freeCancellation: 'true',
    });
    expect(items.map((t) => t.slug)).toEqual([
      'hue-imperial-city-heritage-tour',
    ]);
  });

  it('hides unpublished tours from the public catalog', () => {
    const s = new CatalogService();
    s.updateTour('hoi-an-lantern-food-walk', {
      published: false,
      priceUsd: 45,
    });
    expect(s.listTours({ q: 'hoi an' }).total).toBe(0);
    expect(
      s.listAllTours().find((t) => t.slug === 'hoi-an-lantern-food-walk')
        ?.priceUsd,
    ).toBe(45);
    expect(() =>
      s.updateTour('hoi-an-lantern-food-walk', { startTimes: ['25:00'] }),
    ).toThrow();
  });

  it('counts tours per destination', () => {
    const dest = service.listDestinations().find((d) => d.slug === 'hoi-an');
    expect(dest?.tourCount).toBe(1);
    expect(dest?.fromPriceUsd).toBe(39);
  });
});
