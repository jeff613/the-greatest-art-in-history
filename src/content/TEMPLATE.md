# Content authoring guide

## Adding an artwork — src/content/works/<slug>.md

Filename = URL slug, kebab-case (e.g. `the-third-of-may-1808.md`).
Put the master image in `src/assets/art/<slug>.jpg` (min 2500px long edge, public domain).

    ---
    title: "The Third of May 1808"
    artist: goya                # filename of the artist file, no .md
    period: romanticism         # filename of the period file
    year: "1814"
    medium: "Oil on canvas"
    location: "Museo del Prado, Madrid"
    image: "../../assets/art/the-third-of-may-1808.jpg"
    imageSource: "https://commons.wikimedia.org/wiki/File:..."
    imageLicense: "Public domain"
    teaser: "One sentence that makes you want to read the story."
    ---

    ## The Story
    250–450 words. Why it was painted, the drama of its creation and reception.

    ## The World Behind It
    150–300 words. Politics, society, the artist's city at that moment.

    ## The Artist at This Moment
    150–300 words. Where the artist was in their life.

    ## Interesting Facts
    - 4–7 punchy bullets: thefts, scandals, hidden details, record prices.

`year` must START with the 4-digit year (e.g. "1503–1519", not "c. 1503") — the site sorts works lexicographically by this string.

No technique-analysis sections. Technique only appears inside a story.

## Adding an artist — src/content/artists/<slug>.md

Portrait in `src/assets/portraits/<slug>.jpg` (min 800px long edge).

    ---
    name: "Francisco Goya"
    birth: 1746
    death: 1828
    period: romanticism
    portrait: "../../assets/portraits/goya.jpg"
    portraitSource: "https://commons.wikimedia.org/wiki/File:..."
    portraitLicense: "Public domain"
    hook: "The court painter who went deaf and painted nightmares on his walls."
    timeline:
      - { year: "1746", event: "Born in Fuendetodos, Aragon" }
      - { year: "1786", event: "Appointed painter to King Charles III" }
    ---

    Life story as narrative, 300–500 words. Not a Wikipedia dump.

After adding content, run: npm run check && npm run build

## Image sourcing procedure

1. Find the work on Wikimedia Commons; prefer files from museum open-access
   programs (Google Art Project, Rijksmuseum, Met, NGA, Getty, Prado, AIC) —
   usually the largest scan. Museum sites with direct open-access downloads
   (NGA, AIC, Getty, Rijksmuseum, Mauritshuis) are equally good.
2. Download the ORIGINAL file (upload.wikimedia.org link), not a thumbnail:
   `curl -L -o src/assets/art/<slug>.jpg "<original-url>"`.
3. Verify: `sips -g pixelWidth -g pixelHeight <file>` → artwork long edge
   ≥2500px, portrait ≥800px. No upscales, no watermarks, no photographed
   frames (crop them out with `sips -c H W` if unavoidable).
4. `imageSource` must be the page for the file ACTUALLY used. If you
   substitute a different scan or work, update it to match.
5. If a work cannot meet the floor from any source, substitute another famous
   work by the same artist that can, and say so in the commit message.
6. Downscaling an enormous master (80MB+) to ~6000px long edge is fine;
   keep well above the floor.

## Licensing rules

- Default: public-domain works (artist dead 70+ years) → `imageLicense:
  "Public domain"` or the museum's CC0 wording.
- **Nothing dated 1930 or later, anywhere in the collection** (US
  public-domain line; also Jeff's taste boundary).
- Artists dead less than 70 years (currently only Picasso, d. 1973): pre-1930
  works are US-PD only. Use exactly:
  `"Public domain in the US (published before 1930); may remain under copyright in the EU"`.
  The same wording applies to any photograph whose photographer died after
  1955 (e.g. the Coburn photo of Matisse).

## Period music

Each period file carries one ambient track in `music:` (a list, one entry).
Example, from `renaissance.md`:

    music:
      - title: "Missa Papae Marcelli — I. Kyrie"
        composer: "Giovanni Pierluigi da Palestrina"
        composed: "c. 1562"
        performer: "European Archive Music"
        source: "Wikimedia Commons (via Musopen)"
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Missa_Papae_Marcelli_-_I._Kyrie.flac"
        license: "CC0"
        file: "/audio/renaissance.mp3"

Rules:

- The license must cover the RECORDING, not just the underlying composition —
  public domain and CC0/CC BY/CC BY-SA only. Verify on the source page itself,
  and for re-uploads cross-check the file's embedded metadata against what the
  page claims.
- Human performances only — no MIDI or synthesized renderings.
- Ambient gate: loudness range ≤ 12 LU, checked with `ffmpeg -af ebur128`.
- Duration ≥ 2 minutes.
- Encode with `ffmpeg -codec:a libmp3lame -q:a 4` to
  `public/audio/<period-slug>.mp3`, ≤ 10 MB.
- `sourceUrl` must be the exact page for the file actually used.
