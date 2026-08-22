import type { BoardKey } from './constants'

export type Point = { x: number; y: number }

export type PanelRole = 'face' | 'glue' | 'tuck' | 'dust'

export type BoxStyle = 'STE' | 'RTE' | 'AUTOLOCK' | 'RIGID'

export interface Panel {
  id: string
  outline: Point[]
  role: PanelRole
}

export interface FoldEdge {
  from: Point
  to: Point
  panels: [string, string]
  angle: number
  type: 'crease' | 'perf'
}

export interface BoxSpec {
  style: BoxStyle
  l: number
  w: number
  h: number
  board: BoardKey
  gsm: number
}

export interface Dieline {
  style: BoxStyle
  dims: { l: number; w: number; h: number; flap: number; caliper: number }
  flat: { width: number; height: number }
  panels: Panel[]
  folds: FoldEdge[]
  cuts: Point[][]
  bleed: number
  grain: 'width' | 'height'
}
