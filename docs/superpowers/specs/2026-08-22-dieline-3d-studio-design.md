# Dieline & 3D Visual Studio — Design

**Date:** 2026-08-22
**Status:** Approved, ready for implementation planning
**Sub-project:** #1 of 5 (see *Programme context* below)

---

## 1. Why this exists

The owner is starting a small printing & packaging brokerage. Current position:

| Have | Missing |
|---|---|
| Deep printing/packaging expertise | Any client |
| Local press/vendor relationships | Any portfolio or physical sample |
| Registered business, bank, Payoneer | — |
| A quoting app (Press Docket, Apps Script) | — |

Chosen sales channels: **own website (Vercel)** and **Fiverr/Upwork**. Both channels are
gated on visual proof, and no proof exists. There is no press and no capital for sample runs.

This tool manufactures that proof digitally. One engine solves three problems at once:

1. **Portfolio** — generate 15–20 credible pieces without a press
2. **Fiverr deliverable** — sell print-ready dielines + mockups, which builds reviews and
   seller rating with zero capital, and naturally upsells into production work
3. **Client hook** — the existing quotation already promises *"send us your logo file and we
   will return a 3D visual on the exact dieline above, at no cost"*. This makes that promise
   cheap to keep.

### Programme context

This is sub-project #1 of five. Ordering was agreed as 1 → 2 → 3 → 4 → 5.

| # | Sub-project | Depends on |
|---|---|---|
| **1** | **Dieline & 3D Visual Studio** *(this spec)* | — |
| 2 | Public website on Vercel | #1 (supplies its content) |
| 3 | Broker costing engine (rework Press Docket) | — (independent) |
| 4 | Inquiry → quote pipeline | #2 + #3 |
| 5 | Vendor & job tracker | #3 |

---

## 2. Scope

### v1 audience: the owner only

An internal studio tool. The UI may be dense and powerful rather than polished. Public
self-serve is sub-project #2 and must not be designed for here.

### Construction coverage — "Approach B"

| Family | v1 delivers | v1 does **not** deliver |
|---|---|---|
| **Tuck-end** (STE, RTE, Auto-lock) | Full production dieline — cut/crease/bleed layers, vector export | — |
| **Rigid** (two-piece, magnetic, drawer) | 3D visual + wrap sheet layout | Greyboard cutting layout |

Rationale: v1's purpose is portfolio imagery. Portfolio needs the box to *look* right, not to
be manufacturable. Tuck-end dielines get full treatment because that is the Fiverr product.
Rigid gets full dieline treatment only when a paying job requires it.

### Build order within v1

`STE / RTE` → `Auto-lock bottom` → `Rigid wrap`

Auto-lock's interlocking bottom is the hardest geometry; it comes after the simpler tuck ends
have proven the folding engine.

### Explicitly out of scope (YAGNI)

- No accounts, database, or server — everything runs in the browser
- No public self-serve mode
- No rigid greyboard cutting layout
- No fold animation *(strong website asset; fast-follow, not v1)*
- No sleeve, pillow, mailer, or roll-end styles

---

## 3. Architecture

**Stack:** Next.js (App Router) + React Three Fiber + Tailwind, deployed on Vercel.
Client-side only in v1 — free hosting, and sub-project #2 reuses the engine without a rewrite.

**Core principle:** a single interchange format, `Dieline`. The geometry layer produces it.
The render, artwork, and export layers only consume it. Nothing else crosses those boundaries.

```
lib/
  geometry/          pure TypeScript — no React, no Three imports
    types.ts           Panel, FoldEdge, Dieline, BoxSpec
    tuckEnd.ts         STE / RTE / Auto-lock  → Dieline
    rigid.ts           rigid → wrap sheet + finished dimensions
    index.ts           style registry: (style, dims) → Dieline
  render/
    fold.ts            Dieline → 3D mesh via fold-graph hinge rotations
    materials.ts       foil / soft-touch / metalized / gloss → Three materials
    scene.ts           lighting + environment presets
  artwork/
    mapping.ts         flat artwork image → per-panel UV coordinates
  export/
    svg.ts             Dieline → SVG, separate cut / crease / bleed layers
    pdf.ts             SVG → PDF
    png.ts             canvas → PNG capture
```

`geometry/` imports neither React nor Three. This is deliberate: it makes the geometry core
unit-testable in Node without a browser, and geometry errors are the most expensive kind here.

### Interchange types

```ts
type Point = { x: number; y: number }          // mm, flat dieline space

type Panel = {
  id: string                                    // 'front' | 'left' | 'top-tuck' | 'glue' …
  outline: Point[]                              // closed polygon
  role: 'face' | 'glue' | 'tuck' | 'dust'       // 'face' = artwork applies
}

type FoldEdge = {
  from: Point; to: Point
  panels: [string, string]                      // the two panels this edge joins
  angle: number                                 // target fold angle, degrees
  type: 'crease' | 'perf'
}

type Dieline = {
  style: string
  dims: { l: number; w: number; h: number; flap: number; caliper: number }
  flat: { width: number; height: number }
  panels: Panel[]
  folds: FoldEdge[]
  cuts: Point[][]                               // windows, thumb notches
  bleed: number
  grain: 'width' | 'height'                     // marked on export
}
```

