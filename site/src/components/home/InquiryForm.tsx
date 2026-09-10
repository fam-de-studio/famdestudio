"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { site } from "@/content/site";
import { finishingOptions, projectTypes, quantities } from "@/content/studio";
import { formatInquiry, inquirySubject, whatsappUrl, type Inquiry } from "@/lib/inquiry";

type Status = "idle" | "sent";
/** State of the background email copy, shown as one line on the sent screen. */
type Copy = "sending" | "sent" | "unavailable" | "failed";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/**
 * Quote request form. Primary channel is WhatsApp: on submit the visitor's
 * WhatsApp opens with the request prefilled (they only press Send), so the
 * studio gets the inquiry and the client's number in one go. An email copy
 * is posted to the endpoint in the background; mailto stays as a fallback.
 */
export function InquiryForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copy, setCopy] = useState<Copy>("sending");
  const [waHref, setWaHref] = useState("");
  const [mailHref, setMailHref] = useState("");
  const startedAt = useRef(0);

  // Bots submit instantly; the endpoint rejects anything under a few seconds.
  useEffect(() => {
    startedAt.current = Date.now();
  }, [status]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries()) as Record<string, string>;

    if (data.website) return; // honeypot

    const next: Record<string, string> = {};
    if (!data.name?.trim()) next.name = "Add your name.";
    if (!emailOk(data.email ?? "")) next.email = "Add a valid email so we can reply.";
    if (!data.projectType) next.projectType = "Choose the closest project type.";
    if (!data.details?.trim()) next.details = "Tell us a little about the product.";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = form.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`);
      first?.focus();
      return;
    }

    const inquiry: Inquiry = {
      name: data.name.trim(),
      company: (data.company ?? "").trim(),
      country: (data.country ?? "").trim(),
      email: data.email.trim(),
      projectType: data.projectType,
      quantity: data.quantity ?? "",
      finishing: fd.getAll("finishing").map(String).join(", "),
      details: data.details.trim(),
    };

    const wa = site.whatsapp ? whatsappUrl(site.whatsapp, inquiry) : "";
    const mail = `mailto:${site.email}?subject=${encodeURIComponent(inquirySubject(inquiry))}&body=${encodeURIComponent(formatInquiry(inquiry))}`;
    setWaHref(wa);
    setMailHref(mail);

    // Must run synchronously inside the submit handler or popup blockers stop it.
    if (wa) window.open(wa, "_blank", "noopener,noreferrer");
    else window.location.href = mail;

    setStatus("sent");
    setCopy("sending");
    form.reset();

    if (!site.formEndpoint) {
      setCopy("unavailable");
      return;
    }
    fetch(site.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...inquiry, startedAt: startedAt.current }),
    })
      .then((res) => setCopy(res.ok ? "sent" : res.status === 503 ? "unavailable" : "failed"))
      .catch(() => setCopy("failed"));
  }

  if (status === "sent") {
    return (
      <div className="border-t border-line-d pt-10" role="status" aria-live="polite">
        <p className="t-h2">Thank you.</p>
        <p className="t-body mt-4 max-w-md text-muted">
          {waHref
            ? "WhatsApp should now be open with your request ready. Press Send there and we'll reply on WhatsApp. If it didn't open, use the button below."
            : "Your mail app should now be open with the request ready to send."}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          {waHref && (
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="t-nav btn-yellow font-bold px-8 py-5">
              Open WhatsApp
            </a>
          )}
          <a href={mailHref} className="link-line t-nav text-text-d">
            Prefer email? {site.email}
          </a>
        </div>
        <p className="t-small mt-6 text-muted">
          {copy === "sending" && "Sending a copy by email…"}
          {copy === "sent" && "A copy has also been emailed to the studio."}
          {copy === "unavailable" && "Email copy not available yet; WhatsApp is the fastest route."}
          {copy === "failed" && "The email copy didn't go through; WhatsApp still works."}
        </p>
        <button type="button" className="link-line t-nav mt-8" onClick={() => setStatus("idle")}>
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-10" aria-describedby="form-help">
      <p id="form-help" className="sr-only">
        All fields marked required must be completed.
      </p>

      {/* Honeypot */}
      <div className="hidden" aria-hidden>
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
        <Field label="Name" name="name" required error={errors.name} autoComplete="name" />
        <Field label="Company / Brand" name="company" autoComplete="organization" />
        <Field label="Country" name="country" autoComplete="country-name" />
        <Field label="Email" name="email" type="email" required error={errors.email} autoComplete="email" />

        <SelectField label="Project type" name="projectType" required error={errors.projectType} options={projectTypes} />
        <SelectField label="Estimated quantity" name="quantity" options={quantities} />
      </div>

      <fieldset>
        <legend className="t-eyebrow text-muted">Finishing required</legend>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {finishingOptions.map((f) => (
            <label key={f} className="chip relative">
              <input type="checkbox" name="finishing" value={f} />
              <span>{f}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="details" className="t-eyebrow text-muted">
          Project details <span aria-hidden className="text-champagne-2">*</span>
        </label>
        <textarea
          id="details"
          name="details"
          rows={5}
          required
          className="field mt-3 resize-y"
          placeholder="The product, its dimensions if known, the feeling you want the packaging to have, and any deadline."
          aria-invalid={!!errors.details}
          aria-describedby={errors.details ? "details-err" : undefined}
        />
        {errors.details && (
          <p id="details-err" className="t-small mt-2 text-[#9a3b2e]">
            {errors.details}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-8">
        <button type="submit" className="t-nav btn-yellow font-bold px-8 py-5">
          Request a quote
        </button>
        {site.whatsapp && (
          <p className="t-small max-w-xs text-muted">Opens WhatsApp with your request prefilled. You just press Send.</p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  error,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  autoComplete?: string;
}) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="t-eyebrow text-muted">
        {label} {required && <span aria-hidden className="text-champagne-2">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="field mt-2"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
      />
      {error && (
        <p id={`${id}-err`} className="t-small mt-2 text-[#9a3b2e]">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  required,
  error,
}: {
  label: string;
  name: string;
  options: readonly string[];
  required?: boolean;
  error?: string;
}) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="t-eyebrow text-muted">
        {label} {required && <span aria-hidden className="text-champagne-2">*</span>}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue=""
        className="field mt-2"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
      >
        <option value="" disabled>
          Select
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-err`} className="t-small mt-2 text-[#9a3b2e]">
          {error}
        </p>
      )}
    </div>
  );
}
