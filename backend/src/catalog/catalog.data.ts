import { Destination, Tour } from './catalog.types';

const img = (file: string) => `/images/destinations/${file}`;

export const DESTINATIONS: Destination[] = [
  {
    slug: 'ha-long-bay',
    name: 'Hạ Long Bay',
    region: 'north',
    tagline: 'Emerald water and 1,600 limestone islands',
    description:
      'A UNESCO World Heritage seascape of towering karsts, hidden lagoons and floating villages, best explored by overnight cruise.',
    image: img('ha-long-bay-1.jpg'),
    bestTime: 'Mar – May, Sep – Nov',
  },
  {
    slug: 'hanoi',
    name: 'Hà Nội',
    region: 'north',
    tagline: 'A thousand years of history around Hoàn Kiếm Lake',
    description:
      'Old Quarter street food, French colonial boulevards and quiet temples make the capital the perfect start to any trip.',
    image: img('hanoi-1.jpg'),
    bestTime: 'Oct – Apr',
  },
  {
    slug: 'sa-pa',
    name: 'Sa Pa',
    region: 'north',
    tagline: 'Rice terraces carved into the Hoàng Liên Sơn range',
    description:
      'Trek through Hmong and Dao villages, sleep in a family homestay and watch the clouds roll over Fansipan.',
    image: img('sa-pa-1.jpg'),
    bestTime: 'Sep – Nov, Mar – May',
  },
  {
    slug: 'ha-giang',
    name: 'Hà Giang',
    region: 'north',
    tagline: 'The legendary loop over Mã Pí Lèng Pass',
    description:
      "Vietnam's northernmost frontier: switchback roads, deep canyons and colourful highland markets.",
    image: img('ha-giang-1.jpg'),
    bestTime: 'Oct – Dec',
  },
  {
    slug: 'ninh-binh',
    name: 'Ninh Bình',
    region: 'north',
    tagline: 'Hạ Long Bay on land',
    description:
      'Row through caves at Tràng An, climb to Hang Múa viewpoint and cycle between paddy fields and pagodas.',
    image: img('ninh-binh-1.jpg'),
    bestTime: 'May – Jun, Sep – Oct',
  },
  {
    slug: 'phong-nha',
    name: 'Phong Nha',
    region: 'central',
    tagline: 'The kingdom of caves',
    description:
      'Home to some of the largest caves on Earth, underground rivers and pristine jungle in Phong Nha – Kẻ Bàng National Park.',
    image: img('phong-nha-1.jpg'),
    bestTime: 'Mar – Aug',
  },
  {
    slug: 'hue',
    name: 'Huế',
    region: 'central',
    tagline: 'The imperial capital on the Perfume River',
    description:
      'Walk the Nguyễn dynasty citadel, royal tombs and pagodas, then taste the refined cuisine of the old court.',
    image: img('hue-1.jpg'),
    bestTime: 'Jan – Apr',
  },
  {
    slug: 'da-nang',
    name: 'Đà Nẵng',
    region: 'central',
    tagline: 'Golden Bridge, beaches and mountain views',
    description:
      'A modern coastal city with the iconic Golden Bridge at Bà Nà Hills, Marble Mountains and long sandy beaches.',
    image: img('da-nang-1.jpg'),
    bestTime: 'Feb – Aug',
  },
  {
    slug: 'hoi-an',
    name: 'Hội An',
    region: 'central',
    tagline: 'Lantern-lit lanes of a UNESCO ancient town',
    description:
      'Saffron shophouses, tailor shops, riverside lanterns and some of the best street food in the country.',
    image: img('hoi-an-1.jpg'),
    bestTime: 'Feb – Jul',
  },
  {
    slug: 'nha-trang',
    name: 'Nha Trang',
    region: 'south',
    tagline: 'Island hopping in a turquoise bay',
    description:
      'Snorkel coral reefs, soak in mud baths and enjoy fresh seafood in one of the most beautiful bays in Asia.',
    image: img('nha-trang-1.jpg'),
    bestTime: 'Jan – Aug',
  },
  {
    slug: 'da-lat',
    name: 'Đà Lạt',
    region: 'south',
    tagline: 'The city of eternal spring',
    description:
      'Pine forests, flower farms, waterfalls and cool highland air around Xuân Hương Lake.',
    image: img('da-lat-1.jpg'),
    bestTime: 'Dec – Mar',
  },
  {
    slug: 'saigon',
    name: 'Hồ Chí Minh City',
    region: 'south',
    tagline: 'The energetic heart of the south',
    description:
      'Skyline bars, war history, Bến Thành market and the best night-time food scooter tours in Vietnam.',
    image: img('saigon-1.jpg'),
    bestTime: 'Dec – Apr',
  },
  {
    slug: 'mekong-delta',
    name: 'Mekong Delta',
    region: 'south',
    tagline: 'Floating markets and fruit orchards',
    description:
      'Glide through palm-fringed canals, visit Cái Răng floating market at dawn and stay with local families.',
    image: img('mekong-delta-1.jpg'),
    bestTime: 'Sep – Dec',
  },
  {
    slug: 'phu-quoc',
    name: 'Phú Quốc',
    region: 'south',
    tagline: 'White sand and sunset beaches',
    description:
      "Vietnam's largest island: quiet beaches, coral snorkelling, pepper farms and night markets.",
    image: img('phu-quoc-1.jpg'),
    bestTime: 'Nov – Apr',
  },
];

