import { validateInquiry } from '@/lib/inquiry'
import { SITE } from '@/content/site'

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ ok: false, problems: ['Bad request.'] }, { status: 400 })
  }

  const { inquiry, problems, honeypot } = validateInquiry(body)
  if (honeypot) return Response.json({ ok: true }) // pretend success for bots
  if (!inquiry) return Response.json({ ok: false, problems }, { status: 422 })

  const key = process.env.RESEND_API_KEY
  if (!key) {
    // Not configured yet — the form falls back to mailto so nothing is lost.
    return Response.json({ ok: false, problems: ['Email service not configured.'] }, { status: 503 })
  }

  const text = [
    `Name:        ${inquiry.name}`,
    `Email:       ${inquiry.email}`,
    `Packing:     ${inquiry.packing}`,
    `Quantity:    ${inquiry.quantity || '—'}`,
    `Destination: ${inquiry.destination || '—'}`,
    `Finishes:    ${inquiry.finishes.join(', ') || '—'}`,
    '',
    inquiry.message || '(no message)',
  ].join('\n')

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Fam de Studio <onboarding@resend.dev>',
      to: [SITE.email],
      reply_to: inquiry.email,
      subject: `Inquiry — ${inquiry.packing} (${inquiry.quantity || 'qty?'})`,
      text,
    }),
  })

  if (!r.ok) {
    return Response.json({ ok: false, problems: ['Email service failed.'] }, { status: 502 })
  }
  return Response.json({ ok: true })
}
