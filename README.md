# Vietnamtour

A GetYourGuide-style marketplace for tours and experiences in Vietnam: travellers search and book experiences, pay (sandbox), get a QR voucher and manage their trips; local operators manage bookings, capacity and products in a supplier portal.

| App | Stack | Port |
|---|---|---|
| `backend/` | NestJS 11 REST API, JSON-file persistence, Jest unit + e2e tests | 4000 |
| `web/` | Next.js 16 (App Router, Cache Components, Server Actions), Tailwind CSS 4 | 3000 |
| `mobile/` | Flutter 3.50 app (Android / iOS / web preview) | – |

## Features

**Customer website**
- Search with Vietnamese-diacritic-insensitive matching (“ha long” finds “Hạ Long”)
- Filters: region, activity, max price, duration, guide language, rating, free cancellation; sorting
- Tour detail with gallery, itinerary, inclusions, meeting point, operator and reviews
- Live availability per departure time with remaining seats, child pricing and price breakdown
- Guest checkout → sandbox card payment → QR voucher → cancellation with automatic refund rules
- “My trips” lookup by email, wishlist (saved tours) stored on the device

**Supplier portal** (`/supplier`)
- Dashboard: revenue, payout after 20% commission, 14-day revenue chart, top experiences, next departures
- Bookings: filter by status, confirm/decline request-only bookings, check guests in
- Availability calendar per experience, product editor (price, capacity, start times, publish/unpublish)

**Mobile app**: explore and filter tours, tour detail, booking sheet with date/slot picker, QR voucher, My trips.

## Run locally

```bash
# 1. API (http://localhost:4000/api)
cd backend && npm install && npm run start:dev

# 2. Website (http://localhost:3000)
cd web && cp .env.example .env.local && npm install && npm run dev

# 3. Mobile (needs the API running)
cd mobile && flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000 --dart-define=IMAGE_BASE_URL=http://10.0.2.2:3000   # Android emulator
```

On first start the API seeds 12 realistic demo bookings into `backend/data/bookings.json` (git-ignored). Delete the file to reset.
Sandbox cards: `4242 4242 4242 4242` succeeds, `4000 0000 0000 0002` is declined; any future expiry and CVC.

## Tests

```bash
cd backend && npm test && npm run test:e2e && npm run lint
cd web && npm run lint && npx tsc --noEmit && npm run build
cd mobile && flutter analyze && flutter test
```

## API overview

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/tours?q=&region=&category=&maxPrice=&maxDays=&language=&minRating=&freeCancellation=&sort=` | Search tours |
| GET | `/api/tours/:slug` · `/api/tours/:slug/availability?date=` | Detail · seats per start time |
| GET | `/api/destinations` · `/api/destinations/:slug` · `/api/stats` | Catalog |
| POST | `/api/bookings` → `/api/bookings/:code/pay` → `/api/bookings/:code/cancel` | Booking lifecycle |
| GET | `/api/bookings?email=` · `/api/bookings/:code` | My trips · voucher |
| GET/POST/PATCH | `/api/supplier/overview`, `/bookings`, `/bookings/:code/(confirm\|decline\|check-in)`, `/products/:slug`, `/calendar` | Supplier portal |

## Not included (demo scope)

Real payment gateway, user accounts/authentication for travellers and suppliers, admin back office, email/push notifications and a production database. These are the natural next steps.

Photos: Wikimedia Commons (CC BY / CC BY-SA / CC0 / public domain), credited on `/credits`.
