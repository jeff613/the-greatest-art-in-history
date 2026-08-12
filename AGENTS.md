# The Greatest Art in History

A personal virtual museum: Jeff and friends learn the great artists through
**stories** — history and the artist's human moment, never technique lectures.
Astro 7 static site, local-only today, public deploy planned eventually
(an app may follow). **Product vision and principles: `PRD.md`** — read it
before proposing features.

**Current state (2026-08-12):** 10 periods · 50 artists · 163 works,
c. 1280–1929 (Cimabue → Kandinsky). 226 built pages. Every period page carries
an ambient period-matched classical track (period music, merged 2026-07-14).
The home walk has a silent idle-triggered TV auto-scroll mode for AirPlay
display (merged 2026-07-21); the old "artwork of the day" pick was dropped
that day (first slide is now a random shuffle lead). Everything is on `main`,
pushed to the public GitHub repo `jeff613/the-greatest-art-in-history`
(2026-08-04) — plain git, no LFS; the ~1GB of image masters lives in history
by design. The site itself stays local/Tailscale-only; publishing the repo is
not a public deploy, so the pre-deploy checklist below still applies.

## Development

Dev server in background mode:

```
astro dev --background
```

Manage with `astro dev stop|status|logs`. The preview server (serves `dist/`)
usually runs at http://localhost:4322. Jeff browses the dev server over
Tailscale (http://100.75.239.52:4321). After merging changes to
`content.config.ts` or collection schemas from another branch/session, the
running dev server serves STALE content-layer data — restart it with a cache
clear: `astro dev stop && rm -rf .astro && astro dev --background`.

Gates that must stay green after ANY content change:

```
npm run check   # scripts/check-content.mjs — image floors + story sections
npm run build   # 158 pages currently; page count = 2 + periods + 1 + artists + works
```

Astro docs: https://docs.astro.build (routing, components, content collections,
styling guides as needed).

## Architecture map

- `src/content.config.ts` — collections schema (periods/artists/works, plus the
  optional per-period `music` array). **Frozen: do not modify** without explicit
  direction; everything depends on it.
- `public/audio/<period-slug>.mp3` + `src/components/PeriodMusic.astro` — the
  period-music player (one ambient track per period, ~34MB total). Authoring
  rules in TEMPLATE.md ("Period music"); licensing audit in
  `docs/superpowers/2026-07-14-period-music-licensing-audit.md`.
- `src/content/{periods,artists,works}/*.md` — all content. `src/content/TEMPLATE.md`
  is the authoring guide (frontmatter shapes, section rules, image sourcing,
  licensing).
