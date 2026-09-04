"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/content/site";
import { finishingOptions, projectTypes, quantities } from "@/content/studio";

type Status = "idle" | "sending" | "sent" | "error";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export function InquiryForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sentVia, setSentVia] = useState<"endpoint" | "mailto">("mailto");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries()) as Record<string, string>;
    const finishing = fd.getAll("finishing").map(String);

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

    const payload: Record<string, string> = { ...data, finishing: finishing.join(", ") };
    delete payload.website;

    if (site.formEndpoint) {
      setStatus("sending");
      let notConfigured = false;
      try {
        const res = await fetch(site.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.status === 503) {
          notConfigured = true; // endpoint exists but no mail service configured yet
        } else if (!res.ok) {
          throw new Error(String(res.status));
        } else {
          setSentVia("endpoint");
          setStatus("sent");
          form.reset();
          return;
        }
      } catch {
        setStatus("error");
        return;
      }
      if (!notConfigured) return;
    }

    // Hand off to the visitor's mail client.
    const lines = [
      `Name: ${payload.name}`,
      `Company / Brand: ${payload.company || "-"}`,
      `Country: ${payload.country || "-"}`,
      `Email: ${payload.email}`,
      `Project type: ${payload.projectType}`,
      `Estimated quantity: ${payload.quantity || "-"}`,
      `Finishing: ${payload.finishing || "-"}`,
      "",
      payload.details,
    ];
    const subject = encodeURIComponent(`Quote request — ${payload.projectType} (${payload.quantity || "qty tbc"})`);
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSentVia("mailto");
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="border-t border-line-d pt-10" role="status" aria-live="polite">
        <p className="t-h2">Thank you.</p>
        <p className="t-body mt-4 max-w-md text-muted">
          {sentVia === "endpoint"
            ? "Your request has been received. Expect a reply within two working days."
            : "Your mail app should now be open with the request ready to send. If it isn't, email us directly at"}{" "}
          {sentVia === "mailto" && (
            <a href={`mailto:${site.email}`} className="link-line text-text-d">
              {site.email}
            </a>
          )}
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
        <button
          type="submit"
          disabled={status === "sending"}
          className="t-nav btn-yellow font-bold px-8 py-5 disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Request a quote"}
        </button>
        {status === "error" && (
          <p role="alert" className="t-small text-[#9a3b2e]">
            The request couldn&rsquo;t be sent. Email us directly at{" "}
            <a href={`mailto:${site.email}`} className="underline">
              {site.email}
            </a>
            .
          </p>
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
