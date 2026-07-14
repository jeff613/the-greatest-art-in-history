import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const WORKS_DIR = path.join(ROOT, 'src/content/works');
const ARTISTS_DIR = path.join(ROOT, 'src/content/artists');
const PERIODS_DIR = path.join(ROOT, 'src/content/periods');
const PUBLIC_DIR = path.join(ROOT, 'public');
const MIN_ART = 2500;
const MIN_PORTRAIT = 800;
const SECTIONS = [
  '## The Story',
  '## The World Behind It',
  '## The Artist at This Moment',
  '## Interesting Facts',
];

let failures = 0;
const fail = (msg) => {
  failures++;
  console.error('✗ ' + msg);
};

function frontmatterValue(text, key) {
  const m = text.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+)["']?\\s*$`, 'm'));
  return m ? m[1].trim() : null;
}

async function checkImage(label, contentDir, relPath, minEdge) {
  if (!relPath) return fail(`${label}: missing image path in frontmatter`);
  const abs = path.resolve(contentDir, relPath);
  try {
    const meta = await sharp(abs).metadata();
    const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
    if (longEdge < minEdge)
      fail(`${label}: ${relPath} long edge ${longEdge}px < required ${minEdge}px`);
  } catch {
    fail(`${label}: image unreadable at ${abs}`);
  }
}

async function mdFiles(dir) {
  try {
    return (await readdir(dir)).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
}

for (const f of await mdFiles(WORKS_DIR)) {
  const text = await readFile(path.join(WORKS_DIR, f), 'utf8');
  await checkImage(`works/${f}`, WORKS_DIR, frontmatterValue(text, 'image'), MIN_ART);
  for (const s of SECTIONS)
    if (!text.includes(s)) fail(`works/${f}: missing section "${s}"`);
}

for (const f of await mdFiles(ARTISTS_DIR)) {
  const text = await readFile(path.join(ARTISTS_DIR, f), 'utf8');
  await checkImage(
    `artists/${f}`,
    ARTISTS_DIR,
    frontmatterValue(text, 'portrait'),
    MIN_PORTRAIT
  );
}

for (const f of await mdFiles(PERIODS_DIR)) {
  const text = await readFile(path.join(PERIODS_DIR, f), 'utf8');
  for (const m of text.matchAll(/^\s*file:\s*["']?([^"'\n]+?)["']?\s*$/gm)) {
    const rel = m[1].trim();
    if (!rel.startsWith('/audio/')) {
      fail(`periods/${f}: music file "${rel}" must start with /audio/`);
      continue;
    }
    try {
      await stat(path.join(PUBLIC_DIR, rel));
    } catch {
      fail(`periods/${f}: audio file missing at public${rel}`);
    }
  }
}

if (failures > 0) {
  console.error(`${failures} problem(s) found`);
  process.exit(1);
}
console.log('✓ content checks passed');
