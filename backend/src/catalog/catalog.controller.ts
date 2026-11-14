import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import type { TourQuery } from './catalog.types';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('destinations')
  destinations() {
    return this.catalog.listDestinations();
  }

  @Get('destinations/:slug')
  destination(@Param('slug') slug: string) {
    return this.catalog.getDestination(slug);
  }

  @Get('tours')
  tours(@Query() query: TourQuery) {
    return this.catalog.listTours(query);
  }

  @Get('tours/:slug')
  tour(@Param('slug') slug: string) {
    return this.catalog.getTour(slug);
  }

  @Get('stats')
  stats() {
    return this.catalog.stats();
  }
}
