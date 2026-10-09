import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const sections = ['画作的故事', '时代背景', '此刻的艺术家', '趣闻'];
const fields = {
  works: ['title', 'medium', 'location', 'teaser'],
  artists: ['name', 'hook', 'timeline'],
  periods: ['name', 'years', 'music'],
};
let failures = 0;
let total = 0;
const fail = (message) => { console.error(`✗ ${message}`); failures++; };
const body = (text) => text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();
const paragraphs = (text) => body(text).split(/\n\s*\n/).filter((block) => !/^(?:#|[-*] )/.test(block)).length;

for (const [collection, required] of Object.entries(fields)) {
  const sourceDir = `${root}/src/content/${collection}`;
  const translatedDir = `${root}/src/translations/zh/${collection}`;
  const sources = (await readdir(sourceDir)).filter((file) => file.endsWith('.md'));
  const translations = (await readdir(translatedDir)).filter((file) => file.endsWith('.md'));
  for (const file of translations) {
    if (!sources.includes(file)) fail(`${collection}/${file}: translation has no English source`);
  }
  for (const file of sources) {
    const label = `zh/${collection}/${file}`;
    if (!translations.includes(file)) { fail(`${label}: missing translation`); continue; }
    const source = await readFile(`${sourceDir}/${file}`, 'utf8');
    const translated = await readFile(`${translatedDir}/${file}`, 'utf8');
    const frontmatter = translated.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatter) { fail(`${label}: missing frontmatter`); continue; }
    const keys = [...frontmatter[1].matchAll(/^(\w+):/gm)].map((match) => match[1]);
    for (const key of required) if (!keys.includes(key)) fail(`${label}: missing ${key}`);
    for (const key of keys) if (!required.includes(key)) fail(`${label}: unexpected field ${key}; structural data belongs to the original collection`);
    if (!/\p{Script=Han}/u.test(body(translated))) fail(`${label}: missing Chinese prose`);
    if (paragraphs(source) !== paragraphs(translated)) fail(`${label}: narrative paragraph count differs from source (${paragraphs(source)} / ${paragraphs(translated)})`);
    const bullets = (text) => [...body(text).matchAll(/^[-*] /gm)].length;
    if (bullets(source) !== bullets(translated)) fail(`${label}: fact list length differs from source`);
    if (collection === 'works') {
      const headings = [...body(translated).matchAll(/^## (.+)$/gm)].map((match) => match[1]);
      if (JSON.stringify(headings) !== JSON.stringify(sections)) fail(`${label}: expected four translated story sections`);
    }
    if (collection === 'artists') {
      const years = (text) => [...text.matchAll(/\byear:\s*(?:"([^"]*)"|'([^']*)'|([^,\n}]+))/g)]
        .map((match) => (match[1] ?? match[2] ?? match[3]).trim());
      if (JSON.stringify(years(source)) !== JSON.stringify(years(frontmatter[1]))) fail(`${label}: timeline years differ from source`);
    }
    if (collection === 'periods') {
      for (const key of ['file', 'sourceUrl', 'license']) {
        const values = (text) => [...text.matchAll(new RegExp(`^\\s*${key}:\\s*(.+)$`, 'gm'))]
          .map((match) => match[1].trim().replace(/^["']|["']$/g, ''));
        if (JSON.stringify(values(source)) !== JSON.stringify(values(frontmatter[1]))) fail(`${label}: music ${key} differs from source`);
      }
    }
    total++;
  }
}
if (failures) { console.error(`${failures} translation checks failed.`); process.exitCode = 1; }
else console.log(`✓ Chinese translations: ${total} complete entries, matching story sections, paragraphs and fact lists.`);
