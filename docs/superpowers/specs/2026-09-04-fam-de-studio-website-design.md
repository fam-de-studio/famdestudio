# FAM De Studio — Website Design System & Architecture

Date: 2026-09-04
Status: Approved by brief (the brief instructs: design first, then implement section by section).

## 1. Positioning recap (drives every decision)

Boutique luxury packaging design **and production** studio. Small runs (50–1,000), exceptional detail.
The site must read as a studio run by someone who has stood next to a press since 1998, not a design portfolio.
The packaging photography is the hero; the UI is a quiet gallery wall around it.

Tone: editorial, confident, restrained. No black-and-gold cliché. Champagne accent used like a foil hairline, never as a fill.

## 2. Design system

### 2.1 Colour tokens (CSS variables, Tailwind v4 `@theme`)

| Token            | Value     | Use |
|------------------|-----------|-----|
| `--color-ink`    | `#0E0E0F` | Page background (near-black, slightly warm) |
| `--color-ink-2`  | `#151516` | Alternate section background |
| `--color-ink-3`  | `#1E1E20` | Elevated surfaces, form fields |
| `--color-line`   | `rgba(255,255,255,0.10)` | Hairline rules |
| `--color-ivory`  | `#F2EDE4` | Light sections (Intro, Process, Contact) |
| `--color-ivory-2`| `#E9E2D6` | Light section alt / borders on ivory |
| `--color-text`   | `#ECE8E1` | Primary text on dark |
| `--color-muted`  | `#9A958D` | Secondary text on dark |
| `--color-text-d` | `#141414` | Primary text on ivory |
| `--color-muted-d`| `#6B6660` | Secondary text on ivory |
| `--color-champagne` | `#C9B48A` | Accent: hairlines, eyebrows, active states, hover |
| `--color-champagne-2` | `#A8936B` | Accent on ivory (darker for contrast) |

Rules: accent appears only as text ≤ 14px, 1px rules, and small marks. Never as a background block.
Light sections alternate with dark to give rhythm (dark hero → ivory intro → dark expertise → dark work → dark finishing → ivory structure → dark small runs → ivory process → dark experience/about → ivory tools → dark international → ivory contact → dark footer).

### 2.2 Typography

- Display serif: **Instrument Serif** (Google, regular + italic). Contemporary editorial; uppercase headings track wide, italics for emphasis words.
- UI/body sans: **Manrope** (Google, 300–600). Geometric, quiet, international.
- Loaded via `next/font/google`, `display: swap`, self-hosted at build.

Scale (fluid, `clamp`):

| Class        | Size                          | Font | Tracking |
|--------------|-------------------------------|------|----------|
| `.t-display` | clamp(3rem, 8vw, 8.5rem)      | serif, lh 0.95 | -0.01em |
| `.t-h1`      | clamp(2.5rem, 5.5vw, 5.5rem)  | serif, lh 1.0 | 0 |
| `.t-h2`      | clamp(2rem, 4vw, 3.75rem)     | serif, lh 1.05 | 0 |
| `.t-h3`      | clamp(1.5rem, 2.4vw, 2.25rem) | serif, lh 1.15 | 0 |
| `.t-lead`    | clamp(1.125rem, 1.4vw, 1.375rem) | sans 300, lh 1.55 | 0 |
| `.t-body`    | 1rem / 1.0625rem              | sans 400, lh 1.7 | 0 |
| `.t-small`   | 0.8125rem                     | sans 400, lh 1.5 | 0 |
| `.t-eyebrow` | 0.6875rem uppercase           | sans 500, lh 1 | 0.22em |
| `.t-nav`     | 0.75rem uppercase             | sans 500 | 0.18em |

Uppercase serif headings use `letter-spacing: 0.02em`. Numbers (01, 1998, 25+) use serif with tabular figures.

### 2.3 Spacing & grid

- Container: `max-width: 1440px`, padding `clamp(1.25rem, 4vw, 4rem)`.
- Section vertical rhythm: `py: clamp(5rem, 12vw, 11rem)`.
- 12-column grid on desktop; editorial offsets use column starts (e.g. text starts at col 2 or 7).
- Hairline dividers (`1px --color-line`) are the main structural device; no card boxes.
- Radius: 0 everywhere (packaging is square-edged). Images are hard-edged.

### 2.4 Motion (all gated on `prefers-reduced-motion`)

- Reveal on scroll: opacity 0→1 + translateY 24px→0, 900ms, `cubic-bezier(.2,.6,.2,1)`, stagger 80ms via `--i`.
- Image reveal: clip-path inset from bottom + slight scale 1.06→1, 1.2s.
- Hover on work images: scale 1.03, 1.2s ease.
- Hero: slow scale-down 1.08→1 over 2s on load; subtle parallax (translateY ≤ 8% of scroll) via rAF.
- Page transition: `template.tsx` wraps pages with 500ms fade+rise.
- Cursor: desktop only (`pointer: fine`), 12px ring that grows to 56px with label "VIEW" over work links.
- Process steps: hairline draws in (scaleX) as each step enters.
- Nothing loops. Nothing bounces.

### 2.5 Components (design-level)

Eyebrow (numbered section label `01 — INTRODUCTION`), Rule, Button (primary: ivory fill on dark / ink fill on ivory; secondary: hairline underline link with arrow), ImageFrame (ratio + reveal), WorkTile (image, name, type, finishes), FinishCard (large image + caption + one-line physical description), ProcessStep, TimelineItem, FormField, Select, CheckboxChip.

