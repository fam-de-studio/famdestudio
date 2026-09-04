import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/home/Intro";
import { Marquee } from "@/components/home/Marquee";
import { Expertise } from "@/components/home/Expertise";
import { SelectedWork } from "@/components/home/SelectedWork";
import { Finishing } from "@/components/home/Finishing";
import { Structure } from "@/components/home/Structure";
import { SmallRuns } from "@/components/home/SmallRuns";
import { Process } from "@/components/home/Process";
import { Experience } from "@/components/home/Experience";
import { About } from "@/components/home/About";
import { Tools } from "@/components/home/Tools";
import { International } from "@/components/home/International";
import { Contact } from "@/components/home/Contact";
import { site } from "@/content/site";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    description: site.description,
    url: site.url,
    email: site.email,
    image: `${site.url}/og.jpg`,
    foundingDate: String(site.foundedYear),
    areaServed: "Worldwide",
    address: { "@type": "PostalAddress", addressCountry: "PK" },
    knowsAbout: [...site.keywords],
    makesOffer: [
      "Luxury packaging design",
      "Rigid box production",
      "Premium folding cartons",
      "Structural packaging and dielines",
      "Hot foil, embossing, debossing, spot UV finishing",
    ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <Marquee />
      <Intro />
      <Expertise />
      <SelectedWork />
      <Finishing />
      <Structure />
      <SmallRuns />
      <Process />
      <Experience />
      <About />
      <Tools />
      <International />
      <Contact />
    </>
  );
}
