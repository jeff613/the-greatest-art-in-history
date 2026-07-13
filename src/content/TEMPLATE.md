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
