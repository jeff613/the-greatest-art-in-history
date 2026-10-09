# Chinese edition implementation

1. Read the existing templates and source narratives.
2. Add Markdown translation overlays outside the frozen content collections.
3. Split full artwork/artist translations across three independent implementers,
   with nonoverlapping sorted filename slices; translate periods in the main task.
4. Share rendering through locale-aware collection helpers and thin `/zh/` routes.
5. Translate interface copy and add the bottom-right language control and CJK type.
6. Verify translation completeness, narrative structure, dates and qualifications,
   then run the required content checks and static build.
7. Inspect language navigation and responsive gallery/reading layouts; document
   any verification limitations. Leave changes available for Jeff's browse-through.

Validation completed:
- All 223 translations pass content and translation completeness checks.
- Static build produces 452 pages. An output audit verified reciprocal language
  links, language metadata, internal Chinese links, and matching image assets.
- Browser checks confirmed gallery artwork preservation on language switch,
  artwork counterpart navigation, Chinese lightbox controls, and period music labels.
- Reviewed mobile gallery and artist layouts, and timeline layouts at 1056px,
  1280px, and 2560px. No browser console errors observed.
- Translation spot reviews covered selected period essays and biographies;
  structural checks cover every entry, but are not exhaustive editorial review.

Browse-through refinements and acceptance:
- Music buttons remain on one line and expose loading, pause, and retry states.
  Immediate guarded initialization fixes the first Safari visit being inert;
  Jeff confirmed playback works after the fix.
- Artwork facts use small gold numbers, serif text, and fine row dividers.
  Artist timelines use separate date and description columns, stacking on phones.
- Chinese homepage period labels are larger and closer to their artwork titles.
  English labels retain their original styling at Jeff's request.
- Homepage initialization now guards the hero before shuffling, populates on
  `astro:after-swap`, and also initializes when its script loads. The hero waits
  for image decoding before revealing, and the homepage skips the outer page
  transition. Jeff confirmed the repeated same-art flash appears resolved.
- Script harness checks covered music loading/play/pause/retry, initial setup
  without a page-load event, duplicate-event guards, and home initialization.
  Chrome checks covered first load and return navigation; Safari confirmation
  came from Jeff rather than automated Safari testing.
- Jeff accepted this stopping point and requested documentation, push, and cleanup.
