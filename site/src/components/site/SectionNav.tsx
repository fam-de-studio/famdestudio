"use client";

import { useEffect, useState } from "react";

const items = [
  { id: "top", label: "Start" },
  { id: "intro", label: "Studio" },
  { id: "work", label: "Work" },
  { id: "finishing", label: "Finishing" },
  { id: "structure", label: "Structure" },
  { id: "process", label: "Process" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

/** Desktop-only vertical section indicator on the right edge. */
export function SectionNav() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav className="section-nav" aria-label="Sections">
      {items.map((i) => (
        <a key={i.id} href={`#${i.id}`} aria-current={active === i.id ? "true" : undefined}>
          <span>{i.label}</span>
          <i aria-hidden />
        </a>
      ))}
    </nav>
  );
}
