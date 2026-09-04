/**
 * Pre-generates responsive WebP variants for every image in src/images so
 * nothing is encoded at request time. Output: public/img/<name>-<hash>-<w>.webp
 * plus src/lib/image-manifest.json consumed by src/lib/image-loader.ts.
 *
 * Runs automatically before `next build` and `next dev` (see package.json).
 * Idempotent: existing variants are skipped, stale ones removed.
 */
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SRC = new URL("../src/images/", import.meta.url);
const OUT = new URL("../public/img/", import.meta.url);
const MANIFEST = new URL("../src/lib/image-manifest.json", import.meta.url);

const WIDTHS = [480, 768, 1080, 1440, 1920];
const QUALITY = 82; // WebP: visually transparent for photography
const QUALITY_HERO = 86;

await mkdir(OUT, { recursive: true });
await mkdir(new URL("../src/lib/", import.meta.url), { recursive: true });

const files = (await readdir(SRC)).filter((f) => /\.(png|jpe?g)$/i.test(f));
const manifest = {};
const keep = new Set();
let made = 0;

for (const file of files) {
  const base = basename(file, extname(file));
  const buf = await readFile(new URL(file, SRC));
  const hash = createHash("md5").update(buf).digest("hex").slice(0, 8);
  const meta = await sharp(buf).metadata();
  const srcW = meta.width ?? 1920;
  const widths = [...new Set([...WIDTHS.filter((w) => w < srcW), Math.min(srcW, 1920)])].sort((a, b) => a - b);
  const quality = base.startsWith("hero") ? QUALITY_HERO : QUALITY;

  manifest[base] = { hash, widths, width: srcW, height: meta.height };

  for (const w of widths) {
    const name = `${base}-${hash}-${w}.webp`;
    keep.add(name);
    const target = new URL(name, OUT);
    try {
      await stat(target);
      continue; // already built for this content hash
    } catch {}
    await sharp(buf)
      .resize({ width: w, withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
      .webp({ quality, effort: 5, smartSubsample: true })
      .toFile(fileURLToPath(target));
    made++;
  }
}

// Remove variants whose source changed or disappeared
for (const f of await readdir(OUT)) {
  if (f.endsWith(".webp") && !keep.has(f)) await rm(new URL(f, OUT));
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

let total = 0;
for (const f of keep) total += (await stat(new URL(f, OUT))).size;
console.log(`images: ${files.length} sources, ${keep.size} variants (${made} new), ${(total / 1024 / 1024).toFixed(1)} MB total`);
