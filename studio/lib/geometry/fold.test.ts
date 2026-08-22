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
