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
  if (Math.abs(got - want) > tol) { console.error(`FAIL ${label}: got ${got}, want ${want}`); failures++ }
}
function ok(label, cond) { if (!cond) { console.error(`FAIL ${label}`); failures++ } }

// ── Parity with the verified pre-refactor engine ──
const m1 = computeCost(JOB, CTX)
eq('ups', m1.ups, 12, 0)
eq('gross sheets', m1.gross, 647, 0)
eq('direct PKR', m1.direct, 152538.33, 0.5)
eq('total PKR (with 8% overhead, Task 1 only)', m1.total, 164741.39, 0.5)
eq('exw USD', m1.exw, 963.40, 0.05)
ok('costForQty(10000) cheaper per pc', costForQty(JOB, CTX, 10000).perPc < m1.perPc)

if (failures) { console.error(`\n${failures} failure(s)`); process.exit(1) }
console.log('engine tests: all passed')
