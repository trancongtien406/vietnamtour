import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/src/models.dart';
import 'package:mobile/src/screens.dart';

void main() {
  test('formats prices', () {
    expect(money(39), r'$39');
    expect(money(105.3), r'$105.30');
  });

  test('parses a tour summary', () {
    final t = TourSummary.fromJson({
      'slug': 'hoi-an-lantern-food-walk',
      'title': 'Hội An Lantern Night',
      'destinationName': 'Hội An',
      'category': 'food',
      'summary': 'Taste 10 dishes',
      'durationDays': 1,
      'priceUsd': 39,
      'rating': 4.9,
      'reviewCount': 638,
      'images': ['/images/destinations/hoi-an-1.jpg'],
      'maxGroupSize': 10,
    });
    expect(t.priceUsd, 39.0);
    expect(t.startTimes, ['08:00']);
  });

  test('voucher timeline never mixes unpaid and confirmed', () {
    final paid = _booking({
      'status': 'confirmed',
      'payment': {'paidAt': '2026-11-14T06:01:00.000Z'},
      'history': [
        {'status': 'pending_payment', 'at': '2026-11-14T06:00:00.000Z'},
        {'status': 'confirmed', 'at': '2026-11-14T06:01:00.000Z'},
      ],
    });
    expect(bookingSteps(paid).map((s) => s.$1), ['Booking created', 'Payment successful', 'Confirmed', 'Voucher issued']);
    expect(bookingSteps(paid).every((s) => s.$3), isTrue);

    final unpaid = _booking({'status': 'pending_payment', 'history': []});
    expect(bookingSteps(unpaid).where((s) => s.$3).map((s) => s.$1), ['Booking created']);
  });

  test('formats dates and detects past trips', () {
    expect(niceDate('2026-11-26'), 'Thu, 26 Nov');
    final b = _booking({'status': 'checked_in'});
    expect(b.isPast(DateTime(2026, 12, 1)), isTrue);
    expect(b.isPast(DateTime(2026, 11, 20)), isFalse);
  });
}

Booking _booking(Map<String, dynamic> extra) => Booking.fromJson({
      'code': 'VT-ABC123',
      'tourSlug': 'hoi-an-lantern-food-walk',
      'tourTitle': 'Hội An Lantern Night',
      'date': '2026-11-26',
      'time': '17:00',
      'adults': 2,
      'children': 0,
      'fullName': 'Trần Công Tiến',
      'totalUsd': 78,
      'createdAt': '2026-11-14T06:00:00.000Z',
      ...extra,
    });
