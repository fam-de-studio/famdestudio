import { site } from "@/content/site";
import { formatInquiry, inquirySubject, type Inquiry } from "@/lib/inquiry";

/**
 * Inquiry endpoint: the email copy of a quote request. The form's primary
 * channel is a WhatsApp handoff done client-side; this route only sends the
 * backup email through Resend when RESEND_API_KEY is set (503 otherwise).
 *
 * Spam layers, in order: honeypot, minimum fill time, per-IP rate limit,
 * content check. None of them needs a captcha or an external service.
 */

const MIN_FILL_MS = 3_000;
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 3;
const MAX_LINKS = 3;

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const linkRe = /https?:\/\/|www\./gi;

// Per-instance sliding window; resets on restart, which is fine here.
const hits = new Map<string, number[]>();
function rateLimited(ip: string, now: number) {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5_000) hits.clear(); // crude memory cap
  return recent.length > RATE_MAX;
}

function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

function looksLikeSpam(i: Inquiry) {
  if ((i.details.match(linkRe) ?? []).length > MAX_LINKS) return true;
  if (linkRe.test(i.name)) return true;
  if (i.details.length > 30 && !/\s/.test(i.details)) return true;
  return false;
}

type Parsed = { inquiry?: Inquiry; problems: string[]; honeypot: boolean; startedAt: number };

function parse(body: unknown): Parsed {
  if (typeof body !== "object" || body === null) {
    return { problems: ["Bad request body."], honeypot: false, startedAt: NaN };
  }
  const b = body as Record<string, unknown>;
  const str = (k: string, max = 500) => (typeof b[k] === "string" ? (b[k] as string).trim().slice(0, max) : "");
  const startedAt = Number(b.startedAt);

  if (str("website")) return { problems: [], honeypot: true, startedAt };

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
  return problems.length
    ? { problems, honeypot: false, startedAt }
    : { inquiry, problems: [], honeypot: false, startedAt };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, problems: ["Bad request."] }, { status: 400 });
  }

  const { inquiry, problems, honeypot, startedAt } = parse(body);
  if (honeypot) return Response.json({ ok: true });
  if (!inquiry) return Response.json({ ok: false, problems }, { status: 422 });

  const now = Date.now();
  if (!Number.isFinite(startedAt) || now - startedAt < MIN_FILL_MS) {
    return Response.json({ ok: false, problems: ["Please take a moment before sending."] }, { status: 422 });
  }
  if (rateLimited(clientIp(req), now)) {
    return Response.json({ ok: false, problems: ["Too many requests. Try again later."] }, { status: 429 });
  }
  if (looksLikeSpam(inquiry)) {
    return Response.json({ ok: false, problems: ["The request looks like spam."] }, { status: 422 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return Response.json({ ok: false, problems: ["Email service not configured."] }, { status: 503 });
  }

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? `${site.name} <onboarding@resend.dev>`,
      to: [site.email],
      reply_to: inquiry.email,
      subject: inquirySubject(inquiry),
      text: formatInquiry(inquiry),
    }),
  });

  if (!r.ok) return Response.json({ ok: false, problems: ["Email service failed."] }, { status: 502 });
  return Response.json({ ok: true });
}
