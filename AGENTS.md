# The Greatest Art in History

A personal virtual museum: Jeff and friends learn the great artists through
**stories** — history and the artist's human moment, never technique lectures.
Astro 7 static site, local-only today, public deploy planned eventually
(an app may follow). **Product vision and principles: `PRD.md`** — read it
before proposing features.

**Current state (2026-07-13):** 10 periods · 33 artists · 112 works,
c. 1290–1929 (Giotto → Kandinsky). 158 built pages. Everything is on `main`;
no remote configured.

## Development

Dev server in background mode:

```
astro dev --background
```

Manage with `astro dev stop|status|logs`. The preview server (serves `dist/`)
usually runs at http://localhost:4322.

Gates that must stay green after ANY content change:

```
npm run check   # scripts/check-content.mjs — image floors + story sections
npm run build   # 158 pages currently; page count = 2 + periods + 1 + artists + works
```

Astro docs: https://docs.astro.build (routing, components, content collections,
styling guides as needed).

## Architecture map

- `src/content.config.ts` — collections schema (periods/artists/works). **Frozen:
  do not modify** without explicit direction; everything depends on it.
- `src/content/{periods,artists,works}/*.md` — all content. `src/content/TEMPLATE.md`
  is the authoring guide (frontmatter shapes, section rules, image sourcing,
  licensing).
- `src/assets/art/<work-slug>.jpg` + `src/assets/portraits/<artist-slug>.jpg` —
  masters, ~1GB total, stored in plain git (Jeff's explicit decision; no LFS).
- `src/pages/` — index (daily pick + gallery walk), works/[slug], artists/,
  periods/. `src/layouts/Base.astro` carries the floating header.
- `src/styles/global.css` — the whole design system.
- `docs/superpowers/specs/` + `docs/superpowers/plans/` — every feature and
  content batch was spec'd and planned there; read them for full history and
  rationale (v1 pilot → design overhaul → collection expansion → timeline
  extension).

## Load-bearing conventions (break these and things quietly rot)

1. **Work `year` frontmatter MUST start with the 4-digit sort year**
   (`"1509–1511"`, never `"c. 1509"`) — the site sorts works lexicographically
   by this string.
2. **Story sections are exactly four**: `## The Story`, `## The World Behind It`,
   `## The Artist at This Moment`, `## Interesting Facts` (word ranges in
   TEMPLATE.md). `npm run check` enforces headings; word ranges are convention.
3. **Image floors**: artworks ≥2500px long edge, portraits ≥800px, public
   domain, no watermarks, no upscales. `imageSource` = the page for the file
   ACTUALLY used. Full sourcing procedure in TEMPLATE.md. Image quality is a
   hard requirement Jeff cares about personally.
4. **Facts must be web-verifiable**; legends get hedged attribution ("Vasari
   says...", "tradition holds..."). Every content batch was independently
   fact-checked by reviewer agents — keep that bar.
5. **Copyright line: nothing after 1929.** Early Modernism works are pre-1930
   only. The three Picasso works + the Matisse portrait photo carry the exact
   wording `"Public domain in the US (published before 1930); may remain under
   copyright in the EU"` — resolve before any EU-reachable public deploy.
6. **Aspect-ratio contract**: cards pass `--ar` (width/height) inline; the
   justified grid in global.css sizes rows from it. New card templates must
   set it.
7. **Voice**: cinematic scene-first openings, human drama, hedged legends, no
   technique analysis. Read 2–3 existing work files before writing any new one.

## Design system ("the dimmed gallery and the reading room")

Dark image rooms (`--room #121010`) alternate with warm paper (`--paper
#f6f3ec`); gilt accent (`--gilt`, with `--gilt-room` for dark contexts —
contrast was tuned, don't swap them). Cormorant Garamond display (italic ONLY
for artwork titles) + Inter. Floating header, fixed on the home walk, active
nav tab underlined via `aria-current`. Homepage: deterministic daily pick
(date-hash over the full works JSON) + gallery walk of 24 random rooms per
visit (`WALK_SIZE` in index.astro), mandatory scroll-snap, scroll cue in the
hero. Period and artist pages hang the most vertical relevant canvas beside
their intro text on wide screens. Motion is subtle/slow and fully disabled
under `prefers-reduced-motion`. All page scripts init via `astro:page-load`
(ClientRouter view transitions) with idempotence guards.

## Known quirks (all deliberate)

- `the-slave-ship.jpg` is WikiArt-sourced (2663px) — the only non-museum/Commons
  outlier; MFA's own download caps at 1600px. Reviewed and accepted.
- Matisse's *The Dance* has NO floor-clearing scan anywhere; *The Green Line*
  was substituted. Don't re-attempt without a new source. Same for Courbet's
  *The Desperate Man* (→ *The Wounded Man*).
- Giotto/Duccio portraits: no life portraits exist (posthumous portrait /
  Maestà-detail stand-in; the bios disclose this).
- `periods/[slug].astro` guards against zero-work periods (needed when a new
  period lands before its artists).
- Two hardcoded count headlines must be updated when the collection changes:
  `src/pages/periods/index.astro` ("Six hundred years, ten revolutions.") and
  `src/pages/artists/index.astro` ("Thirty-three lives that changed how we see.").
- Jeff likes round numbers: 11 periods were distilled to 10 by merging
  Symbolism & Fin de Siècle into Post-Impressionism.

## Backlog (do not act without Jeff's request)

Pre-deploy checklist: `site` in astro.config, meta/OG/robots/sitemap, lightbox
rendition cap (`getImage` with no width re-encodes 8000px masters), BASE_URL
threading, Picasso EU caveat. Wait-listed artists: Gauguin, Seurat, El Greco,
Ingres, Watteau, Holbein, Schiele, Rousseau; post-1929 moderns (Hopper's
Nighthawks, Rockwell, Hockney) blocked by copyright until their terms lapse.
Image upgrades wanted: witches-sabbath.jpg (soft scan), botticelli.jpg portrait
(halftone pattern). Minor prose nits are logged in `.superpowers/sdd/progress.md`
(gitignored scratch — local only).

## How content gets built here

Large batches run as subagent-driven development: spec in `docs/superpowers/specs`
→ plan with per-artist tasks → fresh implementer agent per task (researches,
sources images, writes) → independent reviewer agent per task (spec compliance
+ live web fact-check + sips image checks) → whole-branch final review → Jeff's
browse-through is the acceptance test. Jeff approves merges explicitly — never
merge to main without his word.
