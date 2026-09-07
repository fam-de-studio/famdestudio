"use client";

import { useEffect, useRef } from "react";

/**
 * One-time loading curtain: wordmark, counter, yellow bar, then it lifts.
 * Shown only on the first page view of a session, never under reduced motion.
 * Driven through the DOM (no React state) so it never blocks hydration.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem("fam-seen") === "1";
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
      el.remove();
      return;
    }
    document.documentElement.dataset.loading = "true";
    const start = performance.now();
    const dur = 1100;
    let raf = 0;
    let timer = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      barRef.current?.style.setProperty("--p", eased.toFixed(3));
      if (countRef.current) countRef.current.textContent = String(Math.round(eased * 100)).padStart(3, "0");
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        el.dataset.done = "true";
        try {
          sessionStorage.setItem("fam-seen", "1");
        } catch {}
        timer = window.setTimeout(() => {
          delete document.documentElement.dataset.loading;
          el.remove();
        }, 950);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      delete document.documentElement.dataset.loading;
    };
  }, []);

  return (
    <div ref={root} className="preloader" aria-hidden>
      <div className="text-center">
        <div className="pl-mark">FAM</div>
        <div className="pl-sub t-eyebrow">De Studio · Luxury Packaging</div>
      </div>
      <span ref={countRef} className="pl-count">
        000
      </span>
      <div ref={barRef} className="pl-bar" />
    </div>
  );
}
