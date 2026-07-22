# TV Gallery Mode (Idle Auto-Scroll) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the home walk (`/`) start scrolling itself, silently, after the viewer stops interacting — an unattended ambient gallery for AirPlay-to-TV — and hand control straight back the moment they touch it.

**Architecture:** A single self-contained client function, `initTvMode()`, added to the existing `<script>` in `src/pages/index.astro`. It arms an idle timer on the `.walk-scroller` container; after 60s of no real input it advances one room (one viewport) every 15 minutes via smooth scroll, looping at the end. Any genuine input stops it and re-arms the idle timer. It reuses the existing DOM, scroll-snap, room cards, and focal crops — no new route, component, data, or schema change. Bound via `astro:page-load` and torn down on `astro:before-swap`, matching every other script on the page.

**Tech Stack:** Astro 7 static site, vanilla TypeScript in a scoped page `<script>`, browser timer + Wake Lock APIs. No new dependencies.

## Global Constraints

- **No new dependencies.** Vanilla DOM/timer/Wake Lock APIs only (`CLAUDE.md`: "don't import a new library"; simplicity-first).
- **No test framework exists** (`package.json` scripts are `dev`/`build`/`preview`/`check`/`astro`). Verification is `npm run build` (bundles + typechecks the page) plus observed behavior on the dev server. Do NOT add vitest/playwright.
- **Surgical changes only.** Touch only `src/pages/index.astro`. Do not modify `content.config.ts`, schemas, serialized data, the room template, or unrelated code.
- **Init via `astro:page-load`, idempotent, torn down on `astro:before-swap`** — the ClientRouter view-transition contract every script on this page already follows.
- **`prefers-reduced-motion: reduce` → no auto-scroll at all.**
- **Gates stay green:** `npm run check` and `npm run build` (currently 158 pages; this change adds no pages).
- **Constants, single source, top of the block:** `IDLE_MS = 60_000`, `DWELL_MS = 15 * 60_000`.
- Match the file's existing style: `document.addEventListener('astro:page-load', fn)` registration, `querySelector<HTMLElement>` typing, terse comments explaining *why*.

---

### Task 1: Idle auto-scroll engine + on-screen affordances

**Files:**
- Modify: `src/pages/index.astro` — append `initTvMode()` and its `astro:page-load` registration inside the existing `<script>` block (after the `document.addEventListener('astro:page-load', initHome);` line, ~line 214); add two CSS rules to the `<style>` block.

**Interfaces:**
- Consumes: the existing home DOM — `.walk-scroller` (the fixed-height snap container, `index.astro:83`) and `.scroll-cue` (the hero hint, `index.astro:90`). Nothing from other tasks.
- Produces: a `.walk-scroller.autoscrolling` state class (Task 2 hooks its Wake Lock into the same `start()`/`stop()` this task defines). Module-scoped `initTvMode()` closure — `start`, `stop`, `advance`, `armIdle` are internal, not exported.

- [ ] **Step 1: Add the two affordance CSS rules**

In the `<style>` block of `src/pages/index.astro`, after the `.walk-end` rules (~line 134), add:

```css
  /* TV gallery mode: while auto-scrolling, drop the cursor and the (now
     redundant) scroll hint so the display reads as pure art. */
  .walk-scroller.autoscrolling { cursor: none; }
  .walk-scroller.autoscrolling .scroll-cue { display: none; }
```

- [ ] **Step 2: Add the engine**

In the `<script>` block, immediately after the line `document.addEventListener('astro:page-load', initHome);` (~line 214), add:

