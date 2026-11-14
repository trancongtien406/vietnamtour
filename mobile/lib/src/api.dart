import 'dart:convert';

import 'package:http/http.dart' as http;

import 'models.dart';

/// API origin. Override with --dart-define=API_BASE_URL=http://10.0.2.2:4000 on Android emulators.
const apiBase = String.fromEnvironment('API_BASE_URL', defaultValue: 'http://localhost:4000');

/// Tour photos are served by the Next.js site (web/public/images).
const imageBase = String.fromEnvironment('IMAGE_BASE_URL', defaultValue: 'http://localhost:3100');

String imageUrl(String path) => path.startsWith('http') ? path : '$imageBase$path';

class VietnamtourApi {
  VietnamtourApi({http.Client? client}) : _client = client ?? http.Client();
  final http.Client _client;

  Future<dynamic> _send(String method, String path, [Map<String, dynamic>? body]) async {
    final uri = Uri.parse('$apiBase/api$path');
    final headers = {'content-type': 'application/json'};
    final res = method == 'GET' ? await _client.get(uri, headers: headers) : await _client.post(uri, headers: headers, body: jsonEncode(body ?? {}));
    final data = res.body.isEmpty ? null : jsonDecode(utf8.decode(res.bodyBytes));
    if (res.statusCode >= 400) {
      final map = data is Map<String, dynamic> ? data : <String, dynamic>{};
      throw ApiException(
        map['message']?.toString() ?? 'Request failed (${res.statusCode})',
        (map['errors'] as Map?)?.map((k, v) => MapEntry(k.toString(), v.toString())) ?? {},
      );
    }
    return data;
  }

  Future<List<TourSummary>> tours({String? category, String? q, String? region, String? sort}) async {
    final params = <String, String>{'category': ?category, 'region': ?region, 'sort': ?sort, if (q != null && q.isNotEmpty) 'q': q};
    final qs = params.isEmpty ? '' : '?${Uri(queryParameters: params).query}';
    final data = await _send('GET', '/tours$qs') as Map<String, dynamic>;
    return (data['items'] as List).map((j) => TourSummary.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<List<Destination>> destinations() async =>
      (await _send('GET', '/destinations') as List).map((j) => Destination.fromJson(j as Map<String, dynamic>)).toList();

  Future<TourDetail> tour(String slug) async => TourDetail.fromJson(await _send('GET', '/tours/$slug') as Map<String, dynamic>);

  Future<List<Slot>> availability(String slug, String date) async {
    final data = await _send('GET', '/tours/$slug/availability?date=$date') as Map<String, dynamic>;
    return (data['slots'] as List).map((j) => Slot.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<Booking> book(Map<String, dynamic> body) async => Booking.fromJson(await _send('POST', '/bookings', body) as Map<String, dynamic>);

  Future<Booking> pay(String code, String card) async =>
      Booking.fromJson(await _send('POST', '/bookings/$code/pay', {'cardNumber': card, 'expiry': '12/30', 'cvc': '123'}) as Map<String, dynamic>);

  Future<Booking> booking(String code) async => Booking.fromJson(await _send('GET', '/bookings/${Uri.encodeComponent(code)}') as Map<String, dynamic>);

  Future<List<Booking>> myTrips(String email) async {
    final data = await _send('GET', '/bookings?email=${Uri.encodeQueryComponent(email)}') as List;
    return data.map((j) => Booking.fromJson(j as Map<String, dynamic>)).toList();
  }
}
