"use client";

import { useEffect, useState } from "react";

/**
 * A folding carton built from CSS 3D panels. Flat it reads as a dieline
 * (dashed creases); as `progress` rises the sides, back and flaps fold up,
 * then the finished box turns slightly to show its depth.
 */
export function FoldingCarton({ progress }: { progress: number }) {
  const fold = clamp((progress - 0.15) / 0.55); // 0.15 → 0.70 folding
  const turn = clamp((progress - 0.7) / 0.3); // 0.70 → 1.0 turning
  const a = fold * 90;
  const ry = -18 * turn + fold * -6;
  const rx = 12 * turn; // tilt so the closed top face is seen

  return (
    <div className="fold-stage flex items-center justify-center" aria-hidden>
      <div
        className="fold-box"
        style={{
          ["--fw" as string]: "clamp(120px, 14vw, 190px)",
          ["--fh" as string]: "clamp(200px, 24vw, 320px)",
          ["--fd" as string]: "clamp(52px, 6vw, 80px)",
          ["--a" as string]: `${a}deg`,
          ["--ry" as string]: `${ry}deg`,
          ["--rx" as string]: `${rx}deg`,
        }}
      >
        <div className="pn flap-t crease" />
        <div className="pn side-l crease">
          <div className="pn back crease" style={{ left: "auto", right: "100%", transformOrigin: "right center", transform: "rotateY(calc(var(--a, 0deg) * -1))", width: "var(--fw)" }}>
            <div className="mark text-[0.55rem] uppercase text-[rgba(20,20,20,.5)]">Back</div>
          </div>
        </div>
        <div className="pn side-r crease" />
        <div className="pn front">
          <div className="rule" style={{ top: "18%" }} />
          <div className="mark text-[clamp(0.9rem,1.4vw,1.25rem)]">
            <span>
              FAM
              <br />
              <span className="text-[0.45em] tracking-[0.3em]">DE STUDIO</span>
            </span>
          </div>
          <div className="rule" style={{ bottom: "18%" }} />
        </div>
        <div className="pn flap-b crease" />
      </div>
    </div>
  );
}

function clamp(v: number) {
  return Math.min(1, Math.max(0, v));
}

/** Drives progress from the scroll position of a tall wrapper. */
export function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const range = el.offsetHeight - window.innerHeight;
      setP(range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 1);
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
  }, [ref]);
  return p;
}
