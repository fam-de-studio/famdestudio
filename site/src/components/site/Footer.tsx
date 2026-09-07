import Link from "next/link";
import { site } from "@/content/site";
import { LocalTime } from "./LocalTime";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink">
      <div className="container-x pt-20 lg:pt-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="t-eyebrow text-yellow">Let&rsquo;s make something exceptional</p>
            <a href={`mailto:${site.email}`} className="link-line t-h3 mt-5 inline-block">
              {site.email}
            </a>
            {site.whatsapp && (
              <p className="t-small mt-4 text-muted">
                WhatsApp {site.whatsapp} · {site.location}
              </p>
            )}
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
            <p className="t-eyebrow text-muted">Studio time</p>
            <p className="t-serif mt-3 text-3xl tabular-nums">
              <LocalTime />
            </p>
            <p className="t-small mt-1 text-muted">Lahore · GMT+5</p>
            <p className="t-serif mt-8 text-xl leading-tight">
              Small Runs. <span className="t-italic foil">Exceptional</span> Detail.
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-small text-muted">© {new Date().getFullYear()} {site.name} · Luxury Packaging Design &amp; Production</p>
          <p className="t-eyebrow text-muted">Design · Structure · Print · Finishing</p>
        </div>
      </div>

      <div className="container-x overflow-hidden pb-6 pt-4" aria-hidden>
        <div className="foot-mark">FAM DE STUDIO</div>
      </div>
    </footer>
  );
}