### Data flow

```
BoxSpec (style + L×W×H + caliper + finishes)
    │
    └─► geometry/index.ts ──► Dieline
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
     export/svg.ts      render/fold.ts        artwork/mapping.ts
          │             + materials.ts               │
          ▼                    └──────────┬──────────┘
   dieline.pdf                            ▼
   (Fiverr deliverable)             export/png.ts
                                          ▼
                                    mockup.png
                                (portfolio / client)
```

---

## 4. Geometry

### Tuck-end family

Body panels across the flat width:

```
[glue flap g] [back L] [side W] [front L] [side W]
```

Flat width = `2(L + W) + g` — consistent with the existing Press Docket `autoFlat` formula.

**STE vs RTE is a real geometric difference, not a label.**

- **STE** — top and bottom tucks fold from the *same* panel
- **RTE** — top tuck from the back panel, bottom tuck from the front panel (reversed). Nests
  better on the press sheet, so it costs less

**Closure geometry:**

- Tuck depth `D = W − tuckClearance`
- Friction ears / slit lock on the tuck panel
- Dust flaps on the side panels, leading edge chamfered so they clear during folding
- Glue flap chamfered at both ends so it does not show at the edge

**Caliper allowance.** Wrapping panels must grow by board thickness. This is where amateur
dielines fail — get it wrong and the box is either tight or the lid will not seat.

### Rigid box (wrap only)

- Base: greyboard bottom + four walls, mitred corners
- `lid inner = base outer + 2 × (greyboard + wrap paper) + lidClearance`
- Wrap sheet: plus/cross shape with turn-in allowance on all outer edges, 45° corner notches
  so the paper does not bunch at the corners

### Flat → 3D folding

Build a graph from `FoldEdge.panels`, rooted at the `front` panel. Each child panel rotates
about its shared fold edge (the hinge axis) by its `angle`; transforms accumulate down the
tree. Panels are extruded to `caliper` thickness — visible at edges, and material on rigid.

### Trade constants — ⚠️ CONFIRM BEFORE IMPLEMENTATION

These are the author's defaults, not the owner's verified numbers. The owner is the domain
expert; these must be reviewed and corrected before the geometry module is built, because
every dieline depends on them.

| Constant | Default | Confirmed? |
|---|---|---|
| Glue flap width | 15 mm | ☐ |
| Tuck clearance (`W − D`) | 2 mm | ☐ |
| Dust flap chamfer | 40° | ☐ |
| Bleed | 3 mm | ☐ |
| Rigid turn-in allowance | 16 mm | ☐ |
| Rigid lid clearance | 0.5 mm | ☐ |
| Greyboard thickness | 2.0 mm | ☐ |

Caliper table (gsm → mm), which drives dieline accuracy:

| Board | 300 gsm | 350 gsm | 400 gsm |
|---|---|---|---|
| SBS / Ivory | 0.35 | 0.42 | 0.48 |
| Art Card C1S | 0.33 | 0.39 | 0.45 |
| Kraft | 0.38 | 0.45 | 0.52 |

Grain direction is marked on every dieline export — rigid wrap quality and crease quality both
depend on it.

---

## 5. Rendering and materials

This is the project's differentiator. Nobody inspects mockup geometry; they respond to how
light behaves on the finish. Cheap mockups make everything glossy and read as fake instantly.

**Fortunate alignment:** the existing quotation already instructs clients to supply
*"foil and spot UV as separate 100% black layers."* Those same layers become the renderer's
masks with no extra preparation.

Each box takes one artwork map plus up to four optional masks.

| Finish | Model |
|---|---|
| Soft-touch / velvet | `roughness 0.9` + **`sheen`** — the velvety edge glow comes from sheen |
| Gloss BOPP | `clearcoat 1.0`, `clearcoatRoughness 0.05` — clearcoat literally *is* the film |
| Matte BOPP | `clearcoat 0.3`, `clearcoatRoughness 0.6` |
| Hot foil | `metalness 1.0`, `roughness ~0.2`, anisotropic highlight, driven by foil mask. Gold / silver / rose / holographic |
| Drip-off / spot UV | **`roughnessMap`** driven by the spot-UV mask — matte field vs glossy spot |
| Metalized / MetPET | semi-transparent ink over a mirror base; `metalness 0.8` where masked |
| Emboss / deboss | mask-driven **normal map**, height ~0.4 mm |

**Drip-off deserves emphasis.** Most online mockups render it as generic shine. The real
effect is the *contrast between matte and gloss*, which is a roughness property, not a
metalness one. A buyer paying a premium for drip-off recognises the difference immediately.

**Lighting.** Foil and metalized need something to reflect or they render black, so an
environment is mandatory, not optional.

