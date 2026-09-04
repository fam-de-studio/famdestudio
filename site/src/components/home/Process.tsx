import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { process } from "@/content/studio";

export function Process() {
  return (
    <section className="surface-ivory section-y" aria-labelledby="process-title">
      <div className="container-x">
        <Reveal className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow>Process</Eyebrow>
            <h2 id="process-title" className="t-h1 mt-8">
              Five steps, <span className="t-italic">one</span> conversation.
            </h2>
          </div>
          <p className="t-lead text-muted lg:col-span-4 lg:col-start-9 lg:pt-4">
            From the first brief to the delivered boxes, every step is discussed remotely, with proofs and white
            samples shipped where a screen isn&rsquo;t enough.
          </p>
        </Reveal>

        <ol className="mt-16 lg:mt-24">
          {process.map((step, i) => (
            <li key={step.n} className="relative">
              <Reveal variant="line" index={i} className="h-px w-full bg-text-d/70" />
              <Reveal index={i} className="grid gap-4 py-8 md:grid-cols-12 md:items-baseline md:py-10">
                <span className="t-num text-3xl text-champagne-2 md:col-span-2 md:text-4xl">{step.n}</span>
                <h3 className="t-h2 md:col-span-5">{step.title}</h3>
                <p className="t-body max-w-md text-muted md:col-span-5">{step.text}</p>
              </Reveal>
              {i === process.length - 1 && (
                <Reveal variant="line" index={i + 1} className="h-px w-full bg-text-d/70" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
