export type Region = 'north' | 'central' | 'south';

export type Category =
  'cruise' | 'culture' | 'adventure' | 'beach' | 'nature' | 'food';

export interface Destination {
  slug: string;
  name: string;
  region: Region;
  tagline: string;
  description: string;
  image: string;
  bestTime: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface Review {
  author: string;
  country: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Tour {
  slug: string;
  title: string;
  destinationSlug: string;
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
  highlights: string[];
  itinerary: ItineraryDay[];
  included: string[];
  excluded: string[];
  reviews: Review[];
  meetingPoint: string;
  startTimes: string[];
  freeCancellation: boolean;
  instantConfirmation: boolean;
  published: boolean;
  operator: string;
}

export type TourSummary = Omit<
  Tour,
  'itinerary' | 'included' | 'excluded' | 'reviews' | 'highlights'
> & { destinationName: string };

export interface TourQuery {
  q?: string;
  region?: string;
  category?: string;
  destination?: string;
  maxPrice?: string | number;
  maxDays?: string | number;
  sort?: string;
  language?: string;
  minRating?: string | number;
  freeCancellation?: string | boolean;
  featured?: string | boolean;
}
