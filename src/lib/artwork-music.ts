import type { CollectionEntry } from 'astro:content';

export type MusicTrack = NonNullable<CollectionEntry<'periods'>['data']['music']>[number] & {
  processing?: string;
};

// Listening windows, not composition dates. Chant remained in use throughout
// the Middle Ages; later windows overlap so neighbouring artworks can vary.
const PERIOD_WINDOWS: Record<string, [number, number]> = {
  'gothic-proto-renaissance': [1250, 1450],
  'northern-renaissance': [1480, 1610],
  renaissance: [1480, 1620],
  baroque: [1650, 1780],
  'rococo-neoclassicism': [1700, 1810],
  romanticism: [1780, 1870],
  realism: [1800, 1880],
  impressionism: [1860, 1929],
  'post-impressionism': [1860, 1929],
  'early-modernism': [1900, 1929],
};

const additions = [
  {
    window: [1250, 1480],
    title: ['Resurrexi et adhuc tecum sum', '《我已复活，仍与你同在》'],
    composer: ['Anonymous (Gregorian chant)', '佚名（格里高利圣咏）'],
    composed: ['traditional (Easter plainchant)', '传统复活节圣咏'],
    performer: ['The Tudor Consort', '都铎合唱团'],
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:The_Tudor_Consort_-_02_-_Introit_-_Resurrexi_et_Adhuc_Tecum_Sum.ogg',
    license: 'CC BY 3.0',
    file: '/audio/resurrexi.mp3',
  },
  {
    window: [1380, 1520],
    title: ['Se la face ay pale', '《若我的脸色苍白》'],
    composer: ['Guillaume Du Fay', '纪尧姆·迪费'],
    composed: ['15th century', '15世纪'],
    performer: ['Asteria', 'Asteria 古乐二重奏'],
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Guillaume_Dufay_-_Se_La_Face_Ay_Pale.ogg',
    license: 'CC BY-SA 2.5',
    file: '/audio/dufay-se-la-face.mp3',
    processed: true,
  },
  {
    window: [1540, 1680],
    title: ['Versa est in luctum', '《我的琴声化为哀哭》'],
    composer: ['Alonso Lobo', '阿隆索·洛博'],
    composed: ['1598', '1598'],
    performer: ['The Tudor Consort (dir. Alastair Carey)', '都铎合唱团（指挥：阿拉斯泰尔·凯里）'],
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:The_Tudor_Consort_-_06_-_Alonso_Lobo_-_Versa_est_in_Luctum.ogg',
    license: 'CC BY 3.0',
    file: '/audio/lobo-versa-est.mp3',
  },
  {
    window: [1550, 1680],
    title: ['Out of the Deep', '《从深渊中》'],
    composer: ['Orlando Gibbons', '奥兰多·吉本斯'],
    composed: ['early 17th century', '17世纪初'],
    performer: ['The Tudor Consort (dir. Alastair Carey)', '都铎合唱团（指挥：阿拉斯泰尔·凯里）'],
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:The_Tudor_Consort_-_01_-_Orlando_Gibbons_-_Out_of_the_Deep.ogg',
    license: 'CC BY 3.0',
    file: '/audio/gibbons-out-of-the-deep.mp3',
    processed: true,
  },
];

export function artworkMusic(
  periods: CollectionEntry<'periods'>[], year: string, slug: string, chinese: boolean,
): MusicTrack[] {
  const date = Number(year.slice(0, 4));
  const within = ([start, end]: number[]) => date >= start && date <= end;
  const tracks: MusicTrack[] = periods
    .filter((period) => PERIOD_WINDOWS[period.id] && within(PERIOD_WINDOWS[period.id]))
    .flatMap((period) => period.data.music ?? []);
  const language = chinese ? 1 : 0;
  for (const entry of additions.filter((entry) => within(entry.window))) {
    tracks.push({
      title: entry.title[language], composer: entry.composer[language],
      composed: entry.composed[language], performer: entry.performer[language],
      source: chinese ? '维基共享资源' : 'Wikimedia Commons',
      sourceUrl: entry.sourceUrl, license: entry.license, file: entry.file,
      processing: entry.processed
        ? (chinese ? '音量与动态已调整' : 'Loudness and dynamics adjusted') : undefined,
    });
  }
  // Stable across builds and language changes, varied across artwork pages.
  tracks.sort((a, b) => a.file.localeCompare(b.file));
  const hash = [...slug].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 0);
  const first = hash % tracks.length;
  return [...tracks.slice(first), ...tracks.slice(0, first)];
}

export function musicForWorks(
  periods: CollectionEntry<'periods'>[], works: CollectionEntry<'works'>[], chinese: boolean,
): MusicTrack[] {
  return [...new Map(works.flatMap((work) =>
    artworkMusic(periods, work.data.year, work.id, chinese)
  ).map((track) => [track.file, track])).values()]
    .sort((a, b) => a.file.localeCompare(b.file));
}
