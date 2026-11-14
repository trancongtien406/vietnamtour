import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Wishlist of tour slugs kept on the device (localStorage on web).
class SavedTours extends ValueNotifier<Set<String>> {
  SavedTours() : super({}) {
    _load();
  }

  static const _key = 'saved_tours';

  Future<void> _load() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      value = (prefs.getStringList(_key) ?? const []).toSet();
    } catch (_) {
      // Storage unavailable (e.g. tests): keep an in-memory list.
    }
  }

  bool contains(String slug) => value.contains(slug);

  Future<void> toggle(String slug) async {
    final next = {...value};
    if (!next.remove(slug)) next.add(slug);
    value = next;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList(_key, next.toList());
    } catch (_) {}
  }
}

final savedTours = SavedTours();