- Default: procedural studio environment — zero download, instant
- Presets: 2–3 HDRIs — softbox studio, warm window, dark luxury (best for foil)

**Camera presets** (fixed, for portfolio consistency):
`3/4 hero` · `front elevation` · `top-down flat lay` · `flat dieline view`

---

## 6. Studio UI

Mirrors the Press Docket layout the owner already works in.

```
┌──────────────────────────────────────────────────────────┐
│  style · dimensions · export                             │
├───────────────┬──────────────────────────┬───────────────┤
│  SPEC         │                          │  ARTWORK      │
│  style        │      3D viewport         │  artwork.png  │
│  L × W × H    │      (orbit)             │  foil mask    │
│  board / gsm  │                          │  spot-UV mask │
│  caliper      │   [3D] ⇄ [flat dieline]  │  emboss mask  │
│  finishes     │                          │  foil colour  │
└───────────────┴──────────────────────────┴───────────────┘
```

Workflow: enter dimensions → dieline generates live → drop artwork → drop masks → choose
finishes → choose camera preset → export.

**Saved specs.** Each `BoxSpec` persists to `localStorage` with a "recent" list. Building a
portfolio means creating ~20 boxes; reopening them must be trivial. No database in v1.

### Exports

| File | Purpose |
|---|---|
| `dieline.pdf` — cut/crease/bleed layers, grain marked | Fiverr deliverable |
| `mockup.png` — 2000–3000 px, chosen camera angle | Portfolio, website, client |
| Batch export — all camera presets in one click | Filling the portfolio |
| `spec.json` | Reopening a job |

---

## 7. Error handling

Addressing what actually goes wrong, with actionable messages rather than generic failures.

1. **Artwork size does not match the dieline** — the most common failure. Never silently
   stretch. Overlay the artwork on the flat dieline so the mismatch is visible.
2. **Dieline does not close / panels overlap** — caused by bad dimensions (e.g. flap wider
   than its panel). Detect by overlap-checking panel polygons in flat space.
3. **Impossible dimensions** — e.g. *"Tuck depth 45 mm exceeds side width 45 mm — reduce tuck
   clearance."* Validated at `BoxSpec` level.
4. **Rigid lid will not fit** — compute `lid inner` vs `base outer` and warn.
5. **WebGL unavailable or context lost** — the flat dieline view still works (it is 2D SVG);
   only 3D is disabled.
6. **Oversized artwork** — downscale to a 4096 px cap before texture upload.

---

## 8. Testing

Keeping `geometry/` free of React and Three pays off here: it tests in Node, headless.

**Geometry unit tests**, per style and dimension set:

- Flat size matches the trade formula: `2(L+W)+g` × `H+2D`
- No two panels overlap in flat space
- The fold graph is a connected tree
- **Closure test (the critical one):** after folding every panel by its angle, the resulting
  bounding box equals `L × W × H` within ±`caliper` mm on each axis (so a 0.42 mm board
  permits ±0.42 mm), and every fold angle reaches its target within ±0.5°

The closure test catches nearly every geometry bug, because it proves the dieline actually
folds into the box that was requested.

**Export tests:** golden-file snapshots of SVG path data for a set of known specs.

**Visual checks:** manual in v1. Headless visual regression is a later addition.

---

## 9. Repository layout and a known hazard

**Decided:** both projects share one workspace.

```
E:\QUOT\
  appsscript.json  Code.js  App.html      Press Docket (Apps Script)
  .clasp.json  .claspignore
  docs\superpowers\specs\                 this spec
  studio\                                 Dieline & 3D Visual Studio (Next.js)
```

⚠️ **Hazard, now mitigated.** `.clasp.json` has `skipSubdirectories: false` and an empty
`rootDir`, so `clasp push` would otherwise walk into `studio/` and attempt to push
`node_modules` and build output to Apps Script.

`.claspignore` now excludes everything except the three Apps Script files. Verified with
`clasp status`: only `App.html`, `appsscript.json`, and `Code.js` are tracked.

Re-run `clasp status` after scaffolding `studio/` to confirm the exclusion still holds.

Version control is not yet initialised — `E:\QUOT` is not a git repository.

---

## 10. What this tool cannot do

Stated plainly so it is not mistaken for a complete business solution:

- It cannot win the first client. The website and the Fiverr gig only open the door.
- It cannot guarantee the first job's quality. When a real order lands, standing over the
  press and getting the quality out is the owner's work. One bad first order ends a
  brokerage.

---

## 11. Open decision carried forward

Website positioning — **"manufacturer"** or **"print management / sourcing partner"**? This
changes copy, pricing, and trust posture across sub-project #2.

Recommendation: *sourcing partner*. Premium buyers ask for factory audits and video calls, and
a manufacturer claim would not survive one. "I am Pakistan's decorative print specialist, I
select the right press and I guarantee the quality" is both true and saleable.

Not required for this sub-project; it must be settled before sub-project #2.
