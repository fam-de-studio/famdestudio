"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { Logo } from "./Logo";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-700 ${
          scrolled || open
            ? "border-b border-line bg-ink/90 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="container-x flex h-[4.5rem] items-center justify-between lg:h-20">
          <Logo />

          <nav
            aria-label="Primary"
            className="hidden items-center gap-9 lg:flex"
          >
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link t-nav text-text/85 hover:text-text"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={site.cta.href}
              className="t-nav btn-yellow font-bold ml-3 px-5 py-3"
            >
              {site.cta.label}
            </Link>
          </nav>

          <button
            type="button"
            className="relative -mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`absolute h-px w-6 bg-text transition-transform duration-500 ${
                open ? "rotate-45" : "-translate-y-[4px]"
              }`}
            />
            <span
              className={`absolute h-px w-6 bg-text transition-transform duration-500 ${
                open ? "-rotate-45" : "translate-y-[4px]"
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile menu: a sibling of the header, because the header's backdrop
          blur would otherwise become the containing block for this fixed panel. */}
      <div
        id="mobile-menu"
        className={`fixed inset-x-0 bottom-0 top-[4.5rem] z-40 bg-ink transition-[opacity,visibility] duration-500 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        aria-hidden={!open}
      >
        <nav
          aria-label="Mobile"
          className="container-x flex h-full flex-col justify-between py-10"
        >
          <ul className="flex flex-col">
            {site.nav.map((item, i) => (
              <li
                key={item.href}
                className="border-b border-line"
                style={{
                  transition:
                    "opacity .6s var(--ease-out-expo), transform .6s var(--ease-out-expo)",
                  transitionDelay: open ? `${80 + i * 60}ms` : "0ms",
                  opacity: open ? 1 : 0,
                  transform: open ? "none" : "translateY(12px)",
                }}
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="t-h2 flex items-baseline justify-between py-5"
                  tabIndex={open ? 0 : -1}
                >
                  {item.label}
                  <span className="t-num text-sm text-muted">0{i + 1}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-6">
            <Link
              href={site.cta.href}
              onClick={() => setOpen(false)}
              className="t-nav btn-yellow font-bold inline-flex justify-center px-7 py-5"
              tabIndex={open ? 0 : -1}
            >
              {site.cta.label}
            </Link>
            <a
              href={`mailto:${site.email}`}
              className="t-small text-muted"
              tabIndex={open ? 0 : -1}
            >
              {site.email}
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
