"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import hero1 from "@/images/hero-01.png";
import hero2 from "@/images/hero-02.jpg";
import hero3 from "@/images/hero-03.png";

const frames = [
  { img: hero1, word: "Design", alt: "Black rigid boxes and cartons with ornate gold foil, gloss spot UV, blind deboss and a holographic carton in a dark studio" },
  { img: hero2, word: "Structure", alt: "A collection of black rigid boxes and cartons with gold foil, blind deboss and gloss spot UV finishes" },
  { img: hero3, word: "Finishing", alt: "Black cartons seen from above with gold foil ornament, deboss and a holographic cube" },
];

/**
 * Scroll story: the hero pins for ~2 screens while three studio images
 * crossfade and the closing word changes (Design → Structure → Finishing).
 * With reduced motion or no scroll the first frame simply stays.
 */
export function Hero() {
  const wrap = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const range = el.offsetHeight - window.innerHeight;
      const prog = range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0;
      setP(prog);
      setIdx(Math.min(frames.length - 1, Math.floor(prog * frames.length)));
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
  }, []);

  return (
    <section ref={wrap} id="top" className="hero-story relative bg-ink" aria-labelledby="hero-title">
      <div className="hs-panel">
        {frames.map((f, i) => (
          <div key={f.word} className="hs-img" data-active={i === idx}>
            <Image
              src={f.img}
              alt={f.alt}
              fill
              priority={i === 0}
              fetchPriority={i === 0 ? "high" : "auto"}
              sizes="100vw"
              className="object-cover object-[70%_center] md:object-center"
            />
          </div>
        ))}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,14,15,.5)_0%,rgba(14,14,15,0)_35%,rgba(14,14,15,0)_50%,rgba(14,14,15,.9)_100%)] md:bg-[linear-gradient(90deg,rgba(14,14,15,.82)_0%,rgba(14,14,15,.4)_42%,rgba(14,14,15,0)_72%),linear-gradient(180deg,rgba(14,14,15,.35)_0%,rgba(14,14,15,0)_25%,rgba(14,14,15,.75)_100%)]"
        />

        <div className="container-x relative z-10 flex h-full flex-col justify-end pb-12 pt-32 md:pb-16">
          <p className="t-eyebrow reveal is-in text-yellow" style={{ ["--i" as string]: 1 }}>
            Luxury packaging design &amp; production · Lahore
          </p>
          <h1 id="hero-title" className="t-display reveal is-in mt-7 max-w-[12ch]" style={{ ["--i" as string]: 2 }}>
            Luxury packaging made to be <span className="t-italic foil">felt.</span>
          </h1>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-8">
            <div className="reveal is-in max-w-xl" style={{ ["--i" as string]: 3 }}>
              <p className="t-lead text-text/85">
                Rigid boxes, premium cartons and fine finishing for brands that order in the hundreds, not the
                hundred thousands.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/#work" className="t-nav btn-yellow font-bold px-7 py-4">
                  Explore our work
                </Link>
                <Link href="/#contact" className="t-nav border border-line-strong px-7 py-4 transition-colors duration-500 hover:border-yellow hover:text-yellow">
                  Start a project
                </Link>
              </div>
            </div>

            <div className="reveal is-in flex items-center gap-5" style={{ ["--i" as string]: 4 }}>
              <div className="hs-ring" aria-hidden>
                <i />
              </div>
              <div>
                <p className="t-eyebrow text-muted">
                  {String(idx + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}
                </p>
                <p className="t-h3 hs-word mt-1 uppercase tracking-[0.06em]" aria-live="polite">
                  {frames.map((f, i) => (
                    <span key={f.word} data-active={i === idx}>
                      {f.word}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>

          <div aria-hidden className="mt-8 h-px w-full bg-line">
            <div className="h-full bg-yellow" style={{ width: `${Math.round(p * 100)}%`, transition: "width 0.2s linear" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
