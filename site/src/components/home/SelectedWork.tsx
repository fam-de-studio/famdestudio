import { featuredProjects } from "@/content/projects";
import { WorkHorizontal } from "./WorkHorizontal";

/**
 * Selected work: a full-bleed pinned horizontal track on desktop, a native
 * horizontal swipe strip on touch. See WorkHorizontal for the scroll maths.
 */
export function SelectedWork() {
  return (
    <section id="work" className="scroll-mt-0 border-t border-line bg-ink pb-[var(--section-y)]" aria-labelledby="work-title">
      <WorkHorizontal projects={featuredProjects} />
    </section>
  );
}
