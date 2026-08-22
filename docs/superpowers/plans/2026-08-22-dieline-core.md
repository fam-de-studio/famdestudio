# Dieline Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Given box style and L×W×H, produce a production-ready folding-carton dieline (STE and RTE) and export it as layered SVG and PDF.

**Architecture:** A pure-TypeScript geometry core (`lib/geometry/`) that imports neither React nor Three, so it unit-tests in Node. It emits a single interchange type, `Dieline`. A separate export layer turns `Dieline` into SVG and PDF. A thin Next.js UI drives the core and renders the flat dieline as inline SVG. Plan B adds 3D on top of the same `Dieline`.

**Tech Stack:** Next.js 16 (App Router) · TypeScript · Tailwind · Vitest (Node environment) · `svg2pdf.js` + `jspdf` for PDF

## Status

Tasks 1-8 complete on branch `feat/dieline-core`. 31 tests pass. Verified in a running
browser: STE and RTE both render, RTE genuinely reverses the bottom tuck onto the front
panel, invalid dimensions disable export, and the PDF button produces a real
`application/pdf` blob.

Task 9 is blocked: `gh auth login` has not been run, so the repository cannot be pushed.

---

## Global Constraints

- Project root is `E:\QUOT\studio\`. The repository root is `E:\QUOT\`.
- `lib/geometry/**` MUST NOT import React, Three.js, or any browser API. It runs in Node.
- All geometry units are **millimetres**. All angles are **degrees** at the type boundary.
- Every trade constant lives in `lib/geometry/constants.ts`. No magic numbers elsewhere.
- ⚠️ **The values in `constants.ts` are unconfirmed defaults.** The project owner is a printing expert and must verify them. Task 2 is where they get set; every later task depends on them.
- After any task that adds files, `clasp status` run from `E:\QUOT` MUST still list exactly three tracked files: `App.html`, `appsscript.json`, `Code.js`.
- Commit after every task.

---

### Task 1: Scaffold the project and test harness

**Files:**
- Create: `studio/` (via create-next-app)
- Create: `studio/vitest.config.ts`
- Create: `studio/lib/geometry/smoke.test.ts`
- Modify: `E:\QUOT\.gitignore`

**Interfaces:**
- Consumes: nothing
- Produces: a `npm test` command that runs Vitest against `lib/**/*.test.ts` in a Node environment

- [ ] **Step 1: Scaffold Next.js**

Run from `E:\QUOT`:

```bash
npx create-next-app@latest studio --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

- [ ] **Step 2: Install Vitest**

Run from `E:\QUOT\studio`:

```bash
npm install -D vitest
```

- [ ] **Step 3: Add Vitest config**

Create `studio/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
})
```

- [ ] **Step 4: Add the test script**

In `studio/package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write a smoke test that fails**

Create `studio/lib/geometry/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { MM_PER_INCH } from './constants'

describe('harness', () => {
  it('resolves the geometry module', () => {
    expect(MM_PER_INCH).toBe(25.4)
  })
})
```

- [ ] **Step 6: Run it and confirm it fails**

Run from `studio/`: `npm test`
Expected: FAIL — cannot resolve `./constants`.

- [ ] **Step 7: Create the constants module with just this value**

Create `studio/lib/geometry/constants.ts`:

```ts
export const MM_PER_INCH = 25.4
```

- [ ] **Step 8: Run it and confirm it passes**

Run: `npm test`
Expected: PASS, 1 test.

- [ ] **Step 9: Verify clasp is still isolated**

Run from `E:\QUOT`: `clasp status`
Expected: Tracked files lists exactly `App.html`, `appsscript.json`, `Code.js`. If `studio/` files appear, `.claspignore` is broken — stop and fix it before continuing.

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat: scaffold studio app with vitest harness"
```

---

### Task 2: Trade constants and the caliper table

**Files:**
- Modify: `studio/lib/geometry/constants.ts`
- Create: `studio/lib/geometry/constants.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `TRADE` — object with `glueFlapWidth`, `glueFlapChamfer`, `tuckClearance`, `dustClearance`, `dustChamfer`, `bleed`, `rigidTurnIn`, `rigidLidClearance`, `greyboardThickness` (all `number`, mm)
  - `type BoardKey = 'sbs' | 'artC1S' | 'kraft'`
  - `caliperFor(board: BoardKey, gsm: number): number` — throws on an unlisted gsm

⚠️ **Before writing this task's code, confirm every number below with the project owner.** They are the author's defaults, not verified trade values, and every dieline depends on them.

- [ ] **Step 1: Write the failing test**

Create `studio/lib/geometry/constants.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { TRADE, caliperFor } from './constants'

describe('trade constants', () => {
  it('exposes the folding-carton allowances', () => {
    expect(TRADE.glueFlapWidth).toBeGreaterThan(0)
    expect(TRADE.tuckClearance).toBeGreaterThan(0)
    expect(TRADE.bleed).toBe(3)
  })
})

