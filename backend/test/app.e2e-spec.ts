import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Vietnamtour API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.BOOKINGS_FILE = '';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health', () =>
    request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((r) => {
        expect((r.body as { status: string }).status).toBe('ok');
      }));

  it('GET /api/tours filters by category', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/tours?category=food')
      .expect(200);
    const body = res.body as { total: number; items: { category: string }[] };
    expect(body.total).toBeGreaterThan(0);
    expect(
      body.items.every((t: { category: string }) => t.category === 'food'),
    ).toBe(true);
  });

  it('GET /api/tours/:slug returns 404 for unknown tour', () =>
    request(app.getHttpServer()).get('/api/tours/unknown').expect(404));

  it('POST /api/bookings creates and fetches a booking', async () => {
    const future = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);
    const res = await request(app.getHttpServer())
      .post('/api/bookings')
      .send({
        tourSlug: 'saigon-street-food-by-scooter',
        date: future,
        time: '17:30',
        adults: 2,
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1 555 0100 200',
      })
      .expect(201);
    const code = (res.body as { code: string }).code;
    await request(app.getHttpServer())
      .post(`/api/bookings/${code}/pay`)
      .send({ cardNumber: '4242424242424242', expiry: '12/30', cvc: '123' })
      .expect(200);
    await request(app.getHttpServer())
      .get(`/api/supplier/bookings/${code}`)
      .expect(200)
      .expect((r) =>
        expect((r.body as { status: string }).status).toBe('confirmed'),
      );
    await request(app.getHttpServer())
      .get(`/api/bookings/${(res.body as { code: string }).code}`)
      .expect(200);
  });

  it('GET /api/tours/:slug/availability returns slots', async () => {
    const future = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
    const res = await request(app.getHttpServer())
      .get(`/api/tours/hoi-an-lantern-food-walk/availability?date=${future}`)
      .expect(200);
    expect((res.body as { slots: unknown[] }).slots).toHaveLength(2);
  });

  it('GET /api/supplier/overview', () =>
    request(app.getHttpServer()).get('/api/supplier/overview').expect(200));

  it('POST /api/bookings returns field errors', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/bookings')
      .send({})
      .expect(400);
    expect((res.body as { errors: object }).errors).toHaveProperty('tourSlug');
  });
});
