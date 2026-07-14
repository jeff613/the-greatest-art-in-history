# The Greatest Art in History — Product Requirements

## Vision

A home museum. A quiet, beautiful place you can walk into any evening and
stand in front of one of the greatest artworks human beings have ever made —
and actually understand it: who made it, what world it was born into, what it
cost its maker, and why it still matters.

Most art sites are databases. This is a gallery. It is built for the owner and
his friends first — people who love classical, romantic, and impressionist art
and want to *learn* it, not scroll past it.

## What it is

A curated collection of the great art of human history, hung in a digital
building designed like a high-end gallery:

- **The collection** — the canon, period by period, from Giotto's first
  weeping figures (c. 1290) to Kandinsky's leap into abstraction (1920s).
  Currently 10 periods, 33 artists, 112 works. It grows deliberately, wing by
  wing, never faster than its quality bar allows.
- **The stories** — every artwork carries a researched, fact-checked narrative
  in four movements: the story of the painting, the world behind it, the
  artist at that moment of their life, and the interesting facts (thefts,
  scandals, record prices, hidden details). History and human drama over
  technique — the way a great docent talks, not a textbook.
- **The images** — museum-grade only. High-resolution open-access masters
  (2500px+), sourced from the museums that hold the originals. If a
  respectable scan of a work does not exist, the work waits; we never hang a
  bad reproduction.
- **The building** — a dimmed gallery for the art (near-black rooms, paintings
  full-bleed) and a warm reading room for the stories (gallery paper, generous
  type). Subtle, slow motion. No clutter, no chrome, no feed.

## The experience

1. **Something is always on view.** Every visit opens on the Artwork of the
   Day — one painting, full screen, chosen deterministically so the whole
   household sees the same picture that day.
2. **You can always wander.** Scrolling continues into a gallery walk: two
   dozen works in a fresh random order every visit, each a full-screen room,
   the way you drift through a physical museum without a plan.
3. **You can always go deeper.** Every painting opens into its story; every
   artist has a life; every period has an essay and its works hung together.
   Browse by artist or by period — both are first-class doors.

## Principles

- **Stories are the product.** A work without a great, verified story doesn't
  ship. Legends are told as legends ("Vasari says…"), facts are checked.
- **Image quality is non-negotiable.** The owner's words: "really try to find
  the best source for the art images — we don't get bad low-res images."
- **Curated, not comprehensive.** The short list of the truly great, expanded
  thoughtfully. Ten periods is a nice number.
- **Museum feel over web feel.** Elegant, spare, unhurried. Nothing blinks,
  nothing begs, nothing autoplays.
- **Respect the law of the art.** The collection ends at 1929, where living
  copyright begins. Picasso's early works hang with an honest US-only
  public-domain label; Nighthawks, Rockwell, and Hockney wait for the public
  domain like everyone else.

## Scope today / non-goals today

Local, personal, English-only. No accounts, no comments, no social features,
no search (the collection is small enough to wander), no modern/contemporary
art, no AI-generated imagery — ever. The site is a static build with no
backend.

## Roadmap (in intent order, each gated on the owner's go)

1. **More wings** — wait-listed artists (Gauguin, Seurat, El Greco, Ingres,
   Watteau, Holbein, Schiele, Rousseau…) and deeper benches for the giants.
2. **Public deployment** — share the museum beyond the household. Requires the
   pre-deploy checklist (metadata, sitemap, image-delivery tuning, and
   resolving the Picasso EU-copyright caveat).
3. **The app** — the museum in your pocket; same collection, same stories,
   native feel. Not yet designed.
4. **Someday** — the 20th century, as copyrights lapse year by year.

## Success

The owner opens the site on a random Tuesday, sees a painting he half-knows,
reads for four minutes, and comes away knowing why it matters — and tells a
friend. That's the product working. Growth, traffic, and engagement metrics
are explicitly not how this project is judged.

---

*Technical documentation for contributors and agents: `AGENTS.md`. Content
authoring guide: `src/content/TEMPLATE.md`. Feature-level specs and plans:
`docs/superpowers/`.*
