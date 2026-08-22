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
