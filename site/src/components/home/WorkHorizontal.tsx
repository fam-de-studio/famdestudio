"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/content/projects";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Dots } from "@/components/ui/Spec";

/**
 * Pinned horizontal showcase. The section is tall; an inner 100vh panel
 * sticks while the track slides left 1px per 1px scrolled (pure scroll math,
 * no library). On touch / narrow / reduced-motion the same track becomes a
 * native horizontal scroller with snap points.
 */
export function WorkHorizontal({ projects }: { projects: Project[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    const mq = window.matchMedia("(min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference)");
    let raf = 0;
    let total = 0;
    let enabled = false;

    const measure = () => {
      enabled = mq.matches;
      setPinned(enabled);
      if (!enabled) {
        wrap.style.height = "";
        track.style.transform = "";
        return;
      }
      total = Math.max(0, track.scrollWidth - track.clientWidth);
      wrap.style.height = `${window.innerHeight + total}px`;
      update();
    };

    const update = () => {
      raf = 0;
      if (!enabled) return;
      const rect = wrap.getBoundingClientRect();
      const range = wrap.offsetHeight - window.innerHeight;
      const p = range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0;
      track.style.transform = `translate3d(${(-p * total).toFixed(1)}px, 0, 0)`;
      setActive(Math.round(p * (projects.length - 1)));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onNativeScroll = () => {
      if (enabled) return;
      const cards = track.querySelectorAll<HTMLElement>("[data-card]");
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      cards.forEach((c, i) => {
        if (c.offsetLeft <= mid) best = i;
      });
      setActive(best);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    mq.addEventListener("change", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    track.addEventListener("scroll", onNativeScroll, { passive: true });
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      track.removeEventListener("scroll", onNativeScroll);
      cancelAnimationFrame(raf);
    };
  }, [projects.length]);

  return (
    <div ref={wrapRef} className="relative" data-pinned={pinned}>
      <div className={`flex flex-col ${pinned ? "sticky top-0 h-dvh overflow-hidden" : ""}`}>
        {/* Header */}
        <div className="container-x flex flex-wrap items-end justify-between gap-6 pt-24 lg:pt-28">
          <div>
            <Eyebrow>Case studies</Eyebrow>
            <h2 id="work-title" className="t-h1 mt-6">
              Selected <span className="t-italic foil">work</span>
            </h2>
          </div>
          <div className="flex items-center gap-5 lg:pb-3" aria-hidden>
            <span className="flex items-center gap-2">
              {projects.map((p, i) => (
                <i
                  key={p.slug}
                  className={`block h-px transition-all duration-500 ${
                    i === active ? "w-8 bg-champagne" : "w-3 bg-line-strong"
                  }`}
                />
              ))}
            </span>
            <span className="t-eyebrow t-num tabular-nums text-muted">
              {String(active + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          data-pinned={pinned}
          className={`htrack mt-8 flex items-start gap-6 lg:mt-10 lg:gap-8 ${
            pinned ? "will-change-transform" : "snap-x snap-mandatory overflow-x-auto"
          }`}
          style={{ paddingInline: "var(--gutter)" }}
        >
          {projects.map((p, i) => (
            <article
              key={p.slug}
              data-card
              className="hcard shrink-0 snap-start"
            >
              <Link href={`/work/${p.slug}`} className="group block" data-cursor="view">
                <div className="hmedia sheen hover-zoom relative overflow-hidden bg-ink-2">
                  <Image
                    src={p.cover.src}
                    alt={p.cover.alt}
                    sizes="(min-width: 1024px) 60vw, 80vw"
                    placeholder="blur"
                    priority={i === 0}
                    className="h-full w-full object-cover"
                  />
                  <span
                    aria-hidden
                    className="t-num absolute left-6 top-5 text-[0.8125rem] tracking-[0.1em] text-text/80 mix-blend-difference"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-5 flex items-start justify-between gap-6">
                  <div>
                    <h3 className="t-h3 uppercase tracking-[0.04em] transition-colors duration-500 group-hover:text-champagne">
                      {p.name}
                    </h3>
                    <p className="t-small mt-2 text-muted">
                      <Dots items={p.finishes} />
                    </p>
                  </div>
                  <span className="t-eyebrow mt-2 hidden shrink-0 text-muted sm:block">{p.quantity}</span>
                </div>
              </Link>
            </article>
          ))}

          {/* End card */}
          <div data-card className="hcard hcard-end flex shrink-0 snap-start items-center" style={{ paddingRight: "var(--gutter)" }}>
            <div className="border-l border-line pl-8">
              <p className="t-serif text-2xl leading-snug text-muted">
                Two more studies in the archive, including the studio&rsquo;s own finishing library.
              </p>
              <Link href="/work" className="link-line t-nav mt-8 inline-flex" data-cursor="link">
                View all projects
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
                  <path d="M0 5h12M8.5 1 13 5l-4.5 4" stroke="currentColor" strokeWidth="1" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <p className="container-x t-eyebrow mt-6 pb-6 text-muted lg:mt-auto" aria-hidden>
          {pinned ? "Scroll to move sideways" : "Swipe sideways"}
        </p>
      </div>
    </div>
  );
}
