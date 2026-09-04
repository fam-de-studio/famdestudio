import manifest from "./image-manifest.json";

type Entry = { hash: string; widths: number[]; width: number; height: number };
const entries = manifest as Record<string, Entry>;

/**
 * next/image loader that maps statically imported sources to the WebP
 * variants pre-built by scripts/optimize-images.mjs. No request-time
 * encoding: every URL is an immutable static file under /public/img.
 * Unknown sources (anything not in src/images) fall through untouched.
 */
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  // "/_next/static/media/hero-01.2d2w_svmunnx4.png" -> "hero-01"
  const m = src.match(/\/([^/]+?)\.[0-9a-z_-]{6,}\.(?:png|jpe?g|webp|avif)$/i);
  const base = m?.[1];
  const entry = base ? entries[base] : undefined;
  if (!entry) return src;
  const w = entry.widths.find((x) => x >= width) ?? entry.widths[entry.widths.length - 1];
  return `/img/${base}-${entry.hash}-${w}.webp`;
}
