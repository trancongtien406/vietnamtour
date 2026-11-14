import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../main.dart' show jade, lotus, ink, sand;
import 'api.dart';
import 'models.dart';
import 'saved.dart';

const categories = {null: 'All', 'cruise': 'Cruises', 'food': 'Food', 'adventure': 'Adventure', 'culture': 'Culture', 'nature': 'Nature', 'beach': 'Beach'};

const regions = {null: 'All Vietnam', 'north': 'Northern Vietnam', 'central': 'Central Vietnam', 'south': 'Southern Vietnam'};

const line = Color(0xFFE9E3D7);
const _months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const _weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

String money(double v) => v == v.roundToDouble() ? '\$${v.toStringAsFixed(0)}' : '\$${v.toStringAsFixed(2)}';
TextStyle display(double size) => TextStyle(fontSize: size, fontWeight: FontWeight.w800, color: ink, height: 1.2, letterSpacing: -0.3);
TextStyle muted([double size = 14]) => TextStyle(fontSize: size, color: ink.withValues(alpha: .6));

/// "2026-11-26" -> "Thu, 26 Nov".
String niceDate(String iso) {
  final d = DateTime.tryParse(iso);
  if (d == null) return iso;
  return '${_weekdays[d.weekday - 1]}, ${d.day} ${_months[d.month - 1]}';
}

String niceStamp(String? iso) {
  final d = DateTime.tryParse(iso ?? '')?.toUtc().add(const Duration(hours: 7));
  if (d == null) return 'Pending';
  return '${d.day} ${_months[d.month - 1]}, ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
}

const statusLabel = {
  'pending_payment': 'Awaiting payment',
  'awaiting_supplier': 'Awaiting operator',
  'confirmed': 'Confirmed',
  'checked_in': 'Completed',
  'cancelled': 'Cancelled',
};

(Color, Color) statusColors(String s) => switch (s) {
  'confirmed' => (const Color(0xFFE3F5EC), const Color(0xFF0B6B45)),
  'checked_in' => (const Color(0xFFEDEBE6), const Color(0xFF4A4F4C)),
  'cancelled' => (const Color(0xFFFDE8E8), const Color(0xFFB42318)),
  'awaiting_supplier' => (const Color(0xFFE6F1FB), const Color(0xFF1D5F99)),
  _ => (const Color(0xFFFFF4DB), const Color(0xFF8A5A00)),
};

class StatusChip extends StatelessWidget {
  const StatusChip(this.status, {super.key});
  final String status;
  @override
  Widget build(BuildContext context) {
    final (bg, fg) = statusColors(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)),
      child: Text(
        statusLabel[status] ?? status,
        style: TextStyle(color: fg, fontWeight: FontWeight.w700, fontSize: 12),
      ),
    );
  }
}

class HomeShell extends StatefulWidget {
  const HomeShell({super.key, required this.api, this.initialTab = 0, this.openTour, this.openVoucher});
  final VietnamtourApi api;
  final int initialTab;

