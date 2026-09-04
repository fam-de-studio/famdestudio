import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { structureSteps } from "@/content/studio";
import { DielineDiagram } from "./DielineDiagram";
import img from "@/images/folding-carton-collection-01.jpg";

export function Structure() {
  return (
    <section className="surface-ivory section-y" aria-labelledby="structure-title">
      <div className="container-x">
        <Reveal className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow>Structure</Eyebrow>
            <h2 id="structure-title" className="t-h1 mt-8">
              From flat artwork
              <br />
              to a real <span className="t-italic">object.</span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-4">
            <p className="t-lead">
              A dieline is a promise: that the artwork will fold, lock, close and open the way it was drawn.
            </p>
            <p className="t-body mt-5 text-muted">
              The studio draws its own structures in ArtiosCAD and Esko, folds them digitally, then cuts white
              samples in the real board before a single sheet is printed. Fit, closure and panel sequence are settled
              long before finishing is discussed.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid items-center gap-10 lg:mt-24 lg:grid-cols-12">
          <Reveal className="crop-marks border border-line-d p-6 text-text-d lg:col-span-6 lg:p-10">
            <DielineDiagram className="w-full" />
            <p className="t-eyebrow mt-6 text-muted">Straight tuck-end carton · Die drawing</p>
          </Reveal>
          <Reveal variant="image" index={1} className="lg:col-span-5 lg:col-start-8">
            <Image
              src={img}
              alt="Six gable-top folding cartons, the result of one dieline in six boards and six finishes"
              sizes="(min-width: 1024px) 42vw, 100vw"
              placeholder="blur"
              className="aspect-[4/3] w-full object-cover"
            />
            <p className="t-eyebrow mt-5 text-muted">One dieline · Six boards · Six finishes</p>
          </Reveal>
        </div>

        {/* Journey: the steps are a real sequence, so they are numbered */}
        <ol className="mt-20 grid gap-y-10 border-t border-line-d pt-10 md:grid-cols-5 md:gap-x-6 lg:mt-28">
          {structureSteps.map((s, i) => (
            <Reveal key={s.label} as="li" index={i} className="relative md:pr-6">
              {i < structureSteps.length - 1 && (
                <svg
                  aria-hidden
                  width="14"
                  height="10"
                  viewBox="0 0 14 10"
                  className="absolute right-0 top-1 hidden text-champagne-2 md:block"
                >
                  <path d="M0 5h12M8.5 1 13 5l-4.5 4" stroke="currentColor" strokeWidth="1" fill="none" />
                </svg>
              )}
              <span className="t-num text-sm text-muted">0{i + 1}</span>
              <h3 className="t-h3 mt-3 uppercase tracking-[0.04em]">{s.label}</h3>
              <p className="t-small mt-3 max-w-[15rem] text-muted">{s.text}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-3 border-t border-line-d pt-6">
          <span className="t-eyebrow text-muted">Structural tools</span>
          {["ArtiosCAD", "Esko", "Blender", "3D visualization"].map((t) => (
            <span key={t} className="t-small">
              {t}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
