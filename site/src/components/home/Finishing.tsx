"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Words } from "@/components/ui/Words";
import { finishes } from "@/content/finishes";

/**
 * The art of finishing as a sticky gallery: the close-up on the left stays
 * pinned and crossfades while the nine finishes scroll past on the right.
 * Under lg the same content stacks image-then-caption.
 */
export function Finishing() {
  const [active, setActive] = useState(0);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const els = itemsRef.current.filter(Boolean) as HTMLLIElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="finishing" className="section-y scroll-mt-20 border-t border-line bg-ink-2" aria-labelledby="finishing-title">
      <div className="container-x">
        <Reveal className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow>Finishing</Eyebrow>
            <h2 id="finishing-title" className="t-h1 mt-8">
              <Words text="The art of" /> <span className="w"><i className="t-italic foil">finishing</i></span>
            </h2>
          </div>
          <p className="t-lead text-muted lg:col-span-4 lg:col-start-9 lg:pt-4">
            The surface is where a box is judged: under the hand, in raking light, at the moment of opening. Nine
            processes the studio specifies, proofs and stands beside.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-12 lg:gap-12">
          {/* Sticky image (desktop) */}
          <div className="hidden lg:col-span-7 lg:block">
            <div className="fin-sticky overflow-hidden bg-ink">
              {finishes.map((f, i) => (
                <div key={f.slug} className="fin-img" data-active={i === active}>
                  <Image src={f.image} alt={f.alt} fill sizes="(min-width: 1024px) 58vw, 100vw" placeholder="blur" className="object-cover" />
                </div>
              ))}
              <div className="absolute bottom-6 left-6 flex items-center gap-4">
                <span className="t-num text-sm text-yellow">{String(active + 1).padStart(2, "0")}</span>
                <span className="h-px w-10 bg-yellow/60" />
                <span className="t-eyebrow text-text/80">{finishes[active].name}</span>
              </div>
            </div>
          </div>

          {/* Captions */}
          <ol className="lg:col-span-5">
            {finishes.map((f, i) => (
              <li
                key={f.slug}
                ref={(el) => {
                  itemsRef.current[i] = el;
                }}
                data-i={i}
                data-active={i === active}
                className="fin-item py-10"
              >
                <div className="sheen mb-6 overflow-hidden lg:hidden">
                  <Image src={f.image} alt={f.alt} sizes="100vw" placeholder="blur" className="aspect-[4/3] w-full object-cover" />
                </div>
                <span className="fin-num t-num text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="t-h2 mt-3 uppercase tracking-[0.04em] transition-colors duration-500">{f.name}</h3>
                <p className="fin-phys t-serif mt-3 text-xl italic leading-snug text-yellow transition-colors duration-500">{f.physical}</p>
                <p className="t-body mt-4 max-w-md text-muted">{f.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
