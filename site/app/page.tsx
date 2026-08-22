import Image from 'next/image'
import { Effects } from '@/components/Effects'
import { InquiryForm } from '@/components/InquiryForm'
import { Marquee } from '@/components/Marquee'
import { SITE, FINISHES, STEPS, NUMBERS } from '@/content/site'
import { readWork } from '@/lib/work'

const Rule = () => <hr className="rule" />
const Wrap = ({ children }: { children: React.ReactNode }) => (
  <div className="relative z-[2] mx-auto max-w-[1120px] px-6 sm:px-10">{children}</div>
)

const NAV = [
  ['/finishes', '#finishes'],
  ['/numbers', '#numbers'],
  ['/process', '#process'],
  ['/contact', '#enquire'],
] as const

export default function Page() {
  const work = readWork()

  return (
    <main>
      <Effects />

      {/* ── header: wordmark · /paths · CTA ── */}
      <Wrap>
        <header className="flex items-center justify-between gap-4 py-6">
          <span className="display foil text-lg tracking-tight">Fam de Studio</span>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map(([label, href]) => (
              <a key={label} href={href} className="font-mono2 text-[12px] tracking-[.12em] transition-colors hover:text-[--brass]" style={{ color: 'var(--dim)' }}>
                {label}
              </a>
            ))}
          </nav>
          <a href="#enquire" className="ghostlink">Let&apos;s talk →</a>
        </header>
      </Wrap>
      <Rule />

      {/* ── hero ── */}
      <Wrap>
        <section className="py-20 sm:py-24">
          <div className="rise mb-10 flex flex-wrap items-center gap-x-8 gap-y-3">
            <span className="flex items-center gap-3">
              <i className="dot" />
              <span className="eyebrow !text-[11px]" style={{ color: 'var(--cream)' }}>Taking orders — from 200 pcs</span>
            </span>
            <span className="eyebrow">Lahore · Pakistan · 2026</span>
          </div>

          <h1 className="rise display text-[15vw] leading-[.9] sm:text-[110px] lg:text-[150px]">
            Fam de
            <br />
            <span className="foil">Studio</span>
          </h1>

          <div className="rise mt-8 flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="font-mono2 text-[12px] tracking-[.16em] uppercase" style={{ color: 'var(--brass)' }}>
                Decorative print &amp; packaging · Designer · Print broker
              </p>
              <p className="mt-4 max-w-[52ch] text-[17px]" style={{ color: 'var(--dim)' }}>
                The fine work most printers won&apos;t attempt — hot foil, drip-off, metalized,
                soft touch. Twenty-eight years at the press. Designed and produced in Pakistan,
                delivered to your door.
              </p>
            </div>
            <div className="flex flex-col items-start gap-4">
              <a className="cta" href="#enquire">Send your logo →</a>
              <a className="ghostlink" href="#finishes">/view finishes</a>
            </div>
          </div>

          <p className="rise font-mono2 mt-16 text-[10.5px] tracking-[.3em] uppercase" style={{ color: 'var(--dimmer)' }}>
            Scroll
          </p>
        </section>
      </Wrap>

      {/* ── marquee 1: the craft ── */}
      <Marquee items={['Hot foil', 'Drip-off', 'Metalized', 'Soft touch', 'Emboss & deboss', 'Holographic', 'Structure & keylines', 'From 200 pieces']} />

      {/* ── /numbers ── */}
      <Wrap>
        <section id="numbers" className="py-24">
          <p className="eyebrow rise mb-2"><span className="slash">/</span>numbers</p>
          <h2 className="rise display text-[34px] sm:text-[48px]">By the numbers</h2>
          <div className="mt-14 grid grid-cols-1 items-start gap-12 sm:grid-cols-3">
            {NUMBERS.map((x, i) => (
              <div key={x.stat} className="rise border-t pt-6" style={{ borderColor: 'var(--hair)', transitionDelay: `${i * 0.12}s` }}>
                <div className="foil display text-[76px] leading-none">{x.stat}</div>
                <p className="mt-4 text-[14.5px]" style={{ color: 'var(--dim)' }}>{x.body}</p>
              </div>
            ))}
          </div>
        </section>
      </Wrap>
      <Rule />

      {/* ── /finishes — numbered case rows ── */}
      <Wrap>
        <section id="finishes" className="py-24">
          <p className="eyebrow rise mb-2"><span className="slash">/</span>finishes</p>
          <h2 className="rise display text-[34px] sm:text-[48px]">What I actually do</h2>
          <p className="rise font-mono2 mt-4 mb-10 text-[12px] tracking-wide" style={{ color: 'var(--dimmer)' }}>
            Hover a row — that sheen is what drip-off does on paper.
          </p>

          <div className="border-b" style={{ borderColor: 'var(--hair)' }}>
            {FINISHES.map((f, i) => (
              <article key={f.title} className="case rise">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[80px_1fr_1fr]">
                  <div className="idx pt-2">{String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <h3 className="display foil text-[30px] sm:text-[40px]">{f.title}</h3>
                    <p className="mt-3 max-w-[44ch] text-[15px]" style={{ color: 'var(--dim)' }}>{f.body}</p>
                  </div>
                  <div className="lg:pt-2">
                    <p className="font-mono2 text-[13px] leading-relaxed" style={{ color: 'var(--dimmer)' }}>
                      <span style={{ color: 'var(--brass)' }}>{'// '}</span>
                      {f.note}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </Wrap>

      {/* ── marquee 2: who it's for ── */}
      <Marquee items={['Skincare', 'Chocolate', 'Candles', 'Supplements', 'Specialty coffee', 'Launch runs', 'Lahore', 'Delivered worldwide']} />

      {/* ── who this is for ── */}
      <Wrap>
        <section className="py-24">
          <h2 className="rise display max-w-[16ch] text-[30px] leading-[1.02] sm:text-[44px]">
            Too small for a Chinese factory, <span className="foil">too particular</span> for a local printer.
          </h2>
          <p className="rise mt-7 max-w-[54ch] text-[17px]" style={{ color: 'var(--dim)' }}>
            Whether it&apos;s 200 boxes for a launch or 20,000 for a season — if the box has to feel
            like the product inside, that&apos;s the work I do.
          </p>
        </section>
      </Wrap>
      <Rule />

      {/* ── /work — renders only when content/work has entries ── */}
      {work.length > 0 && (
        <>
          <Wrap>
            <section className="py-24">
              <p className="eyebrow rise mb-2"><span className="slash">/</span>work</p>
              <h2 className="rise display text-[34px] sm:text-[48px]">Selected work</h2>
              <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {work.map((w, i) => (
                  <div key={w.title} className="rise" style={{ transitionDelay: `${i * 0.12}s` }}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-sm border" style={{ borderColor: 'var(--hair)' }}>
                      <Image src={w.image} alt={w.title} fill className="object-cover" />
                    </div>
                    <p className="idx mt-4 mb-2">{w.finishes.join(' // ')}</p>
                    <p className="text-[14.5px]" style={{ color: 'var(--dim)' }}>{w.caption}</p>
                  </div>
                ))}
              </div>
            </section>
          </Wrap>
          <Rule />
        </>
      )}

      {/* ── /process ── */}
      <Wrap>
        <section id="process" className="py-24">
          <p className="eyebrow rise mb-2"><span className="slash">/</span>process</p>
          <h2 className="rise display text-[34px] sm:text-[48px]">How it works</h2>
          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rise border-t pt-6" style={{ borderColor: 'var(--hair)', transitionDelay: `${i * 0.1}s` }}>
                <div className="idx mb-4">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="display text-[19px]">{s.title}</h3>
                <p className="mt-3 text-sm" style={{ color: 'var(--dim)' }}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      </Wrap>
      <Rule />

      {/* ── /contact ── */}
      <Wrap>
        <section id="enquire" className="py-24">
          <p className="eyebrow rise mb-2"><span className="slash">/</span>contact</p>
          <h2 className="rise display mb-4 text-[34px] sm:text-[48px]">
            Tell me what <span className="foil">you&apos;re packing</span>
          </h2>
          <p className="rise mb-10 max-w-[50ch] text-[15px]" style={{ color: 'var(--dim)' }}>
            Send a logo and a rough idea. Keyline and 3D visual come back free within two
            working days — no cost, no obligation.
          </p>
          <div className="rise">
            <InquiryForm />
          </div>
        </section>
      </Wrap>
      <Rule />

      <Wrap>
        <footer className="flex flex-wrap items-center justify-between gap-4 py-12">
          <span className="display foil text-base">{SITE.name}</span>
          <span className="font-mono2 text-[12px] tracking-[.08em]" style={{ color: 'var(--dimmer)' }}>
            <a href={`mailto:${SITE.email}`} className="hover:underline">{SITE.email}</a>
            {'  //  '}
            <a href={SITE.whatsappHref} className="hover:underline">WhatsApp {SITE.whatsapp}</a>
            {'  //  '}
            {SITE.city}
          </span>
        </footer>
      </Wrap>
    </main>
  )
}