## 3. Image system

Source: `Final Images/` → copied to `site/src/images/` with kebab names; imported statically so Next generates width/height + blur placeholder and serves AVIF/WebP.

| Section / use | File |
|---|---|
| Hero | hero-02 (dark cinematic; clean text) |
| Intro | fam-de-studio-02 (soft-touch FAM box) |
| Expertise backdrop | folding-carton-collection-02 |
| Work: Perfume | luxury-perfume-box-01 (cover), -02, main-image |
| Work: Cosmetics cartons | luxury-cosmetic-cartons, hot-foil-and-spot-uv |
| Work: Chocolate | chocolate-packaging |
| Work: Jewellery | jewellery-rigid-box, luxury-gift-box-02 |
| Work: Gift drawer box | luxury-gift-box-01 |
| Work: Magnetic box | magnetic-box |
| Work: Metalized carton | metalized-printing |
| Work: Folding carton collection | folding-carton-collection-01, -02 |
| Finishing ×9 | hot-foil-close-up, emboss-close-up, deboss-close-up, spot-uv-close-up, textured-uv, drip-off, metalized-printing, fam-de-studio-02 (soft touch), extreme-craftsmanship-detail (rigid construction) |
| Structure | folding-carton-collection-02 + SVG dieline diagram (code) |
| Small runs backdrop | hero-03 |
| About | fam-de-studio-01, rigid-box |
| International backdrop | hero-01 |
| OG image | hero-02 |
| Not used | hero-04, full-fam-de-studio-collection (visible AI-garbled lettering; flagged to owner) |

## 4. Page architecture

```
/                 Home: 13 sections in brief order + footer
/work             Index of all projects (asymmetric grid)
/work/[slug]      Case study (10-part structure) + next project
/sitemap.xml      generated
/robots.txt       generated
```
Nav items WORK / EXPERTISE / FINISHING / ABOUT / CONTACT link to `/#work` etc.; WORK also has the `/work` index. START A PROJECT → `/#contact`.

## 5. Component architecture (Next.js 16, App Router, TS, Tailwind v4)

```
site/
  src/app/
    layout.tsx        fonts, metadata, Nav, Footer, Cursor
    template.tsx      page transition wrapper
    page.tsx          home (composes sections)
    work/page.tsx
    work/[slug]/page.tsx  generateStaticParams + generateMetadata
    sitemap.ts, robots.ts, not-found.tsx, globals.css
  src/components/
    ui/     Container, Eyebrow, Button, Reveal (client), ImageFrame, Rule, ArrowLink
    site/   Nav (client: sticky + hamburger), Footer, Cursor (client), Logo
    home/   Hero, Intro, Expertise, SelectedWork, Finishing, Structure (+ DielineDiagram svg),
            SmallRuns, Process, Experience, About, Tools, International, Contact (+ InquiryForm client)
    work/   ProjectHero, ProjectSection, ProjectGallery, NextProject
  src/content/
    site.ts        name, email, socials, nav, SEO strings   (owner edits)
    projects.ts    Project[] with all case-study fields + image imports
    finishes.ts    Finish[] (9)
    expertise.ts   3 columns
    process.ts     5 steps
    timeline.ts    4 items
    tools.ts       4 categories
  src/images/      optimized source images
  public/          og.jpg, favicon
```

Client components are limited to: Nav, Cursor, Reveal, InquiryForm, HeroParallax. Everything else is server-rendered.

### 5.1 Data shapes

```ts
type Finish = { slug; name; image; alt; physical: string; description: string }
type Project = {
  slug; name; category; type; finishes: string[]; year?;
  cover: StaticImageData; hero: StaticImageData; gallery: StaticImageData[];
  overview; challenge; concept; structure; materials; printing; finishing; detail?;
  size: 'large' | 'tall' | 'wide' | 'standard'   // grid placement
}
```

### 5.2 Inquiry form

Static site, no database. `InquiryForm` posts JSON to `NEXT_PUBLIC_FORM_ENDPOINT` (Formspree/Web3Forms/any endpoint) when set; otherwise composes a `mailto:` with the fields so the site is functional on day one. Client-side validation, `aria-*` states, success/error messaging. Honeypot field.

## 6. SEO & performance

- `metadata` per page: title template `%s — FAM De Studio`, description, canonical, OG/Twitter with `og.jpg`.
- JSON-LD `Organization` + `ProfessionalService` on home.
- Semantic landmarks, one `h1` per page, alt text describing material/finish, skip link, focus-visible rings in champagne.
- `next/image` with `sizes`, `priority` only on hero, lazy elsewhere.
- No animation library. ~5 small client components.

## 7. Assumptions (owner can change in `src/content/site.ts`)

- Contact email placeholder `hello@famdestudio.com`; domain `https://famdestudio.com`.
- Founder unnamed in copy ("the founder"); can be replaced.
- Project brand names are the fictional names visible in the renders (Aeterna, Aurélia, Maison du Chocolat Fin…) presented as concept studies, since these are studio concept renders.

## 8. Implementation order

1. Scaffold, tokens, fonts, globals, Container/Eyebrow/Button/Reveal.
2. Nav + Footer + layout + Cursor.
3. Content files + image import.
4. Home sections 01–13 in order.
5. Work index + case-study page + NextProject.
6. SEO files, OG image, JSON-LD.
7. Build, lint, accessibility pass, responsive check in browser, report.
