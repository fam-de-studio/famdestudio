import { readFileSync } from 'node:fs'

const html = readFileSync(new URL('../App.html', import.meta.url), 'utf8')
const m = html.match(/\/\* ENGINE-START \*\/([\s\S]*?)\/\* ENGINE-END \*\//)
if (!m) { console.error('FAIL: ENGINE-START/ENGINE-END markers not found in App.html'); process.exit(1) }

const engine = {}
new Function('exports', m[1] + '\nexports.computeCost = computeCost; exports.costForQty = costForQty; exports.imposition = imposition;')(engine)
const { computeCost, costForQty, imposition } = engine

const RATES = {
  plate: 1200, print: 900, print_min: 1000, proof: 3500, uv_setup: 3000, uv_run: 3.5,
  foil_block: 45, foil_run: 2.5, emb_block: 60, emb_run: 2,
  dc_run: 1800, dc_min: 2500, paste: 2.5, paste_lock: 5, pack: 1.5,
  flute_e: 95, flute_b: 110, flute_eb: 180, mount: 6,
  carton_pkr: 220, carton_cbm: 0.06,
  rigid_kg: 260, rigid_gsm: 1200, rigid_make: 45,
  x_window: 6, x_ribbon: 8, x_magnet: 25, x_edge: 10, x_braille: 4,
  waste: 0.07, setup_sheets: 200,
  fx: 285, margin: 0.4, fr_dhl: 9, fr_air: 5.5, fr_sea: 180, docs: 120,
  ins_pct: 0.005, ddp_fee: 25, bank_pct: 0.02,
}
const CTX = {
  rates: RATES,
  boards: [{ name: 'SBS / Ivory Board', pkr_per_kg: 520 }],
  films: [{ name: 'Soft Touch / Velvet', pkr_per_sqin: 0.045 }, { name: 'None', pkr_per_sqin: 0 }],
}
/* The default job in App.html: 45 x 45 x 120 STE, true blank 195 x 246 */
const JOB = {
  style: 'Straight Tuck End (STE)', qty: 5000, len: 45, wid: 45, hgt: 120, flap: 15, tuck: 18, pieces: 1,
  flat_w: 195, flat_h: 246,
  board: 'SBS / Ivory Board', gsm: 350, psw: 635, psh: 965, trim_w: 10, trim_h: 25, grain: 'Long',
  col_f: 5, col_b: 0, lam: 'Soft Touch / Velvet', uv: 'Yes', foil: 'Yes', foil_area: 6,
  emb: 'No', emb_area: 4, other_pkr: 0, die_cost: 8000, local_tr: 4000,
  pack_pct: 0.08, cartons: 0, mode: 'Air Freight', incoterm: 'DAP', qty2: 10000, extras: [],
}

let failures = 0
function eq(label, got, want, tol = 0.01) {
  if (!(Math.abs(got - want) <= tol)) { console.error(`FAIL ${label}: got ${got}, want ${want}`); failures++ }
}
function ok(label, cond) { if (!cond) { console.error(`FAIL ${label}`); failures++ } }

// ── Imposition & grain ──
// printable 625 x 940: upright 3 x 3 = 9, sideways 2 x 4 = 8
eq('upright ups (grain long)', imposition(JOB).ups, 9, 0)
eq('sideways ups (grain short)', imposition({ ...JOB, grain: 'Short' }).ups, 8, 0)
eq('free grain takes the most', imposition({ ...JOB, grain: 'Free' }).ups, 9, 0)
// a blank that only fits well sideways: grain lock must NOT switch it
const wide = { ...JOB, flat_w: 300, flat_h: 120 }
ok('grain long keeps upright even when sideways gives more', imposition(wide).ups < imposition({ ...wide, grain: 'Free' }).ups)
ok('no-fit reports a warning', computeCost({ ...JOB, flat_w: 700 }, CTX).warnings.length === 1)

// ── Sheets & board ──
const m1 = computeCost(JOB, CTX)
eq('net -> run sheets', m1.runSheets, Math.ceil(Math.ceil(5000 / 9) * 1.07), 0)   // 556 -> 595
eq('gross = run + setup', m1.gross, m1.runSheets + 200, 0)
const kgSheet = (635 * 965 / 1e6) * 350 / 1000
eq('board line', m1.parts.board, m1.gross * kgSheet * 520, 0.01)
ok('two blanks per box doubles sheets', computeCost({ ...JOB, pieces: 2 }, CTX).runSheets >= 2 * m1.runSheets - 2)

// ── Press & die minimums ──
eq('print charged at the 1,000 minimum when gross is below it', m1.parts.print, 1000 / 1000 * 900 * 5, 0.01)
const big = costForQty(JOB, CTX, 60000)
ok('print above the minimum scales with gross', big.parts.print > m1.parts.print)
eq('die cutting sits at the job minimum for a small run', m1.parts.dc, 2500, 0.01)
ok('die cutting scales above the minimum', big.parts.dc > 2500)
eq('no plates -> no printing', computeCost({ ...JOB, col_f: 0, col_b: 0 }, CTX).parts.print, 0, 0.001)

// ── Blocks are made for the full sheet ──
eq('foil block = area per box x ups x rate + run', m1.parts.foil, 6 * 9 * 45 + m1.gross * 2.5, 0.01)
const jEmb = { ...JOB, emb: 'Yes' }
eq('emboss block = area per box x ups x rate + run', computeCost(jEmb, CTX).parts.emb, 4 * 9 * 60 + m1.gross * 2, 0.01)

// ── Overrides ──
const jOv = { ...JOB, overrides: { board: 60000, paste: 10000 } }
const mOv = computeCost(jOv, CTX)
eq('board override wins', mOv.parts.board, 60000, 0.001)
eq('paste override wins', mOv.parts.paste, 10000, 0.001)
eq('override total consistent', mOv.direct, m1.direct - m1.parts.board - m1.parts.paste + 70000, 0.01)
eq('zero is a valid override', computeCost({ ...JOB, overrides: { proof: 0 } }, CTX).parts.proof, 0, 0.001)
eq('no overhead: total equals direct', m1.total, m1.direct, 0.001)

// ── Repeat order ──
const mRep = computeCost({ ...JOB, repeat: 'Yes' }, CTX)
eq('repeat: plates zero', mRep.parts.plates, 0, 0.001)
eq('repeat: die zero', mRep.parts.die, 0, 0.001)
eq('repeat: proof zero', mRep.parts.proof, 0, 0.001)
eq('repeat: foil is run-only', mRep.parts.foil, mRep.gross * 2.5, 0.01)
eq('repeat: uv is run-only', mRep.parts.uv, mRep.gross * 3.5, 0.01)
ok('repeat is cheaper', mRep.direct < m1.direct)

// ── Missing board / film never costs zero silently ──
const mNoB = computeCost({ ...JOB, board: 'Renamed Board' }, CTX)
eq('unknown board costs zero', mNoB.parts.board, 0, 0.001)
ok('unknown board raises a warning', mNoB.warnings.some(w => /Board "Renamed Board"/.test(w)))
ok('unknown film raises a warning', computeCost({ ...JOB, lam: 'Ghost Film' }, CTX).warnings.some(w => /Film "Ghost Film"/.test(w)))
eq('None film is fine', computeCost({ ...JOB, lam: 'None' }, CTX).warnings.length, 0, 0)

// ── Extras carry cost ──
const mX = computeCost({ ...JOB, extras: ['Window patch', 'Magnetic closure'] }, CTX)
eq('extras = qty x sum of per-piece rates', mX.parts.extras, 5000 * (6 + 25), 0.01)
eq('no extras -> zero', m1.parts.extras, 0, 0.001)

// ── Rigid boxes ──
const jRig = { ...JOB, style: 'Rigid Magnetic', flat_w: 45 + 240 + 30, flat_h: 45 + 240 + 30, pieces: 2 }
const mRig = computeCost(jRig, CTX)
const coreKg = (2 * (45 * 45 + 2 * 90 * 120) / 1e6) * 1200 / 1000
eq('rigid: greyboard core line', mRig.parts.core, coreKg * 5000 * 260, 0.05)
eq('rigid: making line', mRig.parts.make, 5000 * 45, 0.01)
eq('rigid: no carton pasting', mRig.parts.paste, 0, 0.001)
ok('rigid ships assembled: more CBM than flat', mRig.cbmAuto > m1.cbmAuto)
eq('folding carton has no rigid lines', m1.parts.core + m1.parts.make, 0, 0.001)

// ── Crash-lock pasting, corrugated litho-lam ──
eq('straight-line pasting', m1.parts.paste, 5000 * 2.5, 0.01)
eq('crash-lock pasting', computeCost({ ...JOB, style: 'Auto-Lock Bottom' }, CTX).parts.paste, 5000 * 5, 0.01)
eq('gable uses the lock gluer too', computeCost({ ...JOB, style: 'Gable Box' }, CTX).parts.paste, 5000 * 5, 0.01)
eq('no flute -> no flute or mounting lines', m1.parts.flute + m1.parts.mount, 0, 0.001)
const mFl = computeCost({ ...JOB, style: 'Mailer / Roll-End', flute: 'E-flute' }, CTX)
eq('flute sheet = gross x sheet m² x rate', mFl.parts.flute, mFl.gross * (635 * 965 / 1e6) * 95, 0.01)
eq('mounting = gross x rate', mFl.parts.mount, mFl.gross * 6, 0.01)
ok('flute adds weight', mFl.boxKg > m1.boxKg)
ok('flute adds volume', mFl.cbmAuto > m1.cbmAuto)
eq('unknown flute name is ignored', computeCost({ ...JOB, flute: 'Z-flute' }, CTX).parts.flute, 0, 0.001)

// ── Cartons, weight, volume ──
eq('carton count from volume', m1.cartons, Math.ceil(m1.cbmUsed / 0.06), 0)
eq('carton line', m1.parts.cartons, m1.cartons * 220, 0.01)
eq('typed carton count wins', computeCost({ ...JOB, cartons: 12 }, CTX).cartons, 12, 0)
const vol1 = (195 / 1000) * (246 / 1000) * (350 / 800000)
eq('cbmAuto at 5000', m1.cbmAuto, vol1 * 5000 * 1.08, 0.001)
eq('cbm override wins for freight', computeCost({ ...JOB, mode: 'Sea LCL', cbm_override: 2.5 }, CTX).freight, 2.5 * 180, 0.01)

// ── Freight: volumetric, sea minimum, insurance, bank ──
const light = { ...JOB, gsm: 200 }                     // light board -> volumetric wins
const mLight = computeCost({ ...light, mode: 'DHL Express' }, CTX)
eq('DHL volumetric ÷ 5000 applies when it is heavier', mLight.chargeKg, Math.max(mLight.kgTotal, mLight.cbmUsed * 1e6 / 5000), 0.001)
eq('sea LCL bills at least 1 CBM', costForQty({ ...JOB, mode: 'Sea LCL' }, CTX, 500).freight, 180, 0.01)
ok('sea freight grows with qty', costForQty({ ...JOB, mode: 'Sea LCL' }, CTX, 50000).freight > costForQty({ ...JOB, mode: 'Sea LCL' }, CTX, 10000).freight)
eq('insurance on goods + freight', m1.insurance, 0.005 * (m1.exw + m1.freight), 0.001)
eq('bank fee on the full invoice', m1.bankFee, 0.02 * (m1.exw + m1.freight + 120 + m1.insurance), 0.001)

// ── Pricing, DAP / DDP ──
eq('exw from margin and fx', m1.exw, m1.total / 0.6 / 285, 0.01)
eq('DAP = exw + freight + docs + insurance + bank', m1.ddp, m1.exw + m1.freight + 120 + m1.insurance + m1.bankFee, 0.01)
eq('DAP duty zero', m1.duty + m1.vat + m1.ddpFee, 0, 0.001)
const mDdp = computeCost({ ...JOB, incoterm: 'DDP', duty_pct: 0.03, vat_pct: 0.20 }, CTX)
const cif = mDdp.exw + mDdp.freight + mDdp.insurance
eq('duty on CIF', mDdp.duty, 0.03 * cif, 0.01)
eq('VAT on CIF + duty', mDdp.vat, 0.20 * (cif + mDdp.duty), 0.01)
eq('DDP adds courier duties-paid fee', mDdp.ddpFee, 25, 0.001)
eq('DDP total', mDdp.ddp, mDdp.dap + mDdp.duty + mDdp.vat + 25, 0.01)
ok('option B cheaper per piece', costForQty(JOB, CTX, 10000).perPc < m1.perPc)

if (failures) { console.error(`\n${failures} failure(s)`); process.exit(1) }
console.log('engine tests: all passed')
