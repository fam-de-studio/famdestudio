import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Parallax } from "@/components/ui/Parallax";
import img from "@/images/hero-03.png";

export function SmallRuns() {
  return (
    <section className="relative overflow-hidden bg-ink" aria-labelledby="small-runs-title">
      <Parallax className="absolute inset-0" amount={0.08}>
        <Image
          src={img}
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          quality={70}
          className="scale-110 object-cover object-right"
        />
      </Parallax>
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,14,15,.96)_0%,rgba(14,14,15,.9)_35%,rgba(14,14,15,.55)_65%,rgba(14,14,15,.25)_100%)]"
      />
      <div className="container-x section-y relative">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow>Positioning</Eyebrow>
            <h2 id="small-runs-title" className="t-display mt-8">
              Small runs.
              <br />
              No <span className="t-italic foil">shortcuts.</span>
            </h2>
          </Reveal>
          <Reveal index={1} className="mt-12 max-w-xl space-y-6">
            <p className="t-lead">Luxury packaging is often associated with large production volumes.</p>
            <p className="t-lead">FAM De Studio takes a different approach.</p>
            <p className="t-body text-text/80">
              We work with brands that need smaller quantities without sacrificing the materials, finishing and
              attention to detail that make premium packaging feel truly premium.
            </p>
          </Reveal>
          <Reveal index={2} className="mt-12 flex flex-wrap items-center gap-8">
            <Link href="/#contact" className="t-nav bg-text px-7 py-4 text-ink transition-colors duration-500 hover:bg-champagne">
              Discuss your project
            </Link>
            <p className="t-eyebrow text-muted">
              50 <span className="mx-2 text-champagne">·</span> 100 <span className="mx-2 text-champagne">·</span> 250{" "}
              <span className="mx-2 text-champagne">·</span> 500 <span className="mx-2 text-champagne">·</span> 1,000
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
