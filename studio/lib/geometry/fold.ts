import type { Dieline, Point } from './types'

export type Vec3 = [number, number, number]

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const mul = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s]
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const norm = (a: Vec3): Vec3 => {
  const m = Math.hypot(a[0], a[1], a[2])
  if (m === 0) throw new Error('Cannot normalise a zero-length fold axis.')
  return mul(a, 1 / m)
}

/** Rodrigues rotation of point p about the axis running from a to b. */
export function rotateAboutAxis(p: Vec3, a: Vec3, b: Vec3, deg: number): Vec3 {
  const th = (deg * Math.PI) / 180
  const k = norm(sub(b, a))
  const v = sub(p, a)
  const c = Math.cos(th)
  const s = Math.sin(th)
  const rotated = add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c)))
  return add(a, rotated)
}

type Hinge = { a: Vec3; b: Vec3; angle: number }

/**
 * Fold every panel into 3D. Returns panel id to folded vertices.
 * A panel's points are rotated by its own hinge first, then by each ancestor
 * hinge outward to the root.
 */
export function foldDieline(d: Dieline, root = 'front'): Map<string, Vec3[]> {
  const chains = new Map<string, Hinge[]>([[root, []]])
  const queue: string[] = [root]

  while (queue.length) {
    const parent = queue.shift()!
    for (const f of d.folds) {
      const [p0, p1] = f.panels
      let child: string | null = null
      if (p0 === parent && !chains.has(p1)) child = p1
      else if (p1 === parent && !chains.has(p0)) child = p0
      if (!child) continue

      const hinge: Hinge = {
        a: [f.from.x, f.from.y, 0],
        b: [f.to.x, f.to.y, 0],
        angle: p0 === parent ? f.angle : -f.angle,
      }
      chains.set(child, [hinge, ...chains.get(parent)!])
      queue.push(child)
    }
  }

  const out = new Map<string, Vec3[]>()
  for (const panel of d.panels) {
    const chain = chains.get(panel.id)
    if (!chain) throw new Error(`Panel "${panel.id}" is not connected to any fold edge.`)
    out.set(panel.id, panel.outline.map((q: Point) => applyChain([q.x, q.y, 0], chain)))
  }
  return out
}

function applyChain(p: Vec3, chain: Hinge[]): Vec3 {
  let v = p
  for (const h of chain) v = rotateAboutAxis(v, h.a, h.b, h.angle)
  return v
}

export function boundingBox(points: Vec3[]): { min: Vec3; max: Vec3; size: Vec3 } {
  const min: Vec3 = [Infinity, Infinity, Infinity]
  const max: Vec3 = [-Infinity, -Infinity, -Infinity]
  for (const p of points) {
    for (let i = 0; i < 3; i++) {
      if (p[i] < min[i]) min[i] = p[i]
      if (p[i] > max[i]) max[i] = p[i]
    }
  }
  return { min, max, size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] }
}
