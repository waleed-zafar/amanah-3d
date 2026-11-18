# Amanah Mall — "The Vertical City"

One immersive, single-page homepage for Amanah Mall, Lahore. It is static HTML, CSS and vanilla JavaScript, with GSAP for motion and Three.js for the 3D arrival scene.

## Run locally

The 3D scene is an ES module, so it needs a local web server. Opening `index.html` straight from disk works, but the 3D scene falls back to a still poster.

```bash
cd amanah-mall
npx serve .            # or: python3 -m http.server 8080
```

Then open http://localhost:3000 (or :8080).

## Deploy to Vercel

```bash
npm i -g vercel
vercel            # preview
vercel --prod     # production
```

There is no build step. `vercel.json` sets cache headers and a few security headers.

## Project structure

```
amanah-mall/
├── index.html              Semantic markup: one <section> per chapter
├── assets/
│   ├── css/main.css        Tokens, components, chapters, responsive, reduced-motion
│   └── js/
│       ├── content.js      ALL dynamic content (brands, facilities, events, journal, hours)
│       ├── main.js         Renders content, then runs the GSAP motion system and interactions
│       └── scene.js        Three.js procedural building (ES module)
├── vercel.json
├── README.md
└── CREATIVE-REPORT.md
```

## Media: where the images come from

No image files were copied into this package. Every image loads from one of two places:

| Source | Used for |
|---|---|
| `https://amanahmall.vercel.app/images/` (your previous project) | Logo, partner logos, cinema photo, trampoline photo, building and interior photos |
| `https://amanahmall.com.pk/wp-content/uploads/` (live site) | Magic Planet photos, Basant 2026 gallery, event posters, site icon |

**To self-host (recommended before launch):**

1. Copy your previous project's `/images` folder to `assets/images/`.
2. In `assets/js/content.js`, set `redesign: 'assets/images/'`.
3. In `index.html`, replace the three `https://amanahmall.vercel.app/images/` paths (header logo, destination images, footer logo).
4. Convert the photos to WebP/AVIF, for example with `npx @squoosh/cli --webp auto assets/images/*.jpg`.

The Basant 2026 images use full-size WordPress URLs (for example `2026/02/10.jpeg`). If one of them is missing, `main.js` falls back to the `-300x300` / `-300x202` thumbnails automatically.

## External dependencies (all loaded from a CDN, no npm install)

| Library | Version | Why |
|---|---|---|
| GSAP core, ScrollTrigger, SplitText, ScrollToPlugin | 3.13.0 | Motion system. Since 3.13, every GSAP plugin is free, including for commercial use |
| Lenis | 1.1.20 | Smooth wheel scrolling on desktop, kept in sync with ScrollTrigger. Turned off for reduced motion; touch scrolling stays native |
| Three.js (+ RoomEnvironment) | 0.164.1 | 3D arrival scene |
| Google Fonts: Cormorant + Manrope | — | Serif display + sans-serif text |

To vendor them for offline or production use, download the files into `assets/vendor/` and update the `<script>` tags and the `importmap` in `index.html`.

## Progressive enhancement

- **No JavaScript:** all content is still readable. Brands, facilities and events are injected by `main.js`, so for SEO/WordPress they should be server-rendered (see below).
- **No GSAP (for example, the CDN is blocked):** `main.js` detects this, adds `.no-gsap`, shows everything, makes the brand rail natively scrollable and switches the facilities to a two-column layout.
- **No WebGL / file:// :** the hero shows an architectural line-drawing poster.
- **Mobile (≤ 900px):** no pinning. The brand rail is a native swipe carousel and facilities show their image inline. The 3D scene uses a lower pixel ratio and less geometry, with a gentle camera move and no exploded section.
- **prefers-reduced-motion:** no loader, no Lenis, no scrubbed or pinned scenes, no cursor. The 3D renders a still frame.

## WordPress / ACF integration notes

`content.js` is the content contract. Each collection maps to a WordPress source:

| content.js | WordPress |
|---|---|
| `brands[]` | CPT `brand` — title, `logo` (image) |
| `directory[]` | Taxonomy or option list |
| `facilities[]` | CPT `facility` — title, `kicker`, `text`, `hours`, `image`, `plate` word, link |
| `events[]` | CPT `event` — title, category, featured image, permalink |
| `posters[]` | ACF gallery on the home page |
| `journal[]` | Latest 3 posts (`WP_Query`) |
| `moments[]` | ACF gallery |
| `timings[]` | ACF repeater (label, weekday hours, Sunday hours) |

In a theme, output the same markup in PHP (the rendering functions in `main.js` show the exact HTML for each item) and delete `render()`. The motion system only uses data attributes and class names, so it works on server-rendered markup unchanged.

## Things to verify before launch

- **Links:** some internal links follow the live site's naming but were not all checked: `/floor-map/`, `/gallery/`, `/special-offers/`, `/message-from-the-general-manager/`, `/recent-events/`, `/trampoline-park/` and `/velocity-fitness-club/`.
- **Journal images:** the three journal images are mall photography used as stand-ins. Replace them with each post's featured image.
- **Cinema figures:** the About page says 4 screens / 865 seats, while the Cinepax page mentions 8 rooms. The homepage uses the About page figure. Please confirm.
- **3D model:** `scene.js` builds the building procedurally. If a GLB of the real building exists, load it with `GLTFLoader` (plus `DRACOLoader`) in place of the floor-building loop in `init()`, keeping the camera choreography.
