import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { site } from "@/content/site";
import { InquiryForm } from "./InquiryForm";

export function Contact() {
  return (
    <section id="contact" className="surface-ivory section-y scroll-mt-20" aria-labelledby="contact-title">
      <div className="container-x">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow>Contact</Eyebrow>
              <h2 id="contact-title" className="t-h1 mt-8">
                Let&rsquo;s make something <span className="t-italic">exceptional.</span>
              </h2>
              <p className="t-lead mt-8 max-w-md text-muted">
                Tell us about your product, quantity and the finish you have in mind.
              </p>
            </Reveal>

            <Reveal index={1} className="mt-12 space-y-8">
              <div>
                <p className="t-eyebrow text-muted">Email</p>
                <a href={`mailto:${site.email}`} className="link-line t-h3 mt-3">
                  {site.email}
                </a>
              </div>
              {site.whatsapp && (
                <div>
                  <p className="t-eyebrow text-muted">WhatsApp</p>
                  <a
                    href={`https://wa.me/${String(site.whatsapp).replace(/\D/g, "")}`}
                    className="link-line t-h3 mt-3"
                    rel="noopener"
                  >
                    {site.whatsapp}
                  </a>
                </div>
              )}
              <div>
                <p className="t-eyebrow text-muted">What to include</p>
                <ul className="t-small mt-3 max-w-sm space-y-1.5 text-muted">
                  <li>The product and its approximate size</li>
                  <li>Quantity, even if it&rsquo;s a range</li>
                  <li>Reference images or brands you admire</li>
                  <li>Deadline, if there is one</li>
                </ul>
              </div>
            </Reveal>
          </div>

          <Reveal index={1} className="lg:col-span-6 lg:col-start-7">
            <InquiryForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
