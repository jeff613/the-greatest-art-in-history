# Design Overhaul — "The Dimmed Gallery and the Reading Room"

Date: 2026-07-12
Status: Approved pending user review
Reference: White Cube (whitecube.com) homepage treatment, per Jeff.

## Purpose

The v1 pilot shipped functionally complete but visually barebones. This overhaul makes
the site image-first and gallery-grade: artwork fills the screen, chrome nearly
disappears, long-form stories read on warm paper. Presentation layer only — no content,
URL, or data changes.

## Scope

**Changed:** `src/styles/global.css`, `src/layouts/Base.astro`, `src/pages/index.astro`,
`src/pages/works/[slug].astro`, `src/pages/artists/index.astro`,
`src/pages/artists/[slug].astro`, `src/pages/periods/index.astro`,
`src/pages/periods/[slug].astro`, `src/components/ArtworkCard.astro`.

**Untouched:** all content collections and markdown, content schemas, check script,
routes/URLs, image assets, favicon.

**Removed:** the "Surprise me" shuffle button and its logic. The daily pick remains.

## Design language

- **Two rooms.** Imagery lives on near-black (`#121010` — "the dimmed gallery");
  long-form text lives on warm gallery paper (`#f6f3ec` — "the reading room").
  Pages may contain both zones; there is no solid header bar anywhere.
- **Floating header** on every page: `THE GREATEST ART` wordmark centered, uppercase,
  wide letter-spacing; `Artists` left, `Periods` right, tiny uppercase. White text
  over dark/imagery, ink text over paper. Absolute/fixed over content, no background.
- **Typography:** Cormorant Garamond (display; *italic* for titles over imagery, up to
  ~5rem via clamp) + Inter (UI/body). Kickers ~0.7rem uppercase, letter-spacing ≥0.2em.
  Body on paper ≥1.0625rem with line-height ≥1.8 at ~42rem measure.
- **Accent:** existing muted gold `#8a6d3b`, used only for rules, links, kickers.
- **Uncropped thumbnails:** `ArtworkCard` shows true aspect ratio (no 4:3 crop),
  images presented like matted prints — consistent gutters, no borders/boxes/shadows
  on cards.
- **Motion (one language, sitewide):** hero/large images fade in ~1.2s ease-out;
  captions rise ~8px and fade just after; hovers brighten ~2% over ~400ms; page
  navigations crossfade via Astro view transitions (ClientRouter). All motion
  disabled under `prefers-reduced-motion: reduce`.

## Page treatments

### Home
Artwork of the Day as the full-viewport background (`object-fit: cover`, centered),
soft bottom gradient scrim for legibility. Bottom-left gallery-label block: kicker
`ARTWORK OF THE DAY — <MONTH DAY>`, title in large italic display serif, artist + year
line, quiet `Read the story →` link. The entire background links to the work page.
No shuffle. Daily pick stays client-side and deterministic by local date (unchanged
algorithm); the works-data JSON embed stays (minus now-unused fields if any).
`<noscript>` shows a simple centered wordmark + links to Artists/Periods.

### Artwork page (`/works/<slug>`)
1. **Dark room:** floating header; painting large on black with existing soft shadow;
   title (display italic) + byline; quick facts collapse to one centered line:
   `1814 · Oil on canvas · Museo del Prado, Madrid` (period remains a link).
2. **Reading room:** the four story sections on gallery paper, comfortable measure,
   gold hairline section rules (current `.prose h2::before` treatment carries over).
3. **Dark close:** next-artwork invitation on black. Full-screen zoom lightbox stays.

### Artist page (`/artists/<slug>`)
Opens dark: large portrait beside/under the name in display serif, period · dates
kicker, hook line in italic. Bio + timeline on paper. Works in the uncropped grid.

### Artists index (`/artists`)
Paper page: headline, then portrait grid (uncropped, no boxes), name, dates, italic
hook line. Type/spacing upgraded.

### Periods index (`/periods`)
Paper page: full-width chronological ledger rows — years, era name (larger display
serif), work count. Existing structure, upgraded scale and spacing.

### Period page (`/periods/<slug>`)
Paper page: years kicker, era name, intro rendered as a large italic serif lede,
then the uncropped works grid.

## Acceptance

- `npm run check` and `npm run build` pass; 48 pages; no content diffs.
- Homepage shows today's artwork full-bleed with legible caption over any painting
  (scrim must handle light artworks like Impression, Sunrise).
- No layout shift from image fade-ins; `prefers-reduced-motion` yields a static site.
- Works with keyboard: header links, read-the-story, zoom open/close.
- Phone-width: full-bleed home still legible; grids reflow to one/two columns;
  no horizontal scroll.
- Jeff's visual walkthrough is the acceptance test.

## Out of scope

Search, deployment prep, content edits, new pages, the deferred backlog items
(lightbox rendition cap, LFS, meta/OG tags) except where a touched file makes a
fix free.
