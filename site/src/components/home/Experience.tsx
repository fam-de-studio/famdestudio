import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { timeline } from "@/content/studio";

export function Experience() {
  return (
    <section className="section-y border-t border-line bg-ink" aria-labelledby="experience-title">
      <div className="container-x">
        <Reveal>
          <Eyebrow>Experience</Eyebrow>
          <h2 id="experience-title" className="t-h2 mt-8">
            A working life in print
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="t-num text-[clamp(6rem,16vw,15rem)] leading-[0.85] tracking-[-0.02em]">1998</p>
            <p className="t-eyebrow mt-6 text-champagne">Where it started</p>
          </Reveal>

          <ol className="lg:col-span-6 lg:col-start-7">
            {timeline.map((t, i) => (
              <Reveal
                key={t.mark}
                as="li"
                index={i}
                className="grid gap-3 border-t border-line py-8 last:border-b sm:grid-cols-[9rem_1fr] sm:gap-8"
              >
                <div>
                  <p className="t-serif text-2xl uppercase tracking-[0.06em]">{t.mark}</p>
                  {"sub" in t && t.sub && <p className="t-eyebrow mt-2 text-champagne">{t.sub}</p>}
                </div>
                <div>
                  <h3 className="t-body font-medium">{t.title}</h3>
                  <p className="t-small mt-2 max-w-md text-muted">{t.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
