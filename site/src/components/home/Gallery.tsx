import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Words } from "@/components/ui/Words";
import { Button } from "@/components/ui/Button";
import { homeGallery } from "@/content/gallery";

/** Home teaser: eight gallery picks in a masonry, linking to /gallery. */
export function Gallery() {
  return (
    <section id="gallery" className="section-y scroll-mt-20 border-t border-line bg-ink" aria-labelledby="gallery-title">
      <div className="container-x">
        <Reveal className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow>Gallery</Eyebrow>
            <h2 id="gallery-title" className="t-h1 mt-8">
              <Words text="More from the" />{" "}
              <span className="w">
                <i className="t-italic foil">studio</i>
              </span>
            </h2>
          </div>
          <p className="t-lead text-muted lg:col-span-4 lg:col-start-9 lg:pt-4">
            Rigid and magnetic boxes, gift sets, apparel boxes and kraft mailers, photographed as they leave the
            bench. Twenty-five pieces, three categories.
          </p>
        </Reveal>

        <ul className="mt-16 columns-2 gap-4 md:columns-3 md:gap-5 lg:columns-4 lg:mt-24" aria-label="Gallery preview">
          {homeGallery.map((g, i) => (
            <li key={g.id} className="mb-4 break-inside-avoid md:mb-6">
              <Reveal index={i % 3}>
                <Link href="/gallery" className="group block" data-cursor="view">
                  <span className="sheen hover-zoom block overflow-hidden bg-ink-2">
                    <Image
                      src={g.src}
                      alt={g.alt}
                      sizes="(min-width: 1024px) 23vw, (min-width: 768px) 30vw, 48vw"
                      placeholder="blur"
                      className="h-auto w-full object-cover"
                    />
                  </span>
                  <span className="t-small mt-3 block text-muted transition-colors duration-500 group-hover:text-champagne">
                    {g.caption.join(" · ")}
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal className="mt-14">
          <Button href="/gallery" variant="solid" className="px-9 py-5 text-[0.8125rem] font-bold">
            See the full gallery
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
