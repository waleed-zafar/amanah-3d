/*!
 * Amanah Mall — content layer
 * ---------------------------------------------------------------
 * All dynamic content lives here, separated from markup and styling.
 * Each collection maps 1:1 to a future WordPress / ACF source:
 *   brands      -> CPT "brand"       (title, logo image field, url)
 *   facilities  -> CPT "facility"    (title, kicker, text, hours, image, url)
 *   events      -> CPT "event"       (title, category, image, url)
 *   posters     -> ACF gallery "noticeboard"
 *   journal     -> WP posts           (title, date, categories, featured image, url)
 *   moments     -> ACF gallery "moments"
 *   timings     -> ACF repeater "opening_hours"
 *
 * Sources: amanahmall.com.pk (live site, primary) and the previous
 * redesign's /images folder (partner logos, cinema & trampoline photos).
 * To self-host media, copy those files to /assets/images and change
 * ASSETS.redesign to "assets/images/".
 */
(function () {
  'use strict';

  var ASSETS = {
    redesign: 'https://amanahmall.vercel.app/images/',
    live: 'https://amanahmall.com.pk/wp-content/uploads/',
    site: 'https://amanahmall.com.pk/'
  };

  var R = function (f) { return ASSETS.redesign + f; };
  var L = function (f) { return ASSETS.live + f; };
  var S = function (p) { return ASSETS.site + p; };

  window.AMANAH = {
    assets: ASSETS,

    logo: R('imgi_3_amanah-mall-logo.webp'),

    /* Brands with partner logo assets available in the project */
    brands: [
      { name: 'Breakout',      logo: R('breakout.png') },
      { name: 'Limelight',     logo: R('limelight.png') },
      { name: 'Edenrobe',      logo: R('edenrobe.png') },
      { name: 'Uniworth',      logo: R('uniworth.png') },
      { name: 'Bonanza',       logo: R('BONANZA-1.png') },
      { name: 'J.',            logo: R('J-1.png') },
      { name: 'Unze',          logo: R('unze-1.png') },
      { name: 'Saya',          logo: R('saya-2.png') },
      { name: 'Diners',        logo: R('diners-1.png') },
      { name: 'Charcoal',      logo: R('charcoal-1.png') },
      { name: 'Monark',        logo: R('monark-.png') },
      { name: 'Lakhany',       logo: R('lakhany-1.png') },
      { name: 'Hemani',        logo: R('hemani.png') },
      { name: 'Saeed Ghani',   logo: R('saeed-ghani-1.png') },
      { name: 'Humna Momina',  logo: R('humna-momina.png') },
      { name: 'Miandad',       logo: R('miandad.png') }
    ],

    /* Full partner directory as listed on the live homepage */
    directory: [
      'Breakout', 'Limelight', 'Miniso', 'Uniworth', 'Bareeze Man', 'Sapphire',
      'Engine', 'Ideas', 'Chinyere', 'Gravity', 'Sweet Sixteen', 'Bareeze',
      'Minnie Minors', 'The Fabric Store', 'Diners', 'Charcoal', 'Cougar',
      'Ultra Club', 'Monark'
    ],

    facilities: [
      {
        id: 'cinepax',
        title: 'Cinepax Cinema',
        kicker: 'Upper levels · Premium cinema',
        text: 'A four-screen premium cinema with 865 seats — wide and 3D screens, daily show timings and online ticket booking.',
        hours: 'Mon–Sun · regular mall timings',
        image: R('cinema-pic.jpg'),
        url: S('cinepax-cinema/')
      },
      {
        id: 'magic-planet',
        title: 'Magic Planet',
        kicker: 'Indoor amusement park',
        text: 'Arcade games, VR rides and kids’ play zones — the indoor amusement park at the heart of Amanah’s family floors.',
        hours: 'Mon–Sat 12 PM–9 PM · Sun 2 PM–9 PM',
        image: L('2025/07/magic-planet-1.jpg'),
        url: S('magic-planet/')
      },
      {
        id: 'vr-park',
        title: 'VR Park',
        kicker: 'Under the Magic Planet banner',
        text: 'Step into virtual worlds. The VR Park brings immersive rides and games to the Magic Planet floor.',
        hours: 'Mon–Sat 12 PM–9 PM · Sun 2 PM–9 PM',
        image: L('2025/07/magic-planet-2.jpg'),
        url: S('magic-planet/')
      },
      {
        id: 'trampoline',
        title: 'Trampoline Park',
        kicker: 'Pakistan’s largest',
        text: 'Pakistan’s largest trampoline park — an indoor arena built for bounce, balance and boundless energy.',
        hours: 'Mon–Sat 12 PM–9 PM · Sun 2 PM–9 PM',
        image: R('bouncing-1.jpg'),
        url: S('trampoline-park/')
      },
      {
        id: 'food-court',
        title: 'Food Court',
        kicker: '23 food outlets',
        text: 'Indoor restaurants, cafés and ice cream parlours — from McDonald’s, Cheezious and Red Chilli to Istanbul Dondurma and Timmy’s.',
        hours: 'Mon–Sat 12 PM–10 PM · Sun 2 PM–10 PM',
        image: null,
        plate: 'Taste',
        url: S('food-court/')
      },
      {
        id: 'snooker',
        title: 'American Pool & Snooker Club',
        kicker: 'Part of Magic Planet',
        text: 'Pool and snooker tables alongside bowling — the Magic Planet family’s answer to an evening out with friends.',
        hours: 'Mon–Sat 12 PM–9 PM · Sun 2 PM–9 PM',
        image: null,
        plate: 'Cue',
        url: S('magic-planet/')
      },
      {
        id: 'velocity',
        title: 'Velocity Fitness Club',
        kicker: 'Upper levels · Fitness',
        text: 'A dedicated fitness club inside the mall, open from early morning for training before the day begins.',
        hours: 'Mon–Sat 7 AM–10 PM · Sunday closed',
        image: null,
        plate: 'Move',
        url: S('velocity-fitness-club/')
      }
    ],

    events: [
      { title: 'Basant Festival 2026', category: 'Festival',      image: L('2026/02/11.jpeg'), url: S('basant-festival-2026/') },
      { title: 'Azadi Mubarak',        category: 'Entertainment', image: null,                 url: S('azadi-mubarak-2025/') },
      { title: 'Rang-e-Khaas',         category: 'Entertainment', image: null,                 url: S('rang-e-khaas/') },
      { title: 'Bari Eid ki Bari Tayari', category: 'Lifestyle Exhibition', image: null,      url: S('events/lifestyle-exhibition-2025/') },
      { title: 'Exhibition',           category: 'Entertainment', image: null,                 url: S('Events/exhibition/') }
    ],

    /* "Upcoming events" posters published on the live homepage */
    posters: [
      L('2025/07/5.jpg'),
      L('2025/07/6.jpg'),
      L('2025/07/8.jpg')
    ],

    journal: [
      {
        title: 'Amanah Shopping Festival 2026 — Shop More, Smile More This Ramzan',
        date: 'March 2, 2026',
        tags: ['Entertainment', 'Fashion'],
        excerpt: 'Eid shopping, Ramzan offers and a festival atmosphere across every floor.',
        image: L('2026/02/9.jpeg'),
        url: S('amanah-shopping-festival-shop-win/')
      },
      {
        title: 'How Shopping Malls Increase Brand Visibility in Lahore',
        date: 'February 23, 2026',
        tags: ['Blog', 'Fashion'],
        excerpt: 'Inside Lahore’s competitive retail market — and why place still matters for brands.',
        image: R('compress-images-6.jpg'),
        url: S('shopping-malls-increase-brand-visibility/')
      },
      {
        title: 'Top Fashion Brands to Explore at Amanah Mall Lahore',
        date: 'February 21, 2026',
        tags: ['Fashion'],
        excerpt: 'A guided walk through the labels that make Amanah a fashion address.',
        image: R('compress-images-7.jpg'),
        url: S('top-fashion-brands-amanah-mall/')
      }
    ],

    /* Family & lifestyle imagery (Basant 2026 gallery + Magic Planet) */
    moments: [
      L('2026/02/10.jpeg'),
      L('2025/07/magic-planet-3.jpg'),
      L('2026/02/7.jpeg'),
      L('2025/08/magic-planet.webp'),
      L('2026/02/5.jpeg')
    ],

    timings: [
      { label: 'Retail Shops & Kiosks', week: '12:00 PM – 9:00 PM',  sun: '2:00 PM – 9:00 PM' },
      { label: 'Food Court',            week: '12:00 PM – 10:00 PM', sun: '2:00 PM – 10:00 PM' },
      { label: 'Magic Planet & Trampoline Park', week: '12:00 PM – 9:00 PM', sun: '2:00 PM – 9:00 PM' },
      { label: 'Velocity Fitness Club', week: '7:00 AM – 10:00 PM',  sun: 'Closed' },
      { label: 'Cinepax Cinema',        week: 'Regular timings',     sun: 'Regular timings' }
    ]
  };
})();
