import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BookingsService } from '../bookings/bookings.service';
import { CatalogService } from '../catalog/catalog.service';
import { SupplierService } from './supplier.service';

/**
 * Supplier portal API. Every route lives under /api/supplier/* so the web
 * portal (/supplier/*) and the API share one naming scheme.
 * Demo only: there is no supplier authentication.
 */
@Controller('supplier')
export class SupplierController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly bookings: BookingsService,
    private readonly supplier: SupplierService,
  ) {}

  @Get('overview')
  overview() {
    return this.bookings.supplierOverview();
  }

  @Get('bookings')
  list(@Query('status') status?: string, @Query('tour') tour?: string) {
    return this.bookings.list({ status, tour });
  }

  @Get('bookings/:code')
  get(@Param('code') code: string) {
    return this.bookings.get(code);
  }

  @Post('bookings/:code/:action')
  @HttpCode(200)
  act(@Param('code') code: string, @Param('action') action: string) {
    return this.bookings.supplierAction(code, action);
  }

  @Get('products')
  products() {
    return this.catalog.listAllTours();
  }

  @Get('products/:slug')
  product(@Param('slug') slug: string) {
    return this.catalog.findTour(slug);
  }

  @Patch('products/:slug')
  update(@Param('slug') slug: string, @Body() body: Record<string, unknown>) {
    return this.catalog.updateTour(slug, body ?? {});
  }

  @Get('calendar')
  calendar(
    @Query('tour') tour: string,
    @Query('from') from: string,
    @Query('days') days = '14',
  ) {
    const start = /^\d{4}-\d{2}-\d{2}$/.test(from ?? '')
      ? new Date(`${from}T00:00:00Z`)
      : new Date(Date.now() + 864e5);
    const n = Math.min(Math.max(Number(days) || 14, 1), 42);
    return Array.from({ length: n }, (_, i) => {
      const date = new Date(start.getTime() + i * 864e5)
        .toISOString()
        .slice(0, 10);
      return { date, slots: this.bookings.availability(tour, date) };
    });
  }

  @Get('finance')
  finance() {
    return this.supplier.finance();
  }

  @Get('reviews')
  reviews(@Query('rating') rating?: string, @Query('tour') tour?: string) {
    return this.supplier.reviews({
      rating: rating ? Number(rating) : undefined,
      tour: tour || undefined,
    });
  }

  @Post('reviews/:id/reply')
  @HttpCode(200)
  reply(@Param('id') id: string, @Body() body: { text?: unknown }) {
    return this.supplier.reply(id, body?.text);
  }

  @Get('settings')
  settings() {
    return this.supplier.settings();
  }

  @Patch('settings')
  updateSettings(@Body() body: Record<string, unknown>) {
    return this.supplier.updateSettings(body ?? {});
  }
}
