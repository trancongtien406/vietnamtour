import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../main.dart' show jade, lotus, ink, sand;
import 'api.dart';
import 'models.dart';

const categories = {
  null: 'All',
  'cruise': 'Cruises',
  'food': 'Food',
  'adventure': 'Adventure',
  'culture': 'Culture',
  'nature': 'Nature',
  'beach': 'Beach',
};

String money(double v) => v == v.roundToDouble() ? '\$${v.toStringAsFixed(0)}' : '\$${v.toStringAsFixed(2)}';
TextStyle display(double size) => TextStyle(fontSize: size, fontWeight: FontWeight.w800, color: ink, height: 1.2, letterSpacing: -0.3);

class HomeShell extends StatefulWidget {
  const HomeShell({super.key, required this.api});
  final VietnamtourApi api;
  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int tab = 0;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: tab, children: [ExploreScreen(api: widget.api), TripsScreen(api: widget.api)]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: tab,
        onDestinationSelected: (i) => setState(() => tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.explore_outlined), selectedIcon: Icon(Icons.explore), label: 'Explore'),
          NavigationDestination(icon: Icon(Icons.confirmation_number_outlined), selectedIcon: Icon(Icons.confirmation_number), label: 'My trips'),
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
  String query = '';
  late Future<List<TourSummary>> tours = widget.api.tours();

  void reload() => setState(() => tours = widget.api.tours(category: category, q: query));

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () async => reload(),
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(color: lotus, borderRadius: BorderRadius.circular(10)),
                      child: const Icon(Icons.spa, color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 8),
                    Text('Vietnamtour', style: display(20)),
                  ]),
                  const SizedBox(height: 18),
                  Text('Xin chào! Where to next?', style: display(28)),
                  const SizedBox(height: 14),
                  TextField(
                    onSubmitted: (v) {
                      query = v;
                      reload();
                    },
                    decoration: InputDecoration(
                      hintText: 'Search Hạ Long, food, caves…',
                      prefixIcon: const Icon(Icons.search),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(28), borderSide: const BorderSide(color: Color(0xFFE9E3D7))),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(28), borderSide: const BorderSide(color: Color(0xFFE9E3D7))),
                    ),
                  ),
                ]),
              ),
            ),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 52,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  children: [
                    for (final e in categories.entries)
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(e.value),
                          selected: category == e.key,
                          selectedColor: jade,
                          labelStyle: TextStyle(color: category == e.key ? Colors.white : ink, fontWeight: FontWeight.w600),
                          showCheckmark: false,
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
                    child: Center(child: Padding(padding: const EdgeInsets.all(24), child: Text('Could not reach the API.\n${snap.error}', textAlign: TextAlign.center))),
                  );
                }
                if (!snap.hasData) return const SliverFillRemaining(child: Center(child: CircularProgressIndicator()));
                final items = snap.data!;
                if (items.isEmpty) return const SliverFillRemaining(child: Center(child: Text('No experiences found')));
                return SliverPadding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                  sliver: SliverList.separated(
                    itemCount: items.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 16),
                    itemBuilder: (_, i) => TourTile(tour: items[i], api: widget.api),
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