- `src/assets/art/<work-slug>.jpg` + `src/assets/portraits/<artist-slug>.jpg` —
  masters, ~1GB total, stored in plain git (Jeff's explicit decision; no LFS).
- `src/pages/` — index (gallery walk + idle TV auto-scroll), works/[slug], artists/,
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
8. **Focal points**: whenever works are added or images replaced, run
   `swift scripts/focal-points.swift` (Apple Vision face/saliency detection →
   `src/data/focal-points.json`; the home walk pivots its full-bleed crops
   around these so subjects never get cut off). Wrong anchors go in the
   script's OVERRIDES table, never the generated JSON. Eyeball new rooms on
   wide and phone screens as part of every collection batch.

## Design system ("the dimmed gallery and the reading room")

Dark image rooms (`--room #121010`) alternate with warm paper (`--paper
#f6f3ec`); gilt accent (`--gilt`, with `--gilt-room` for dark contexts —
contrast was tuned, don't swap them). Cormorant Garamond display (italic ONLY
for artwork titles) + Inter. Wordmark reads "The Greatest" (rebranded
2026-07-14). Floating header, fixed on the home walk, active nav tab
underlined via `aria-current`. Homepage: one fresh shuffle of all works per
visit — the first leads as a full-screen hero (labelled with its period, like
every room; no "artwork of the day" framing), then a gallery walk of 24 rooms
(`WALK_SIZE` in index.astro), mandatory scroll-snap, scroll cue in the hero,
and full-bleed crops that pivot around each painting's focal point
(convention #8). **TV gallery mode** (idle auto-scroll): after 60s of no input
the walk advances one room every 15 min and loops, for unattended
AirPlay-to-TV display — holds a screen Wake Lock, hides cursor + scroll-cue,
and never runs under `prefers-reduced-motion`; any real input stops it and
re-arms (`IDLE_MS`/`DWELL_MS` in index.astro). The wall-label title sizes to
the available width (`calc(100% - 2*--pad)`) so it wraps only when it truly
runs out of horizontal room. Period and artist pages hang the most vertical relevant
canvas beside their intro text on wide screens. The index pages' two-line
headlines break deliberately (`<br>`) and align under their nav tab (artists
left, periods right). Motion is subtle/slow and fully disabled under
`prefers-reduced-motion`. All page scripts init via `astro:page-load`
(ClientRouter view transitions) with idempotence guards.

### The periods timeline (src/pages/periods/index.astro)

The hero of the periods page: a gilt axis (c. 1280–1940) with 10 named period
cameos, 6 smaller title-labelled artwork cameos filling sparse centuries, and
9 historical anchor events (Black Death → Great War). Everything is
HAND-BALANCED in two config arrays — `TIMELINE_CFG` (per cameo: work, side
above/below, tier near/mid/far/lowered) and `EVENTS` (per event: side, plus
leftward/snug label tweaks). Positions derive from artwork years (the
4-digit sort-year convention). When periods or signature works change: add or
adjust config entries, then CHECK FOR COLLISIONS visually at narrow (66rem
scroll floor), laptop, and ultrawide widths — every current placement was
tuned against real screenshots. Unconfigured periods fall back to their first
work as a cameo.

## Known quirks (all deliberate)

- `the-slave-ship.jpg` is WikiArt-sourced (2663px) — the only non-museum/Commons
  outlier; MFA's own download caps at 1600px. Reviewed and accepted.
- Matisse's *The Dance* has NO floor-clearing scan anywhere; *The Green Line*
  was substituted. Don't re-attempt without a new source. Same for Courbet's
  *The Desperate Man* (→ *The Wounded Man*), and for four works found in the
  2026-08-12 batch: Ingres's *La Grande Odalisque* (nothing above 2200px; the
  larger file is a head detail) and *Monsieur Bertin* (only ≥2500px file
  includes the gilt frame, and cropping it drops to ~2090px); El Greco's *El
  Espolio* (only visitor photos of the Toledo sacristy); Géricault's *Wounded
  Cuirassier* (only large file is a 16:9 phone photo); Repin's *Reply of the
  Zaporozhian Cossacks* (only a Yorck plate trimmed 4% off the canvas ratio).
- Commons traps this repo has hit: exact 2×/3× upscales presented as large
  files, framed gallery photos with the museum wall label in shot, vertically
  stretched scans, and "remastered colour" Photoshop derivatives. **Always check
  a candidate's aspect ratio against the documented canvas dimensions** — it
  catches all four.
- Giotto/Duccio portraits: no life portraits exist (posthumous portrait /
  Maestà-detail stand-in; the bios disclose this).
- `periods/[slug].astro` guards against zero-work periods (needed when a new
  period lands before its artists).
- Two hardcoded count headlines must be updated when the collection changes:
  `src/pages/periods/index.astro` ("Six hundred years, ten revolutions.") and
  `src/pages/artists/index.astro` ("Fifty lives that changed how we see.").
- Jeff likes round numbers: 11 periods were distilled to 10 by merging
  Symbolism & Fin de Siècle into Post-Impressionism.

## Backlog (do not act without Jeff's request)

Pre-deploy checklist: `site` in astro.config, meta/OG/robots/sitemap, lightbox
rendition cap (`getImage` with no width re-encodes 8000px masters), BASE_URL
threading, Picasso EU caveat. baroque.mp3 and early-modernism.mp3 are PD-US only (US-government-work
doctrine — same EU-caveat shape as the Picasso works); northern-renaissance.mp3's
Commons page has a pending license review (CC BY 3.0 confirmed at its Free
Music Archive origin — re-check before deploy). The 2026-08-12 batch cleared the
whole wait-list (Gauguin, Seurat, El Greco, Ingres, Watteau, Holbein, Schiele,
Rousseau) plus nine more; the new wait-list is Toulouse-Lautrec, Modigliani,
Simone Martini or Ambrogio Lorenzetti (Gothic is still the thinnest period at
3), Frans Hals, Corot. Post-1929 moderns (Hopper's Nighthawks, Rockwell,
Hockney) stay blocked by copyright until their terms lapse.
Image upgrades wanted: witches-sabbath.jpg (soft scan), botticelli.jpg portrait
(halftone pattern), seurat.jpg portrait (halftone — the only PD Seurat likeness
is a book reproduction), saying-grace.jpg (hazy-blue Louvre scan, ~4.5% wide of
the catalogue ratio from photographic margin). Minor prose nits are logged in `.superpowers/sdd/progress.md`
(gitignored scratch — local only).

**Open decision — rebrand scope:** the visible wordmark became "The Greatest"
(2026-07-14) but page `<title>`s, PRD, and docs still use the full name "The
Greatest Art in History." Jeff hasn't decided whether the rebrand goes all the
way down; ask before sweeping.

**Mobile compatibility pass (Jeff, 2026-07-14):** the home walk scrolls inside a
fixed 100dvh container as a workaround for iOS Safari toolbar-resize snap drift
(see index.astro comments). Jeff accepted it as a workaround; a proper mobile
audit is wanted later — walk scroll feel, toolbar behavior, works/artists pages
on small screens, the periods timeline horizontal scroll on touch.

## Multiple agents work this repo

Jeff runs parallel agent sessions; their worktrees live under
`.claude/worktrees/` (gitignored). Rules of coexistence: never touch another
session's worktree; prefer explicit path staging over `git add -A` at the repo
root; expect `main` to have moved since your session started (pull the latest
state before branching or merging); surface — don't resolve — anything
unexpected you find in the tree.

## How content gets built here

Large batches run as subagent-driven development: spec in `docs/superpowers/specs`
→ plan with per-artist tasks → fresh implementer agent per task (researches,
sources images, writes) → independent reviewer agent per task (spec compliance
+ live web fact-check + sips image checks) → whole-branch final review → Jeff's
browse-through is the acceptance test. Jeff approves merges explicitly — never
merge to main without his word.
