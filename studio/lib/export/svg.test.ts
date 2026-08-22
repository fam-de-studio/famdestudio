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
    const creaseBlock = svg.split('<g id="crease"')[1].split('</g>')[0]
    const lines = creaseBlock.match(/<line /g) ?? []
    expect(lines.length).toBe(d.folds.length)
  })

  it('marks grain direction', () => {
    expect(svg).toContain('<g id="grain"')
    expect(svg).toContain('grain: height')
  })
})
