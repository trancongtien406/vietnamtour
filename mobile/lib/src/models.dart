class TourSummary {
  TourSummary({
    required this.slug,
    required this.title,
    required this.destinationName,
    required this.category,
    required this.summary,
    required this.durationDays,
    required this.priceUsd,
    required this.rating,
    required this.reviewCount,
    required this.images,
    required this.maxGroupSize,
    required this.freeCancellation,
    required this.instantConfirmation,
    required this.startTimes,
    required this.meetingPoint,
    required this.operator,
    this.originalPriceUsd,
  });

  factory TourSummary.fromJson(Map<String, dynamic> j) => TourSummary(
        slug: j['slug'] as String,
        title: j['title'] as String,
        destinationName: j['destinationName'] as String? ?? '',
        category: j['category'] as String,
        summary: j['summary'] as String,
        durationDays: j['durationDays'] as int,
        priceUsd: (j['priceUsd'] as num).toDouble(),
        originalPriceUsd: (j['originalPriceUsd'] as num?)?.toDouble(),
        rating: (j['rating'] as num).toDouble(),
        reviewCount: j['reviewCount'] as int,
        images: (j['images'] as List).cast<String>(),
        maxGroupSize: j['maxGroupSize'] as int,
        freeCancellation: j['freeCancellation'] as bool? ?? true,
        instantConfirmation: j['instantConfirmation'] as bool? ?? true,
        startTimes: (j['startTimes'] as List?)?.cast<String>() ?? const ['08:00'],
        meetingPoint: j['meetingPoint'] as String? ?? '',
        operator: j['operator'] as String? ?? '',
      );

  final String slug;
  final String title;
  final String destinationName;
  final String category;
  final String summary;
  final int durationDays;
  final double priceUsd;
  final double? originalPriceUsd;
  final double rating;
  final int reviewCount;
  final List<String> images;
  final int maxGroupSize;
  final bool freeCancellation;
  final bool instantConfirmation;
  final List<String> startTimes;
  final String meetingPoint;
  final String operator;
}

class ItineraryDay {
  ItineraryDay(this.day, this.title, this.description);
  final int day;
  final String title;
  final String description;
}

class TourDetail {
  TourDetail(this.summary, this.highlights, this.itinerary, this.included);

  factory TourDetail.fromJson(Map<String, dynamic> j) => TourDetail(
        TourSummary.fromJson(j),
        (j['highlights'] as List).cast<String>(),
        (j['itinerary'] as List)
            .map((d) => ItineraryDay(d['day'] as int, d['title'] as String, d['description'] as String))
            .toList(),
        (j['included'] as List).cast<String>(),
      );

  final TourSummary summary;
  final List<String> highlights;
  final List<ItineraryDay> itinerary;
  final List<String> included;
}

class Slot {
  Slot(this.time, this.capacity, this.remaining);
  factory Slot.fromJson(Map<String, dynamic> j) =>
      Slot(j['time'] as String, j['capacity'] as int, j['remaining'] as int);
  final String time;
  final int capacity;
  final int remaining;
}

class Booking {
  Booking({
    required this.code,
    required this.tourTitle,
    required this.date,
    required this.time,
    required this.adults,
    required this.children,
    required this.fullName,
    required this.totalUsd,
    required this.status,
  });

  factory Booking.fromJson(Map<String, dynamic> j) => Booking(
        code: j['code'] as String,
        tourTitle: j['tourTitle'] as String,
        date: j['date'] as String,
        time: j['time'] as String,
        adults: j['adults'] as int,
        children: j['children'] as int,
        fullName: j['fullName'] as String,
        totalUsd: (j['totalUsd'] as num).toDouble(),
        status: j['status'] as String,
      );

  final String code;
  final String tourTitle;
  final String date;
  final String time;
  final int adults;
  final int children;
  final String fullName;
  final double totalUsd;
  final String status;
}

class ApiException implements Exception {
  ApiException(this.message, [this.errors = const {}]);
  final String message;
  final Map<String, String> errors;
  @override
  String toString() => errors.isNotEmpty ? errors.values.first : message;
}
