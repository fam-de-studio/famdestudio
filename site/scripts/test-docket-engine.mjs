/**
 * Parity test for the ported costing engine. Same fixture and expectations
 * as the original tools/test-engine.mjs that guarded the Apps Script build.
 * Run: node scripts/test-docket-engine.mjs   (Node 24: TypeScript is stripped natively)
 */
import { computeCost, costForQty } from "../src/lib/docket/engine.ts";

const RATES = {
  plate: 1200, print: 900, proof: 3500, uv_setup: 3000, uv_run: 3.5,
  foil_block: 45, foil_run: 2.5, emb_block: 60, emb_run: 2,
  dc_run: 1800, paste: 2.5, pack: 1.5,
  waste: 0.07, setup_sheets: 200,
  fx: 285, margin: 0.4, fr_dhl: 9, fr_air: 5.5, fr_sea: 180, docs: 120, bank_pct: 0.02,
};
const CTX = {
  rates: RATES,
  boards: [{ name: "SBS / Ivory Board", pkr_per_kg: 520 }],
  films: [{ name: "Soft Touch / Velvet", pkr_per_sqin: 0.045 }, { name: "None", pkr_per_sqin: 0 }],
};
const JOB = {
  qty: 5000, len: 45, wid: 45, hgt: 120, flap: 15, flat_w: 195, flat_h: 210,
  board: "SBS / Ivory Board", gsm: 350, psw: 635, psh: 965, trim_w: 10, trim_h: 17,
  col_f: 5, col_b: 0, lam: "Soft Touch / Velvet", uv: "Yes", foil: "Yes", foil_area: 6,
  emb: "No", emb_area: 4, other_pkr: 0, die_cost: 8000, local_tr: 4000,
  pack_pct: 0.08, cbm: 1.8, mode: "Air Freight", qty2: 10000, repeat: "No", incoterm: "DAP",
  duty_pct: 0, vat_pct: 0, cbm_override: "", overrides: {}, vendors: {},
};

let failures = 0;
function eq(label, got, want, tol = 0.01) {
  if (!(Math.abs(got - want) <= tol)) { console.error(`FAIL ${label}: got ${got}, want ${want}`); failures++; }
}
function ok(label, cond) { if (!cond) { console.error(`FAIL ${label}`); failures++; } }

const m1 = computeCost(JOB, CTX);
eq("ups", m1.ups, 12, 0);
eq("gross sheets", m1.gross, 647, 0);
eq("direct PKR", m1.direct, 152538.33, 0.5);
eq("total PKR (no overhead)", m1.total, 152538.33, 0.5);
eq("exw USD", m1.exw, 892.04, 0.05);
ok("costForQty(10000) cheaper per pc", costForQty(JOB, CTX, 10000).perPc < m1.perPc);

const jOv = { ...JOB, overrides: { board: 60000, paste: 10000 } };
const mOv = computeCost(jOv, CTX);
eq("board override wins", mOv.parts.board, 60000, 0.001);
eq("paste override wins", mOv.parts.paste, 10000, 0.001);
eq("override total consistent", mOv.direct, m1.direct - m1.parts.board - m1.parts.paste + 70000, 0.01);
eq("zero is a valid override", computeCost({ ...JOB, overrides: { proof: 0 } }, CTX).parts.proof, 0, 0.001);

const mRep = computeCost({ ...JOB, repeat: "Yes" }, CTX);
eq("repeat: no plates", mRep.parts.plates, 0, 0.001);
eq("repeat: no die", mRep.parts.die, 0, 0.001);
eq("repeat: no proof", mRep.parts.proof, 0, 0.001);
ok("repeat: cheaper", mRep.total < m1.total);
ok("repeat: running foil still charged", mRep.parts.foil > 0);

const mDdp = computeCost({ ...JOB, incoterm: "DDP", duty_pct: 0.03, vat_pct: 0.2 }, CTX);
eq("DDP duty", mDdp.duty, 0.03 * (m1.exw + m1.freight), 0.01);
eq("DDP vat", mDdp.vat, 0.2 * (m1.exw + m1.freight + mDdp.duty), 0.01);
ok("DDP landed > DAP", mDdp.ddp > m1.ddp);

const mSea = computeCost({ ...JOB, mode: "Sea LCL" }, CTX);
eq("sea freight from auto CBM", mSea.freight, m1.cbmAuto * 180, 0.01);
eq("sea freight override", computeCost({ ...JOB, mode: "Sea LCL", cbm_override: 2 }, CTX).freight, 360, 0.001);

eq("no fit -> zero", computeCost({ ...JOB, flat_w: 5000 }, CTX).ups, 0, 0);

if (failures) { console.error(`${failures} failure(s)`); process.exit(1); }
console.log("docket engine: parity OK");
