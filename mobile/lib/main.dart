import 'package:flutter/material.dart';

import 'src/api.dart';
import 'src/screens.dart';

void main() => runApp(VietnamtourApp(api: VietnamtourApi()));

/// Web deep links: `/?tab=saved|trips`, `/?tour=slug`, `/?voucher=CODE`.
Widget homeFromUri(VietnamtourApi api, Uri uri) {
  final q = uri.queryParameters;
  final tab = switch (q['tab']) {
    'saved' => 1,
    'trips' => 2,
    _ => 0,
  };
  return HomeShell(api: api, initialTab: tab, openTour: q['tour'], openVoucher: q['voucher']);
}

const jade = Color(0xFF0D5C4B);
const lotus = Color(0xFFE2713A);
const ink = Color(0xFF12211D);
const sand = Color(0xFFF6F1E8);

class VietnamtourApp extends StatelessWidget {
  const VietnamtourApp({super.key, required this.api});
  final VietnamtourApi api;

  @override
  Widget build(BuildContext context) {
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: jade, primary: jade, secondary: lotus, surface: const Color(0xFFFFFDF9)),
      scaffoldBackgroundColor: const Color(0xFFFFFDF9),
    );
    return MaterialApp(
      title: 'Vietnamtour',
      debugShowCheckedModeBanner: false,
      theme: base.copyWith(
        textTheme: base.textTheme.apply(bodyColor: ink, displayColor: ink),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            backgroundColor: lotus,
            foregroundColor: Colors.white,
            minimumSize: const Size.fromHeight(52),
            textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
            shape: const StadiumBorder(),
          ),
        ),
      ),
      home: homeFromUri(api, Uri.base),
    );
  }
}