  /// Deep links (e.g. /?tour=slug or /?voucher=VT-123ABC on web).
  final String? openTour;
  final String? openVoucher;
  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  late int tab = widget.initialTab;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final nav = Navigator.of(context);
      if (widget.openTour != null) {
        final d = await widget.api.tour(widget.openTour!);
        nav.push(
          MaterialPageRoute(
            builder: (_) => TourScreen(slug: d.summary.slug, api: widget.api, preview: d.summary),
          ),
        );
      } else if (widget.openVoucher != null) {
        final b = await widget.api.booking(widget.openVoucher!);
        nav.push(MaterialPageRoute(builder: (_) => VoucherScreen(booking: b)));
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: tab,
        children: [
          ExploreScreen(api: widget.api),
          SavedScreen(api: widget.api, onExplore: () => setState(() => tab = 0)),
          TripsScreen(api: widget.api),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        height: 68,
        selectedIndex: tab,
        backgroundColor: Colors.white,
        indicatorColor: jade.withValues(alpha: .12),
        onDestinationSelected: (i) => setState(() => tab = i),
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.explore_outlined),
            selectedIcon: Icon(Icons.explore, color: jade),
            label: 'Explore',
          ),
          NavigationDestination(
            icon: ValueListenableBuilder(
              valueListenable: savedTours,
              builder: (_, s, _) =>
                  Badge(isLabelVisible: s.isNotEmpty, label: Text('${s.length}'), backgroundColor: lotus, child: const Icon(Icons.favorite_border)),
            ),
            selectedIcon: const Icon(Icons.favorite, color: jade),
            label: 'Saved',
          ),
          const NavigationDestination(
            icon: Icon(Icons.confirmation_number_outlined),
            selectedIcon: Icon(Icons.confirmation_number, color: jade),
            label: 'My trips',
          ),
        ],
      ),
    );
  }
}

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key, required this.api});
  final VietnamtourApi api;
  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  String? category;
  String? region;
  String query = '';
  final search = TextEditingController();
  late Future<List<TourSummary>> tours = widget.api.tours(sort: 'popular');
  late final Future<List<Destination>> destinations = widget.api.destinations();

  void reload() => setState(() => tours = widget.api.tours(category: category, q: query, region: region, sort: 'popular'));

  Future<void> pickRegion() async {
    final picked = await showModalBottomSheet<MapEntry<String?, String>>(
      context: context,
      showDragHandle: true,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
              child: Text('Where are you travelling?', style: display(18)),
            ),
            for (final e in regions.entries)
              ListTile(
                leading: Icon(e.key == region ? Icons.radio_button_checked : Icons.radio_button_off, color: jade),
                title: Text(e.value, style: const TextStyle(fontWeight: FontWeight.w600)),
                onTap: () => Navigator.pop(context, e),
              ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
    if (picked == null) return;
    region = picked.key;
    reload();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () async => reload(),
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(color: lotus, borderRadius: BorderRadius.circular(8)),
                          child: const Icon(Icons.spa, color: Colors.white, size: 16),
                        ),
                        const SizedBox(width: 8),
                        Text('Vietnamtour', style: display(17)),
                        const Spacer(),
                        InkWell(
                          onTap: pickRegion,
                          borderRadius: BorderRadius.circular(20),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: line),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.location_on, color: lotus, size: 16),
                                const SizedBox(width: 4),
                                Text(regions[region]!, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                                const Icon(Icons.keyboard_arrow_down, size: 18),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text('Xin chào, Tiến 👋', style: muted(14)),
                    const SizedBox(height: 2),
                    Text('Where to next?', style: display(22)),
                    const SizedBox(height: 12),
                    TextField(
                      controller: search,
                      textInputAction: TextInputAction.search,
                      onSubmitted: (v) {
                        query = v;
                        reload();
                      },
                      decoration: InputDecoration(
                        isDense: true,
                        hintText: 'Search Hạ Long, food, caves…',
                        prefixIcon: const Icon(Icons.search, size: 22),
                        suffixIcon: query.isEmpty
                            ? const Icon(Icons.tune, color: jade, size: 20)
                            : IconButton(
                                icon: const Icon(Icons.close, size: 20),
                                onPressed: () {
                                  search.clear();
                                  query = '';
                                  reload();
                                },
                              ),
                        filled: true,
                        fillColor: Colors.white,
                        contentPadding: const EdgeInsets.symmetric(vertical: 14),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: line),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: line),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (query.isEmpty && region == null && category == null)
              SliverToBoxAdapter(
                child: FutureBuilder<List<Destination>>(
                  future: destinations,
                  builder: (context, snap) {
                    final list = snap.data ?? const <Destination>[];
                    if (list.isEmpty) return const SizedBox(height: 8);
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(20, 16, 20, 10),
                          child: Text('Popular destinations', style: display(17)),
                        ),
                        SizedBox(
                          height: 112,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            itemCount: list.length,
                            separatorBuilder: (_, _) => const SizedBox(width: 10),
                            itemBuilder: (_, i) => GestureDetector(
                              onTap: () {
                                search.text = list[i].name;
                                query = list[i].name;
                                reload();
                              },
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(16),
                                child: SizedBox(
                                  width: 96,
                                  child: Stack(
                                    fit: StackFit.expand,
                                    children: [
                                      Image.network(imageUrl(list[i].image), fit: BoxFit.cover),
                                      const DecoratedBox(
                                        decoration: BoxDecoration(
                                          gradient: LinearGradient(
                                            begin: Alignment.topCenter,
                                            end: Alignment.bottomCenter,
                                            colors: [Colors.transparent, Color(0xCC12211D)],
                                          ),
                                        ),
                                      ),
                                      Positioned(
                                        left: 8,
                                        right: 8,
                                        bottom: 8,
                                        child: Text(
                                          list[i].name,
                                          maxLines: 2,
                                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12, height: 1.2),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 56,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
                  children: [
                    for (final e in categories.entries)
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(e.value),
                          selected: category == e.key,
                          selectedColor: jade,
                          backgroundColor: Colors.white,
                          side: BorderSide(color: category == e.key ? jade : line),
                          shape: const StadiumBorder(),
                          labelStyle: TextStyle(color: category == e.key ? Colors.white : ink, fontWeight: FontWeight.w600, fontSize: 13),
                          showCheckmark: false,
                          visualDensity: VisualDensity.compact,
                          onSelected: (_) {
                            category = e.key;
                            reload();
                          },
                        ),
                      ),
                  ],
                ),
              ),
            ),
            FutureBuilder<List<TourSummary>>(
              future: tours,
              builder: (context, snap) {
                if (snap.hasError) {
                  return SliverFillRemaining(
                    child: Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Text('Could not reach the API.\n${snap.error}', textAlign: TextAlign.center),
                      ),
                    ),
                  );
                }
                if (!snap.hasData) return const SliverFillRemaining(child: Center(child: CircularProgressIndicator()));
                final items = snap.data!;
                return SliverPadding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                  sliver: SliverList.list(
                    children: [
                      Row(
                        children: [
                          Text(query.isNotEmpty ? 'Results for “$query”' : 'Top experiences', style: display(17)),
                          const Spacer(),
                          Text('${items.length} found', style: muted(13)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (items.isEmpty)
                        Padding(
                          padding: const EdgeInsets.all(32),
                          child: Center(child: Text('No experiences match. Try another search.', style: muted())),
                        ),
                      for (final t in items)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: TourTile(tour: t, api: widget.api),
                        ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class SaveHeart extends StatelessWidget {
  const SaveHeart({super.key, required this.slug, this.size = 20});
  final String slug;
  final double size;
  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder(
      valueListenable: savedTours,
      builder: (_, s, _) {
        final on = s.contains(slug);
        return Material(
          color: Colors.white,
          shape: const CircleBorder(),
          elevation: 1,
          child: InkWell(
            customBorder: const CircleBorder(),
            onTap: () => savedTours.toggle(slug),
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Icon(
                on ? Icons.favorite : Icons.favorite_border,
                size: size,
                color: on ? lotus : ink,
                semanticLabel: on ? 'Remove from saved' : 'Save tour',
              ),
            ),
          ),
        );
      },
    );
  }
}

class TourTile extends StatelessWidget {
  const TourTile({super.key, required this.tour, required this.api});
  final TourSummary tour;
  final VietnamtourApi api;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(20),
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => TourScreen(slug: tour.slug, api: api, preview: tour),
        ),
      ),
      child: Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: line),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 16 / 9,
                  child: Image.network(imageUrl(tour.images.first), fit: BoxFit.cover),
                ),
                Positioned(
                  left: 12,
                  top: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
                    child: Text(
                      categories[tour.category] ?? tour.category,
                      style: const TextStyle(color: jade, fontWeight: FontWeight.w700, fontSize: 12),
                    ),
                  ),
                ),
                Positioned(right: 10, top: 10, child: SaveHeart(slug: tour.slug, size: 18)),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    tour.destinationName.toUpperCase(),
                    style: TextStyle(fontSize: 11, letterSpacing: .8, fontWeight: FontWeight.w700, color: ink.withValues(alpha: .5)),
                  ),
                  const SizedBox(height: 4),
                  Text(tour.title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16, height: 1.3)),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 10,
                    children: [
                      if (tour.freeCancellation)
                        const Text(
                          'Free cancellation',
                          style: TextStyle(color: jade, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      if (tour.instantConfirmation)
                        const Text(
                          '⚡ Instant',
                          style: TextStyle(color: jade, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.star_rounded, color: Colors.amber, size: 18),
                      Text(' ${tour.rating.toStringAsFixed(1)}', style: const TextStyle(fontWeight: FontWeight.w700)),
                      Text(' (${tour.reviewCount})', style: muted()),
                      const SizedBox(width: 10),
                      Icon(Icons.schedule, size: 16, color: ink.withValues(alpha: .6)),
                      Text(' ${tour.durationDays} day${tour.durationDays > 1 ? 's' : ''}', style: TextStyle(color: ink.withValues(alpha: .7))),
                      const Spacer(),
                      Text('from ', style: muted(12)),
                      Text(money(tour.priceUsd), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SavedScreen extends StatefulWidget {
  const SavedScreen({super.key, required this.api, required this.onExplore});
  final VietnamtourApi api;
  final VoidCallback onExplore;
  @override
  State<SavedScreen> createState() => _SavedScreenState();
}

class _SavedScreenState extends State<SavedScreen> {
  late final Future<List<TourSummary>> all = widget.api.tours();

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ValueListenableBuilder(
        valueListenable: savedTours,
        builder: (context, saved, _) => FutureBuilder<List<TourSummary>>(
          future: all,
          builder: (context, snap) {
            final items = (snap.data ?? const <TourSummary>[]).where((t) => saved.contains(t.slug)).toList();
            return ListView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                Text('Saved', style: display(24)),
                const SizedBox(height: 4),
                Text(items.isEmpty ? 'Tap the heart on any experience to keep it here.' : '${items.length} experiences saved on this device', style: muted()),
                const SizedBox(height: 16),
                if (!snap.hasData) const Center(child: CircularProgressIndicator()),
                if (snap.hasData && items.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(28),
                    decoration: BoxDecoration(color: sand, borderRadius: BorderRadius.circular(20)),
                    child: Column(
                      children: [
                        const Icon(Icons.favorite_border, size: 40, color: lotus),
                        const SizedBox(height: 12),
                        Text('No saved experiences yet', style: display(17)),
                        const SizedBox(height: 16),
                        OutlinedButton(onPressed: widget.onExplore, child: const Text('Explore experiences')),
                      ],
                    ),
                  ),
                for (final t in items)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(18),
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => TourScreen(slug: t.slug, api: widget.api, preview: t),
                        ),
                      ),
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: line),
                        ),
                        child: Row(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(imageUrl(t.images.first), width: 92, height: 92, fit: BoxFit.cover),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    t.destinationName.toUpperCase(),
                                    style: TextStyle(fontSize: 10, letterSpacing: .8, fontWeight: FontWeight.w700, color: ink.withValues(alpha: .5)),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    t.title,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontWeight: FontWeight.w700, height: 1.25),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      const Icon(Icons.star_rounded, color: Colors.amber, size: 16),
                                      Text(' ${t.rating.toStringAsFixed(1)}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                                      Text(' · ${t.durationDays}d', style: muted(13)),
                                      const Spacer(),
                                      Text(money(t.priceUsd), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              onPressed: () => savedTours.toggle(t.slug),
                              icon: const Icon(Icons.favorite, color: lotus),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class TourScreen extends StatefulWidget {
  const TourScreen({super.key, required this.slug, required this.api, required this.preview});
  final String slug;
  final VietnamtourApi api;
  final TourSummary preview;
  @override
  State<TourScreen> createState() => _TourScreenState();
}

class _TourScreenState extends State<TourScreen> {
  late final Future<TourDetail> detail = widget.api.tour(widget.slug);
  int photo = 0;

  Widget section(String title, List<Widget> children) => Padding(
    padding: const EdgeInsets.only(top: 24),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: display(19)),
        const SizedBox(height: 10),
        ...children,
      ],
    ),
  );

  @override
  Widget build(BuildContext context) {
    final t = widget.preview;
    return Scaffold(
      body: FutureBuilder<TourDetail>(
        future: detail,
        builder: (context, snap) {
          final d = snap.data;
          final images = d?.summary.images ?? t.images;
          return CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 260,
                pinned: true,
                backgroundColor: jade,
                foregroundColor: Colors.white,
                leading: Padding(
                  padding: const EdgeInsets.all(8),
                  child: CircleAvatar(
                    backgroundColor: Colors.white,
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back, color: ink, size: 20),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),
                ),
                actions: [
                  Padding(
                    padding: const EdgeInsets.only(right: 12),
                    child: SaveHeart(slug: t.slug),
                  ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      PageView(
                        onPageChanged: (i) => setState(() => photo = i),
                        children: [for (final img in images) Image.network(imageUrl(img), fit: BoxFit.cover)],
                      ),
                      Positioned(
                        right: 14,
                        bottom: 14,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(20)),
                          child: Text(
                            '${photo + 1} / ${images.length}',
                            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 120),
                sliver: SliverList.list(
                  children: [
                    Text(
                      '${t.destinationName.toUpperCase()} · ${(categories[t.category] ?? t.category).toUpperCase()}',
                      style: const TextStyle(color: lotus, fontWeight: FontWeight.w700, letterSpacing: 1, fontSize: 11),
                    ),
                    const SizedBox(height: 6),
                    Text(t.title, style: display(24)),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 14,
                      runSpacing: 6,
                      children: [
                        _Meta(Icons.star_rounded, '${t.rating} (${t.reviewCount})', Colors.amber),
                        _Meta(Icons.schedule, '${t.durationDays} day${t.durationDays > 1 ? 's' : ''}', jade),
                        _Meta(Icons.group_outlined, 'Max ${t.maxGroupSize}', jade),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(color: sand, borderRadius: BorderRadius.circular(16)),
                      child: Column(
                        children: [
                          if (t.freeCancellation) const _Perk(Icons.event_available, 'Free cancellation', 'Full refund up to 24 hours before'),
                          if (t.instantConfirmation) const _Perk(Icons.bolt, 'Instant confirmation', 'Mobile voucher with QR code'),
                          if (!t.instantConfirmation) const _Perk(Icons.hourglass_top, 'Confirmed by operator', 'Usually within 24 hours'),
                          if (d != null && d.languages.isNotEmpty) _Perk(Icons.translate, 'Live guide', d.languages.join(' · ')),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(t.summary, style: TextStyle(fontSize: 15, height: 1.55, color: ink.withValues(alpha: .8))),
                    if (d == null)
                      const Padding(
                        padding: EdgeInsets.all(32),
                        child: Center(child: CircularProgressIndicator()),
                      ),
                    if (d != null) ...[
                      section('Highlights', [
                        for (final h in d.highlights)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.check_circle, color: jade, size: 20),
                                const SizedBox(width: 10),
                                Expanded(child: Text(h, style: const TextStyle(height: 1.4))),
                              ],
                            ),
                          ),
                      ]),
                      section('Itinerary', [
                        for (final (i, day) in d.itinerary.indexed)
                          IntrinsicHeight(
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Column(
                                  children: [
                                    CircleAvatar(
                                      radius: 14,
                                      backgroundColor: jade,
                                      foregroundColor: Colors.white,
                                      child: Text('${day.day}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                                    ),
                                    if (i < d.itinerary.length - 1) Expanded(child: Container(width: 2, color: line)),
                                  ],
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Padding(
                                    padding: const EdgeInsets.only(bottom: 16, top: 4),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(day.title, style: const TextStyle(fontWeight: FontWeight.w700)),
                                        const SizedBox(height: 4),
                                        Text(day.description, style: muted(13.5)),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ]),
                      section('What’s included', [
                        for (final x in d.included) _Bullet(Icons.check, x, jade),
                        for (final x in d.excluded) _Bullet(Icons.close, x, ink.withValues(alpha: .4)),
                      ]),
                      section('Meeting point', [_Perk(Icons.place_outlined, t.meetingPoint, 'Operated by ${t.operator}')]),
                      if (d.reviews.isNotEmpty)
                        section('Reviews', [
                          for (final r in d.reviews.take(3))
                            Container(
                              margin: const EdgeInsets.only(bottom: 10),
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: line),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(r.author, style: const TextStyle(fontWeight: FontWeight.w700)),
                                      Text(' · ${r.country}', style: muted(13)),
                                      const Spacer(),
                                      const Icon(Icons.star_rounded, color: Colors.amber, size: 16),
                                      Text(' ${r.rating.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w700)),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text('“${r.comment}”', style: TextStyle(height: 1.45, color: ink.withValues(alpha: .8))),
                                ],
                              ),
                            ),
                        ]),
                    ],
                  ],
                ),
              ),
            ],
          );
        },
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: line)),
        ),
        child: Row(
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('from', style: muted(12)),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(money(t.priceUsd), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 22)),
                    Text(' / adult', style: muted(12)),
                  ],
                ),
              ],
            ),
            const SizedBox(width: 16),
            Expanded(
              child: FilledButton(
                onPressed: () => showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  showDragHandle: true,
                  builder: (_) => BookingSheet(tour: t, api: widget.api),
                ),
                child: const Text('Check availability'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Meta extends StatelessWidget {
  const _Meta(this.icon, this.text, this.color);
  final IconData icon;
  final String text;
  final Color color;
  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icon, size: 18, color: color),
      const SizedBox(width: 4),
      Text(text, style: const TextStyle(fontWeight: FontWeight.w600)),
    ],
  );
}

class _Perk extends StatelessWidget {
  const _Perk(this.icon, this.title, this.subtitle);
  final IconData icon;
  final String title;
  final String subtitle;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 5),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: jade, size: 20),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
              Text(subtitle, style: muted(13)),
            ],
          ),
        ),
      ],
    ),
  );
}