class TourTile extends StatelessWidget {
  const TourTile({super.key, required this.tour, required this.api});
  final TourSummary tour;
  final VietnamtourApi api;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(20),
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => TourScreen(slug: tour.slug, api: api, preview: tour))),
      child: Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFE9E3D7))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Stack(children: [
            AspectRatio(aspectRatio: 16 / 10, child: Image.network(imageUrl(tour.images.first), fit: BoxFit.cover)),
            Positioned(
              left: 12,
              top: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
                child: Text(categories[tour.category] ?? tour.category, style: const TextStyle(color: jade, fontWeight: FontWeight.w700, fontSize: 12)),
              ),
            ),
          ]),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(tour.destinationName.toUpperCase(), style: TextStyle(fontSize: 11, letterSpacing: .8, fontWeight: FontWeight.w700, color: ink.withValues(alpha: .5))),
              const SizedBox(height: 4),
              Text(tour.title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16, height: 1.3)),
              const SizedBox(height: 10),
              Row(children: [
                const Icon(Icons.star_rounded, color: Colors.amber, size: 18),
                Text(' ${tour.rating.toStringAsFixed(1)}', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(' (${tour.reviewCount})', style: TextStyle(color: ink.withValues(alpha: .55))),
                const SizedBox(width: 10),
                Icon(Icons.schedule, size: 16, color: ink.withValues(alpha: .6)),
                Text(' ${tour.durationDays} day${tour.durationDays > 1 ? 's' : ''}', style: TextStyle(color: ink.withValues(alpha: .7))),
                const Spacer(),
                Text('from ', style: TextStyle(fontSize: 12, color: ink.withValues(alpha: .55))),
                Text(money(tour.priceUsd), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
              ]),
            ]),
          ),
        ]),
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

  @override
  Widget build(BuildContext context) {
    final t = widget.preview;
    return Scaffold(
      body: FutureBuilder<TourDetail>(
        future: detail,
        builder: (context, snap) {
          final d = snap.data;
          return CustomScrollView(slivers: [
            SliverAppBar(
              expandedHeight: 280,
              pinned: true,
              backgroundColor: jade,
              foregroundColor: Colors.white,
              flexibleSpace: FlexibleSpaceBar(background: Image.network(imageUrl(t.images.first), fit: BoxFit.cover)),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
              sliver: SliverList.list(children: [
                Text(t.destinationName.toUpperCase(), style: const TextStyle(color: lotus, fontWeight: FontWeight.w700, letterSpacing: 1, fontSize: 12)),
                const SizedBox(height: 6),
                Text(t.title, style: display(26)),
                const SizedBox(height: 10),
                Wrap(spacing: 14, runSpacing: 6, children: [
                  _Meta(Icons.star_rounded, '${t.rating} (${t.reviewCount})', Colors.amber),
                  _Meta(Icons.schedule, '${t.durationDays} day${t.durationDays > 1 ? 's' : ''}', jade),
                  _Meta(Icons.group_outlined, 'Max ${t.maxGroupSize}', jade),
                  if (t.instantConfirmation) const _Meta(Icons.bolt, 'Instant confirmation', jade),
                ]),
                const SizedBox(height: 16),
                Text(t.summary, style: TextStyle(fontSize: 15, height: 1.55, color: ink.withValues(alpha: .8))),
                if (d == null) const Padding(padding: EdgeInsets.all(32), child: Center(child: CircularProgressIndicator())),
                if (d != null) ...[
                  const SizedBox(height: 20),
                  for (final h in d.highlights)
                    Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: sand, borderRadius: BorderRadius.circular(14)),
                      child: Row(children: [const Icon(Icons.check_circle, color: jade, size: 20), const SizedBox(width: 10), Expanded(child: Text(h))]),
                    ),
                  const SizedBox(height: 16),
                  Text('Itinerary', style: display(22)),
                  const SizedBox(height: 10),
                  for (final day in d.itinerary)
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: CircleAvatar(backgroundColor: jade, foregroundColor: Colors.white, child: Text('${day.day}')),
                      title: Text(day.title, style: const TextStyle(fontWeight: FontWeight.w700)),
                      subtitle: Text(day.description),
                    ),
                  const SizedBox(height: 8),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.place_outlined, color: lotus),
                    title: const Text('Meeting point', style: TextStyle(fontWeight: FontWeight.w700)),
                    subtitle: Text('${t.meetingPoint}\nOperated by ${t.operator}'),
                  ),
                ],
              ]),
            ),
          ]);
        },
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
        decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: Color(0xFFE9E3D7)))),
        child: Row(children: [
          Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('from', style: TextStyle(color: ink.withValues(alpha: .6), fontSize: 12)),
            Text(money(t.priceUsd), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 22)),
          ]),
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
        ]),
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
  Widget build(BuildContext context) =>
      Row(mainAxisSize: MainAxisSize.min, children: [Icon(icon, size: 18, color: color), const SizedBox(width: 4), Text(text, style: const TextStyle(fontWeight: FontWeight.w600))]);
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
    setState(() {
      slots = s;
      time = s.where((x) => x.remaining >= adults).map((x) => x.time).firstOrNull;
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
    const wd = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 0, 20, MediaQuery.of(context).viewInsets.bottom + 20),
      child: SingleChildScrollView(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
          Text('Choose your departure', style: display(22)),
          const SizedBox(height: 14),
          SizedBox(
            height: 70,
            child: ListView(scrollDirection: Axis.horizontal, children: [
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
                      border: Border.all(color: d == day ? jade : const Color(0xFFE9E3D7)),
                    ),
                    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                      Text(wd[d.weekday - 1], style: TextStyle(fontSize: 12, color: d == day ? Colors.white70 : ink.withValues(alpha: .55))),
                      Text('${d.day}', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: d == day ? Colors.white : ink)),
                    ]),
                  ),
                ),
            ]),
          ),
          const SizedBox(height: 14),
          if (slots == null) const LinearProgressIndicator(),
          if (slots != null)
            Wrap(spacing: 8, children: [
              for (final s in slots!)
                ChoiceChip(
                  label: Text('${s.time} · ${s.remaining == 0 ? 'sold out' : '${s.remaining} left'}'),
                  selected: time == s.time,
                  onSelected: s.remaining < adults ? null : (_) => setState(() => time = s.time),
                ),
            ]),
          const SizedBox(height: 12),
          Row(children: [
            const Text('Adults', style: TextStyle(fontWeight: FontWeight.w700)),
            const Spacer(),
            IconButton.outlined(onPressed: adults > 1 ? () => setState(() => adults--) : null, icon: const Icon(Icons.remove)),
            Padding(padding: const EdgeInsets.symmetric(horizontal: 12), child: Text('$adults', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700))),
            IconButton.outlined(onPressed: adults < widget.tour.maxGroupSize ? () => setState(() => adults++) : null, icon: const Icon(Icons.add)),
          ]),
          const SizedBox(height: 8),
          TextField(controller: name, decoration: const InputDecoration(labelText: 'Full name')),
          TextField(controller: email, decoration: const InputDecoration(labelText: 'Email'), keyboardType: TextInputType.emailAddress),
          TextField(controller: phone, decoration: const InputDecoration(labelText: 'Phone'), keyboardType: TextInputType.phone),
          if (error != null) Padding(padding: const EdgeInsets.only(top: 10), child: Text(error!, style: const TextStyle(color: Colors.red))),
          const SizedBox(height: 16),
          Text('Sandbox payment with test card 4242 · no real charge', style: TextStyle(fontSize: 12, color: ink.withValues(alpha: .6))),
          const SizedBox(height: 8),
          FilledButton(
            onPressed: busy || time == null ? null : book,
            child: Text(busy ? 'Booking…' : 'Book & pay ${money(widget.tour.priceUsd * adults)}'),
          ),
        ]),
      ),
    );
  }
}

