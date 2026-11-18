# Creative Report — Amanah Mall: "The Vertical City"

## 1. The idea

Most malls spread out. Amanah Mall stacks up. Its own About page describes the building as **four basements of parking, four retail floors, and four leisure floors above them** (food court, Magic Planet, Velocity Fitness Club, Cinepax). That vertical stack became the concept.

**The homepage is a ride up through the building.** Every chapter is a floor, and a lift readout in the navigation (`G → 01 → L01 → L05 … → EXIT`) tracks where you are. The brand line, *"More than a destination. A world of experiences,"* is shown literally: a destination at street level that opens into a world as you rise.

The previous direction was a sequence of dark bands with cards. This one is built differently:

| Before | Now |
|---|---|
| Video hero | Real-time 3D building, choreographed by scroll |
| Logo grid ×3 | Pinned horizontal "type index" with giant outlined brand names |
| Facility cards | Sticky image stage synchronised to a scrolling directory |
| Repeated event cards | Editorial index rows with a cursor-following preview |
| Generic news cards | Magazine masthead and lead-story layout |

## 2. Narrative architecture

| Floor | Chapter | Experience |
|---|---|---|
| **G** | The Arrival | 3D building at dusk on Link Road with car light trails. Scrolling dollies the camera around it, then **explodes the building into an architectural section**: B1–B4 parking, L01–L04 retail, L05–L08 leisure. Labels are shown alongside |
| **01** | The Destination | Warm white, editorial. "Lahore's largest and most-visited retail destination" (the live site's own claim), the About copy, and a figures strip (500,000 visitors/month, 8 floors, 4 basements, 23 food outlets, 865 cinema seats, Amanah Group since 1995) |
| **L01** | World of Brands | Pinned horizontal rail: 16 partners with their real logos; names fill on hover. Below it, a scroll-velocity marquee of the full 19-name directory from the live homepage |
| **L05** | Beyond Shopping | "Then the building turns to play." A sticky image stage swaps with clip-path wipes (direction-aware) as each of the 7 facilities becomes active. Facilities without photography get typographic plates rather than stock images |
| **L06** | Moments Together | A drifting collage built from the Basant 2026 gallery and Magic Planet photography, around a centred statement |
| **L07** | What's Happening | Index of real events (Basant 2026, Azadi Mubarak, Rang-e-Khaas, Bari Eid ki Bari Tayari, Exhibition), a hover preview that follows the cursor, and a noticeboard of the three live posters |
| **L08** | The District Journal | Magazine masthead, lead story and two side stories, using the three live blog posts |
| **EXIT** | Plan Your Visit | The only place the brand gradient appears, as a slow light bloom. Address, contact, live opening hours (today's column highlighted in Lahore time), a click-to-load Google Map, and a footer whose AMANAH wordmark rises letter by letter |

## 3. Visual system

- **Colour:** deep navy `#080D48` and warm paper `#F5F2EC` alternate like day and night. Aqua `#08A9E8` is the single accent (italic words, the light fin, active states). Electric blue `#0873C8` does the same job on light sections. The full gradient is used **once**, at the exit.
- **Type:** *Cormorant* for display, in roman and italic (the italic carries emphasis and emotion). *Manrope* for text and UI, with tracked uppercase for "floor plate" labels. Two families only.
- **Shapes:** square images, hairline rules and circular floor badges. The only rounded elements are buttons. No card grids.
- **Logo:** used unchanged, on a white pill so it reads on both dark and light backgrounds.

## 4. Motion language

There are three verbs, used consistently:

1. **Rise:** masked line reveals for headings (SplitText `mask: "lines"`, expo.out) and soft rises for body copy (`ScrollTrigger.batch`).
2. **Open:** clip-path "doors" for images. The loader is a pair of lift doors parting after a B4 → G floor count.
3. **Travel:** scrubbed scenes that move you through space. These are the 3D camera, the horizontal brand rail and the stage wipes.

Rules that were followed:

- There are only **two scroll-length scenes**. The hero uses CSS `position: sticky` and the brand rail uses a GSAP pin, so there are no nested pins.
- Everything sits inside `gsap.matchMedia()`, so desktop, mobile and reduced-motion versions are separate contexts that clean up automatically when the viewport crosses a breakpoint.
- SplitText uses `autoSplit`, so lines re-split correctly after fonts load or the window resizes.
- Lenis drives `ScrollTrigger.update`. It is off for touch and for reduced motion.
- The cursor, magnetic buttons and cursor preview only run on fine pointers.

## 5. 3D strategy

**Honesty note:** no survey or BIM model of Amanah Mall was available, either in the previous project or on the live site. The scene is a **procedural architectural interpretation** built from the published facts: 8 floors, 4 basements, a retail podium with a set-back leisure tower, curtain-wall glazing and Link Road frontage. It is labelled on screen as an interpretation, not a survey model.

Technical choices:

- The building is about 40 draw calls: instanced mullions, city blocks and traffic. Lighting is one PMREM environment (RoomEnvironment) and three lights. There are no textures except a canvas-drawn sign.
- Floors glow in their zone colour (warm retail, aqua leisure, blue parking), so the exploded section reads like an architectural diagram.
- `camera.filmOffset` frames the building to the right of the headline on desktop. It shifts left once the section labels appear on the right.
- Rendering pauses when the hero is off screen or the tab is hidden. Pixel ratio is capped at 1.75 on desktop and 1.25 on mobile. Mobile uses fewer cars and city blocks and no exploded section.
- Fallbacks: no WebGL shows a CSS line-drawing poster; reduced motion renders one still frame.

## 6. Performance

- No framework and no build step. The JavaScript is GSAP (about 70 KB gzipped with plugins), Three.js (about 160 KB gzipped, loaded as a module so it never blocks first paint) and Lenis.
- The hero headline is HTML text and is likely the LCP element, so it isn't blocked by WebGL.
- Every below-the-fold image uses `loading="lazy"` and `decoding="async"`. Every image box has a fixed aspect ratio, so nothing shifts when it loads.
- The Google Map only loads when the visitor clicks it, which saves about 600 KB and avoids third-party cookies on first visit.
- **Before launch:** self-host the images as WebP/AVIF (steps in the README) and consider vendoring the CDN libraries.

## 7. Testing and known limits

Tested in headless Chrome at 1440×900 and 390×844:

- **Layout, fallback styling and responsive behaviour:** checked with screenshots.
- **The full GSAP code path:** `main.js` was run against an instrumented GSAP/ScrollTrigger/SplitText/Lenis stub, covering the loader, the matchMedia contexts, the scroll callbacks, the menu, the hover preview and the map. It ran with zero runtime errors.
- **The Three.js scene:** passes a syntax check, but it has **not been rendered yet**.

The build sandbox couldn't reach the CDNs or either website's images. Because of that, the real-library animation timing and the 3D framing need a first visual pass in a browser. The camera keyframes are grouped together at the top of the choreography block in `scene.js` (`KEYS`) so they are quick to tune.
