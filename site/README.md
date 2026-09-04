# FAM De Studio — website

Luxury packaging design & production studio site. Next.js 16 (App Router), TypeScript, Tailwind CSS v4. Static content, no database.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (all pages pre-rendered)
npm start
```

## Where to edit things

| What | File |
|---|---|
| Studio name, email, domain, WhatsApp, nav, SEO keywords | `src/content/site.ts` |
| Projects / case studies (text + images) | `src/content/projects.ts` |
| The nine finishing categories | `src/content/finishes.ts` |
| Expertise columns, process steps, timeline, tools, form options | `src/content/studio.ts` |
| Images | `src/images/` (imported statically so Next generates sizes, AVIF/WebP and blur placeholders) |
| Social-share image | `public/og.jpg` (1376×768) |
| Design tokens (colours, type scale, motion) | `src/app/globals.css` |

### Adding a project

1. Drop the images in `src/images/`.
2. Add an entry to the `projects` array in `src/content/projects.ts` (copy an existing one). The `size` field controls its shape in the grid; the first six entries appear on the home page.
3. The case-study page, sitemap and next/previous links are generated automatically.

## Inquiry form

The form posts to the built-in `/api/inquire` route:

- **With `RESEND_API_KEY` set** (see `.env.example`), the route emails the request to the studio address via Resend and the visitor sees an inline confirmation.
- **Without it**, the route answers 503 and the form opens the visitor's mail app with everything pre-filled, so no request is lost before email is configured.
- Set `NEXT_PUBLIC_FORM_ENDPOINT` to post to Formspree, Web3Forms or similar instead.

## Deploy

Any Node host works (Vercel, Netlify, a VPS with `npm start`). Image optimisation uses Next's built-in loader, so a Node runtime is expected rather than a purely static export.

## Structure

```
src/app            routes, layout, sitemap, robots, 404
src/components/ui  Reveal, Parallax, Button, Eyebrow, Spec, Container
src/components/site Nav, Footer, Logo, Cursor
src/components/home the 13 home sections in order
src/components/work WorkTile
src/content        all editable content
```

Motion is CSS-driven and disabled under `prefers-reduced-motion`. Client-side JavaScript is limited to the nav, cursor, scroll reveal, parallax and the form.
