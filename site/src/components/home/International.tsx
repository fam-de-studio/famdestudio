import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import img from "@/images/hero-02.jpg";

const points = [
  { label: "Brief", text: "A call or a written brief, in your time zone." },
  { label: "Design", text: "Concepts, 3D renders and dielines shared as PDFs and interactive previews." },
  { label: "Proof", text: "Colour proofs and white samples couriered before production." },
  { label: "Deliver", text: "Finished packaging shipped by courier or freight, worldwide." },
];

export function International() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-ink" aria-labelledby="intl-title">
      <Image
        src={img}
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        quality={70}
        className="object-cover object-right opacity-60"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,14,15,.97)_0%,rgba(14,14,15,.94)_45%,rgba(14,14,15,.72)_100%)]"
      />
      <div className="container-x section-y relative">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <Eyebrow>International</Eyebrow>
            <h2 id="intl-title" className="t-h1 mt-8">
              Made for brands <span className="t-italic">anywhere.</span>
            </h2>
            <p className="t-lead mt-8 max-w-lg">Based in Pakistan. Experienced in Dubai. Working with brands internationally.</p>
            <p className="t-body mt-5 max-w-lg text-muted">
              Projects are discussed remotely from concept to production. Renders, dielines, proofs and samples move
              between studio and client the same way they would across a city.
            </p>
          </Reveal>

          <Reveal index={1} className="lg:col-span-5 lg:col-start-8">
            <ul className="divide-y divide-line border-y border-line">
              {points.map((p) => (
                <li key={p.label} className="grid grid-cols-[6rem_1fr] gap-6 py-5">
                  <span className="t-eyebrow pt-1 text-champagne">{p.label}</span>
                  <span className="t-body text-text/85">{p.text}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
