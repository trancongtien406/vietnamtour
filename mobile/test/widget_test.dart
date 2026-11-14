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
}