class _Bullet extends StatelessWidget {
  const _Bullet(this.icon, this.text, this.color);
  final IconData icon;
  final String text;
  final Color color;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Row(
      children: [
        Icon(icon, size: 18, color: color),
        const SizedBox(width: 10),
        Expanded(child: Text(text)),
      ],
    ),
  );
}

class BookingSheet extends StatefulWidget {
  const BookingSheet({super.key, required this.tour, required this.api});
  final TourSummary tour;
  final VietnamtourApi api;
  @override
  State<BookingSheet> createState() => _BookingSheetState();
}

class _BookingSheetState extends State<BookingSheet> {
  late final List<DateTime> days = List.generate(10, (i) => DateTime.now().add(Duration(days: i + 3)));
  late DateTime day = days.first;
  List<Slot>? slots;
  String? time;
  int adults = 2;
  final name = TextEditingController(text: 'Trần Công Tiến');
  final email = TextEditingController(text: 'tien.demo@example.com');
  final phone = TextEditingController(text: '+84 905 123 456');
  bool busy = false;
  String? error;

  String iso(DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    setState(() => slots = null);
    final s = await widget.api.availability(widget.tour.slug, iso(day));
    if (!mounted) return;
    final open = s.where((x) => x.remaining >= adults).toList()..sort((a, b) => b.remaining.compareTo(a.remaining));
    setState(() {
      slots = s;
      time = open.isEmpty ? null : open.first.time;
    });
  }

