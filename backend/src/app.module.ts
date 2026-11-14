import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BookingsController } from './bookings/bookings.controller';
import { BookingsService } from './bookings/bookings.service';
import { BookingsStore } from './bookings/bookings.store';
import { CatalogController } from './catalog/catalog.controller';
import { CatalogService } from './catalog/catalog.service';
import { SupplierController } from './supplier/supplier.controller';
import { SupplierService } from './supplier/supplier.service';

@Module({
  controllers: [
    AppController,
    CatalogController,
    BookingsController,
    SupplierController,
  ],
  providers: [CatalogService, BookingsService, BookingsStore, SupplierService],
})
export class AppModule {}
