import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { projects } from "@/content/projects";
import { WorkTile } from "@/components/work/WorkTile";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Luxury packaging case studies by FAM De Studio: rigid boxes, magnetic boxes and premium folding cartons for perfume, cosmetics, jewellery, chocolate and gifting, finished with hot foil, embossing, debossing and spot UV.",
  alternates: { canonical: "/work" },
  openGraph: { title: "Work — FAM De Studio", url: "/work" },
};

export default function WorkIndexPage() {
  return (
    <>
      <section className="section-y border-b border-line bg-ink pt-40 lg:pt-48">
        <div className="container-x">
          <Reveal className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Eyebrow>Work</Eyebrow>
              <h1 className="t-h1 mt-8">
                Every box, from dieline to <span className="t-italic">finish.</span>
              </h1>
            </div>
            <p className="t-lead text-muted lg:col-span-4 lg:col-start-9 lg:pt-4">
              Concept and production studies across perfume, cosmetics, jewellery, chocolate and gifting. Each
              study lists the structure, board, print and finishing so you can see exactly how it was made.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-y bg-ink" aria-label="All projects">
        <div className="container-x grid gap-x-8 gap-y-16 lg:grid-cols-12">
          {projects.map((p, i) => {
            const pattern = i % 4;
            const cls =
              pattern === 0
                ? "lg:col-span-7"
                : pattern === 1
                  ? "lg:col-span-5 lg:pt-28"
                  : pattern === 2
                    ? "lg:col-span-5"
                    : "lg:col-span-7 lg:pt-20";
            const sizes = pattern === 0 || pattern === 3 ? "(min-width: 1024px) 54vw, 100vw" : "(min-width: 1024px) 38vw, 100vw";
            return <WorkTile key={p.slug} project={p} index={i % 2} className={cls} sizes={sizes} priority={i === 0} headingLevel="h2" />;
          })}
        </div>
      </section>

      <section className="surface-ivory section-y">
        <div className="container-x grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <h2 className="t-h2">
              Have a product that needs a <span className="t-italic">box?</span>
            </h2>
          </Reveal>
          <Reveal index={1} className="lg:col-span-4 lg:col-start-9 lg:pt-3">
            <p className="t-body text-muted">Tell us the product, the quantity and the finish you have in mind.</p>
            <Button href="/#contact" variant="link" className="mt-6">
              Start a project
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
