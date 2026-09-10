# WhatsApp inquiry handoff + spam layers

**Goal:** a quote request submitted on the site reaches the studio on WhatsApp, with the client's own number attached, while the email copy keeps working and commodity bot spam is filtered out.

## Flow (client, `InquiryForm.tsx`)

1. Validate as today (name, email, project type, details).
2. Synchronously open `https://wa.me/<studio number>?text=<prefilled message>` in a new tab (must happen inside the submit handler so popup blockers allow it; on mobile this opens the WhatsApp app).
3. Show the "sent" screen straight away. It always carries an **Open WhatsApp** button with the same prefilled link (covers blocked popups) and an email fallback link.
4. In the background, POST the same payload to `/api/inquire` so an email copy is also sent when Resend is configured. The result only updates a one-line status under the button; a failure never blocks the WhatsApp route.

The prefilled message and the email body use one formatter in `src/lib/inquiry.ts` so both channels read the same.

## Spam layers (server, `/api/inquire`)

Applied in order; all are silent to bots and cheap to run.

| Layer | Rule | Response |
|---|---|---|
| Honeypot | hidden `website` field filled | `200 ok` (already exists) |
| Time check | payload `startedAt` missing, or less than 3 s before receipt | `422` |
| Rate limit | more than 3 requests from one IP in 10 minutes (in-memory) | `429` |
| Content check | more than 3 links in details, or a URL in the name, or details is one unbroken blob over 30 chars | `422` |

IP comes from `x-forwarded-for` (first entry) or `x-real-ip`. The in-memory map is per server instance and resets on restart, which is acceptable.

The client records `startedAt` when the form mounts and sends it with the payload.

## Not now

Cloudflare Turnstile. Add only if spam still gets through; it needs a Cloudflare account and keys.