describe('caliperFor', () => {
  it('returns board thickness in mm', () => {
    expect(caliperFor('sbs', 350)).toBe(0.42)
    expect(caliperFor('kraft', 300)).toBe(0.38)
  })

  it('throws with an actionable message for an unlisted gsm', () => {
    expect(() => caliperFor('sbs', 275)).toThrow(
      'No caliper on file for sbs at 275 gsm. Known: 300, 350, 400.'
    )
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `TRADE` and `caliperFor` are not exported.

- [ ] **Step 3: Implement**

Replace `studio/lib/geometry/constants.ts`:

```ts
export const MM_PER_INCH = 25.4

/**
 * Trade allowances, millimetres.
 *
 * UNCONFIRMED DEFAULTS — verify with the project owner before trusting any
 * dieline produced from them. Every panel dimension derives from this object.
 */
export const TRADE = {
  glueFlapWidth: 15,
  glueFlapChamfer: 3,
  tuckClearance: 2,
  dustClearance: 2,
  dustChamfer: 4,
  bleed: 3,
  rigidTurnIn: 16,
  rigidLidClearance: 0.5,
  greyboardThickness: 2.0,
} as const

export type BoardKey = 'sbs' | 'artC1S' | 'kraft'

const CALIPER: Record<BoardKey, Record<number, number>> = {
  sbs:    { 300: 0.35, 350: 0.42, 400: 0.48 },
  artC1S: { 300: 0.33, 350: 0.39, 400: 0.45 },
  kraft:  { 300: 0.38, 350: 0.45, 400: 0.52 },
}

export function caliperFor(board: BoardKey, gsm: number): number {
  const row = CALIPER[board]
  const v = row[gsm]
  if (v === undefined) {
    const known = Object.keys(row).join(', ')
    throw new Error(`No caliper on file for ${board} at ${gsm} gsm. Known: ${known}.`)
  }
  return v
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add trade constants and caliper table"
```

---

### Task 3: Core types and BoxSpec validation

**Files:**
- Create: `studio/lib/geometry/types.ts`
- Create: `studio/lib/geometry/validate.ts`
- Create: `studio/lib/geometry/validate.test.ts`

**Interfaces:**
- Consumes: `TRADE`, `BoardKey`, `caliperFor` from `./constants`
- Produces:
  - `Point`, `Panel`, `PanelRole`, `FoldEdge`, `BoxStyle`, `BoxSpec`, `Dieline` types
  - `validateSpec(spec: BoxSpec): string[]` — returns an array of human-readable problems, empty when valid

- [ ] **Step 1: Write the types**

Create `studio/lib/geometry/types.ts`:

```ts
import type { BoardKey } from './constants'

export type Point = { x: number; y: number }

export type PanelRole = 'face' | 'glue' | 'tuck' | 'dust'

export type BoxStyle = 'STE' | 'RTE' | 'AUTOLOCK' | 'RIGID'

export interface Panel {
  id: string
  outline: Point[]
  role: PanelRole
}

export interface FoldEdge {
  from: Point
  to: Point
  panels: [string, string]
  angle: number
  type: 'crease' | 'perf'
}

export interface BoxSpec {
  style: BoxStyle
  l: number
  w: number
  h: number
  board: BoardKey
  gsm: number
}

export interface Dieline {
  style: BoxStyle
  dims: { l: number; w: number; h: number; flap: number; caliper: number }
  flat: { width: number; height: number }
  panels: Panel[]
  folds: FoldEdge[]
  cuts: Point[][]
  bleed: number
  grain: 'width' | 'height'
}
```

- [ ] **Step 2: Write the failing test**

Create `studio/lib/geometry/validate.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { validateSpec } from './validate'
import type { BoxSpec } from './types'

const base: BoxSpec = { style: 'STE', l: 45, w: 45, h: 120, board: 'sbs', gsm: 350 }

describe('validateSpec', () => {
  it('accepts a sane carton', () => {
    expect(validateSpec(base)).toEqual([])
  })

  it('rejects non-positive dimensions', () => {
    expect(validateSpec({ ...base, l: 0 })).toContain(
      'Length must be greater than 0 mm.'
    )
  })

  it('rejects a width that cannot carry a tuck', () => {
    expect(validateSpec({ ...base, w: 2 })).toContain(
      'Width 2 mm is too small: tuck depth would be 0 mm. Reduce tuck clearance (2 mm) or increase width.'
    )
  })

  it('rejects a gsm with no caliper on file', () => {
    expect(validateSpec({ ...base, gsm: 275 })).toContain(
      'No caliper on file for sbs at 275 gsm. Known: 300, 350, 400.'
    )
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./validate`.

- [ ] **Step 4: Implement**

Create `studio/lib/geometry/validate.ts`:

```ts
import { TRADE, caliperFor } from './constants'
import type { BoxSpec } from './types'

export function validateSpec(spec: BoxSpec): string[] {
  const problems: string[] = []

  const dims: Array<[string, number]> = [
    ['Length', spec.l],
    ['Width', spec.w],
    ['Height', spec.h],
  ]
  for (const [label, value] of dims) {
    if (!(value > 0)) problems.push(`${label} must be greater than 0 mm.`)
  }

  if (spec.w > 0) {
    const tuckDepth = spec.w - TRADE.tuckClearance
    if (tuckDepth <= 0) {
      problems.push(
        `Width ${spec.w} mm is too small: tuck depth would be ${tuckDepth} mm. ` +
          `Reduce tuck clearance (${TRADE.tuckClearance} mm) or increase width.`
      )
    }
  }

  try {
    caliperFor(spec.board, spec.gsm)
  } catch (e) {
    problems.push((e as Error).message)
  }

  return problems
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `npm test`
Expected: PASS, 8 tests.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add geometry types and spec validation"
```

---

### Task 4: STE panel layout

**Files:**
- Create: `studio/lib/geometry/tuckEnd.ts`
- Create: `studio/lib/geometry/tuckEnd.test.ts`

**Interfaces:**
- Consumes: `TRADE`, `caliperFor`, all types
- Produces: `buildTuckEnd(spec: BoxSpec): Dieline` — handles `style: 'STE'` and `'RTE'`. Panel ids are exactly `glue`, `back`, `side1`, `front`, `side2`, `top-tuck`, `bottom-tuck`, `top-dust1`, `top-dust2`, `bottom-dust1`, `bottom-dust2`.

**Layout.** Body panels run left to right across the flat width:

```
[glue g] [back L] [side1 W] [front L] [side2 W]
```

so flat width = `2(L + W) + g`. The body occupies `y ∈ [0, H]`; closures extend beyond and the whole shape is translated so its minimum is `(0, 0)` at the end.

**STE** places both tuck panels on the **back** panel (top and bottom). **RTE** places the top tuck on the **back** and the bottom tuck on the **front**. This is a genuine geometric difference, not a label.

⚠️ Confirm with the owner that STE hinges both tucks on the *back* rather than the front — conventions differ by shop.

- [ ] **Step 1: Write the failing test**

Create `studio/lib/geometry/tuckEnd.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildTuckEnd } from './tuckEnd'
import { TRADE } from './constants'
import type { BoxSpec, Point } from './types'

const spec: BoxSpec = { style: 'STE', l: 45, w: 45, h: 120, board: 'sbs', gsm: 350 }

const idsOf = (d: { panels: { id: string }[] }) => d.panels.map((p) => p.id).sort()

function bbox(pts: Point[]) {
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  return { w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }
}

describe('buildTuckEnd', () => {
  it('matches the trade flat-width formula 2(L+W)+g', () => {
    const d = buildTuckEnd(spec)
    expect(d.flat.width).toBeCloseTo(2 * (45 + 45) + TRADE.glueFlapWidth, 6)
  })

  it('has flat height H + 2 x the deeper closure flap', () => {
    const d = buildTuckEnd(spec)
    const closure = Math.max(45 - TRADE.tuckClearance, 45 - TRADE.dustClearance)
    expect(d.flat.height).toBeCloseTo(120 + 2 * closure, 6)
  })

  it('emits every expected panel', () => {
    expect(idsOf(buildTuckEnd(spec))).toEqual([
      'back', 'bottom-dust1', 'bottom-dust2', 'bottom-tuck', 'front',
      'glue', 'side1', 'side2', 'top-dust1', 'top-dust2', 'top-tuck',
    ])
  })

  it('sizes the four body faces correctly', () => {
    const d = buildTuckEnd(spec)
    const by = (id: string) => d.panels.find((p) => p.id === id)!
    expect(bbox(by('front').outline)).toEqual({ w: 45, h: 120 })
    expect(bbox(by('back').outline)).toEqual({ w: 45, h: 120 })
    expect(bbox(by('side1').outline)).toEqual({ w: 45, h: 120 })
  })

  it('places all geometry at or above the origin', () => {
    const d = buildTuckEnd(spec)
    const all = d.panels.flatMap((p) => p.outline)
    expect(Math.min(...all.map((p) => p.x))).toBeGreaterThanOrEqual(0)
    expect(Math.min(...all.map((p) => p.y))).toBeCloseTo(0, 6)
  })

  it('insets the left edge by the glue-flap chamfer', () => {
    const d = buildTuckEnd(spec)
    const all = d.panels.flatMap((p) => p.outline)
    expect(Math.min(...all.map((p) => p.x))).toBeCloseTo(TRADE.glueFlapChamfer, 6)
  })

  it('hinges both STE tucks on the back panel', () => {
    const d = buildTuckEnd({ ...spec, style: 'STE' })
    const tucks = d.folds.filter((f) => f.panels[1].endsWith('-tuck'))
    expect(tucks.every((f) => f.panels[0] === 'back')).toBe(true)
  })

  it('hinges the RTE bottom tuck on the front panel', () => {
    const d = buildTuckEnd({ ...spec, style: 'RTE' })
    const bottom = d.folds.find((f) => f.panels[1] === 'bottom-tuck')!
    expect(bottom.panels[0]).toBe('front')
  })

  it('never overlaps two panels in flat space', () => {
    const d = buildTuckEnd(spec)
    for (let i = 0; i < d.panels.length; i++) {
      for (let j = i + 1; j < d.panels.length; j++) {
        const a = bboxOf(d.panels[i].outline)
        const b = bboxOf(d.panels[j].outline)
        const overlapX = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)
        const overlapY = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0)
        expect(overlapX > 0.01 && overlapY > 0.01).toBe(false)
      }
    }
  })
})

function bboxOf(pts: Point[]) {
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
}
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./tuckEnd`.

- [ ] **Step 3: Implement**

Create `studio/lib/geometry/tuckEnd.ts`:

```ts
import { TRADE, caliperFor } from './constants'
import type { BoxSpec, Dieline, FoldEdge, Panel, Point } from './types'

const rect = (x0: number, y0: number, x1: number, y1: number): Point[] => [
  { x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 },
]

export function buildTuckEnd(spec: BoxSpec): Dieline {
  const { l, w, h } = spec
  const g = TRADE.glueFlapWidth
  const tuck = w - TRADE.tuckClearance
  const dust = w - TRADE.dustClearance
  const caliper = caliperFor(spec.board, spec.gsm)

  // Body panel x-ranges, left to right.
  const xGlue = 0
  const xBack = g
  const xSide1 = g + l
  const xFront = g + l + w
  const xSide2 = g + 2 * l + w
  const xEnd = g + 2 * l + 2 * w

  const panels: Panel[] = [
    { id: 'glue',  role: 'glue', outline: chamferGlue(xGlue, 0, xBack, h) },
    { id: 'back',  role: 'face', outline: rect(xBack, 0, xSide1, h) },
    { id: 'side1', role: 'face', outline: rect(xSide1, 0, xFront, h) },
    { id: 'front', role: 'face', outline: rect(xFront, 0, xSide2, h) },
    { id: 'side2', role: 'face', outline: rect(xSide2, 0, xEnd, h) },
  ]

  // Which body panel carries each tuck.
  const topTuckHost = 'back'
  const bottomTuckHost = spec.style === 'RTE' ? 'front' : 'back'

  const hostRange = (id: string): [number, number] =>
    id === 'front' ? [xFront, xSide2] : [xBack, xSide1]

  const [tx0, tx1] = hostRange(topTuckHost)
  const [bx0, bx1] = hostRange(bottomTuckHost)

  panels.push(
    { id: 'top-tuck',    role: 'tuck', outline: rect(tx0, h, tx1, h + tuck) },
    { id: 'bottom-tuck', role: 'tuck', outline: rect(bx0, -tuck, bx1, 0) },
    { id: 'top-dust1',    role: 'dust', outline: chamferDust(xSide1, h, xFront, h + dust, 'up') },
    { id: 'top-dust2',    role: 'dust', outline: chamferDust(xSide2, h, xEnd, h + dust, 'up') },
    { id: 'bottom-dust1', role: 'dust', outline: chamferDust(xSide1, -dust, xFront, 0, 'down') },
    { id: 'bottom-dust2', role: 'dust', outline: chamferDust(xSide2, -dust, xEnd, 0, 'down') },
  )

  const folds: FoldEdge[] = [
    edge('back', 'glue', xBack, 0, xBack, h),
    edge('back', 'side1', xSide1, 0, xSide1, h),
    edge('side1', 'front', xFront, 0, xFront, h),
    edge('front', 'side2', xSide2, 0, xSide2, h),
    edge(topTuckHost, 'top-tuck', tx0, h, tx1, h),
    edge(bottomTuckHost, 'bottom-tuck', bx0, 0, bx1, 0),
    edge('side1', 'top-dust1', xSide1, h, xFront, h),
    edge('side2', 'top-dust2', xSide2, h, xEnd, h),
    edge('side1', 'bottom-dust1', xSide1, 0, xFront, 0),
    edge('side2', 'bottom-dust2', xSide2, 0, xEnd, 0),
  ]

  // Translate so the lowest closure flap sits on y = 0. Tuck and dust depths
  // differ whenever their clearances differ, so the deeper one sets the offset.
  const closure = Math.max(tuck, dust)
  for (const p of panels) p.outline = p.outline.map((q) => ({ x: q.x, y: q.y + closure }))
  for (const f of folds) {
    f.from = { x: f.from.x, y: f.from.y + closure }
    f.to = { x: f.to.x, y: f.to.y + closure }
  }

  return {
    style: spec.style,
    dims: { l, w, h, flap: g, caliper },
    flat: { width: xEnd, height: h + 2 * closure },
    panels,
    folds,
    cuts: [],
    bleed: TRADE.bleed,
    grain: 'height',
  }
}

function edge(a: string, b: string, x0: number, y0: number, x1: number, y1: number): FoldEdge {
  return { from: { x: x0, y: y0 }, to: { x: x1, y: y1 }, panels: [a, b], angle: 90, type: 'crease' }
}

/** Glue flap: chamfered at both ends so it does not show at the carton edge. */
function chamferGlue(x0: number, y0: number, x1: number, y1: number): Point[] {
  const c = TRADE.glueFlapChamfer
  return [
    { x: x1, y: y0 }, { x: x0 + c, y: y0 + c }, { x: x0 + c, y: y1 - c }, { x: x1, y: y1 },
  ]
}

/** Dust flap: outer corners clipped so the flap clears during folding. */
function chamferDust(x0: number, y0: number, x1: number, y1: number, dir: 'up' | 'down'): Point[] {
  const c = TRADE.dustChamfer
  return dir === 'up'
    ? [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1 - c, y: y1 }, { x: x0 + c, y: y1 }]
    : [{ x: x0 + c, y: y0 }, { x: x1 - c, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }]
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS, 17 tests.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: build STE and RTE tuck-end dielines"
```

---

### Task 5: Fold simulation and the closure test

This is the task that proves the dieline is correct. Everything else is presentation.

**Files:**
- Create: `studio/lib/geometry/fold.ts`
- Create: `studio/lib/geometry/fold.test.ts`

**Interfaces:**
- Consumes: `Dieline`, `Panel`, `Point`
- Produces:
  - `type Vec3 = [number, number, number]`
  - `foldDieline(d: Dieline, root?: string): Map<string, Vec3[]>` — panel id to its folded 3D vertices
  - `boundingBox(points: Vec3[]): { size: Vec3 }`

**How it works.** Every panel starts flat in the `z = 0` plane. Panels form a tree through `folds`, rooted at `front`. A child's transform is its parent's transform composed with a rotation about the shared fold edge, where that edge is expressed in the original flat coordinates. So a point is rotated by its own hinge first, then by each ancestor hinge outward to the root. Rotation uses Rodrigues' formula — no matrix library needed.

- [ ] **Step 1: Write the failing test**

Create `studio/lib/geometry/fold.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildTuckEnd } from './tuckEnd'
import { foldDieline, boundingBox, rotateAboutAxis } from './fold'
import type { BoxSpec } from './types'

describe('rotateAboutAxis', () => {
  it('rotates a point 90 degrees about the x axis', () => {
    const p = rotateAboutAxis([0, 1, 0], [0, 0, 0], [1, 0, 0], 90)
    expect(p[0]).toBeCloseTo(0, 6)
    expect(p[1]).toBeCloseTo(0, 6)
    expect(p[2]).toBeCloseTo(1, 6)
  })

  it('leaves points on the axis untouched', () => {
    const p = rotateAboutAxis([5, 0, 0], [0, 0, 0], [1, 0, 0], 137)
    expect(p[0]).toBeCloseTo(5, 6)
    expect(p[1]).toBeCloseTo(0, 6)
    expect(p[2]).toBeCloseTo(0, 6)
  })
})

describe('closure', () => {
  const cases: BoxSpec[] = [
    { style: 'STE', l: 45, w: 45, h: 120, board: 'sbs', gsm: 350 },
    { style: 'RTE', l: 60, w: 30, h: 90, board: 'kraft', gsm: 300 },
    { style: 'STE', l: 100, w: 80, h: 40, board: 'artC1S', gsm: 400 },
  ]

  for (const spec of cases) {
    it(`${spec.style} ${spec.l}x${spec.w}x${spec.h} folds into the requested box`, () => {
      const d = buildTuckEnd(spec)
      const folded = foldDieline(d)
      const faces = ['front', 'back', 'side1', 'side2'].flatMap((id) => folded.get(id)!)
      const { size } = boundingBox(faces)

      const got = [...size].sort((a, b) => a - b)
      const want = [spec.l, spec.w, spec.h].sort((a, b) => a - b)
      const tol = d.dims.caliper

      for (let i = 0; i < 3; i++) {
        expect(Math.abs(got[i] - want[i])).toBeLessThanOrEqual(tol)
      }
    })
  }

  it('places every panel in the tree', () => {
    const d = buildTuckEnd({ style: 'STE', l: 45, w: 45, h: 120, board: 'sbs', gsm: 350 })
    expect(foldDieline(d).size).toBe(d.panels.length)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./fold`.

- [ ] **Step 3: Implement**

Create `studio/lib/geometry/fold.ts`:

```ts
import type { Dieline, Point } from './types'

export type Vec3 = [number, number, number]

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const mul = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s]
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const norm = (a: Vec3): Vec3 => {
  const m = Math.hypot(a[0], a[1], a[2])
  if (m === 0) throw new Error('Cannot normalise a zero-length fold axis.')
  return mul(a, 1 / m)
}

/** Rodrigues rotation of point p about the axis running from a to b. */
export function rotateAboutAxis(p: Vec3, a: Vec3, b: Vec3, deg: number): Vec3 {
  const th = (deg * Math.PI) / 180
  const k = norm(sub(b, a))
  const v = sub(p, a)
  const c = Math.cos(th)
  const s = Math.sin(th)
  const rotated = add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c)))
  return add(a, rotated)
}

type Hinge = { a: Vec3; b: Vec3; angle: number }

/**
 * Fold every panel into 3D. Returns panel id to folded vertices.
 * A panel's points are rotated by its own hinge first, then by each ancestor
 * hinge outward to the root.
 */
export function foldDieline(d: Dieline, root = 'front'): Map<string, Vec3[]> {
  const chains = new Map<string, Hinge[]>([[root, []]])
  const queue: string[] = [root]

  while (queue.length) {
    const parent = queue.shift()!
    for (const f of d.folds) {
      const [p0, p1] = f.panels
      let child: string | null = null
      if (p0 === parent && !chains.has(p1)) child = p1
      else if (p1 === parent && !chains.has(p0)) child = p0
      if (!child) continue

      const hinge: Hinge = {
        a: [f.from.x, f.from.y, 0],
        b: [f.to.x, f.to.y, 0],
        angle: p0 === parent ? f.angle : -f.angle,
      }
      chains.set(child, [hinge, ...chains.get(parent)!])
      queue.push(child)
    }
  }

  const out = new Map<string, Vec3[]>()
  for (const panel of d.panels) {
    const chain = chains.get(panel.id)
    if (!chain) throw new Error(`Panel "${panel.id}" is not connected to any fold edge.`)
    out.set(panel.id, panel.outline.map((q: Point) => applyChain([q.x, q.y, 0], chain)))
  }
  return out
}

function applyChain(p: Vec3, chain: Hinge[]): Vec3 {
  let v = p
  for (const h of chain) v = rotateAboutAxis(v, h.a, h.b, h.angle)
  return v
}

export function boundingBox(points: Vec3[]): { min: Vec3; max: Vec3; size: Vec3 } {
  const min: Vec3 = [Infinity, Infinity, Infinity]
  const max: Vec3 = [-Infinity, -Infinity, -Infinity]
  for (const p of points) {
    for (let i = 0; i < 3; i++) {
      if (p[i] < min[i]) min[i] = p[i]
      if (p[i] > max[i]) max[i] = p[i]
    }
  }
  return { min, max, size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS, 23 tests. If a closure case fails, the dieline is wrong — fix `tuckEnd.ts`, not the tolerance.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: fold dielines into 3D and assert box closure"
```

---

### Task 6: Style registry

**Files:**
- Create: `studio/lib/geometry/index.ts`
- Create: `studio/lib/geometry/index.test.ts`

**Interfaces:**
- Consumes: `buildTuckEnd`, `validateSpec`, all types
- Produces: `buildDieline(spec: BoxSpec): Dieline` — validates first, throws a joined message when invalid, otherwise dispatches by style. Re-exports the public surface of the geometry module.

- [ ] **Step 1: Write the failing test**

Create `studio/lib/geometry/index.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildDieline } from './index'
import type { BoxSpec } from './types'

const spec: BoxSpec = { style: 'STE', l: 45, w: 45, h: 120, board: 'sbs', gsm: 350 }

describe('buildDieline', () => {
  it('dispatches STE to the tuck-end builder', () => {
    expect(buildDieline(spec).panels.length).toBe(11)
  })

  it('throws every validation problem at once', () => {
    expect(() => buildDieline({ ...spec, l: 0, gsm: 275 })).toThrow(
      /Length must be greater than 0 mm\.[\s\S]*No caliper on file/
    )
  })

  it('rejects styles not yet implemented', () => {
    expect(() => buildDieline({ ...spec, style: 'RIGID' })).toThrow(
      'Style "RIGID" is not implemented yet.'
    )
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./index`.

- [ ] **Step 3: Implement**

Create `studio/lib/geometry/index.ts`:

```ts
import { buildTuckEnd } from './tuckEnd'
import { validateSpec } from './validate'
import type { BoxSpec, Dieline } from './types'

export * from './types'
export { TRADE, caliperFor, MM_PER_INCH } from './constants'
export type { BoardKey } from './constants'
export { validateSpec } from './validate'
export { foldDieline, boundingBox, rotateAboutAxis } from './fold'
export type { Vec3 } from './fold'

export function buildDieline(spec: BoxSpec): Dieline {
  const problems = validateSpec(spec)
  if (problems.length) throw new Error(problems.join('\n'))

  switch (spec.style) {
    case 'STE':
    case 'RTE':
      return buildTuckEnd(spec)
    default:
      throw new Error(`Style "${spec.style}" is not implemented yet.`)
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS, 26 tests.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add style registry entry point"
```

---

### Task 7: Layered SVG export

**Files:**
- Create: `studio/lib/export/svg.ts`
- Create: `studio/lib/export/svg.test.ts`

**Interfaces:**
- Consumes: `Dieline` from `@/lib/geometry`
- Produces: `dielineToSvg(d: Dieline): string` — a complete SVG document, sized in millimetres, with three groups: `id="bleed"`, `id="cut"`, `id="crease"`, plus a grain arrow in `id="grain"`

Trade colour convention: cut = magenta `#FF00FF`, crease = blue `#0000FF` dashed, bleed = cyan `#00FFFF`. Die makers read these on sight.

Note this file lives in `lib/export/`, not `lib/geometry/`. Add `'lib/**/*.test.ts'` already covers it — no Vitest config change needed.

- [ ] **Step 1: Write the failing test**

Create `studio/lib/export/svg.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildDieline } from '../geometry'
import { dielineToSvg } from './svg'
import type { BoxSpec } from '../geometry'

const spec: BoxSpec = { style: 'STE', l: 45, w: 45, h: 120, board: 'sbs', gsm: 350 }

describe('dielineToSvg', () => {
  const svg = dielineToSvg(buildDieline(spec))

  it('declares millimetre dimensions matching the flat size', () => {
    const d = buildDieline(spec)
    expect(svg).toContain(`width="${d.flat.width}mm"`)
    expect(svg).toContain(`height="${d.flat.height}mm"`)
  })

  it('separates cut, crease and bleed into named groups', () => {
    expect(svg).toContain('<g id="bleed"')
    expect(svg).toContain('<g id="cut"')
    expect(svg).toContain('<g id="crease"')
  })

  it('uses the trade colour convention', () => {
    expect(svg).toContain('#FF00FF')
    expect(svg).toContain('#0000FF')
  })

  it('draws one crease line per fold edge', () => {
    const d = buildDieline(spec)
    const creaseBlock = svg.split('<g id="crease"')[1]
    const lines = creaseBlock.match(/<line /g) ?? []
    expect(lines.length).toBe(d.folds.length)
  })

  it('marks grain direction', () => {
    expect(svg).toContain('<g id="grain"')
    expect(svg).toContain('grain: height')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./svg`.

- [ ] **Step 3: Implement**

Create `studio/lib/export/svg.ts`:

```ts
import type { Dieline, Point } from '../geometry'

const CUT = '#FF00FF'
const CREASE = '#0000FF'
const BLEED = '#00FFFF'

const poly = (pts: Point[]) =>
  pts.map((p) => `${round(p.x)},${round(p.y)}`).join(' ')

const round = (n: number) => Math.round(n * 1000) / 1000

export function dielineToSvg(d: Dieline): string {
  const { width, height } = d.flat
  const b = d.bleed

  const bleedRect =
    `<rect x="${-b}" y="${-b}" width="${round(width + 2 * b)}" ` +
    `height="${round(height + 2 * b)}" fill="none" stroke="${BLEED}" stroke-width="0.25"/>`

  const cuts = d.panels
    .map((p) => `<polygon points="${poly(p.outline)}" fill="none" stroke="${CUT}" stroke-width="0.25"/>`)
    .join('\n    ')

  const creases = d.folds
    .map(
      (f) =>
        `<line x1="${round(f.from.x)}" y1="${round(f.from.y)}" ` +
        `x2="${round(f.to.x)}" y2="${round(f.to.y)}" ` +
        `stroke="${CREASE}" stroke-width="0.25" stroke-dasharray="2 1.5"/>`
    )
    .join('\n    ')

  const arrow = grainArrow(d)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1"
     width="${width}mm" height="${height}mm"
     viewBox="${-b} ${-b} ${round(width + 2 * b)} ${round(height + 2 * b)}">
  <g id="bleed">
    ${bleedRect}
  </g>
  <g id="cut">
    ${cuts}
  </g>
  <g id="crease">
    ${creases}
  </g>
  ${arrow}
</svg>`
}

function grainArrow(d: Dieline): string {
  const vertical = d.grain === 'height'
  const x = round(d.flat.width - 8)
  const y = round(d.flat.height - 8)
  const len = 20
  const [x2, y2] = vertical ? [x, round(y - len)] : [round(x - len), y]
  return `<g id="grain">
    <line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="#000000" stroke-width="0.4"/>
    <text x="${round(x - 2)}" y="${round(y + 4)}" font-size="3.5"
          text-anchor="end" fill="#000000">grain: ${d.grain}</text>
  </g>`
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS, 31 tests.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: export dielines as layered SVG"
```

---

### Task 8: Studio UI — spec panel, flat dieline view, downloads

**Files:**
- Create: `studio/lib/store.ts`
- Create: `studio/components/SpecPanel.tsx`
- Create: `studio/components/FlatView.tsx`
- Create: `studio/components/ExportBar.tsx`
- Modify: `studio/app/page.tsx`

**Interfaces:**
- Consumes: `buildDieline`, `validateSpec`, `BoxSpec` from `@/lib/geometry`; `dielineToSvg` from `@/lib/export/svg`
- Produces:
  - `useSpec(): { spec, setSpec, dieline, problems }` from `lib/store.ts`
  - Working SVG and PDF downloads

- [ ] **Step 1: Install PDF dependencies**

Run from `studio/`:

```bash
npm install jspdf svg2pdf.js
```

- [ ] **Step 2: Write the store**

Create `studio/lib/store.ts`:

```ts
'use client'

import { useEffect, useMemo, useState } from 'react'
import { buildDieline, validateSpec, type BoxSpec, type Dieline } from '@/lib/geometry'

const KEY = 'dieline-studio-spec-v1'

export const DEFAULT_SPEC: BoxSpec = {
  style: 'STE', l: 45, w: 45, h: 120, board: 'sbs', gsm: 350,
}

export function useSpec() {
  const [spec, setSpec] = useState<BoxSpec>(DEFAULT_SPEC)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setSpec({ ...DEFAULT_SPEC, ...JSON.parse(raw) })
    } catch {
      /* ignore unreadable storage */
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(spec))
    } catch {
      /* ignore full or blocked storage */
    }
  }, [spec])

  const problems = useMemo(() => validateSpec(spec), [spec])

  const dieline = useMemo<Dieline | null>(() => {
    if (problems.length) return null
    try {
      return buildDieline(spec)
    } catch {
      return null
    }
  }, [spec, problems])

  return { spec, setSpec, dieline, problems }
}
```

- [ ] **Step 3: Write the spec panel**

Create `studio/components/SpecPanel.tsx`:

```tsx
'use client'

