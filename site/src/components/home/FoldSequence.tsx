"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { foldFrames } from "@/content/fold-frames";
import imageLoader from "@/lib/image-loader";

/**
 * Scroll-scrubbed image sequence: the carton goes from dieline to finished
 * box as `progress` runs 0 to 1. Frames are drawn on a canvas so scrubbing is
 * flicker-free; the first frame is a normal next/image poster until the set
 * has loaded. Frames are white-backed renders, blended with multiply so the
 * white disappears into the ivory surface.
 */
export function FoldSequence({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgs = useRef<HTMLImageElement[]>([]);
  const [ready, setReady] = useState(false);

  const width = foldFrames[0].width;
  const height = foldFrames[0].height;

  // Preload every frame once the component mounts (the section is far down
  // the page, so this happens well before it scrolls into view).
  useEffect(() => {
    const w = window.innerWidth >= 1024 ? 1024 : 768;
    let loaded = 0;
    let cancelled = false;
    imgs.current = foldFrames.map((f) => {
      const img = new window.Image();
      img.decoding = "async";
      img.onload = () => {
        loaded += 1;
        if (!cancelled && loaded === foldFrames.length) setReady(true);
      };
      img.src = imageLoader({ src: f.src, width: w });
      return img;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Draw the frame for the current progress.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!ready || !canvas) return;
    const last = foldFrames.length - 1;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const i = reduce ? last : Math.round(Math.min(1, Math.max(0, progress)) * last);
    const img = imgs.current[i];
    if (!img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, [progress, ready]);

  // The sticky scene is its own stacking context, so the blend needs the
  // ivory backdrop inside this element rather than on the section.
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-[640px] bg-ivory" style={{ isolation: "isolate" }} aria-hidden>
      <Image
        src={foldFrames[0]}
        alt=""
        sizes="(min-width: 1024px) 40vw, 90vw"
        placeholder="blur"
        priority={false}
        className={`absolute inset-0 h-full w-full object-contain mix-blend-multiply transition-opacity duration-300 ${ready ? "opacity-0" : "opacity-100"}`}
      />
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`absolute inset-0 h-full w-full mix-blend-multiply ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