class VoucherScreen extends StatelessWidget {
  const VoucherScreen({super.key, required this.booking});
  final Booking booking;

  @override
  Widget build(BuildContext context) {
    final b = booking;
    final ok = b.status == 'confirmed' || b.status == 'checked_in';
    return Scaffold(
      appBar: AppBar(title: const Text('Your voucher')),
      body: ListView(padding: const EdgeInsets.all(20), children: [
        Container(
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFE9E3D7))),
          child: Column(children: [
            Container(
              width: double.infinity,
              color: jade,
              padding: const EdgeInsets.all(18),
              child: Row(children: [
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('BOOKING REFERENCE', style: TextStyle(color: Colors.white70, fontSize: 11, letterSpacing: 1)),
                  Text(b.code, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800)),
                ]),
                const Spacer(),
                Chip(label: Text(ok ? 'Confirmed' : 'Awaiting confirmation')),
              ]),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(children: [
                Text(b.tourTitle, style: display(20), textAlign: TextAlign.center),
                const SizedBox(height: 8),
                Text('${b.date} · ${b.time} · ${b.adults + b.children} guests', style: TextStyle(color: ink.withValues(alpha: .7))),
                const SizedBox(height: 20),
                if (ok) QrImageView(data: 'VIETNAMTOUR|${b.code}', size: 200),
                if (!ok) const Text('The operator will confirm within 24 hours.'),
                const SizedBox(height: 12),
                Text('Lead traveller ${b.fullName} · Paid ${money(b.totalUsd)}', style: TextStyle(color: ink.withValues(alpha: .6))),
              ]),
            ),
          ]),
        ),
      ]),
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
  late Future<List<Booking>>? trips = widget.api.myTrips(email.text);

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(padding: const EdgeInsets.all(20), children: [
        Text('My trips', style: display(28)),
        const SizedBox(height: 12),
        TextField(
          controller: email,
          decoration: InputDecoration(
            labelText: 'Email used for booking',
            suffixIcon: IconButton(icon: const Icon(Icons.search), onPressed: () => setState(() => trips = widget.api.myTrips(email.text))),
          ),
          onSubmitted: (v) => setState(() => trips = widget.api.myTrips(v)),
        ),
        const SizedBox(height: 16),
        if (trips != null)
          FutureBuilder<List<Booking>>(
            future: trips,
            builder: (context, snap) {
              if (snap.hasError) return Text('${snap.error}');
              if (!snap.hasData) return const Center(child: CircularProgressIndicator());
              if (snap.data!.isEmpty) return const Text('No bookings for this email yet.');
              return Column(children: [
                for (final b in snap.data!)
                  Card(
                    elevation: 0,
                    color: sand,
                    child: ListTile(
                      title: Text(b.tourTitle, style: const TextStyle(fontWeight: FontWeight.w700)),
                      subtitle: Text('${b.date} · ${b.time} · ${b.code}'),
                      trailing: Text(b.status.replaceAll('_', ' ')),
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => VoucherScreen(booking: b))),
                    ),
                  ),
              ]);
            },
          ),
      ]),
    );
  }
}
