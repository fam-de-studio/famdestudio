import { site } from "@/content/site";

/**
 * Inquiry endpoint. Sends the request by email through Resend when
 * RESEND_API_KEY is set. Without a key it answers 503 and the form falls back
 * to composing an email in the visitor's mail client, so nothing is lost.
 */
type Inquiry = {
  name: string;
  company: string;
  country: string;
  email: string;
  projectType: string;
  quantity: string;
  finishing: string;
  details: string;
};

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function parse(body: unknown): { inquiry?: Inquiry; problems: string[]; honeypot: boolean } {
  if (typeof body !== "object" || body === null) return { problems: ["Bad request body."], honeypot: false };
  const b = body as Record<string, unknown>;
  const str = (k: string, max = 500) => (typeof b[k] === "string" ? (b[k] as string).trim().slice(0, max) : "");

  if (str("website")) return { problems: [], honeypot: true };

  const problems: string[] = [];
  const inquiry: Inquiry = {
    name: str("name"),
    company: str("company"),
    country: str("country"),
    email: str("email"),
    projectType: str("projectType"),
    quantity: str("quantity"),
    finishing: str("finishing"),
    details: str("details", 4000),
  };
  if (!inquiry.name) problems.push("Name is required.");
  if (!emailOk(inquiry.email)) problems.push("A valid email is required.");
  if (!inquiry.projectType) problems.push("Project type is required.");
  if (!inquiry.details) problems.push("Project details are required.");
  return problems.length ? { problems, honeypot: false } : { inquiry, problems: [], honeypot: false };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, problems: ["Bad request."] }, { status: 400 });
  }

  const { inquiry, problems, honeypot } = parse(body);
  if (honeypot) return Response.json({ ok: true });
  if (!inquiry) return Response.json({ ok: false, problems }, { status: 422 });

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return Response.json({ ok: false, problems: ["Email service not configured."] }, { status: 503 });
  }

  const text = [
    `Name:            ${inquiry.name}`,
    `Company / Brand: ${inquiry.company || "-"}`,
    `Country:         ${inquiry.country || "-"}`,
    `Email:           ${inquiry.email}`,
    `Project type:    ${inquiry.projectType}`,
    `Quantity:        ${inquiry.quantity || "-"}`,
    `Finishing:       ${inquiry.finishing || "-"}`,
    "",
    inquiry.details,
  ].join("\n");

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? `${site.name} <onboarding@resend.dev>`,
      to: [site.email],
      reply_to: inquiry.email,
      subject: `Quote request — ${inquiry.projectType} (${inquiry.quantity || "qty tbc"})`,
      text,
    }),
  });

  if (!r.ok) return Response.json({ ok: false, problems: ["Email service failed."] }, { status: 502 });
  return Response.json({ ok: true });
}