```ts
  // --- TV gallery mode: idle auto-scroll -------------------------------------
  // On the home walk, after the viewer stops touching it, drift through the
  // rooms on our own (one room every DWELL_MS) for an unattended TV display.
  // Any real input stops it and re-arms the idle countdown.
  const IDLE_MS = 60_000;        // no input for this long → auto-scroll starts
  const DWELL_MS = 15 * 60_000;  // hold each room this long before advancing

  function initTvMode(): void {
    const scroller = document.querySelector<HTMLElement>('.walk-scroller');
    if (!scroller || scroller.dataset.tvBound) return;                  // home page only, once
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; // motion opt-out: never auto-scroll
    scroller.dataset.tvBound = '1';

    const ctrl = new AbortController();
    const { signal } = ctrl;
    let idleTimer = 0;
    let stepTimer = 0;
    let running = false;
    let lastX = -1;
    let lastY = -1;

    const atBottom = (): boolean =>
      scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;

    const advance = (): void => {
      if (atBottom()) scroller.scrollTo({ top: 0, behavior: 'smooth' });
      else scroller.scrollBy({ top: scroller.clientHeight, behavior: 'smooth' });
    };

    const start = (): void => {
      if (running) return;
      running = true;
      scroller.classList.add('autoscrolling');
      stepTimer = window.setInterval(advance, DWELL_MS);
    };

    const stop = (): void => {
      if (!running) return;
      running = false;
      scroller.classList.remove('autoscrolling');
      window.clearInterval(stepTimer);
    };

    const armIdle = (): void => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(start, IDLE_MS);
    };

    const onInput = (): void => {
      stop();
      armIdle();
    };

    // A stationary cursor with content scrolling beneath it emits mousemove
    // events at UNCHANGED coordinates. If we treated those as input, our own
    // programmatic scroll would cancel itself. Only a real pointer move counts.
    const onMouseMove = (e: MouseEvent): void => {
      if (e.clientX === lastX && e.clientY === lastY) return;
      lastX = e.clientX;
      lastY = e.clientY;
      onInput();
    };

    scroller.addEventListener('wheel', onInput, { passive: true, signal });
    scroller.addEventListener('touchstart', onInput, { passive: true, signal });
    scroller.addEventListener('pointerdown', onInput, { signal });
    window.addEventListener('keydown', onInput, { signal });
    window.addEventListener('mousemove', onMouseMove, { signal });

    // ClientRouter keeps the old DOM alive during a view-transition swap;
    // tear down timers and listeners explicitly so nothing leaks.
    document.addEventListener('astro:before-swap', () => {
      stop();
      window.clearTimeout(idleTimer);
      ctrl.abort();
      delete scroller.dataset.tvBound;
    }, { once: true });

    armIdle();
  }
  document.addEventListener('astro:page-load', initTvMode);
```

- [ ] **Step 3: Verify the build is green**

Run: `npm run build`
Expected: build succeeds, "158 page(s) built" (unchanged page count), no errors.

- [ ] **Step 4: Verify behavior on the dev server (with temporarily shortened timings)**

Temporarily edit the two constants for observation: `IDLE_MS = 3_000` and `DWELL_MS = 4_000`.

Run: `astro dev --background` then open the home page (`http://localhost:4321/`).

Observe and confirm ALL of:
- Leave the mouse/keyboard alone: after ~3s the walk smooth-scrolls to the next room, then advances again every ~4s.
- It advances room by room to the end, then jumps back to the top and continues (loops).
- The cursor disappears while it's auto-scrolling.
- Move the mouse (a real move) or scroll/press a key: auto-scroll stops immediately; after ~3s of stillness it resumes.
- Clicking a room still opens that work's story page.

Then enable Reduce Motion (macOS: System Settings → Accessibility → Display → Reduce motion), reload, wait >3s: confirm it never auto-scrolls.

- [ ] **Step 5: Restore real timings**

Revert the constants to `IDLE_MS = 60_000` and `DWELL_MS = 15 * 60_000`. Run `npm run build` again — expected: green, 158 pages.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: idle auto-scroll (TV gallery mode) on the home walk

After 60s of no input the home walk advances one room every 15 min and
loops, for unattended AirPlay-to-TV display; any real input stops it and
re-arms. Respects prefers-reduced-motion. Cursor and scroll-cue hide while
running.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Keep the display awake (Wake Lock)

**Files:**
- Modify: `src/pages/index.astro` — extend the `initTvMode()` closure from Task 1 (add a wake-lock variable, two helpers, two call-sites in `start`/`stop`, and a `visibilitychange` listener).

