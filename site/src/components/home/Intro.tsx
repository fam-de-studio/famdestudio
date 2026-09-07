import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Words } from "@/components/ui/Words";
import img from "@/images/fam-de-studio-02.jpg";
import img2 from "@/images/rigid-box-corner-detail.jpg";

export function Intro() {
  return (
    <section id="intro" className="relative scroll-mt-20 overflow-hidden bg-ink section-y" aria-labelledby="intro-title">
      {/* giant outlined year behind the composition */}
      <div aria-hidden className="pointer-events-none absolute -right-8 top-10 select-none lg:right-[8vw]">
        <span className="t-outline font-serif text-[clamp(10rem,28vw,30rem)] leading-none opacity-30">98</span>
      </div>

      <div className="container-x relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-7">
            <Eyebrow>The studio</Eyebrow>
            <h2 id="intro-title" className="t-h1 mt-8">
              <Words text="Design is only" />
              <br />
              <Words text="the" start={3} /> <span className="w" style={{ ["--w" as string]: 4 }}><i className="t-italic">beginning.</i></span>
            </h2>
          </Reveal>

          <div className="lg:col-span-4 lg:col-start-9 lg:pt-4">
            <Reveal index={1} className="space-y-6">
              <p className="t-lead">
                With decades of experience across design, printing and packaging, FAM De Studio understands what
                happens beyond the screen.
              </p>
              <p className="t-body text-muted">
                From structural development and artwork to print processes and luxury finishing, every detail is
                considered with production in mind.
              </p>
              <p className="t-body text-muted">The result is packaging that doesn&rsquo;t simply look premium. It feels intentional.</p>
            </Reveal>
          </div>
        </div>

        <div className="mt-20 grid items-end gap-6 lg:mt-28 lg:grid-cols-12 lg:gap-8">
          <Reveal variant="image" className="sheen hover-zoom overflow-hidden lg:col-span-7">
            <Image
              src={img}
              alt="A square soft-touch black rigid box with a blind-debossed FAM De Studio mark, lid resting ajar to show its ivory interior"
              sizes="(min-width: 1024px) 55vw, 100vw"
              placeholder="blur"
              className="aspect-[4/3] w-full object-cover"
            />
          </Reveal>
          <Reveal variant="image" index={1} className="sheen hover-zoom overflow-hidden lg:col-span-4 lg:col-start-9 lg:mb-16">
            <Image
              src={img2}
              alt="Corner of a navy rigid box with a debossed frame and gold foil wordmark, showing the wrapped board edge"
              sizes="(min-width: 1024px) 30vw, 100vw"
              placeholder="blur"
              className="aspect-[4/5] w-full object-cover"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
