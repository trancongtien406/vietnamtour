import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DESTINATIONS, TOURS } from './catalog.data';
import {
  Category,
  Destination,
  Region,
  Tour,
  TourQuery,
  TourSummary,
} from './catalog.types';

const REGIONS: Region[] = ['north', 'central', 'south'];
const CATEGORIES: Category[] = [
  'cruise',
  'culture',
  'adventure',
  'beach',
  'nature',
  'food',
];

/** Lower-case and strip Vietnamese diacritics so "ha long" matches "Hạ Long". */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

@Injectable()
export class CatalogService {
  private readonly destinations = DESTINATIONS;
  // Copy so supplier edits stay per-instance (and tests stay isolated).
  private readonly tours: Tour[] = TOURS.map((t) => ({ ...t }));

  listDestinations(): (Destination & {
    tourCount: number;
    fromPriceUsd: number | null;
  })[] {
    return this.destinations.map((d) => {
      const tours = this.tours.filter(
        (t) => t.published && t.destinationSlug === d.slug,
      );
      return {
        ...d,
        tourCount: tours.length,
        fromPriceUsd: tours.length
          ? Math.min(...tours.map((t) => t.priceUsd))
          : null,
      };
    });
  }

  getDestination(slug: string) {
    const destination = this.destinations.find((d) => d.slug === slug);
    if (!destination)
      throw new NotFoundException(`Destination "${slug}" not found`);
    return {
      ...destination,
      tours: this.tours
        .filter((t) => t.destinationSlug === slug)
        .map((t) => this.toSummary(t)),
    };
  }

  listTours(query: TourQuery = {}): { total: number; items: TourSummary[] } {
    let items = this.tours.filter((t) => t.published);
    const q = query.q ? normalize(String(query.q)) : '';
    if (q) {
      items = items.filter((t) => {
        const dest = this.destinationName(t.destinationSlug);
        return normalize(
          `${t.title} ${t.summary} ${dest} ${t.category}`,
        ).includes(q);
      });
    }
    if (query.region && REGIONS.includes(query.region as Region)) {
      items = items.filter((t) => t.region === query.region);
    }
    if (query.category && CATEGORIES.includes(query.category as Category)) {
      items = items.filter((t) => t.category === query.category);
    }
    if (query.destination) {
      items = items.filter((t) => t.destinationSlug === query.destination);
    }
    const maxPrice = toNumber(query.maxPrice);
    if (maxPrice !== undefined)
      items = items.filter((t) => t.priceUsd <= maxPrice);
    const maxDays = toNumber(query.maxDays);
    if (maxDays !== undefined)
      items = items.filter((t) => t.durationDays <= maxDays);
    if (query.language) {
      const lang = normalize(String(query.language));
      items = items.filter((t) =>
        t.languages.some((l) => normalize(l) === lang),
      );
    }
    const minRating = toNumber(query.minRating);
    if (minRating !== undefined)
      items = items.filter((t) => t.rating >= minRating);
    if (query.freeCancellation === true || query.freeCancellation === 'true') {
      items = items.filter((t) => t.freeCancellation);
    }
    if (query.featured === true || query.featured === 'true') {
      items = items.filter((t) => t.featured);
    }

    switch (query.sort) {
      case 'price-asc':
        items.sort((a, b) => a.priceUsd - b.priceUsd);
        break;
      case 'price-desc':
        items.sort((a, b) => b.priceUsd - a.priceUsd);
        break;
      case 'duration':
        items.sort((a, b) => a.durationDays - b.durationDays);
        break;
      case 'rating':
        items.sort(
          (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
        );
        break;
      default:
        // "popular": featured first, then by review count
        items.sort(
          (a, b) =>
            Number(b.featured) - Number(a.featured) ||
            b.reviewCount - a.reviewCount,
        );
    }
    return { total: items.length, items: items.map((t) => this.toSummary(t)) };
  }

  getTour(
    slug: string,
  ): Tour & { destinationName: string; related: TourSummary[] } {
    const tour = this.findTour(slug);
    const related = this.tours
      .filter(
        (t) =>
          t.slug !== slug &&
          (t.region === tour.region || t.category === tour.category),
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3)
      .map((t) => this.toSummary(t));
    return {
      ...tour,
      destinationName: this.destinationName(tour.destinationSlug),
      related,
    };
  }

  findTour(slug: string): Tour {
    const tour = this.tours.find((t) => t.slug === slug);
    if (!tour) throw new NotFoundException(`Tour "${slug}" not found`);
    return tour;
  }

  /** All tours including unpublished drafts, for the supplier portal. */
  listAllTours(): TourSummary[] {
    return this.tours.map((t) => this.toSummary(t));
  }

  /** Supplier product editor: update price, capacity, times and publish state. */
  updateTour(slug: string, patch: Record<string, unknown>): Tour {
    const tour = this.findTour(slug);
    const errors: Record<string, string> = {};
    if (patch.priceUsd !== undefined) {
      const price = Number(patch.priceUsd);
      if (!Number.isFinite(price) || price < 1 || price > 10000)
        errors.priceUsd = 'Price must be between 1 and 10,000 USD.';
      else tour.priceUsd = Math.round(price);
    }
    if (patch.maxGroupSize !== undefined) {
      const size = Number(patch.maxGroupSize);
      if (!Number.isInteger(size) || size < 1 || size > 60)
        errors.maxGroupSize = 'Capacity must be 1–60 guests.';
      else tour.maxGroupSize = size;
    }
    if (patch.startTimes !== undefined) {
      const times = Array.isArray(patch.startTimes)
        ? patch.startTimes.map(String)
        : [];
      if (
        !times.length ||
        !times.every((t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t))
      )
        errors.startTimes = 'Use HH:MM start times.';
      else tour.startTimes = [...new Set(times)].sort();
    }
    if (patch.published !== undefined)
      tour.published = patch.published === true || patch.published === 'true';
    if (patch.title !== undefined) {
      const title = (typeof patch.title === 'string' ? patch.title : '').trim();
      if (title.length < 5) errors.title = 'Title is too short.';
      else tour.title = title;
    }
    if (Object.keys(errors).length)
      throw new BadRequestException({ message: 'Validation failed', errors });
    return tour;
  }

  stats() {
    const published = this.tours.filter((t) => t.published);
    const reviews = published.reduce((sum, t) => sum + t.reviewCount, 0);
    const avg =
      this.tours.reduce((sum, t) => sum + t.rating * t.reviewCount, 0) /
      Math.max(reviews, 1);
    return {
      tours: this.tours.length,
      destinations: this.destinations.length,
      reviews,
      averageRating: Math.round(avg * 10) / 10,
    };
  }

  private destinationName(slug: string): string {
    return this.destinations.find((d) => d.slug === slug)?.name ?? slug;
  }

  private toSummary(t: Tour): TourSummary {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { itinerary, included, excluded, reviews, highlights, ...rest } = t;
    return {
      ...rest,
      destinationName: this.destinationName(t.destinationSlug),
    };
  }
}