type TourSeed = Omit<
  Tour,
  | 'meetingPoint'
  | 'startTimes'
  | 'freeCancellation'
  | 'instantConfirmation'
  | 'published'
  | 'operator'
>;

const SEED: TourSeed[] = [
  {
    slug: 'ha-long-bay-luxury-overnight-cruise',
    title: 'Hạ Long Bay Luxury Overnight Cruise',
    destinationSlug: 'ha-long-bay',
    region: 'north',
    category: 'cruise',
    summary:
      'Two days aboard a boutique cruise through Lan Hạ and Hạ Long Bay with kayaking, cave visits and a sunset cooking class.',
    durationDays: 2,
    priceUsd: 189,
    originalPriceUsd: 229,
    rating: 4.9,
    reviewCount: 412,
    maxGroupSize: 20,
    languages: ['English', 'Tiếng Việt'],
    featured: true,
    images: [img('ha-long-bay-1.jpg'), img('ha-long-bay-2.jpg')],
    highlights: [
      'Kayak through hidden lagoons and limestone arches',
      'Visit Sửng Sốt (Surprise) Cave',
      'Sunset cooking class on the sundeck',
      'Tai chi at sunrise among the karsts',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Hà Nội – Hạ Long – Lan Hạ Bay',
        description:
          'Limousine transfer from your Hà Nội hotel, board the cruise, seafood lunch, kayaking at Dark & Bright Cave and a sunset party on deck.',
      },
      {
        day: 2,
        title: 'Sửng Sốt Cave – Hà Nội',
        description:
          'Sunrise tai chi, explore Sửng Sốt Cave, brunch while cruising back to the harbour and return to Hà Nội by early afternoon.',
      },
    ],
    included: [
      'Round-trip limousine from Hà Nội',
      'Private cabin with balcony',
      '4 meals on board',
      'Kayak and entrance fees',
      'English-speaking guide',
    ],
    excluded: ['Drinks', 'Tips', 'Travel insurance'],
    reviews: [
      {
        author: 'Emily R.',
        country: 'Australia',
        rating: 5,
        date: '2026-10-02',
        comment:
          'The cabin was gorgeous and kayaking at sunset was the highlight of our whole trip.',
      },
      {
        author: 'Jonas K.',
        country: 'Germany',
        rating: 5,
        date: '2026-09-18',
        comment: 'Very well organised, fantastic food and a lovely crew.',
      },
    ],
  },
  {
    slug: 'hoi-an-lantern-food-walk',
    title: 'Hội An Lantern Night & Street Food Walk',
    destinationSlug: 'hoi-an',
    region: 'central',
    category: 'food',
    summary:
      'Taste 10 local specialities with a Hội An foodie, release a lantern on the Thu Bồn River and explore the old town after dark.',
    durationDays: 1,
    priceUsd: 39,
    rating: 4.9,
    reviewCount: 638,
    maxGroupSize: 10,
    languages: ['English', 'Tiếng Việt', '한국어'],
    featured: true,
    images: [img('hoi-an-1.jpg'), img('hoi-an-2.jpg')],
    highlights: [
      'Cao lầu, bánh mì Phượng and white rose dumplings',
      'Lantern boat ride on the Thu Bồn River',
      'Small group, max 10 guests',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Evening food walk',
        description:
          'Meet at the Japanese Covered Bridge at 5 pm, eat your way through the market and back lanes, then end with a lantern boat ride.',
      },
    ],
    included: [
      '10 food tastings',
      'Lantern boat ride',
      'Local foodie guide',
      'Water',
    ],
    excluded: ['Hotel pick-up', 'Alcoholic drinks'],
    reviews: [
      {
        author: 'Sarah M.',
        country: 'United Kingdom',
        rating: 5,
        date: '2026-10-21',
        comment: 'Best food tour we have ever done. Come hungry!',
      },
    ],
  },
  {
    slug: 'sa-pa-rice-terrace-trek-homestay',
    title: 'Sa Pa Rice Terrace Trek & Homestay',
    destinationSlug: 'sa-pa',
    region: 'north',
    category: 'adventure',
    summary:
      'Three days hiking through Mường Hoa valley, Hmong and Dao villages with a night in a family homestay.',
    durationDays: 3,
    priceUsd: 145,
    rating: 4.8,
    reviewCount: 287,
    maxGroupSize: 12,
    languages: ['English', 'Tiếng Việt'],
    featured: true,
    images: [img('sa-pa-1.jpg'), img('sa-pa-2.jpg')],
    highlights: [
      '25 km of guided trekking through rice terraces',
      'Homestay dinner with a Dao family',
      'Overnight sleeper bus or train from Hà Nội',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Hà Nội – Sa Pa – Cát Cát village',
        description:
          'Morning limousine bus to Sa Pa, lunch and an easy afternoon walk down to Cát Cát village and waterfall.',
      },
      {
        day: 2,
        title: 'Lao Chải – Tả Van trek',
        description:
          'A full day trek across Mường Hoa valley with lunch by the river, ending at a Dao homestay in Tả Van.',
      },
      {
        day: 3,
        title: 'Tả Van – Hà Nội',
        description:
          'Morning herbal bath, a short hike to Giàng Tả Chải bamboo forest and the return bus to Hà Nội.',
      },
    ],
    included: [
      'Round-trip bus',
      'Hotel + homestay',
      'All meals',
      'Local guide',
      'Permits',
    ],
    excluded: ['Fansipan cable car', 'Drinks', 'Tips'],
    reviews: [
      {
        author: 'Lucas P.',
        country: 'France',
        rating: 5,
        date: '2026-09-30',
        comment: 'Our guide Mai was amazing and the views were unreal.',
      },
    ],
  },
  {
    slug: 'golden-bridge-ba-na-hills-day-trip',
    title: 'Golden Bridge & Bà Nà Hills Day Trip',
    destinationSlug: 'da-nang',
    region: 'central',
    category: 'nature',
    summary:
      'Ride one of the longest cable cars in the world to walk the Golden Bridge held by giant stone hands.',
    durationDays: 1,
    priceUsd: 79,
    originalPriceUsd: 95,
    rating: 4.7,
    reviewCount: 954,
    maxGroupSize: 25,
    languages: ['English', 'Tiếng Việt', '中文'],
    featured: true,
    images: [img('da-nang-1.jpg'), img('da-nang-2.jpg')],
    highlights: [
      'Skip-the-line cable car tickets',
      'Golden Bridge before the crowds',
      'French Village and Le Jardin d’Amour',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Đà Nẵng – Bà Nà Hills',
        description:
          'Hotel pick-up at 8 am, cable car to the summit, Golden Bridge, buffet lunch and free time before returning at 5 pm.',
      },
    ],
    included: ['Cable car ticket', 'Buffet lunch', 'Hotel transfer', 'Guide'],
    excluded: ['Wax museum', 'Drinks'],
    reviews: [
      {
        author: 'Mei L.',
        country: 'Singapore',
        rating: 5,
        date: '2026-08-14',
        comment: 'Arriving early made all the difference. Great guide!',
      },
    ],
  },
  {
    slug: 'hue-imperial-city-heritage-tour',
    title: 'Huế Imperial City Heritage Tour',
    destinationSlug: 'hue',
    region: 'central',
    category: 'culture',
    summary:
      'Explore the Nguyễn dynasty citadel, the tomb of Emperor Khải Định and Thiên Mụ Pagoda by dragon boat.',
    durationDays: 1,
    priceUsd: 55,
    rating: 4.8,
    reviewCount: 341,
    maxGroupSize: 15,
    languages: ['English', 'Tiếng Việt', 'Français'],
    featured: false,
    images: [img('hue-1.jpg'), img('hue-2.jpg')],
    highlights: [
      'Imperial Citadel and Forbidden Purple City',
      'Tomb of Khải Định',
      'Dragon boat on the Perfume River',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Royal Huế',
        description:
          'Citadel in the morning, royal-style lunch, tombs in the afternoon and a dragon boat ride to Thiên Mụ Pagoda.',
      },
    ],
    included: [
      'Entrance tickets',
      'Lunch',
      'Dragon boat',
      'Guide',
      'Transfers in Huế',
    ],
    excluded: ['Drinks', 'Tips'],
    reviews: [
      {
        author: 'Ana G.',
        country: 'Spain',
        rating: 5,
        date: '2026-07-22',
        comment: 'Fascinating history explained with passion.',
      },
    ],
  },
  {
    slug: 'ninh-binh-trang-an-hang-mua-cycling',
    title: 'Ninh Bình: Tràng An Boat, Hang Múa & Cycling',
    destinationSlug: 'ninh-binh',
    region: 'north',
    category: 'nature',
    summary:
      'Row through river caves at Tràng An, climb 500 steps to Hang Múa and cycle through emerald rice fields.',
    durationDays: 1,
    priceUsd: 65,
    rating: 4.9,
    reviewCount: 722,
    maxGroupSize: 16,
    languages: ['English', 'Tiếng Việt'],
    featured: true,
    images: [img('ninh-binh-1.jpg'), img('ninh-binh-2.jpg')],
    highlights: [
      'Two-hour sampan ride through 9 caves',
      'Panoramic sunset at Hang Múa',
      'Countryside cycling',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Hà Nội – Ninh Bình – Hà Nội',
        description:
          'Visit Hoa Lư ancient capital, buffet lunch, cycling, Tràng An boat trip and Hang Múa viewpoint before returning to Hà Nội.',
      },
    ],
    included: [
      'Limousine transfer',
      'Boat ticket',
      'Bicycle',
      'Buffet lunch',
      'Guide',
    ],
    excluded: ['Drinks', 'Tips'],
    reviews: [
      {
        author: 'Tom H.',
        country: 'USA',
        rating: 5,
        date: '2026-10-11',
        comment: 'Even better than Hạ Long in my opinion. Unforgettable.',
      },
    ],
  },
  {
    slug: 'mekong-delta-floating-market-2-days',
    title: 'Mekong Delta & Cái Răng Floating Market',
    destinationSlug: 'mekong-delta',
    region: 'south',
    category: 'culture',
    summary:
      'Two days of sampan rides, fruit orchards, a riverside homestay and the dawn floating market in Cần Thơ.',
    durationDays: 2,
    priceUsd: 119,
    rating: 4.7,
    reviewCount: 198,
    maxGroupSize: 14,
    languages: ['English', 'Tiếng Việt'],
    featured: false,
    images: [img('mekong-delta-1.jpg'), img('mekong-delta-2.jpg')],
    highlights: [
      'Cái Răng floating market at sunrise',
      'Homestay with a local family',
      'Coconut candy and rice paper workshops',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Sài Gòn – Bến Tre – Cần Thơ',
        description:
          'Sampan through coconut canals in Bến Tre, visit local workshops and check into a riverside homestay.',
      },
      {
        day: 2,
        title: 'Cái Răng – Sài Gòn',
        description:
          'Early boat to Cái Răng floating market, noodle-making village and return to Sài Gòn by evening.',
      },
    ],
    included: ['Transport', 'Homestay', 'All meals', 'Boat trips', 'Guide'],
    excluded: ['Drinks', 'Tips'],
    reviews: [
      {
        author: 'Priya S.',
        country: 'India',
        rating: 4,
        date: '2026-06-09',
        comment: 'Lovely family homestay and a magical sunrise on the river.',
      },
    ],
  },
  {
    slug: 'ha-giang-loop-easy-rider',
    title: 'Hà Giang Loop Easy Rider Adventure',
    destinationSlug: 'ha-giang',
    region: 'north',
    category: 'adventure',
    summary:
      'Ride pillion with an experienced local driver over Mã Pí Lèng Pass, Lũng Cú flag tower and Đồng Văn karst plateau.',
    durationDays: 4,
    priceUsd: 249,
    rating: 4.9,
    reviewCount: 156,
    maxGroupSize: 10,
    languages: ['English', 'Tiếng Việt'],
    featured: true,
    images: [img('ha-giang-1.jpg'), img('ha-giang-2.jpg')],
    highlights: [
      'Mã Pí Lèng Pass and Nho Quế River boat',
      'Lũng Cú flag tower at the northern tip',
      'Experienced easy-rider drivers',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Hà Giang – Yên Minh',
        description:
          'Quản Bạ Heaven Gate and Twin Mountains, overnight in Yên Minh.',
      },
      {
        day: 2,
        title: 'Yên Minh – Đồng Văn',
        description:
          'Hmong King palace, Lũng Cú flag tower and the Đồng Văn old quarter.',
      },
      {
        day: 3,
        title: 'Đồng Văn – Mèo Vạc',
        description: 'Mã Pí Lèng Pass and a boat trip through Tu Sản canyon.',
      },
      {
        day: 4,
        title: 'Mèo Vạc – Hà Giang',
        description:
          'Du Già village and waterfall, then back to Hà Giang city.',
      },
    ],
    included: [
      'Easy-rider driver',
      'Fuel',
      'Homestays',
      'All meals',
      'Helmet & raincoat',
      'Permits',
    ],
    excluded: ['Bus Hà Nội – Hà Giang', 'Drinks', 'Tips'],
    reviews: [
      {
        author: 'Chris D.',
        country: 'Canada',
        rating: 5,
        date: '2026-10-28',
        comment:
          'The most beautiful roads I have ever seen. Safe and fun drivers.',
      },
    ],
  },
  {
    slug: 'phong-nha-cave-explorer',
    title: 'Phong Nha Cave Explorer',
    destinationSlug: 'phong-nha',
    region: 'central',
    category: 'adventure',
    summary:
      'Boat into Phong Nha Cave, walk the 31 km Paradise Cave and swim in the Dark Cave mud bath.',
    durationDays: 2,
    priceUsd: 135,
    rating: 4.8,
    reviewCount: 173,
    maxGroupSize: 12,
    languages: ['English', 'Tiếng Việt'],
    featured: false,
    images: [img('phong-nha-1.jpg'), img('phong-nha-2.jpg')],
    highlights: [
      'Paradise Cave',
      'Phong Nha Cave by boat',
      'Zipline and mud bath at Dark Cave',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Đồng Hới – Paradise Cave',
        description: 'Jungle walk and Paradise Cave, overnight in a farmstay.',
      },
      {
        day: 2,
        title: 'Phong Nha – Dark Cave',
        description:
          'Boat to Phong Nha Cave, zipline into Dark Cave and return to Đồng Hới.',
      },
    ],
    included: [
      'Transfers',
      'Farmstay',
      'Meals',
      'Entrance fees',
      'Caving gear',
    ],
    excluded: ['Drinks', 'Tips'],
    reviews: [
      {
        author: 'Olivia W.',
        country: 'New Zealand',
        rating: 5,
        date: '2026-05-17',
        comment: 'Paradise Cave is out of this world.',
      },
    ],
  },
  {
    slug: 'nha-trang-island-hopping-snorkel',
    title: 'Nha Trang Island Hopping & Snorkelling',
    destinationSlug: 'nha-trang',
    region: 'south',
    category: 'beach',
    summary:
      'Speedboat to four islands, snorkel the Hòn Mun marine reserve and enjoy a seafood lunch on the beach.',
    durationDays: 1,
    priceUsd: 49,
    rating: 4.6,
    reviewCount: 402,
    maxGroupSize: 20,
    languages: ['English', 'Tiếng Việt', 'Русский'],
    featured: false,
    images: [img('nha-trang-1.jpg'), img('nha-trang-2.jpg')],
    highlights: ['Hòn Mun coral reef', 'Seafood beach lunch', 'Floating bar'],
    itinerary: [
      {
        day: 1,
        title: 'Four islands by speedboat',
        description:
          'Snorkelling, beach time and fresh seafood, back in town by 4 pm.',
      },
    ],
    included: ['Speedboat', 'Snorkel gear', 'Lunch', 'Marine park fee'],
    excluded: ['Diving', 'Drinks'],
    reviews: [
      {
        author: 'Ivan P.',
        country: 'Kazakhstan',
        rating: 5,
        date: '2026-04-03',
        comment: 'Clear water and great crew.',
      },
    ],
  },
  {
    slug: 'da-lat-highlands-coffee-waterfalls',
    title: 'Đà Lạt Highlands: Coffee Farms & Waterfalls',
    destinationSlug: 'da-lat',
    region: 'south',
    category: 'nature',
    summary:
      'Visit an arabica coffee farm, Elephant waterfall, flower gardens and the Linh Phước mosaic pagoda.',
    durationDays: 1,
    priceUsd: 45,
    rating: 4.7,
    reviewCount: 211,
    maxGroupSize: 12,
    languages: ['English', 'Tiếng Việt'],
    featured: false,
    images: [img('da-lat-1.jpg'), img('da-lat-2.jpg')],
    highlights: [
      'Coffee tasting at the farm',
      'Elephant waterfall',
      'Linh Phước pagoda',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Đà Lạt countryside',
        description:
          'A full day in the highlands with lunch at a local restaurant.',
      },
    ],
    included: ['Transport', 'Lunch', 'Coffee tasting', 'Guide'],
    excluded: ['Drinks', 'Tips'],
    reviews: [
      {
        author: 'Hana T.',
        country: 'Japan',
        rating: 5,
        date: '2026-03-12',
        comment: 'Cool air and amazing coffee.',
      },
    ],
  },
  {
    slug: 'saigon-street-food-by-scooter',
    title: 'Sài Gòn Street Food by Scooter',
    destinationSlug: 'saigon',
    region: 'south',
    category: 'food',
    summary:
      'Hop on the back of a scooter with a local student and taste 8 dishes across four districts at night.',
    durationDays: 1,
    priceUsd: 59,
    rating: 4.9,
    reviewCount: 1203,
    maxGroupSize: 8,
    languages: ['English', 'Tiếng Việt'],
    featured: true,
    images: [img('saigon-1.jpg'), img('saigon-2.jpg')],
    highlights: [
      '8 dishes including bánh xèo and phá lấu',
      'Local student drivers',
      'Rooftop view of the skyline',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Night food ride',
        description:
          '4 hours across Districts 1, 3, 4 and 5 with hotel pick-up and drop-off.',
      },
    ],
    included: ['Scooter & helmet', 'All food and soft drinks', 'Hotel pick-up'],
    excluded: ['Beer', 'Tips'],
    reviews: [
      {
        author: 'Mark B.',
        country: 'Ireland',
        rating: 5,
        date: '2026-11-01',
        comment: 'Exciting, delicious and so much fun.',
      },
    ],
  },
  {
    slug: 'phu-quoc-island-escape-3-days',
    title: 'Phú Quốc Island Escape',
    destinationSlug: 'phu-quoc',
    region: 'south',
    category: 'beach',
    summary:
      'Three relaxed days: southern islands snorkelling, Sao Beach, a pepper farm and sunset at the night market.',
    durationDays: 3,
    priceUsd: 289,
    originalPriceUsd: 339,
    rating: 4.8,
    reviewCount: 129,
    maxGroupSize: 16,
    languages: ['English', 'Tiếng Việt'],
    featured: false,
    images: [img('phu-quoc-1.jpg'), img('phu-quoc-2.jpg')],
    highlights: [
      'An Thới archipelago snorkelling',
      'Sao Beach',
      'Sunset Town and night market',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & sunset',
        description: 'Airport pick-up, beachfront resort and sunset dinner.',
      },
      {
        day: 2,
        title: 'Southern islands',
        description: 'Boat trip with snorkelling and lunch on the islands.',
      },
      {
        day: 3,
        title: 'Pepper farm & departure',
        description:
          'Pepper farm, fish sauce house and Sao Beach before your flight.',
      },
    ],
    included: [
      '2 nights 4★ resort',
      'Breakfasts + 2 lunches',
      'Boat trip',
      'Transfers',
    ],
    excluded: ['Flights', 'Dinners', 'Drinks'],
    reviews: [
      {
        author: 'Linh N.',
        country: 'Vietnam',
        rating: 5,
        date: '2026-02-20',
        comment: 'Perfect relaxing holiday.',
      },
    ],
  },
  {
    slug: 'hanoi-old-quarter-culture-walk',
    title: 'Hà Nội Old Quarter & Culture Walk',
    destinationSlug: 'hanoi',
    region: 'north',
    category: 'culture',
    summary:
      'Hoàn Kiếm Lake, Temple of Literature, train street and egg coffee with a history-loving local guide.',
    durationDays: 1,
    priceUsd: 35,
    rating: 4.8,
    reviewCount: 516,
    maxGroupSize: 12,
    languages: ['English', 'Tiếng Việt', 'Español'],
    featured: false,
    images: [img('hanoi-1.jpg'), img('hanoi-2.jpg')],
    highlights: [
      'Temple of Literature',
      'Egg coffee tasting',
      'Water puppet show',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Old Quarter walk',
        description: 'Half day walking tour ending with a water puppet show.',
      },
    ],
    included: ['Guide', 'Entrance fees', 'Egg coffee', 'Puppet show ticket'],
    excluded: ['Lunch', 'Tips'],
    reviews: [
      {
        author: 'Grace C.',
        country: 'USA',
        rating: 5,
        date: '2026-09-05',
        comment: 'Learned so much in just a few hours.',
      },
    ],
  },
];

