export const MM_PER_INCH = 25.4

/**
 * Trade allowances, millimetres.
 *
 * UNCONFIRMED DEFAULTS — verify with the project owner before trusting any
 * dieline produced from them. Every panel dimension derives from this object.
 */
export const TRADE = {
  glueFlapWidth: 15,
  glueFlapChamfer: 3,
  tuckClearance: 2,
  dustClearance: 2,
  dustChamfer: 4,
  bleed: 3,
  rigidTurnIn: 16,
  rigidLidClearance: 0.5,
  greyboardThickness: 2.0,
} as const

export type BoardKey = 'sbs' | 'artC1S' | 'kraft'

const CALIPER: Record<BoardKey, Record<number, number>> = {
  sbs:    { 300: 0.35, 350: 0.42, 400: 0.48 },
  artC1S: { 300: 0.33, 350: 0.39, 400: 0.45 },
  kraft:  { 300: 0.38, 350: 0.45, 400: 0.52 },
}

export function caliperFor(board: BoardKey, gsm: number): number {
  const row = CALIPER[board]
  const v = row[gsm]
  if (v === undefined) {
    const known = Object.keys(row).join(', ')
    throw new Error(`No caliper on file for ${board} at ${gsm} gsm. Known: ${known}.`)
  }
  return v
}
