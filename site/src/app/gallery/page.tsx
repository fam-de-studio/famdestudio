import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Words } from "@/components/ui/Words";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A gallery of luxury packaging by FAM De Studio: rigid and magnetic boxes, gift sets, apparel boxes and kraft e-commerce mailers with hot foil, deboss and printed interiors.",
  alternates: { canonical: "/gallery" },
  openGraph: { title: "Gallery — FAM De Studio", url: "/gallery" },
};

export default function GalleryPage() {
  return (
    <>
      <section className="section-y border-b border-line bg-ink pt-40 lg:pt-48">
        <div className="container-x">
          <Reveal className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Eyebrow>Gallery</Eyebrow>
              <h1 className="t-h1 mt-8">
                <Words text="Boxes, as they leave the" />{" "}
                <span className="w" style={{ ["--w" as string]: 5 }}>
                  <i className="t-italic foil">bench.</i>
                </span>
              </h1>
            </div>
            <p className="t-lead text-muted lg:col-span-4 lg:col-start-9 lg:pt-4">
              Rigid and magnetic boxes, gift sets and apparel boxes, and kraft mailers for e-commerce. Filter by
              category, click any piece to see it large.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-y bg-ink" aria-label="All gallery images">
        <div className="container-x">
          <GalleryGrid />
        </div>
      </section>

      <section className="surface-ivory section-y">
        <div className="container-x grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <h2 className="t-h2">
              <Words text="Want one of these for your" />{" "}
              <span className="w" style={{ ["--w" as string]: 6 }}>
                <i className="t-italic">product?</i>
              </span>
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