  Future<void> book() async {
    setState(() {
      busy = true;
      error = null;
    });
    try {
      final b = await widget.api.book({
        'tourSlug': widget.tour.slug,
        'date': iso(day),
        'time': time,
        'adults': adults,
        'children': 0,
        'fullName': name.text,
        'email': email.text,
        'phone': phone.text,
      });
      final paid = await widget.api.pay(b.code, '4242424242424242');
      if (!mounted) return;
      Navigator.pop(context);
      Navigator.push(context, MaterialPageRoute(builder: (_) => VoucherScreen(booking: paid)));
    } on ApiException catch (e) {
      setState(() => error = e.toString());
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final total = widget.tour.priceUsd * adults;
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 0, 20, MediaQuery.of(context).viewInsets.bottom + 20),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Choose your departure', style: display(20)),
            const SizedBox(height: 4),
            Text(widget.tour.title, style: muted(13)),
            const SizedBox(height: 14),
            SizedBox(
              height: 70,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  for (final d in days)
                    GestureDetector(
                      onTap: () {
                        day = d;
                        load();
                      },
                      child: Container(
                        width: 58,
                        margin: const EdgeInsets.only(right: 8),
                        decoration: BoxDecoration(
                          color: d == day ? jade : Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: d == day ? jade : line),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(_weekdays[d.weekday - 1], style: TextStyle(fontSize: 12, color: d == day ? Colors.white70 : ink.withValues(alpha: .55))),
                            Text(
                              '${d.day}',
                              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: d == day ? Colors.white : ink),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            if (slots == null) const LinearProgressIndicator(),
            if (slots != null)
              Wrap(
                spacing: 8,
                children: [
                  for (final s in slots!)
                    ChoiceChip(
                      label: Text('${s.time} · ${s.remaining == 0 ? 'sold out' : '${s.remaining} left'}'),
                      selected: time == s.time,
                      onSelected: s.remaining < adults ? null : (_) => setState(() => time = s.time),
                    ),
                ],
              ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Text('Adults', style: TextStyle(fontWeight: FontWeight.w700)),
                const Spacer(),
                IconButton.outlined(onPressed: adults > 1 ? () => setState(() => adults--) : null, icon: const Icon(Icons.remove)),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text('$adults', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                ),
                IconButton.outlined(onPressed: adults < widget.tour.maxGroupSize ? () => setState(() => adults++) : null, icon: const Icon(Icons.add)),
              ],
            ),
            const SizedBox(height: 8),
            TextField(
              controller: name,
              decoration: const InputDecoration(labelText: 'Full name'),
            ),
            TextField(
              controller: email,
              decoration: const InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
            ),
            TextField(
              controller: phone,
              decoration: const InputDecoration(labelText: 'Phone'),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Text('$adults × ${money(widget.tour.priceUsd)}', style: muted()),
                const Spacer(),
                Text(money(total), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
              ],
            ),
            if (error != null)
              Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Text(error!, style: const TextStyle(color: Colors.red)),
              ),
            const SizedBox(height: 10),
            Text('Sandbox payment with test card 4242 · no real charge', style: muted(12)),
            const SizedBox(height: 8),
            FilledButton(onPressed: busy || time == null ? null : book, child: Text(busy ? 'Booking…' : 'Book & pay ${money(total)}')),
          ],
        ),
      ),
    );
  }
}

