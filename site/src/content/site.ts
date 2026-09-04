/**
 * Site-wide settings. Edit this file to update contact details,
 * domain, navigation and shared copy without touching components.
 */
export const site = {
  name: "FAM De Studio",
  tagline: "Luxury Packaging Design & Production",
  motto: "Small Runs. Exceptional Detail.",
  description:
    "FAM De Studio is a boutique luxury packaging design and production studio. Rigid boxes, premium folding cartons, hot foil, embossing, spot UV and fine finishing for small-run, high-detail brands.",
  url: "https://famdestudio.com",
  email: "famdestudio@gmail.com",
  whatsapp: "+92 324 1691194" as string, // leave empty to hide
  location: "Lahore, Pakistan",
  foundedYear: 1998,
  /**
   * Form endpoint. Defaults to the built-in /api/inquire route, which sends
   * mail through Resend when RESEND_API_KEY is set. If the endpoint reports it
   * is not configured, the form composes an email in the visitor's mail app.
   * Override with NEXT_PUBLIC_FORM_ENDPOINT for Formspree, Web3Forms, etc.
   */
  formEndpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "/api/inquire",
  nav: [
    { label: "Work", href: "/#work" },
    { label: "Expertise", href: "/#expertise" },
    { label: "Finishing", href: "/#finishing" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ],
  cta: { label: "Start a project", href: "/#contact" },
  keywords: [
    "luxury packaging",
    "luxury packaging design",
    "premium packaging",
    "rigid box packaging",
    "luxury packaging Pakistan",
    "luxury packaging design Dubai",
    "small batch packaging",
    "premium packaging design",
    "hot foil packaging",
    "embossed packaging",
    "debossed packaging",
    "luxury cosmetic packaging",
    "luxury perfume packaging",
    "premium folding cartons",
  ],
} as const;

export const yearsOfExperience = new Date().getFullYear() - site.foundedYear;
