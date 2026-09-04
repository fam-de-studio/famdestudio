import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import img from "@/images/fam-de-studio-02.jpg";

export function Intro() {
  return (
    <section className="surface-ivory section-y" aria-labelledby="intro-title">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-7">
            <Eyebrow>Introduction</Eyebrow>
            <h2 id="intro-title" className="t-h1 mt-8">
              Design is only
              <br />
              the <span className="t-italic">beginning.</span>
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
              <p className="t-body text-muted">
                The result is packaging that doesn&rsquo;t simply look premium. It feels intentional.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-20 grid items-end gap-10 lg:mt-28 lg:grid-cols-12 lg:gap-8">
          <Reveal variant="image" className="lg:col-span-7 lg:col-start-2">
            <Image
              src={img}
              alt="A square soft-touch black rigid box with a blind-debossed FAM De Studio mark, lid resting ajar to show its ivory interior"
              sizes="(min-width: 1024px) 55vw, 100vw"
              placeholder="blur"
              className="aspect-[4/3] w-full object-cover"
            />
          </Reveal>

          <Reveal index={2} className="lg:col-span-3 lg:col-start-10 lg:pb-8">
            <p className="t-num text-[clamp(4.5rem,9vw,8rem)] leading-none">25+</p>
            <p className="t-eyebrow mt-3 text-champagne">Years</p>
            <p className="t-small mt-4 max-w-[16rem] text-muted">
              Design and print experience, from the first offset press in 1998 to luxury finishing today.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
