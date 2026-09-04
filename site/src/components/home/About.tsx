import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SpecList } from "@/components/ui/Spec";
import img from "@/images/fam-de-studio-01.jpg";
import img2 from "@/images/rigid-box.jpg";

export function About() {
  return (
    <section id="about" className="section-y scroll-mt-20 border-t border-line bg-ink" aria-labelledby="about-title">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-6">
            <Eyebrow>About</Eyebrow>
            <h2 id="about-title" className="t-h1 mt-8">
              The experience
              <br />
              behind the <span className="t-italic">detail.</span>
            </h2>
          </Reveal>

          <div className="lg:col-span-5 lg:col-start-8 lg:pt-4">
            <Reveal index={1} className="space-y-5">
              <p className="t-lead">
                FAM De Studio is led by a designer who has worked in design and printing since 1998, and who has
                spent most of that time where packaging is actually made.
              </p>
              <p className="t-body text-muted">
                The early years covered graphic design, outdoor advertising and flex printing, then offset and
                flexographic production, prepress and colour. Packaging became the focus: structural design,
                dieline development and the finishing processes that give a box its character.
              </p>
              <p className="t-body text-muted">
                Ten years working professionally in Dubai added an international standard of client, supplier and
                production, and the habit of communicating precisely across time zones.
              </p>
              <p className="t-body text-muted">
                Today the studio works in Adobe Illustrator, Photoshop and InDesign for artwork, Blender for 3D
                visualisation, and ArtiosCAD and Esko for structure. The tools matter less than knowing what a press,
                a foil die and a box-maker will do with the file.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-20 grid gap-8 lg:mt-28 lg:grid-cols-12">
          <Reveal variant="image" className="lg:col-span-7">
            <Image
              src={img}
              alt="A black rigid box with a blind-debossed frame and gold foil FAM De Studio wordmark, lid open to show a natural kraft interior"
              sizes="(min-width: 1024px) 58vw, 100vw"
              placeholder="blur"
              className="aspect-[4/3] w-full object-cover"
            />
          </Reveal>
          <div className="flex flex-col justify-between gap-10 lg:col-span-4 lg:col-start-9">
            <Reveal index={1}>
              <SpecList
                rows={[
                  { label: "Since", value: "1998" },
                  { label: "Focus", value: "Luxury packaging, small runs" },
                  { label: "Structure", value: "ArtiosCAD, Esko" },
                  { label: "3D", value: "Blender" },
                  { label: "Print", value: "Offset, flexo, metalized" },
                  { label: "Based", value: "Pakistan · 10 years in Dubai" },
                ]}
              />
            </Reveal>
            <Reveal variant="image" index={2}>
              <Image
                src={img2}
                alt="Deep green rigid box with debossed geometry and a gold foil rule, lid lifted to show a green perfume bottle on velvet"
                sizes="(min-width: 1024px) 30vw, 100vw"
                placeholder="blur"
                className="aspect-[4/3] w-full object-cover"
              />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
