"use client";

import { useEffect, useRef, type ElementType, type ReactNode, type CSSProperties } from "react";

type Props = {
  children?: ReactNode;
  as?: ElementType;
  className?: string;
  /** "fade" = opacity+rise, "image" = clip reveal, "line" = scaleX rule */
  variant?: "fade" | "image" | "line";
  /** Stagger index (multiplied by 80ms). */
  index?: number;
  style?: CSSProperties;
  id?: string;
};

/**
 * Minimal IntersectionObserver reveal. Adds `is-in` once the element enters
 * the viewport. Motion itself is CSS-only and disabled by prefers-reduced-motion.
 *
 * The observed element is never itself clipped or scaled to zero: Chromium
 * computes the intersection rect after clip-path and transforms, so a fully
 * clipped target reports an intersectionRatio of 0 and never crosses the
 * threshold. For "image" and "line" the animation lives on an inner wrapper.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  variant = "fade",
  index = 0,
  style,
  id,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.unobserve(el);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const styleVars = { ...style, ["--i" as string]: index };

  if (variant === "image") {
    return (
      <Tag ref={ref} id={id} className={`reveal-img ${className}`.trim()} style={styleVars}>
        <div className="reveal-clip h-full w-full">{children}</div>
      </Tag>
    );
  }

  if (variant === "line") {
    return (
      <Tag ref={ref} id={id} className="reveal-line block w-full" style={styleVars}>
        <div className={className}>{children}</div>
      </Tag>
    );
  }

  return (
    <Tag ref={ref} id={id} className={`reveal ${className}`.trim()} style={styleVars}>
      {children}
    </Tag>
  );
}
