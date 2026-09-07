import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNextProject, getProject, projects } from "@/content/projects";
import { site } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Dots, SpecList } from "@/components/ui/Spec";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const description = `${p.name}: ${p.type.toLowerCase()} with ${p.finishes.slice(1).join(", ").toLowerCase() || "premium finishing"}. ${p.overview}`;
  return {
    title: p.name,
    description,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: {
      title: `${p.name} — ${site.name}`,
      description,
      url: `/work/${p.slug}`,
      images: [{ url: p.cover.src.src, width: p.cover.src.width, height: p.cover.src.height, alt: p.cover.alt }],
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const next = getNextProject(slug);

  const sections: { n: string; title: string; text: string }[] = [
    { n: "03", title: "Concept", text: p.concept },
    { n: "04", title: "Structure", text: p.structure },
    { n: "05", title: "Material", text: p.materials },
    { n: "06", title: "Print", text: p.printing },
    { n: "07", title: "Finishing", text: p.finishing },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.name,
    description: p.overview,
    creator: { "@type": "Organization", name: site.name, url: site.url },
    image: `${site.url}${p.cover.src.src}`,
    keywords: p.finishes.join(", "),
    url: `${site.url}/work/${p.slug}`,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 01 — Hero */}
      <header className="relative bg-ink pt-32 lg:pt-40">
        <div className="container-x">
          <Reveal className="flex flex-wrap items-end justify-between gap-6 pb-10">
            <div>
              <Eyebrow>{p.category}</Eyebrow>
              <h1 className="t-h1 mt-6">{p.name}</h1>
            </div>
            <p className="t-small text-muted lg:pb-3">
              <Dots items={p.finishes} />
            </p>
          </Reveal>
          <Reveal variant="image" className="hero-wrap">
            <Image
              src={p.hero.src}
              alt={p.hero.alt}
              priority
              fetchPriority="high"
              sizes="(min-width: 1440px) 1376px, 100vw"
              placeholder="blur"
              className="aspect-[4/3] w-full object-cover md:aspect-[16/9]"
            />
          </Reveal>
        </div>
      </header>

      {/* 02 — Intro + specs */}
      <section className="section-y bg-ink">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <Eyebrow n="02">Overview</Eyebrow>
            <p className="t-h3 mt-8 leading-snug">{p.overview}</p>
            <div className="mt-10">
              <p className="t-eyebrow text-muted">The challenge</p>
              <p className="t-body mt-3 max-w-xl text-text/85">{p.challenge}</p>
            </div>
          </Reveal>
          <Reveal index={1} className="lg:col-span-4 lg:col-start-9">
            <SpecList
              rows={[
                { label: "Client", value: p.category },
                { label: "Format", value: p.type },
                { label: "Quantity", value: p.quantity },
                { label: "Finishing", value: <Dots items={p.finishes} /> },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* 03–07 — Concept, Structure, Material, Print, Finishing */}
      <section className="surface-ivory section-y">
        <div className="container-x">
          <ol>
            {sections.map((s, i) => (
              <li key={s.n} className="relative">
                <Reveal variant="line" index={i} className="h-px w-full bg-text-d/60" />
                <Reveal index={i} className="grid gap-4 py-8 md:grid-cols-12 md:py-10">
                  <span className="t-num text-2xl text-champagne-2 md:col-span-1">{s.n}</span>
                  <h2 className="t-h2 md:col-span-4">{s.title}</h2>
                  <p className="t-body max-w-xl text-text-d/85 md:col-span-6 md:col-start-7">{s.text}</p>
                </Reveal>
                {i === sections.length - 1 && (
                  <Reveal variant="line" index={i + 1} className="h-px w-full bg-text-d/60" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 08 — Final */}
      <section className="section-y bg-ink">
        <div className="container-x">
          <Reveal>
            <Eyebrow n="08">Final</Eyebrow>
          </Reveal>
          <div className="mt-10 grid gap-8 lg:grid-cols-12">
            {p.finals.map((img, i) => (
              <Reveal
                key={img.src.src + i}
                variant="image"
                index={i}
                className={p.finals.length === 1 ? "lg:col-span-10 lg:col-start-2" : i === 0 ? "lg:col-span-8" : "lg:col-span-4 lg:pt-24"}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  sizes={p.finals.length === 1 || i === 0 ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
                  placeholder="blur"
                  className="aspect-[4/3] w-full object-cover"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 09 — Detail */}
      <section className="section-y border-t border-line bg-ink-2">
        <div className="container-x">
          <Reveal className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <Eyebrow n="09">Detail</Eyebrow>
              <h2 className="t-h2 mt-8">
                Where the box is <span className="t-italic">judged.</span>
              </h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {p.details.map((img, i) => (
              <Reveal key={img.src.src + i} variant="image" index={i} className={i === 1 ? "md:pt-20" : ""}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  placeholder="blur"
                  className="aspect-[4/3] w-full object-cover"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 10 — Next project */}
      <Link
        href={`/work/${next.slug}`}
        className="group relative block overflow-hidden border-t border-line bg-ink"
        data-cursor="view"
        aria-label={`Next project: ${next.name}`}
      >
        <div className="hover-zoom absolute inset-0">
          <Image
            src={next.cover.src}
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            quality={60}
            className="object-cover opacity-35 transition-opacity duration-1000 group-hover:opacity-55"
          />
        </div>
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,14,15,.9),rgba(14,14,15,.4))]" />
        <div className="container-x relative py-28 lg:py-40">
          <p className="t-eyebrow text-champagne">Next project</p>
          <p className="t-h1 mt-6 transition-colors duration-500 group-hover:text-champagne">{next.name}</p>
          <p className="t-small mt-4 text-muted">
            <Dots items={next.finishes} />
          </p>
        </div>
      </Link>
    </article>
  );
}
