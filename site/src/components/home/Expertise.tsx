import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { expertise, formats } from "@/content/studio";
import img from "@/images/folding-carton-collection-02.jpg";

export function Expertise() {
  return (
    <section id="expertise" className="section-y scroll-mt-20 bg-ink" aria-labelledby="expertise-title">
      <div className="container-x">
        <Reveal>
          <Eyebrow>Expertise</Eyebrow>
          <h2 id="expertise-title" className="t-h2 mt-8 text-muted">
            Not just design.
            <br />
            Not just print.
          </h2>
        </Reveal>

        <Reveal index={1} className="mt-10 lg:mt-14">
          <p className="t-display max-w-6xl text-[clamp(2.5rem,6.2vw,6.5rem)]">
            Packaging, understood
            <br className="hidden md:block" /> from <span className="t-italic">every</span> angle.
          </p>
        </Reveal>

        <div className="mt-20 grid gap-px border-y border-line md:grid-cols-3 lg:mt-28">
          {expertise.map((col, i) => (
            <Reveal
              key={col.title}
              index={i}
              className="border-b border-line py-10 md:border-b-0 md:border-r md:px-10 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
            >
              <h3 className="t-h3 uppercase tracking-[0.06em]">{col.title}</h3>
              <ul className="mt-8 space-y-3">
                {col.items.map((item) => (
                  <li key={item} className="t-body flex items-baseline gap-4 text-text/85">
                    <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-champagne/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid items-center gap-10 lg:mt-24 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="t-eyebrow text-champagne">Formats</p>
            <ul className="mt-6 flex flex-col">
              {formats.map((f) => (
                <li key={f} className="t-h3 border-b border-line py-4 first:border-t">
                  {f}
                </li>
              ))}
            </ul>
            <p className="t-small mt-6 max-w-sm text-muted">
              Every format is developed from a dieline the studio draws itself, so structure, artwork and finishing
              are resolved together before anything goes to press.
            </p>
          </Reveal>
          <Reveal variant="image" index={1} className="lg:col-span-7 lg:col-start-6">
            <Image
              src={img}
              alt="Six lidded folding cartons in ivory, burgundy, green, navy, taupe and black, each carrying the same ornament in a different finish"
              sizes="(min-width: 1024px) 58vw, 100vw"
              placeholder="blur"
              className="aspect-[4/3] w-full object-cover"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
