# TV Gallery Mode (Idle Auto-Scroll) — Design

**Date:** 2026-07-21
**Status:** Approved, ready for planning

## Problem

Jeff runs the site on his TV as an ambient gallery (AirPlay screen-mirror from
his Mac/phone into a fullscreen browser; the TV is a dumb external display,
input happens on the source device). Today the home walk is hand-scrolled, so
it just sits on the first room until someone touches it. He wants it to run
itself — a lean-back, hands-off gallery he can put on and walk away from.

## Scope

**In:** The home walk (`/`, `src/pages/index.astro`) starts scrolling itself
after the viewer stops interacting, advancing one room at a long interval, and
loops indefinitely.

**Out (explicitly decided against):**
- **Music.** Considered and dropped — a forced soundtrack conflicts with
  whatever Jeff would rather play. TV mode is silent; all era-matched-music and
  walk-reordering ideas are out of scope.
- No new route, no `/tv` page, no new components, no visual redesign. Same daily
  hero, same 24 random rooms, same focal-point crops and wall labels.

## Behavior

### Trigger: idle auto-start (screensaver model)

A timer watches for genuine user input on the home page. After **60 seconds**
of no input, auto-scroll begins. Any input immediately stops it and restarts the
60s countdown, so it only ever runs when the viewer has truly stepped away.

**Counts as user input** (stops auto-scroll, resets idle timer):
`wheel`, `touchstart`, `keydown`, `pointerdown`, `mousemove`.

**Does NOT count as input:** the `scroll` event. Programmatic smooth-scrolling
fires `scroll`, and treating it as input would make auto-scroll cancel itself.
Idle detection must never listen to `scroll`.

### The scroll

- Every **15 minutes** (dwell per room), smooth-scroll the walk container down
  by exactly one viewport (`100dvh`, one room), letting the existing
  `scroll-snap-type: y mandatory` land it cleanly on the next room.
- Use `scrollTo({ top, behavior: 'smooth' })` on `.walk-scroller` (the walk
  scrolls inside that fixed-height container, not the document — see the iOS
  toolbar workaround comment in `index.astro`).
- On reaching the end of the walk (`#walk-end`), loop back to the top
  (`scrollTop = 0`) and continue indefinitely. The walk content is unchanged
  (same shuffled 24 built once on load); looping re-shows the same sequence.
- At 15 min/room a 24-room walk is ~6 hours per full loop. This is intended
  (ambient wall-art pace), not a slideshow.

### While auto-scroll is running

- **Cursor hides** (`cursor: none` on the walk); returns on the next
  `mousemove` (which also counts as input and stops auto-scroll).
- **Hero scroll-cue hides** — the animated "scroll down" hint is redundant when
  the page scrolls itself.
- **Wake Lock** — request a screen wake lock (`navigator.wakeLock.request('screen')`)
  so the display doesn't sleep mid-gallery. Re-acquire on
  `visibilitychange` back to visible (the lock is auto-released when the tab is
  hidden). Guard for browsers without the API — degrade silently.
- Clicking a room still navigates to that work's story exactly as today (no
  change to the existing links).

### Accessibility: `prefers-reduced-motion`

Users who have asked their OS to reduce motion get **no auto-scroll at all** —
self-scrolling is precisely the motion they opted out of. The idle timer is
never armed under `(prefers-reduced-motion: reduce)`; the page stays a normal
hand-scrolled walk. (This mirrors the existing home walk, which already gates
its fade-in animations behind `prefers-reduced-motion: no-preference`.)

## Implementation notes

- All logic lives in the existing `initHome()` script block in
  `src/pages/index.astro`, added after the walk is built. It must be idempotent
  and initialize via `astro:page-load` like the rest of the page (ClientRouter
  view transitions), and tear down its timers/listeners on
  `astro:before-swap` so nothing leaks when navigating away.
- State machine is small: `idle countdown → scrolling → (input) → idle countdown`.
  A single `setTimeout` for the idle delay and a single `setInterval` (or
  chained `setTimeout`) for the 15-min room advance. Clear both on any input and
  on `astro:before-swap`.
- No changes to serialized data, `content.config.ts`, schemas, or the room
  template. This is purely a client-side behavior layer over the existing DOM.

## Constants (single source, top of the script)

- `IDLE_MS = 60_000` — idle delay before auto-scroll starts.
- `DWELL_MS = 15 * 60_000` — time each room is held before advancing.

## Testing / acceptance

- `npm run check` and `npm run build` stay green (no content or page-count
  change expected — this is behavior-only).
- Manual: on the home walk, leave it untouched ~60s → it advances one room every
  15 min (verify with a temporarily shortened `DWELL_MS` during dev). Any
  scroll/tap/key/mouse-move stops it and, after 60s more of stillness, it
  resumes. Reaching the end loops to the top.
- Manual: with reduced motion enabled (macOS: System Settings → Accessibility →
  Display → Reduce motion), it never auto-starts.
- Jeff's AirPlay-to-TV browse-through is the final acceptance test.

## Open questions

None. All decisions resolved during brainstorming.
