import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export default function NotFound() {
  return (
    <section className="section-y flex min-h-[70dvh] items-center bg-ink pt-40">
      <div className="container-x">
        <Eyebrow>404</Eyebrow>
        <h1 className="t-h1 mt-8">
          This page was never <span className="t-italic">printed.</span>
        </h1>
        <p className="t-body mt-6 max-w-md text-muted">
          The address may have changed. The work, finishing and contact sections are all on the home page.
        </p>
        <div className="mt-10 flex gap-8">
          <Button href="/" variant="link">
            Back to home
          </Button>
          <Button href="/work" variant="link">
            All projects
          </Button>
        </div>
      </div>
    </section>
  );
}