**Interfaces:**
- Consumes: the `start()`, `stop()`, `running` flag, `scroller`, and `signal` defined inside `initTvMode()` in Task 1.
- Produces: nothing new consumed downstream (final task).

- [ ] **Step 1: Add the wake-lock state and helpers**

Inside `initTvMode()`, add the declaration alongside the other `let` state (after `let lastY = -1;`):

```ts
    let wakeLock: WakeLockSentinel | null = null;
```

And add these two helpers just above `const start = ...`:

```ts
    // Keep the TV/display from sleeping mid-gallery. Silently degrade where
    // the API is absent (older/embedded browsers) or the request is denied.
    const acquireWake = async (): Promise<void> => {
      try { wakeLock = (await navigator.wakeLock?.request('screen')) ?? null; }
      catch { /* unsupported or denied — carry on without it */ }
    };
    const releaseWake = (): void => {
      try { void wakeLock?.release(); } catch { /* already gone */ }
      wakeLock = null;
    };
```

- [ ] **Step 2: Wire the helpers into start/stop**

In `start()`, after `scroller.classList.add('autoscrolling');`, add:

```ts
      void acquireWake();
```

In `stop()`, after `scroller.classList.remove('autoscrolling');`, add:

```ts
      releaseWake();
```

- [ ] **Step 3: Re-acquire when the tab returns to the foreground**

The lock is auto-released when the tab is hidden. Add this listener next to the other `addEventListener(..., { signal })` calls in `initTvMode()`:

```ts
    document.addEventListener('visibilitychange', () => {
      if (running && document.visibilityState === 'visible') void acquireWake();
    }, { signal });
```

- [ ] **Step 4: Verify the build is green**

Run: `npm run build`
Expected: build succeeds, 158 pages, no errors. (If TypeScript complains that `WakeLockSentinel` / `navigator.wakeLock` are unknown, that's a lib-DOM typing gap — the client script is bundled by esbuild which strips types and will still build; confirm the build passes. Do not add a dependency to satisfy types.)

- [ ] **Step 5: Verify the lock acquires (dev server)**

With shortened timings again (`IDLE_MS = 3_000`), open the home page in Chrome, let auto-scroll start, then in DevTools console run `navigator.wakeLock` exists and check no errors were thrown. Optionally confirm via `chrome://` power that the screen-wake request is active. Move the mouse to stop → confirm no console errors on release. Restore `IDLE_MS = 60_000`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: hold a screen wake lock while TV gallery mode auto-scrolls

Requests a screen wake lock when auto-scroll starts, releases on stop, and
re-acquires on return to foreground. Degrades silently where unsupported.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- Idle auto-start after 60s → Task 1 (`IDLE_MS`, `armIdle`). ✓
- Input events that stop it (`wheel`/`touchstart`/`keydown`/`pointerdown`/`mousemove`), `scroll` NOT listened to → Task 1 listeners; mousemove coordinate guard covers the "programmatic scroll must not cancel itself" requirement. ✓
- 15-min dwell, one-viewport smooth advance via scroll-snap → Task 1 (`DWELL_MS`, `advance`). ✓
- Loop at end back to top → Task 1 (`atBottom` → `scrollTo(0)`). ✓
- Cursor hides, scroll-cue hides → Task 1 CSS + `autoscrolling` class. ✓
- Wake Lock, re-acquire on visibility → Task 2. ✓
- `prefers-reduced-motion` → no auto-scroll → Task 1 early return. ✓
- Idempotent, `astro:page-load` init, `astro:before-swap` teardown → Task 1 (`dataset.tvBound`, `AbortController`, teardown handler). ✓
- No route/component/data/schema change; build stays 158 pages → both tasks touch only `index.astro`. ✓

**Placeholder scan:** No TBD/TODO; all code shown in full; every step has a concrete command and expected output. ✓

**Type consistency:** `start`/`stop`/`advance`/`armIdle`/`onInput`/`onMouseMove`/`acquireWake`/`releaseWake`, `running`, `wakeLock`, `scroller`, `signal`, `IDLE_MS`, `DWELL_MS` are named identically wherever referenced across both tasks. ✓
