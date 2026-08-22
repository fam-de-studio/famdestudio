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
