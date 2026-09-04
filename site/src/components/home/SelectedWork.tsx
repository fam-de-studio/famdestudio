import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { featuredProjects } from "@/content/projects";
import { WorkTile } from "@/components/work/WorkTile";

/**
 * Asymmetric editorial grid:
 *   [ large 8 cols          ] [ tall 4 cols ]
 *   [ std 5 ] [ wide 7 offset ]
 *   [ std 4 ] [ std 4 ] [ std 4 ]
 */
export function SelectedWork() {
  const [p0, p1, p2, p3, p4, p5] = featuredProjects;
  return (
    <section id="work" className="section-y scroll-mt-20 border-t border-line bg-ink" aria-labelledby="work-title">
      <div className="container-x">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Case studies</Eyebrow>
            <h2 id="work-title" className="t-h1 mt-8">
              Selected <span className="t-italic">work</span>
            </h2>
          </div>
          <p className="t-small max-w-xs text-muted lg:pb-3">
            Concept and production studies across perfume, cosmetics, jewellery, chocolate and gifting. Each one
            resolved from dieline to finished box.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-x-8 gap-y-16 lg:mt-24 lg:grid-cols-12">
          <WorkTile project={p0} className="lg:col-span-8" sizes="(min-width: 1024px) 62vw, 100vw" />
          <WorkTile project={p2} index={1} className="lg:col-span-4 lg:pt-32" sizes="(min-width: 1024px) 30vw, 100vw" />

          <WorkTile project={p1} index={0} className="lg:col-span-5" sizes="(min-width: 1024px) 38vw, 100vw" />
          <WorkTile project={p4} index={1} className="lg:col-span-6 lg:col-start-7 lg:pt-20" sizes="(min-width: 1024px) 46vw, 100vw" />

          <WorkTile project={p3} index={0} className="lg:col-span-4" sizes="(min-width: 1024px) 30vw, 100vw" />
          <WorkTile project={p5} index={1} className="lg:col-span-4 lg:pt-16" sizes="(min-width: 1024px) 30vw, 100vw" />
          <Reveal index={2} className="flex items-end lg:col-span-3 lg:col-start-10 lg:pb-16">
            <div>
              <p className="t-serif text-2xl leading-snug text-muted">
                Two more studies in the archive, including the studio&rsquo;s own finishing library.
              </p>
              <Button href="/work" variant="link" className="mt-8">
                View all projects
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
