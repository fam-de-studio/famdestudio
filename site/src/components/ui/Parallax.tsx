"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Subtle vertical parallax driven by scroll position, rAF-throttled.
 * `amount` is the fraction of scrolled distance the child moves (0.1 = 10%).
 * Disabled under prefers-reduced-motion.
 */
export function Parallax({
  children,
  amount = 0.1,
  className = "",
}: {
  children: ReactNode;
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      // Only compute while in/near viewport
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      const offset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * amount;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [amount]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
