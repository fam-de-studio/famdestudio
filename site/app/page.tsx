import Image from 'next/image'
import { Effects } from '@/components/Effects'
import { InquiryForm } from '@/components/InquiryForm'
import { SITE, FINISHES, STEPS, NUMBERS } from '@/content/site'
import { readWork } from '@/lib/work'

const Rule = () => <hr className="rule" />
const Wrap = ({ children }: { children: React.ReactNode }) => (
  <div className="relative z-[2] mx-auto max-w-[1020px] px-6 sm:px-10">{children}</div>
)

export default function Page() {
  const work = readWork()

  return (
    <main>
      <Effects />

      <Wrap>
        <header className="flex items-center justify-between py-6">
          <span className="foil font-display text-xl">{SITE.name}</span>
          <span className="eyebrow">{SITE.city}</span>
        </header>
      </Wrap>
      <Rule />

      {/* Hero */}
      <div className="relative">
        <div className="pool" />
        <Wrap>
          <section className="relative py-24 sm:py-28">
            <p className="eyebrow rise mb-6">
              Hot foil · Drip-off · Metalized · <span className="holo">Holographic</span>
            </p>
            <h1 className="rise font-display max-w-[13ch] text-[42px] leading-[1.02] tracking-tight sm:text-[64px] lg:text-[80px]">
              The fine work most printers <span className="foil">won&apos;t attempt.</span>
            </h1>
            <p className="rise mt-7 max-w-[50ch] text-lg" style={{ color: 'var(--dim)' }}>
              Decorative packaging for small premium brands — designed and produced in Pakistan.
              Twenty-eight years at the press, from 200 pieces, delivered to your door.
            </p>
            <div className="rise mt-9">
              <a className="cta" href="#enquire">Send your logo — get a free 3D visual</a>
              <p className="mt-4 text-[13.5px]" style={{ color: 'var(--dimmer)' }}>No cost. No obligation.</p>
            </div>
          </section>
        </Wrap>
      </div>
      <Rule />

      {/* Selected work — renders only when content/work has entries */}
      {work.length > 0 && (
        <>
          <Wrap>
            <section className="py-24">
              <p className="eyebrow rise mb-7">Selected work</p>
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {work.map((w, i) => (
                  <div key={w.title} className="rise" style={{ transitionDelay: `${i * 0.12}s` }}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded border" style={{ borderColor: 'var(--hair-2)' }}>
                      <Image src={w.image} alt={w.title} fill className="object-cover" />
                    </div>
                    <p className="eyebrow mt-4 mb-2 !text-[10.5px]">{w.finishes.join(' · ')}</p>
                    <p className="text-[14.5px]" style={{ color: 'var(--dim)' }}>{w.caption}</p>
                  </div>
                ))}
              </div>
            </section>
          </Wrap>
          <Rule />
        </>
      )}

      {/* Who this is for */}
      <Wrap>
        <section className="py-24">
          <p className="eyebrow rise mb-7">Who this is for</p>
          <h2 className="rise font-display max-w-[21ch] text-[28px] leading-[1.12] sm:text-[37px]">
            Brands too small for a Chinese factory, <span className="foil">too particular</span> for a local printer.
          </h2>
          <p className="rise mt-6 max-w-[50ch] text-lg" style={{ color: 'var(--dim)' }}>
            Skincare, chocolate, candles, supplements, specialty coffee. Whether it&apos;s 200 boxes for a
            launch or 20,000 for a season — if the box has to feel like the product inside, that&apos;s the work I do.
          </p>
        </section>
      </Wrap>
      <Rule />

      {/* Finishes */}
      <Wrap>
        <section className="py-24">
          <p className="eyebrow rise mb-3">What I actually do</p>
          <p className="font-mono2 mb-7 text-[13px] tracking-wide" style={{ color: 'var(--dimmer)' }}>
            Hover a card — that sheen is what drip-off does on paper.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FINISHES.map((f, i) => (
              <div key={f.title} className="card rise" style={{ transitionDelay: `${(i % 3) * 0.08}s` }}>
                <h3 className="foil font-display text-[22px]">{f.title}</h3>
                <p className="mt-2.5 text-[14.5px]" style={{ color: 'var(--dim)' }}>{f.body}</p>
                <p className="note">{f.note}</p>
              </div>
            ))}
          </div>
        </section>
      </Wrap>
      <Rule />

      {/* Numbers */}
      <Wrap>
        <section className="grid grid-cols-1 items-start gap-11 py-24 sm:grid-cols-3">
          {NUMBERS.map((x, i) => (
            <div key={x.stat} className="rise" style={{ transitionDelay: `${i * 0.12}s` }}>
              <div className="foil font-display text-[64px] leading-none">{x.stat}</div>
              <p className="mt-3.5 text-[14.5px]" style={{ color: 'var(--dim)' }}>{x.body}</p>
            </div>
          ))}
        </section>
      </Wrap>
      <Rule />

      {/* Process */}
      <Wrap>
        <section className="py-24">
          <p className="eyebrow rise mb-7">How it works</p>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rise border-t pt-5" style={{ borderColor: 'var(--hair)', transitionDelay: `${i * 0.1}s` }}>
                <div className="font-mono2 mb-3 text-[11px] tracking-[.16em]" style={{ color: 'var(--brass)' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-display text-lg">{s.title}</h3>
                <p className="mt-2 text-sm" style={{ color: 'var(--dim)' }}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      </Wrap>
      <Rule />

      {/* Enquire */}
      <Wrap>
        <section id="enquire" className="py-24">
          <p className="eyebrow rise mb-7">Start a project</p>
          <h2 className="rise font-display mb-9 text-[28px] leading-[1.12] sm:text-[37px]">
            Tell me what <span className="foil">you&apos;re packing.</span>
          </h2>
          <div className="rise">
            <InquiryForm />
          </div>
        </section>
      </Wrap>
      <Rule />

      <Wrap>
        <footer className="flex flex-wrap items-center justify-between gap-4 py-12 text-[13.5px]" style={{ color: 'var(--dimmer)' }}>
          <span className="foil font-display text-base">{SITE.name}</span>
          <span>
            <a href={`mailto:${SITE.email}`} className="hover:underline">{SITE.email}</a>
            {' · '}
            <a href={SITE.whatsappHref} className="hover:underline">WhatsApp {SITE.whatsapp}</a>
          </span>
        </footer>
      </Wrap>
    </main>
  )
}
