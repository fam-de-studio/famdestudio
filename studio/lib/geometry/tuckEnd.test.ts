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

function bboxOf(pts: Point[]) {
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
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
    expect(tucks.length).toBe(2)
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
