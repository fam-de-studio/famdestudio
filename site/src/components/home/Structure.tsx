"use client";

import { useRef } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { structureSteps } from "@/content/studio";
import { FoldingCarton, useScrollProgress } from "./FoldingCarton";

/**
 * From flat artwork to a real object: a pinned two-column section. The copy
 * and the five steps sit left; on the right a dieline folds itself into a
 * carton as the visitor scrolls. Ivory "paper" surface.
 */
export function Structure() {
  const wrap = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(wrap);
  const stepIdx = Math.min(structureSteps.length - 1, Math.floor(p * structureSteps.length));

  return (
    <section id="structure" className="surface-ivory scroll-mt-0" aria-labelledby="structure-title">
      <div ref={wrap} className="relative" style={{ height: "260vh" }}>
        <div className="sticky top-0 flex min-h-dvh flex-col justify-center py-24">
          <div className="container-x grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <Eyebrow>Structure</Eyebrow>
              <h2 id="structure-title" className="t-h1 mt-8">
                From flat artwork
                <br />
                to a real <span className="t-italic">object.</span>
              </h2>
              <p className="t-lead mt-8 max-w-lg">
                A dieline is a promise: that the artwork will fold, lock, close and open the way it was drawn.
              </p>
              <p className="t-body mt-4 max-w-lg text-muted">
                The studio draws its own structures in ArtiosCAD and Esko, folds them digitally, and cuts white
                samples in the real board before a single sheet is printed.
              </p>

              <ol className="mt-10 grid gap-2 sm:grid-cols-5">
                {structureSteps.map((s, i) => (
                  <li key={s.label} className="border-t pt-3 transition-colors duration-500" style={{ borderColor: i <= stepIdx ? "var(--color-text-d)" : "var(--color-line-d)" }}>
                    <span className="t-num text-xs" style={{ color: i === stepIdx ? "var(--color-champagne-2)" : "var(--color-muted-d)" }}>
                      0{i + 1}
                    </span>
                    <p className="t-eyebrow mt-1" style={{ color: i <= stepIdx ? "var(--color-text-d)" : "var(--color-muted-d)" }}>
                      {s.label}
                    </p>
                  </li>
                ))}
              </ol>
              <p className="t-small mt-6 max-w-md text-muted" aria-live="polite">
                {structureSteps[stepIdx].text}
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="crop-marks relative border border-line-d p-6 text-text-d lg:p-10" style={{ minHeight: "min(70vh, 560px)" }}>
                <FoldingCarton progress={p} />
                <div className="absolute bottom-4 left-5 flex items-center gap-3">
                  <span className="t-eyebrow text-muted">Straight tuck-end carton</span>
                  <span className="h-px w-8 bg-line-d-strong" />
                  <span className="t-eyebrow" style={{ color: "var(--color-champagne-2)" }}>
                    {p < 0.15 ? "Dieline" : p < 0.7 ? "Folding" : "Finished box"}
                  </span>
                </div>
              </div>
              <p className="t-eyebrow mt-4 text-muted">Scroll to fold · ArtiosCAD · Esko · Blender</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