/// Milestones derived from the booking, mirroring the website voucher.
List<(String, String?, bool)> bookingSteps(Booking b) {
  final cancelled = b.status == 'cancelled';
  return [
    ('Booking created', b.createdAt, true),
    ('Payment successful', b.paidAt, b.paidAt != null),
    (b.status == 'awaiting_supplier' ? 'Operator confirmation' : 'Confirmed', b.confirmedAt, b.confirmedAt != null),
    ('Voucher issued', b.confirmedAt, b.confirmedAt != null && !cancelled),
    if (b.status == 'checked_in') ('Checked in', null, true),
    if (cancelled) (b.refundUsd > 0 ? 'Cancelled · refunded ${money(b.refundUsd)}' : 'Cancelled', null, true),
  ];
}

class VoucherScreen extends StatelessWidget {
  const VoucherScreen({super.key, required this.booking});
  final Booking booking;

  @override
  Widget build(BuildContext context) {
    final b = booking;
    final ok = b.status == 'confirmed' || b.status == 'checked_in';
    return Scaffold(
      appBar: AppBar(title: const Text('Your voucher'), backgroundColor: Colors.transparent),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
        children: [
          Container(
            clipBehavior: Clip.antiAlias,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: line),
            ),
            child: Column(
              children: [
                Container(
                  width: double.infinity,
                  color: jade,
                  padding: const EdgeInsets.all(18),
                  child: Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('BOOKING REFERENCE', style: TextStyle(color: Colors.white70, fontSize: 11, letterSpacing: 1)),
                          Text(
                            b.code,
                            style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800),
                          ),
                        ],
                      ),
                      const Spacer(),
                      StatusChip(b.status),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      Text(b.tourTitle, style: display(19), textAlign: TextAlign.center),
                      const SizedBox(height: 8),
                      Text('${niceDate(b.date)} · ${b.time} · ${b.adults + b.children} guests', style: muted()),
                      const SizedBox(height: 18),
                      if (ok) QrImageView(data: 'VIETNAMTOUR|${b.code}', size: 190),
                      if (!ok)
                        Text(b.status == 'cancelled' ? 'This voucher is no longer valid.' : 'The operator will confirm within 24 hours.', style: muted()),
                      const SizedBox(height: 12),
                      Text('Lead traveller ${b.fullName} · Paid ${money(b.totalUsd)}', style: muted(13)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: line),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Booking timeline', style: TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 10),
                for (final (label, at, done) in bookingSteps(b))
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 5),
                    child: Row(
                      children: [
                        Icon(done ? Icons.check_circle : Icons.radio_button_unchecked, size: 20, color: done ? jade : ink.withValues(alpha: .3)),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            label,
                            style: TextStyle(fontWeight: FontWeight.w600, color: done ? ink : ink.withValues(alpha: .5)),
                          ),
                        ),
                        Text(at != null ? niceStamp(at) : (done ? '' : 'Pending'), style: muted(12)),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class TripsScreen extends StatefulWidget {
  const TripsScreen({super.key, required this.api});
  final VietnamtourApi api;
  @override
  State<TripsScreen> createState() => _TripsScreenState();
}

class _TripsScreenState extends State<TripsScreen> {
  final email = TextEditingController(text: 'tien.demo@example.com');
  late Future<List<Booking>> trips = widget.api.myTrips(email.text);
  late final Future<Map<String, String>> images = widget.api.tours().then((l) => {for (final t in l) t.slug: t.images.first});
  int tab = 0;

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    return SafeArea(
      child: FutureBuilder<List<Booking>>(
        future: trips,
        builder: (context, snap) {
          final all = snap.data ?? const <Booking>[];
          final groups = [
            all.where((b) => b.status != 'cancelled' && !b.isPast(now)).toList(),
            all.where((b) => b.status != 'cancelled' && b.isPast(now)).toList(),
            all.where((b) => b.status == 'cancelled').toList(),
          ];
          final shown = groups[tab];
          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
            children: [
              Row(
                children: [
                  Text('My trips', style: display(24)),
                  const Spacer(),
                  IconButton(
                    tooltip: 'Find bookings by email',
                    onPressed: () => showDialog<void>(
                      context: context,
                      builder: (_) => AlertDialog(
                        title: const Text('Find my bookings'),
                        content: TextField(
                          controller: email,
                          decoration: const InputDecoration(labelText: 'Email used for booking'),
                        ),
                        actions: [
                          FilledButton(
                            style: FilledButton.styleFrom(minimumSize: const Size(120, 44)),
                            onPressed: () {
                              Navigator.pop(context);
                              setState(() => trips = widget.api.myTrips(email.text));
                            },
                            child: const Text('Search'),
                          ),
                        ],
                      ),
                    ),
                    icon: const Icon(Icons.manage_search),
                  ),
                ],
              ),
              Text(email.text, style: muted(13)),
              const SizedBox(height: 14),
              SegmentedButton<int>(
                showSelectedIcon: false,
                style: SegmentedButton.styleFrom(selectedBackgroundColor: jade, selectedForegroundColor: Colors.white),
                segments: [
                  ButtonSegment(value: 0, label: Text('Upcoming ${groups[0].length}')),
                  ButtonSegment(value: 1, label: Text('Past ${groups[1].length}')),
                  ButtonSegment(value: 2, label: Text('Cancelled ${groups[2].length}')),
                ],
                selected: {tab},
                onSelectionChanged: (s) => setState(() => tab = s.first),
              ),
              const SizedBox(height: 16),
              if (snap.hasError) Text('${snap.error}'),
              if (!snap.hasData && !snap.hasError) const Center(child: CircularProgressIndicator()),
              if (snap.hasData && shown.isEmpty)
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Center(child: Text('Nothing here yet.', style: muted())),
                ),
              FutureBuilder<Map<String, String>>(
                future: images,
                builder: (context, img) => Column(
                  children: [
                    for (final b in shown)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(18),
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => VoucherScreen(booking: b))),
                          child: Container(
                            clipBehavior: Clip.antiAlias,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: line),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (img.data?[b.tourSlug] != null)
                                  SizedBox(
                                    height: 110,
                                    width: double.infinity,
                                    child: Image.network(imageUrl(img.data![b.tourSlug]!), fit: BoxFit.cover),
                                  ),
                                Padding(
                                  padding: const EdgeInsets.all(14),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Text(b.tourTitle, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                                          ),
                                          const SizedBox(width: 8),
                                          StatusChip(b.status),
                                        ],
                                      ),
                                      const SizedBox(height: 6),
                                      Row(
                                        children: [
                                          Icon(Icons.event, size: 16, color: ink.withValues(alpha: .55)),
                                          Text(' ${niceDate(b.date)} · ${b.time}', style: muted(13)),
                                          const SizedBox(width: 10),
                                          Icon(Icons.group_outlined, size: 16, color: ink.withValues(alpha: .55)),
                                          Text(' ${b.adults + b.children}', style: muted(13)),
                                          const Spacer(),
                                          Text(money(b.totalUsd), style: const TextStyle(fontWeight: FontWeight.w800)),
                                        ],
                                      ),
                                      if (b.status == 'confirmed') ...[
                                        const SizedBox(height: 10),
                                        Row(
                                          children: [
                                            const Icon(Icons.qr_code_2, color: jade, size: 18),
                                            const SizedBox(width: 6),
                                            Text(
                                              'Show voucher · ${b.code}',
                                              style: const TextStyle(color: jade, fontWeight: FontWeight.w700, fontSize: 13),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
