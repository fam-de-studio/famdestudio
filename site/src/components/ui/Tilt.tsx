"use client";

import { useRef, type ReactNode } from "react";

/**
 * Light 3D tilt that follows the pointer (max ±`max` degrees) and eases back
 * on leave. Fine pointers only; inert under reduced motion.
 */
export function Tilt({ children, className = "", max = 5 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const ok = useRef<boolean | null>(null);

  const enabled = () => {
    if (ok.current === null) {
      ok.current =
        window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return ok.current;
  };

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !enabled()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = "transform 0.12s ease-out";
    el.style.transform = `perspective(1100px) rotateX(${(-py * max * 2).toFixed(2)}deg) rotateY(${(px * max * 2).toFixed(2)}deg) translateZ(6px)`;
    el.style.setProperty("--mx", `${((px + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${((py + 0.5) * 100).toFixed(1)}%`);
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.7s cubic-bezier(.2,.6,.2,1)";
    el.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) translateZ(0)";
  };

  return (
    <div ref={ref} className={`tilt ${className}`.trim()} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </div>
  );
}
