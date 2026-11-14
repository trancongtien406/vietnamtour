import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import type { CreateBookingInput } from './bookings.types';

@Controller()
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get('tours/:slug/availability')
  availability(@Param('slug') slug: string, @Query('date') date: string) {
    return {
      date,
      slots: this.bookings.availability(slug, String(date ?? '')),
    };
  }

  @Post('bookings')
  create(@Body() body: CreateBookingInput) {
    return this.bookings.create(body ?? {});
  }

  /** Guest "My trips": bookings for an email address. */
  @Get('bookings')
  byEmail(@Query('email') email: string) {
    return this.bookings.findByEmail(String(email ?? ''));
  }

  @Get('bookings/:code')
  get(@Param('code') code: string) {
    const booking = this.bookings.get(code);
    // Lets clients show the refund outcome before the guest cancels.
    return { ...booking, refundable: this.bookings.isRefundable(booking) };
  }

  @Post('bookings/:code/pay')
  @HttpCode(200)
  pay(@Param('code') code: string, @Body() body: Record<string, unknown>) {
    return this.bookings.pay(code, body ?? {});
  }

  @Post('bookings/:code/cancel')
  @HttpCode(200)
  cancel(@Param('code') code: string) {
    return this.bookings.cancel(code);
  }
}