/** Operational details per tour: meeting point and daily departure times. */
const OPERATIONS: Record<
  string,
  { meetingPoint: string; startTimes: string[] }
> = {
  'ha-long-bay-luxury-overnight-cruise': {
    meetingPoint: 'Hotel lobby in Hà Nội Old Quarter (pick-up included)',
    startTimes: ['07:30'],
  },
  'hoi-an-lantern-food-walk': {
    meetingPoint: 'Japanese Covered Bridge, Nguyễn Thị Minh Khai St, Hội An',
    startTimes: ['17:00', '18:30'],
  },
  'sa-pa-rice-terrace-trek-homestay': {
    meetingPoint: 'Hà Nội Old Quarter hotel pick-up',
    startTimes: ['07:00'],
  },
  'golden-bridge-ba-na-hills-day-trip': {
    meetingPoint: 'Hotel pick-up in Đà Nẵng or Hội An',
    startTimes: ['08:00'],
  },
  'hue-imperial-city-heritage-tour': {
    meetingPoint: 'Ngọ Môn Gate, Imperial Citadel, Huế',
    startTimes: ['08:00', '13:00'],
  },
  'ninh-binh-trang-an-hang-mua-cycling': {
    meetingPoint: 'Hà Nội Old Quarter hotel pick-up',
    startTimes: ['07:30'],
  },
  'mekong-delta-floating-market-2-days': {
    meetingPoint: 'Bến Thành Market main gate, District 1',
    startTimes: ['07:00'],
  },
  'ha-giang-loop-easy-rider': {
    meetingPoint: 'Hà Giang city bus station',
    startTimes: ['08:00'],
  },
  'phong-nha-cave-explorer': {
    meetingPoint: 'Đồng Hới train station',
    startTimes: ['08:00'],
  },
  'nha-trang-island-hopping-snorkel': {
    meetingPoint: 'Cầu Đá pier, Nha Trang',
    startTimes: ['08:30'],
  },
  'da-lat-highlands-coffee-waterfalls': {
    meetingPoint: 'Hotel pick-up in central Đà Lạt',
    startTimes: ['08:00'],
  },
  'saigon-street-food-by-scooter': {
    meetingPoint: 'Hotel pick-up in Districts 1 and 3',
    startTimes: ['17:30', '19:00'],
  },
  'phu-quoc-island-escape-3-days': {
    meetingPoint: 'Phú Quốc International Airport arrivals hall',
    startTimes: ['10:00'],
  },
  'hanoi-old-quarter-culture-walk': {
    meetingPoint: 'Ngọc Sơn Temple entrance, Hoàn Kiếm Lake',
    startTimes: ['08:30', '14:00'],
  },
};

