# Gallery

**Goal:** show the 25 AI-treated studio photos from `Final Images/real` on the site without writing case-study copy: a home-page teaser and a full `/gallery` page with category tabs and a lightbox.

## Content

`site/src/content/gallery.ts` holds three categories and 25 items. Each item has a static image import, alt text, a short caption (two or three fragments joined with dots), a category, and a `home` flag for the eight shown on the home page.

| Category key | Label | Count |
|---|---|---|
| `rigid` | Rigid & Magnetic Boxes | 8 |
| `sets` | Gift Sets & Apparel | 9 |
| `kraft` | E-commerce & Kraft | 8 |

Images live in `site/src/images/gal-*.jpg` and go through the existing optimize script, so every one gets hashed WebP variants and a blur placeholder. Sources are 362 to 1600 px wide; the three smallest are not in the home picks.

## Surfaces

- **Home** `components/home/Gallery.tsx`, placed after Selected Work: eyebrow, heading, a CSS-columns masonry of the eight `home` items (2 columns under `md`, 3 above), and a "See the full gallery" link. Server component.
- **`/gallery`** `app/gallery/page.tsx`: header, then `components/gallery/GalleryGrid.tsx` (client) with category tabs (All + 3), the masonry of all items, and the lightbox. Each tile is a button that opens the lightbox at that index.
- **Lightbox** inside `GalleryGrid`: fixed overlay, `role="dialog"` `aria-modal`, the image with `object-contain`, caption, previous / next / close buttons. Escape closes, arrow keys navigate, clicking the backdrop closes, body scroll is locked while open, focus moves to the close button on open and back to the tile on close.
- **Nav / footer:** "Gallery" added to `site.nav` (href `/gallery`). **Sitemap:** `/gallery` entry.

## Styling

Reuses `Reveal` (stagger), `hover-zoom`, `sheen`, `t-eyebrow`, `t-small`, `link-line`. Captions use `text-muted`, hover text uses `text-champagne`, so the daily accent applies. Tabs are plain buttons with `aria-pressed`, underlined in the accent when active.

## Out of scope

Case-study pages for these images; a CMS.
