import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/projects";
import { Reveal } from "@/components/ui/Reveal";
import { Dots } from "@/components/ui/Spec";

const aspect: Record<Project["size"], string> = {
  large: "aspect-[4/3]",
  tall: "aspect-[3/4]",
  wide: "aspect-[16/10]",
  standard: "aspect-[4/3]",
};

export function WorkTile({
  project,
  index = 0,
  className = "",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  headingLevel: Heading = "h3",
}: {
  project: Project;
  index?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** h2 on index pages (under an h1), h3 inside a home section (under an h2). */
  headingLevel?: "h2" | "h3";
}) {
  return (
    <Reveal index={index} as="article" className={className}>
      <Link href={`/work/${project.slug}`} className="group block" data-cursor="view">
        <Reveal variant="image" className={`hover-zoom overflow-hidden bg-ink-2 ${aspect[project.size]}`}>
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            sizes={sizes}
            placeholder="blur"
            priority={priority}
            className="h-full w-full object-cover"
          />
        </Reveal>
        <div className="mt-5 flex items-start justify-between gap-6">
          <div>
            <Heading className="t-h3 uppercase tracking-[0.04em] transition-colors duration-500 group-hover:text-champagne">
              {project.name}
            </Heading>
            <p className="t-small mt-2 text-muted">
              <Dots items={project.finishes} />
            </p>
          </div>
          <span
            aria-hidden
            className="t-eyebrow mt-2 hidden shrink-0 text-muted transition-colors duration-500 group-hover:text-champagne sm:block"
          >
            {project.quantity}
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
