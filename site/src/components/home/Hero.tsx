import Image from "next/image";
import Link from "next/link";
import hero from "@/images/hero-01.png";
import { Parallax } from "@/components/ui/Parallax";

export function Hero() {
  return (
    <section className="relative flex min-h-dvh items-end overflow-hidden bg-ink" aria-labelledby="hero-title">
      <Parallax className="absolute inset-0" amount={0.12}>
        <div className="hero-img absolute inset-0">
          <Image
            src={hero}
            alt="Black rigid boxes and cartons with ornate gold foil, gloss spot UV, blind deboss and a holographic carton, photographed in a dark studio"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={82}
            className="object-cover object-[72%_center] md:object-center"
          />
        </div>
      </Parallax>
      {/* Vignette so the type stays legible over the boxes on small screens */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,14,15,.45)_0%,rgba(14,14,15,0)_30%,rgba(14,14,15,0)_50%,rgba(14,14,15,.85)_100%)] md:bg-[linear-gradient(90deg,rgba(14,14,15,.75)_0%,rgba(14,14,15,.35)_40%,rgba(14,14,15,0)_70%),linear-gradient(180deg,rgba(14,14,15,.3)_0%,rgba(14,14,15,0)_25%,rgba(14,14,15,.7)_100%)]"
      />

      <div className="container-x relative z-10 w-full pb-14 pt-40 md:pb-20">
        <div className="max-w-4xl">
          <p className="t-eyebrow reveal is-in text-champagne" style={{ ["--i" as string]: 1 }}>
            Luxury packaging design &amp; production
          </p>
          <h1 id="hero-title" className="t-display reveal is-in mt-8" style={{ ["--i" as string]: 2 }}>
            Luxury packaging
            <br />
            made to be <span className="t-italic foil">felt.</span>
          </h1>
          <p className="t-lead reveal is-in mt-8 max-w-xl text-text/85" style={{ ["--i" as string]: 3 }}>
            Premium packaging design and production for brands that care about every detail.
          </p>
          <p className="t-eyebrow reveal is-in mt-8 text-muted" style={{ ["--i" as string]: 4 }}>
            Design <span className="mx-2 text-champagne">·</span> Structure <span className="mx-2 text-champagne">·</span>{" "}
            Print <span className="mx-2 text-champagne">·</span> Finishing
          </p>
          <div className="reveal is-in mt-10 flex flex-wrap gap-4" style={{ ["--i" as string]: 5 }}>
            <Link href="/#work" className="t-nav bg-text px-7 py-4 text-ink transition-colors duration-500 hover:bg-champagne">
              Explore our work
            </Link>
            <Link
              href="/#contact"
              className="t-nav border border-line-strong px-7 py-4 transition-colors duration-500 hover:border-champagne hover:text-champagne"
            >
              Start a project
            </Link>
          </div>
        </div>

        <div className="mt-14 flex items-center gap-4 text-muted md:absolute md:bottom-20 md:right-[var(--gutter)] md:mt-0">
          <span className="t-eyebrow">Scroll to explore</span>
          <span aria-hidden className="scroll-hint block h-10 w-px bg-champagne" />
        </div>
      </div>
    </section>
  );
}