import type { BoxSpec, BoardKey } from '@/lib/geometry'

const NUMBERS: Array<[keyof BoxSpec, string]> = [
  ['l', 'Length L (mm)'],
  ['w', 'Width W (mm)'],
  ['h', 'Height H (mm)'],
]

export function SpecPanel({
  spec, setSpec, problems,
}: {
  spec: BoxSpec
  setSpec: (s: BoxSpec) => void
  problems: string[]
}) {
  return (
    <aside className="w-72 shrink-0 space-y-4 border-r border-neutral-800 p-4">
      <label className="block text-sm">
        <span className="text-neutral-400">Style</span>
        <select
          className="mt-1 w-full rounded bg-neutral-900 p-2"
          value={spec.style}
          onChange={(e) => setSpec({ ...spec, style: e.target.value as BoxSpec['style'] })}
        >
          <option value="STE">Straight Tuck End</option>
          <option value="RTE">Reverse Tuck End</option>
        </select>
      </label>

      {NUMBERS.map(([k, label]) => (
        <label key={k} className="block text-sm">
          <span className="text-neutral-400">{label}</span>
          <input
            type="number"
            className="mt-1 w-full rounded bg-neutral-900 p-2"
            value={spec[k] as number}
            onChange={(e) => setSpec({ ...spec, [k]: Number(e.target.value) })}
          />
        </label>
      ))}

      <label className="block text-sm">
        <span className="text-neutral-400">Board</span>
        <select
          className="mt-1 w-full rounded bg-neutral-900 p-2"
          value={spec.board}
          onChange={(e) => setSpec({ ...spec, board: e.target.value as BoardKey })}
        >
          <option value="sbs">SBS / Ivory</option>
          <option value="artC1S">Art Card C1S</option>
          <option value="kraft">Kraft</option>
        </select>
      </label>

      <label className="block text-sm">
        <span className="text-neutral-400">GSM</span>
        <select
          className="mt-1 w-full rounded bg-neutral-900 p-2"
          value={spec.gsm}
          onChange={(e) => setSpec({ ...spec, gsm: Number(e.target.value) })}
        >
          {[300, 350, 400].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </label>

      {problems.length > 0 && (
        <ul className="space-y-2 rounded border border-red-900 bg-red-950/40 p-3 text-xs text-red-300">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
    </aside>
  )
}
```

- [ ] **Step 4: Write the flat view**

Create `studio/components/FlatView.tsx`:

```tsx
'use client'

import { dielineToSvg } from '@/lib/export/svg'
import type { Dieline } from '@/lib/geometry'

export function FlatView({ dieline }: { dieline: Dieline | null }) {
  if (!dieline) {
    return (
      <div className="grid flex-1 place-items-center text-sm text-neutral-500">
        Fix the problems on the left to see the dieline.
      </div>
    )
  }
  return (
    <div
      className="flex-1 overflow-auto bg-white p-8"
      /* dielineToSvg output is generated from validated numbers, not user text */
      dangerouslySetInnerHTML={{ __html: dielineToSvg(dieline) }}
    />
  )
}
```

- [ ] **Step 5: Write the export bar**

Create `studio/components/ExportBar.tsx`:

```tsx
'use client'

import { dielineToSvg } from '@/lib/export/svg'
import type { Dieline } from '@/lib/geometry'

function download(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export function ExportBar({ dieline }: { dieline: Dieline | null }) {
  const disabled = !dieline
  const base = dieline ? `${dieline.style}-${dieline.dims.l}x${dieline.dims.w}x${dieline.dims.h}` : ''

  async function savePdf() {
    if (!dieline) return
    const { jsPDF } = await import('jspdf')
    await import('svg2pdf.js')
    const host = document.createElement('div')
    host.innerHTML = dielineToSvg(dieline)
    const el = host.querySelector('svg')!
    const { width, height } = dieline.flat
    const doc = new jsPDF({
      unit: 'mm',
      format: [width + 2 * dieline.bleed, height + 2 * dieline.bleed],
      orientation: width > height ? 'landscape' : 'portrait',
    })
    await doc.svg(el, { width: width + 2 * dieline.bleed, height: height + 2 * dieline.bleed })
    doc.save(`${base}-dieline.pdf`)
  }

  return (
    <div className="flex gap-2 border-b border-neutral-800 p-3">
      <button
        disabled={disabled}
        className="rounded bg-neutral-800 px-3 py-1.5 text-sm disabled:opacity-40"
        onClick={() =>
          dieline &&
          download(`${base}-dieline.svg`, new Blob([dielineToSvg(dieline)], { type: 'image/svg+xml' }))
        }
      >
        Download SVG
      </button>
      <button
        disabled={disabled}
        className="rounded bg-amber-700 px-3 py-1.5 text-sm disabled:opacity-40"
        onClick={savePdf}
      >
        Download PDF
      </button>
      {dieline && (
        <span className="ml-auto self-center text-xs text-neutral-500">
          flat {Math.round(dieline.flat.width)} × {Math.round(dieline.flat.height)} mm ·
          caliper {dieline.dims.caliper} mm
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Wire up the page**

Replace `studio/app/page.tsx`:

```tsx
'use client'

import { useSpec } from '@/lib/store'
import { SpecPanel } from '@/components/SpecPanel'
import { FlatView } from '@/components/FlatView'
import { ExportBar } from '@/components/ExportBar'

export default function Page() {
  const { spec, setSpec, dieline, problems } = useSpec()
  return (
    <main className="flex h-screen bg-neutral-950 text-neutral-100">
      <SpecPanel spec={spec} setSpec={setSpec} problems={problems} />
      <section className="flex min-w-0 flex-1 flex-col">
        <ExportBar dieline={dieline} />
        <FlatView dieline={dieline} />
      </section>
    </main>
  )
}
```

- [ ] **Step 7: Verify it runs**

Run from `studio/`: `npm run dev`
Open `http://localhost:3000`. Confirm:
- The default 45 × 45 × 120 STE dieline renders with magenta cut lines and dashed blue creases
- Setting Width to `2` shows the tuck-clearance error and hides the dieline
- Download SVG produces a file that opens in a browser
- Download PDF produces a vector PDF at the correct millimetre size

- [ ] **Step 8: Confirm the whole suite still passes**

Run: `npm test`
Expected: PASS, 31 tests.

- [ ] **Step 9: Verify clasp is still isolated**

Run from `E:\QUOT`: `clasp status`
Expected: exactly `App.html`, `appsscript.json`, `Code.js`.

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat: add studio UI with flat dieline view and exports"
```

---

### Task 9: Publish to GitHub and deploy to Vercel

**Files:**
- Create: `studio/README.md`
- Modify: `E:\QUOT\.gitignore`

**Interfaces:**
- Consumes: a working build from Task 8
- Produces: a private GitHub repository and a live Vercel URL that redeploys on every push

⚠️ **The repository root is `E:\QUOT`, but the Next.js app lives in `E:\QUOT\studio`.** Vercel
defaults to building from the repository root, where there is no `package.json`. The Root
Directory setting below is not optional — the build fails without it.

- [ ] **Step 1: Authenticate GitHub (owner runs this personally)**

```bash
gh auth login
```

Choose GitHub.com, HTTPS, and authenticate in the browser. Confirm with:

```bash
gh auth status
```

- [ ] **Step 2: Ignore Vercel's local metadata**

Append to `E:\QUOT\.gitignore`:

```
.vercel
```

- [ ] **Step 3: Write the README**

Create `studio/README.md`:

```markdown
# Dieline & 3D Visual Studio

Generates production-ready folding-carton dielines and, from Plan B onward, 3D mockups
with realistic decorative finishes — foil, drip-off, soft-touch, metalized.

## Run

    npm install
    npm run dev      # http://localhost:3000
    npm test         # geometry unit tests, Node environment

## Layout

    lib/geometry/    pure TypeScript core — no React, no Three, tests in Node
    lib/export/      Dieline → SVG / PDF
    components/      studio UI
    app/             Next.js App Router

`lib/geometry/constants.ts` holds every trade allowance. Change dieline behaviour there,
never inline.

## Deployment

Vercel builds from the `studio` directory of this repository. See the Root Directory
setting in the Vercel project configuration.
```

- [ ] **Step 4: Create the private repository and push**

Run from `E:\QUOT`:

```bash
gh repo create fam-studio --private --source=. --remote=origin --push
```

- [ ] **Step 5: Verify the push**

```bash
git remote -v && git log --oneline -1 && gh repo view --web
```

Expected: `origin` points at the new repository and the browser shows the committed files.

- [ ] **Step 6: Import the project into Vercel**

Run from `E:\QUOT\studio`:

```bash
npx vercel link
```

Accept the prompts, then set the root directory so Vercel builds the subfolder:

```bash
npx vercel --cwd . --prod
```

If configuring through the Vercel dashboard instead, import the GitHub repository and set
**Settings → General → Root Directory** to `studio` before the first build.

- [ ] **Step 7: Verify the deployment**

Open the deployment URL. Confirm:
- The default 45 × 45 × 120 STE dieline renders
- Download SVG and Download PDF both work in the deployed build
- The browser console shows no errors

- [ ] **Step 8: Confirm automatic redeploys**

Make a trivial edit, then:

```bash
git add -A && git commit -m "chore: verify vercel auto-deploy" && git push
```

Expected: Vercel starts a new deployment automatically.

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "docs: add studio readme and deployment notes" && git push
```

---

## Done when

- `npm test` passes, including the closure test for all three box cases
- The dev server renders a correct STE and RTE dieline from typed dimensions
- SVG and PDF both download at true millimetre scale with separated cut, crease and bleed
- `clasp status` still tracks only the three Apps Script files
- The repository is on GitHub and a Vercel URL serves the studio, redeploying on push

## Follow-on plans

- **Plan B — 3D Studio:** fold-to-mesh via `render/fold.ts`, PBR materials (foil, soft-touch, drip-off roughness maps, metalized), artwork and mask upload, camera presets, PNG batch export
- **Plan C — Auto-lock & Rigid:** interlocking crash-lock bottom geometry; rigid wrap sheet with turn-in allowance and 45° corner notches
