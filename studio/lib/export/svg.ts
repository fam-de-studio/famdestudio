import type { Dieline, Point } from '../geometry'

const CUT = '#FF00FF'
const CREASE = '#0000FF'
const BLEED = '#00FFFF'

const round = (n: number) => Math.round(n * 1000) / 1000

const poly = (pts: Point[]) => pts.map((p) => `${round(p.x)},${round(p.y)}`).join(' ')

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
  ${grainArrow(d)}
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
