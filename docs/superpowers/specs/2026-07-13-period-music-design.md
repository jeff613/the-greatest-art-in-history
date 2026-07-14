# Period Music — Ambient Classical per Period Page

Date: 2026-07-13
Status: Approved pending user review
Prior specs: 2026-07-13-timeline-extension-design.md (note: 11 periods have since
been condensed to 10 — Symbolism & Fin de Siècle merged into Post-Impressionism).

## Purpose

Pair browsing an art period with period-matched classical music. Each of the 10
period pages gets an optional ambient audio player: one carefully curated,
freely-licensed recording per period, playable with a single tap, styled to the
dimmed-gallery design system.

## Decisions made during brainstorming

- **Per-period player first** (not a persistent site-wide ambient soundtrack).
  Persistence across navigation is explicitly out of scope for v1.
- **Self-hosted public-domain/CC recordings** (Musopen, Wikimedia Commons,
  IMSLP) — no embeds, no ads, no tracking, player fully under our design control.
- **One signature piece per period, schema designed for more** — `music` is an
  array from day one; we ship with a single track each.
- **Music stops when the visitor navigates off the period page.** Because the
  site uses ClientRouter view transitions, audio would otherwise *survive*
  navigation — the player must explicitly stop playback on `astro:before-swap`
  (or equivalent) when leaving.
- **Ambient suitability is a hard curation criterion** (Jeff's explicit ask):
  calm, even dynamics — solo keyboard, chant, small choral, slow movements.
  No symphonic climaxes or wide loud/soft swings that jar while reading.

## Schema (content.config.ts — frozen file, modified with explicit direction)

The `periods` collection gains one **optional** field:

```ts
music: z.array(z.object({
  title: z.string(),        // "Gymnopédie No. 1"
  composer: z.string(),     // "Erik Satie"
  composed: z.string(),     // display string, e.g. "1888" or "c. 1365"
  performer: z.string(),    // performer/ensemble as credited by the source
  source: z.string(),       // e.g. "Musopen", "Wikimedia Commons"
  sourceUrl: z.string(),    // page for the recording ACTUALLY used (imageSource spirit)
  license: z.string(),      // e.g. "Public domain", "CC BY 3.0"
  file: z.string(),         // "/audio/post-impressionism.mp3"
})).optional(),
```

Optional means a period with no acceptable licensed recording ships silently —
no bad track over no track. This is the only change to the frozen schema file.

## Audio assets

- Location: `public/audio/<period-slug>.mp3` (served as-is; not an Astro asset).
- Format: MP3 (universal), ~128–192 kbps, target a few MB per track. Re-encode
  larger sources with ffmpeg if needed.
- `preload="none"` — visitors who never press play download zero audio bytes.
- **Licensing is per-recording, not per-composition.** The composition being
  public domain is NOT sufficient; the specific recording must be PD or CC
  licensed. Verify each individually; record provenance in `sourceUrl` +
  `license`. CC BY requires the credit line — the player displays performer +
  source, which satisfies attribution.

## Player component — `src/components/PeriodMusic.astro`

- Rendered by `src/pages/periods/[slug].astro` in the page-head area (under
  years/title) only when `period.data.music` is non-empty. Uses the first track.
- UI: a single custom play/pause toggle (♪ glyph, gilt accent, dimmed-gallery
  palette) plus a one-line credit:
  *"Erik Satie — Gymnopédie No. 1, 1888 · performer · source"*.
  The credit line links to `sourceUrl`.
- Behind it: a hidden native `<audio loop preload="none">`. Loops (ambience
  while reading); volume set to ~0.7 so it sits behind the art.
- ~30 lines of vanilla JS, no dependencies. Follows the site convention:
  init via `astro:page-load` with an idempotence guard; stop playback on
  navigation away (view transitions keep the old page's audio alive otherwise).
- Toggle reflects state (play/pause icon + `aria-pressed` / accessible label).

## Repertoire (candidates — final pick per period depends on what exists as a
decent freely-licensed recording; ambient criterion applies to the specific
movement/recording chosen)

| Period | Candidate |
|--------|-----------|
| Gothic & Proto-Renaissance | Plainchant, or Machaut (Messe de Nostre Dame movement) |
| Northern Renaissance | Josquin motet (e.g. Ave Maria… virgo serena) |
| Renaissance | Palestrina, *Sicut cervus* |
| Baroque | Bach, Air from Orchestral Suite No. 3 |
| Rococo & Neoclassicism | A Mozart andante (piano or piano-concerto slow movement) |
| Romanticism | A Chopin nocturne |
| Realism | A Brahms intermezzo (op. 117/118) |
| Impressionism | Debussy, *Clair de lune* or Arabesque No. 1 |
| Post-Impressionism (incl. Symbolism) | Satie, Gymnopédie No. 1 (alt: Fauré *Pavane*) |
| Early Modernism | Quiet pre-1930 modernism: Scriabin late prelude, Ravel *Pavane*, or Schoenberg op. 19 |

Composition copyright note: Early Modernism follows the site's existing
"nothing after 1929" line; prefer compositions published before 1930 and
recordings that are themselves free.

## Gates

- `npm run check` gains a rule: every `music[].file` must exist under `public/`.
- `npm run build` stays green (158 pages; no new pages added by this feature).

## Out of scope for v1

- Music persisting across navigation (machinery half-exists via view
  transitions; deliberate non-goal now).
- Playlists / multiple tracks playing per period (schema supports; UI doesn't).
- Music on home, works, or artist pages.
- Volume control UI.

## Verification

- Each period page: player renders, plays, pauses, loops, credit correct.
- Navigating away stops the audio (the view-transitions trap).
- A period with no `music` renders exactly as before.
- `npm run check` and `npm run build` pass.
- Licensing: every shipped file has verified PD/CC provenance in frontmatter.
