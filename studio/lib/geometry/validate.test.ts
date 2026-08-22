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
