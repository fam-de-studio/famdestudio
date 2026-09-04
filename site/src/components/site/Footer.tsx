import Link from "next/link";
import { site } from "@/content/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink">
      <div className="container-x py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo />
            <p className="t-small mt-6 max-w-xs text-muted">{site.tagline}</p>
            <p className="t-serif mt-8 text-2xl leading-tight">
              Small Runs. <span className="t-italic text-champagne">Exceptional</span> Detail.
            </p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-3 lg:col-start-7">
            <ul className="flex flex-col gap-3">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="nav-link t-nav text-text/80 hover:text-text">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/work" className="nav-link t-nav text-text/80 hover:text-text">
                  All projects
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="t-eyebrow text-muted">Enquiries</p>
            <a href={`mailto:${site.email}`} className="link-line mt-4 inline-block text-[0.9375rem]">
              {site.email}
            </a>
            <p className="t-small mt-6 text-muted">
              Based in {site.location}. Working with brands internationally.
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-small text-muted">© {new Date().getFullYear()} {site.name}</p>
          <p className="t-eyebrow text-muted">Design · Structure · Print · Finishing</p>
        </div>
      </div>
    </footer>
  );
}
