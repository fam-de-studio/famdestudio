import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { finishes } from "@/content/finishes";

/**
 * The tactile showcase. Large close-ups, each captioned like a swatch card:
 * name, what the hand feels, and a short technical note.
 * Layout alternates: large finishes span 8 columns with the note beside;
 * standard finishes sit in a 2-up grid.
 */
export function Finishing() {
  const large = finishes.filter((f) => f.size === "large");
  const standard = finishes.filter((f) => f.size === "standard");
  const [foil, metal, rigid] = large;

  return (
    <section id="finishing" className="section-y scroll-mt-20 border-t border-line bg-ink-2" aria-labelledby="finishing-title">
      <div className="container-x">
        <Reveal className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow>Finishing</Eyebrow>
            <h2 id="finishing-title" className="t-h1 mt-8">
              The art of <span className="t-italic foil">finishing</span>
            </h2>
          </div>
          <p className="t-lead text-muted lg:col-span-4 lg:col-start-9 lg:pt-4">
            The surface is where a box is judged. Under the hand, in raking light, at the moment of opening. These
            are the processes the studio specifies, proofs and supervises.
          </p>
        </Reveal>

        {/* 01 — Hot foil, hero of the section */}
        <FeatureRow finish={foil} index={0} />

        {/* 2-up grid: emboss / deboss / spot uv / textured uv */}
        <div className="mt-20 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:mt-28">
          {standard.slice(0, 4).map((f, i) => (
            <Swatch key={f.slug} finish={f} index={i % 2} className={i % 2 === 1 ? "md:pt-24" : ""} />
          ))}
        </div>

        {/* Metalized */}
        <FeatureRow finish={metal} index={0} flip />

        {/* drip-off / soft touch */}
        <div className="mt-20 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:mt-28">
          {standard.slice(4).map((f, i) => (
            <Swatch key={f.slug} finish={f} index={i} className={i === 1 ? "md:pt-24" : ""} />
          ))}
        </div>

        {/* Rigid box construction */}
        <FeatureRow finish={rigid} index={0} />
      </div>
    </section>
  );
}

function FeatureRow({
  finish,
  index,
  flip = false,
}: {
  finish: (typeof finishes)[number];
  index: number;
  flip?: boolean;
}) {
  return (
    <div className="mt-20 grid items-end gap-8 lg:mt-28 lg:grid-cols-12">
      <Reveal
        variant="image"
        index={index}
        className={`sheen hover-zoom overflow-hidden lg:col-span-8 ${flip ? "lg:order-2 lg:col-start-5" : ""}`}
      >
        <Image
          src={finish.image}
          alt={finish.alt}
          sizes="(min-width: 1024px) 66vw, 100vw"
          placeholder="blur"
          className="aspect-[4/3] w-full object-cover"
        />
      </Reveal>
      <Reveal index={index + 1} className={`lg:col-span-4 lg:pb-2 ${flip ? "lg:order-1" : ""}`}>
        <Caption finish={finish} />
      </Reveal>
    </div>
  );
}

function Swatch({
  finish,
  index,
  className = "",
}: {
  finish: (typeof finishes)[number];
  index: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <Reveal variant="image" index={index} className="sheen hover-zoom overflow-hidden">
        <Image
          src={finish.image}
          alt={finish.alt}
          sizes="(min-width: 768px) 50vw, 100vw"
          placeholder="blur"
          className="aspect-[4/3] w-full object-cover"
        />
      </Reveal>
      <Reveal index={index + 1} className="mt-6">
        <Caption finish={finish} compact />
      </Reveal>
    </div>
  );
}

function Caption({ finish, compact = false }: { finish: (typeof finishes)[number]; compact?: boolean }) {
  return (
    <div className="crop-marks border-t border-line pt-5 text-text">
      <h3 className={`${compact ? "t-h3" : "t-h2"} uppercase tracking-[0.04em]`}>{finish.name}</h3>
      <p className="t-serif mt-3 text-lg italic leading-snug text-champagne">{finish.physical}</p>
      <p className={`t-small mt-4 text-muted ${compact ? "max-w-md" : "max-w-lg sm:text-[0.9375rem]"}`}>
        {finish.description}
      </p>
    </div>
  );
}
