import {
  getCollection as sourceCollection,
  getEntry as sourceEntry,
  render as sourceRender,
  type CollectionEntry,
  type CollectionKey,
} from 'astro:content';
import type { MarkdownInstance } from 'astro';

export const isChinese = (url: URL) => /^\/zh(?:\/|$)/.test(url.pathname);
export const localizedPath = (path: string, chinese: boolean) => chinese ? `/zh${path}` : path;
export const text = (chinese: boolean, english: string, chineseText: string) => chinese ? chineseText : english;

const translations = import.meta.glob<MarkdownInstance<Record<string, unknown>>>(
  '../translations/zh/**/*.md', { eager: true },
);

// Keep image metadata, collection references, chronology and licenses in the
// original collections. Translations supply only reader-facing prose.
export function localizedContent(url: URL) {
  const chinese = isChinese(url);
  const translation = (entry: CollectionEntry<CollectionKey>) => {
    const translated = translations[`../translations/zh/${entry.collection}/${entry.id}.md`];
    if (!translated) throw new Error(`Missing Chinese translation: ${entry.collection}/${entry.id}`);
    return translated;
  };
  const localize = <T extends CollectionEntry<CollectionKey>>(entry: T): T => chinese
    ? { ...entry, data: { ...entry.data, ...translation(entry).frontmatter } }
    : entry;
  const getCollection = (async (...args: Parameters<typeof sourceCollection>) =>
    (await sourceCollection(...args)).map(localize)) as typeof sourceCollection;
  const getEntry = (async (...args: Parameters<typeof sourceEntry>) => {
    const entry = await sourceEntry(...args);
    return entry ? localize(entry) : entry;
  }) as typeof sourceEntry;
  const render = async (entry: CollectionEntry<CollectionKey>) => chinese
    ? { Content: translation(entry).Content }
    : sourceRender(entry);
  return { getCollection, getEntry, render, localize };
}
