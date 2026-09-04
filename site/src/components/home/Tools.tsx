import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { tools } from "@/content/studio";

export function Tools() {
  return (
    <section className="surface-ivory section-y" aria-labelledby="tools-title">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Eyebrow>Tools</Eyebrow>
            <h2 id="tools-title" className="t-h1 mt-8">
              Tools are only part of the <span className="t-italic">craft.</span>
            </h2>
            <p className="t-body mt-8 max-w-md text-muted">
              Software draws the line. Experience knows whether the line will crease cleanly, hold a foil, or crack
              on a 350 gsm board. The studio&rsquo;s value is in the second part.
            </p>
          </Reveal>

          <div className="lg:col-span-6 lg:col-start-7">
            <dl className="divide-y divide-line-d border-y border-line-d">
              {tools.map((group, i) => (
                <Reveal key={group.title} index={i} className="grid gap-3 py-7 sm:grid-cols-[8rem_1fr] sm:gap-8">
                  <dt className="t-eyebrow pt-1 text-champagne">{group.title}</dt>
                  <dd className="flex flex-wrap gap-x-8 gap-y-2">
                    {group.items.map((item) => (
                      <span key={item} className="t-h3">
                        {item}
                      </span>
                    ))}
                  </dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
