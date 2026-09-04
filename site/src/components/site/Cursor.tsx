"use client";

import { useEffect, useRef } from "react";

/**
 * Desktop-only cursor ring. Rendered via CSS only when (pointer: fine) and
 * motion is allowed; otherwise the element is display:none.
 * Grows and shows "View" over elements marked data-cursor="view".
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    if (!fine || !motionOk) return;

    let x = -100;
    let y = -100;
    let raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
          raf = 0;
        });
      }
      const t = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      el.dataset.mode = t?.dataset.cursor === "view" ? "view" : "";
    };
    const leave = () => (el.dataset.mode = "hidden");
    const enter = () => (el.dataset.mode = "");

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    document.documentElement.addEventListener("pointerenter", enter);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.removeEventListener("pointerenter", enter);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="cursor-ring hidden [@media(pointer:fine)]:grid" aria-hidden data-mode="hidden">
      <span className="label">View</span>
    </div>
  );
}
