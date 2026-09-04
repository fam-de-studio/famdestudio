"use client";

import { useEffect, useRef } from "react";

/**
 * Two-part cursor: a solid dot that tracks the pointer exactly, and a ring
 * that follows with easing (lerp 0.12). Both grow over links and buttons.
 * Only on fine pointers with motion allowed; the native cursor is hidden
 * while active.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    if (!fine || !motionOk) return;

    document.body.classList.add("has-cursor");

    let mx = -200,
      my = -200,
      rx = -200,
      ry = -200;
    let raf = 0;

    const loop = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const move = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const hot = (e: Event) => {
      const t = e.target as HTMLElement | null;
      document.body.classList.toggle("cursor-hot", !!t?.closest("a, button, [data-cursor], label.chip, select"));
    };
    const leave = () => document.body.classList.add("cursor-out");
    const enter = () => document.body.classList.remove("cursor-out");

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", hot);
    document.documentElement.addEventListener("pointerleave", leave);
    document.documentElement.addEventListener("pointerenter", enter);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", hot);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.removeEventListener("pointerenter", enter);
      document.body.classList.remove("has-cursor", "cursor-hot", "cursor-out");
    };
  }, []);

  return (
    <>
      <div ref={dotRef} id="cursor" aria-hidden />
      <div ref={ringRef} id="cursor-ring" aria-hidden />
    </>
  );
}
