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

  // Which body panel carries each tuck. STE hinges both on the back;
  // RTE reverses the bottom onto the front, which nests better on the sheet.
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
