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