/** Licensed local operators (suppliers) running each experience. */
const OPERATORS: Record<string, string> = {
  'ha-long-bay-luxury-overnight-cruise': 'Lan Hạ Pearl Cruises',
  'hoi-an-lantern-food-walk': 'Lotus Trails Vietnam',
  'sa-pa-rice-terrace-trek-homestay': 'Hoàng Liên Trekking Co.',
  'golden-bridge-ba-na-hills-day-trip': 'Lotus Trails Vietnam',
  'hue-imperial-city-heritage-tour': 'Perfume River Heritage Tours',
  'ninh-binh-trang-an-hang-mua-cycling': 'Tràng An Discovery',
  'mekong-delta-floating-market-2-days': 'Cửu Long Riverside Travel',
  'ha-giang-loop-easy-rider': 'Northern Loop Riders',
  'phong-nha-cave-explorer': 'Kẻ Bàng Adventures',
  'nha-trang-island-hopping-snorkel': 'Blue Bay Sea Tours',
  'da-lat-highlands-coffee-waterfalls': 'Langbiang Highland Tours',
  'saigon-street-food-by-scooter': 'Saigon Night Riders',
  'phu-quoc-island-escape-3-days': 'Pearl Island Holidays',
  'hanoi-old-quarter-culture-walk': 'Hanoi Heritage Walks',
};

/** Multi-day adventures need operator confirmation; everything else is instant. */
const REQUEST_ONLY = new Set(['ha-giang-loop-easy-rider']);
const NON_REFUNDABLE = new Set(['phu-quoc-island-escape-3-days']);

export const TOURS: Tour[] = SEED.map((t) => ({
  ...t,
  meetingPoint:
    OPERATIONS[t.slug]?.meetingPoint ?? 'Details sent after booking',
  startTimes: OPERATIONS[t.slug]?.startTimes ?? ['08:00'],
  freeCancellation: !NON_REFUNDABLE.has(t.slug),
  instantConfirmation: !REQUEST_ONLY.has(t.slug),
  operator: OPERATORS[t.slug] ?? 'Vietnamtour Partners',
  published: true,
}));
