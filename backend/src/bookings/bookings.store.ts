import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { Booking } from './bookings.types';

/**
 * Tiny JSON-file store so demo bookings survive restarts without a database.
 * Set BOOKINGS_FILE="" (as the tests do) to keep everything in memory.
 */
@Injectable()
export class BookingsStore {
  private readonly file = process.env.BOOKINGS_FILE ?? 'data/bookings.json';
  private bookings: Booking[] = this.load();

  /** True when there is a file but nothing in it yet (first boot). */
  get isFresh(): boolean {
    return Boolean(this.file) && this.bookings.length === 0;
  }

  all(): Booking[] {
    return this.bookings;
  }

  find(code: string): Booking | undefined {
    return this.bookings.find((b) => b.code === code.toUpperCase());
  }

  add(booking: Booking): Booking {
    this.bookings.push(booking);
    this.save();
    return booking;
  }

  save() {
    if (!this.file) return;
    mkdirSync(dirname(this.file), { recursive: true });
    writeFileSync(this.file, JSON.stringify(this.bookings, null, 2));
  }

  private load(): Booking[] {
    if (!this.file || !existsSync(this.file)) return [];
    try {
      return JSON.parse(readFileSync(this.file, 'utf8')) as Booking[];
    } catch {
      return [];
    }
  }
}
