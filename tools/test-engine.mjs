import { readFileSync } from 'node:fs'

const html = readFileSync(new URL('../App.html', import.meta.url), 'utf8')
const m = html.match(/\/\* ENGINE-START \*\/([\s\S]*?)\/\* ENGINE-END \*\//)
if (!m) { console.error('FAIL: ENGINE-START/ENGINE-END markers not found in App.html'); process.exit(1) }

const engine = {}
new Function('exports', m[1] + '\nexports.computeCost = computeCost; exports.costForQty = costForQty;')(engine)
const { computeCost, costForQty } = engine

const RATES = {
  plate: 1200, print: 900, proof: 3500, uv_setup: 3000, uv_run: 3.5,
  foil_block: 45, foil_run: 2.5, emb_block: 60, emb_run: 2,
  dc_run: 1800, paste: 2.5, pack: 1.5,
  waste: 0.07, setup_sheets: 200,
  fx: 285, margin: 0.4, fr_dhl: 9, fr_air: 5.5, fr_sea: 180, docs: 120, bank_pct: 0.02,
}
const CTX = {
  rates: RATES,
  boards: [{ name: 'SBS / Ivory Board', pkr_per_kg: 520 }],
  films: [{ name: 'Soft Touch / Velvet', pkr_per_sqin: 0.045 }, { name: 'None', pkr_per_sqin: 0 }],
}
const JOB = {
  qty: 5000, len: 45, wid: 45, hgt: 120, flap: 15, flat_w: 195, flat_h: 210,
  board: 'SBS / Ivory Board', gsm: 350, psw: 635, psh: 965, trim_w: 10, trim_h: 17,
  col_f: 5, col_b: 0, lam: 'Soft Touch / Velvet', uv: 'Yes', foil: 'Yes', foil_area: 6,
  emb: 'No', emb_area: 4, other_pkr: 0, die_cost: 8000, local_tr: 4000,
  pack_pct: 0.08, cbm: 1.8, mode: 'Air Freight', qty2: 10000,
}

let failures = 0
function eq(label, got, want, tol = 0.01) {
  if (!(Math.abs(got - want) <= tol)) { console.error(`FAIL ${label}: got ${got}, want ${want}`); failures++ }
}
function ok(label, cond) { if (!cond) { console.error(`FAIL ${label}`); failures++ } }

// ── Parity with the verified pre-refactor engine ──
const m1 = computeCost(JOB, CTX)
eq('ups', m1.ups, 12, 0)
eq('gross sheets', m1.gross, 647, 0)
eq('direct PKR', m1.direct, 152538.33, 0.5)
eq('total PKR (no overhead)', m1.total, 152538.33, 0.5)
eq('exw USD', m1.exw, 892.04, 0.05)
ok('costForQty(10000) cheaper per pc', costForQty(JOB, CTX, 10000).perPc < m1.perPc)

// ── Task 2: overrides, vendors, no overhead ──
const m2 = computeCost(JOB, CTX)
eq('no overhead: total equals direct', m2.total, m2.direct, 0.001)

const jOv = { ...JOB, overrides: { board: 60000, paste: 10000 } }
const mOv = computeCost(jOv, CTX)
eq('board override wins', mOv.parts.board, 60000, 0.001)
eq('paste override wins', mOv.parts.paste, 10000, 0.001)
eq('override total consistent', mOv.direct,
   m2.direct - m2.parts.board - m2.parts.paste + 70000, 0.01)

const jOv0 = { ...JOB, overrides: { proof: 0 } }
eq('zero is a valid override', computeCost(jOv0, CTX).parts.proof, 0, 0.001)

// ── Task 3: repeat order ──
const jRep = { ...JOB, repeat: 'Yes' }
const mRep = computeCost(jRep, CTX)
eq('repeat: plates zero', mRep.parts.plates, 0, 0.001)
eq('repeat: die zero', mRep.parts.die, 0, 0.001)
eq('repeat: proof zero', mRep.parts.proof, 0, 0.001)
eq('repeat: foil is run-only', mRep.parts.foil, mRep.gross * 2.5, 0.01)
eq('repeat: uv is run-only', mRep.parts.uv, mRep.gross * 3.5, 0.01)
ok('repeat is cheaper', mRep.direct < computeCost(JOB, CTX).direct)

// ── Task 4: sea CBM scales with qty; bank fee on full invoice ──
const jSea = { ...JOB, mode: 'Sea LCL' }
const sea5 = computeCost(jSea, CTX)
const sea50 = costForQty(jSea, CTX, 50000)
ok('sea freight grows with qty', sea50.freight > sea5.freight * 5)
const vol1 = (195/1000) * (210/1000) * (350/800000)
eq('cbmAuto at 5000', sea5.cbmAuto, vol1 * 5000 * 1.08, 0.001)
const jSeaOv = { ...jSea, cbm_override: 2.5 }
eq('cbm override wins', computeCost(jSeaOv, CTX).freight, 2.5 * 180, 0.01)

const m4 = computeCost(JOB, CTX)
eq('bank fee on full invoice', m4.bankFee, 0.02 * (m4.exw + m4.freight + 120), 0.01)

// ── Task 5: DAP / DDP ──
const mDap = computeCost({ ...JOB, incoterm: 'DAP' }, CTX)
eq('DAP total = exw+freight+docs+bank', mDap.ddp,
   mDap.exw + mDap.freight + 120 + mDap.bankFee, 0.01)
eq('DAP duty is zero', mDap.duty, 0, 0.001)

const jDdp = { ...JOB, incoterm: 'DDP', duty_pct: 0.03, vat_pct: 0.20 }
const mDdp = computeCost(jDdp, CTX)
eq('duty = 3% of (exw+freight)', mDdp.duty, 0.03 * (mDdp.exw + mDdp.freight), 0.01)
eq('vat = 20% of (exw+freight+duty)', mDdp.vat,
   0.20 * (mDdp.exw + mDdp.freight + mDdp.duty), 0.01)
eq('DDP total = DAP + duty + vat', mDdp.ddp, mDdp.dap + mDdp.duty + mDdp.vat, 0.01)
ok('default incoterm is DAP', Math.abs(computeCost(JOB, CTX).duty) < 0.001)

if (failures) { console.error(`\n${failures} failure(s)`); process.exit(1) }
console.log('engine tests: all passed')
