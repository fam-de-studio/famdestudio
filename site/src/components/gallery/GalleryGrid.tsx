"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Reveal } from "@/components/ui/Reveal";
import {
  gallery,
  galleryCategories,
  type GalleryCategory,
} from "@/content/gallery";

type Filter = "all" | GalleryCategory;

/**
 * Full gallery: category tabs, a CSS-columns masonry and a lightbox.
 * Tiles are buttons; the lightbox is a modal dialog with keyboard support.
 */
export function GalleryGrid() {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(null);
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);

  const items =
    filter === "all" ? gallery : gallery.filter((g) => g.category === filter);
  const current = open === null ? null : items[open];

  const count = items.length;

  function close() {
    setOpen((i) => {
      if (i !== null) tileRefs.current[i]?.focus();
      return null;
    });
  }
  function step(d: number) {
    setOpen((i) => (i === null ? null : (i + d + count) % count));
  }

  useEffect(() => {
    if (open === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen((i) => {
          if (i !== null) tileRefs.current[i]?.focus();
          return null;
        });
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const d = e.key === "ArrowRight" ? 1 : -1;
        setOpen((i) => (i === null ? null : (i + d + count) % count));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, count]);

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    ...galleryCategories,
  ];

  return (
    <>
      <div
        role="tablist"
        aria-label="Gallery categories"
        className="flex flex-wrap gap-x-8 gap-y-3"
      >
        {tabs.map((c) => {
          const active = filter === c.key;
          return (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setFilter(c.key);
                setOpen(null);
              }}
              className={`t-nav relative pb-2 transition-colors duration-500 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:bg-champagne after:transition-transform after:duration-500 ${
                active
                  ? "text-text after:scale-x-100"
                  : "text-muted after:scale-x-0 hover:text-text"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <ul
        key={filter}
        className="mt-12 columns-2 gap-4 md:columns-3 md:gap-5 lg:columns-4 lg:mt-16"
        aria-label="Gallery"
      >
        {items.map((g, i) => (
          <li key={g.id} className="mb-4 break-inside-avoid md:mb-6">
            <Reveal index={i % 3}>
              <button
                type="button"
                ref={(el) => {
                  tileRefs.current[i] = el;
                }}
                onClick={() => setOpen(i)}
                className="group block w-full text-left"
                data-cursor="view"
                aria-label={`Open: ${g.caption.join(", ")}`}
              >
                <span className="sheen hover-zoom block overflow-hidden bg-ink-2">
                  <Image
                    src={g.src}
                    alt={g.alt}
                    sizes="(min-width: 1024px) 23vw, (min-width: 768px) 30vw, 48vw"
                    placeholder="blur"
                    className="h-auto w-full object-cover"
                  />
                </span>
                <span className="t-small mt-3 block text-muted transition-colors duration-500 group-hover:text-champagne">
                  {g.caption.join(" · ")}
                </span>
              </button>
            </Reveal>
          </li>
        ))}
      </ul>

      {/* Portal: the page wrapper animates with a transform, which would make
          position:fixed resolve against it instead of the viewport. */}
      {current &&
        open !== null &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={current.caption.join(", ")}
            className="fixed inset-0 z-[90] flex flex-col bg-ink/95 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <div className="flex items-center justify-between px-5 py-4 md:px-8">
              <span className="t-num text-sm text-yellow">
                {String(open + 1).padStart(2, "0")} /{" "}
                {String(items.length).padStart(2, "0")}
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="t-nav link-line"
                aria-label="Close"
              >
                Close
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-5 md:px-20">
              <Image
                key={current.id}
                src={current.src}
                alt={current.alt}
                sizes="100vw"
                placeholder="blur"
                className="max-h-full w-auto max-w-full object-contain"
                priority
              />
              <button
                type="button"
                onClick={() => step(-1)}
                className="t-nav absolute left-2 top-1/2 -translate-y-1/2 p-4 text-text/70 hover:text-text md:left-6"
                aria-label="Previous image"
              >
                &larr;
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className="t-nav absolute right-2 top-1/2 -translate-y-1/2 p-4 text-text/70 hover:text-text md:right-6"
                aria-label="Next image"
              >
                &rarr;
              </button>
            </div>
            <p className="t-small px-5 py-5 text-center text-muted md:px-8">
              {current.caption.join(" · ")}
            </p>
          </div>,
          document.body,
        )}
    </>
  );
}
