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
