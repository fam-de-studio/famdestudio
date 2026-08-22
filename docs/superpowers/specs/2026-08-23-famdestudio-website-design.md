# Fam de Studio — Public Website Design

**Date:** 2026-08-23
**Status:** Approved (direction locked through six mockup iterations with the owner)
**Sub-project:** #2 of 5 in the brokerage programme
**Reference mockup:** the approved v5 HTML mockup (dark ground, shimmer foil) — its CSS
techniques are the implementation reference for Section 5.

---

## 1. Purpose and positioning

Public site at `famdestudio.vercel.app` for the owner's printing & packaging business.

**Positioning (owner's decision):** a design studio that also arranges production —
"fancy kaam kernay waly": hot foil, drip-off, metalized, soft touch. NOT a manufacturer
claim, NOT a rate card.

Key facts that shape the site:

- The owner has been a graphic designer **since 1998** and has real client work to show.
- Keylines are drawn in professional structural CAD (owner asked that the tool **not** be
  named on the site — say "professional structural software").
- **Minimum order 200 pieces** (owner's correction; most competitors quote 5,000).
- The Press Docket app remains a separate private quoting tool. **No prices anywhere on
  the site.**
- Contact: `famdestudio@gmail.com` · WhatsApp `+92 324 1691194` · Lahore, Pakistan.

Audience: small premium brands (skincare, chocolate, candles, supplements, specialty
coffee) ordering 200–20,000 pieces.

Conversion: an inquiry form that emails the owner, plus a standing offer — *send your
logo, get a free keyline + 3D visual, no obligation*.

## 2. Approach (locked)

Single landing page (Approach A), structured so technical articles (MDX) and more work
entries can be added later as content files without structural change.

## 3. Page structure (locked, in order)

1. **Hero** — eyebrow `Hot foil · Drip-off · Metalized · Holographic` (the word
   "Holographic" gets the holo treatment); H1 *"The fine work most printers won't
   attempt."* with foil shimmer on "won't attempt"; lede mentions 1998, 200 pieces,
   delivered to your door; gold CTA *"Send your logo — get a free 3D visual"* with
   "No cost. No obligation." under it.
2. **Selected work** — grid of entries from `content/work/*.md`. **If the directory is
   empty the section does not render at all** (no placeholder, no empty state).
3. **Who this is for** — *"Brands too small for a Chinese factory, too particular for a
   local printer."* 200-for-a-launch to 20,000-for-a-season.
4. **What I actually do** — six finish cards, each with a real technical caveat (the
   credibility engine): Hot foil, Drip-off, Metalized board, Soft touch,
   Emboss & deboss, Structure & keylines. Copy as in the approved mockup.
5. **Three numbers** — `1998` (working in print since) · `200` (minimum order) ·
   `Free` (keyline + 3D visual, yours to keep).
6. **How it works** — 4 numbered steps: send a logo → I send a visual (2 working days) →
   we fix the price (delivered, freight included) → I stand at the press (proof first,
   photos before dispatch).
7. **Inquiry form** — name, email, what are you packing, quantity select
   (200–500 / 500–1,000 / 1,000–5,000 / 5,000–20,000 / 20,000+ / not sure), where to,
   finish chips (multi-select incl. "Not sure — advise me"), message + logo link.
8. **Footer** — wordmark (foil), email, WhatsApp, Lahore.

Explicitly absent: stock photos, "trusted by" logos, invented stats, testimonials,
prices, the CAD tool's name.

## 4. Visual direction (locked, v5 mockup)

- **Dark ground** `#0B0A09` — foil reads on dark, not on white.
- Type: Bodoni Moda (display), Archivo (body), IBM Plex Mono (eyebrows/labels) — same
  family as the Press Docket documents.
- **Foil shimmer**: gold gradient swept across text via `background-clip: text`,
  3.8s linear loop, two white flash bands, soft gold `drop-shadow`. Applied to wordmark,
  H1/H2 highlights, card titles, the three numbers, footer wordmark.
- **Holo**: rainbow gradient shift on the single word "Holographic".
- **Sparkles**: ~18 fixed-position 4px dots, pure CSS twinkle (staggered delays/durations),
  `position: fixed`, pointer-events none.
- **Hero glow pool**: radial brass glow behind the hero.
- **Gold CTA**: gradient button with a periodic shine sweep (`::after`) and hover lift.
- **Finish cards**: matte dark cards; on hover a skewed gloss band sweeps across
  ("that sheen is what drip-off does on paper" — the microcopy stays) and the border
  warms to brass.
- **Scroll reveal**: sections fade/rise on scroll with stagger.

**Progressive enhancement is a hard requirement:** all content visible with JS disabled.
The reveal animation arms itself only after JS adds a `js` class to `<body>`; sparkles
are static markup with CSS animation. `prefers-reduced-motion: reduce` disables all
animation and shows everything.

## 5. Architecture

New Next.js app in `E:\QUOT\site\` (same repo as `studio/`).

```
site/
  app/
    layout.tsx          fonts (next/font), metadata, dark body
    page.tsx            assembles sections in order
    api/inquire/route.ts POST → validate → send email via Resend
  components/
    Hero.tsx  Work.tsx  WhoFor.tsx  Finishes.tsx  Numbers.tsx
    Process.tsx  InquiryForm.tsx  Footer.tsx
    Sparkles.tsx  Reveal.tsx      (client components)
  content/
    work/               *.md work entries (empty at launch)
    site.ts             contact details, copy constants
  lib/
    work.ts             reads content/work at build time → WorkEntry[]
    inquiry.ts          zod schema shared by form and API route
  public/work/          work images
```

- Work entries: markdown with frontmatter `title`, `finishes` (list), `image`, `order`;
  body text = caption. `lib/work.ts` reads them server-side at build time (static).
- Site is fully static except the one API route.
- Styling: Tailwind for layout + a small `globals.css` for the foil/holo/sparkle/card
  keyframes (gradient text animation is cleaner as plain CSS than Tailwind utilities).

### Inquiry email — Resend

- `RESEND_API_KEY` env var on Vercel; from `onboarding@resend.dev` (no domain yet),
  `reply_to` = the inquirer's email, to `famdestudio@gmail.com`.
- Free tier (100/day) is far beyond expected volume.
- API route validates with the shared zod schema; on success the form swaps to a
  thank-you state ("I reply within one working day"); on failure the form shows an
  inline error **and the mailto fallback** (`famdestudio@gmail.com`) so no inquiry is
  ever lost.
- Honeypot field (hidden input; if filled, pretend success) — no CAPTCHA.
- **If `RESEND_API_KEY` is unset** (e.g. fresh clone), the route returns 503 and the
  form shows the mailto fallback — the site still works.

### SEO / meta

- Title "Fam de Studio — decorative print & packaging", description mentioning foil /
  drip-off / metalized / soft touch / low minimums; OpenGraph tags; a simple OG image
  (dark ground, foil wordmark) generated as a static PNG at `public/og.png`.

## 6. Deployment

The three traps from sub-project #1 are already recorded in the dieline plan; they apply
here identically (local git identity, production branch `main`).

**Root Directory change:** the Vercel project currently builds `studio/`. The decision
(owner-approved): `famdestudio.vercel.app` now serves the **website** — set Root
Directory to `site`. The studio remains in the repo and runs locally via `npm run dev`;
it gets a separate Vercel project later only if needed.

## 7. Testing

- `lib/work.ts`: unit tests (Vitest, Node env) — empty dir → `[]`; entries sorted by
  `order`; bad frontmatter → build-time error naming the file.
- `lib/inquiry.ts`: schema accepts a valid payload, rejects missing email, strips the
  honeypot.
- API route: unit-test the handler with mocked Resend (success, Resend failure → 502,
  missing key → 503, honeypot → fake success).
- Manual browser pass on the deployed site: content visible with JS off; reduced-motion
  honoured; form round-trip lands an email in the Gmail inbox.

## 8. Out of scope

- MDX articles (planned follow-on; the content/ structure anticipates them)
- File upload on the form (link field instead — YAGNI until inquiries demand it)
- Analytics, custom domain, multilingual, CMS
