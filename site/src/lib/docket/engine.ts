/**
 * Press Docket costing engine.
 * Pure: no storage, no DOM. A line-for-line port of the ENGINE block in the
 * original App.html; scripts/test-docket-engine.mjs checks parity with the
 * figures the Apps Script version was verified against.
 */

export type Rates = Record<string, number | string | null | undefined>;
export type Board = { name: string; pkr_per_kg: number | string; note?: string };
export type Film = { name: string; pkr_per_sqin: number | string; note?: string };
export type Ctx = { rates: Rates; boards: Board[]; films: Film[] };

export type YesNo = "Yes" | "No";

export type Job = {
  quote_no: string;
  date: string;
  status: string;
  pi_no: string;
  po_ref: string;
  client_name: string;
  client_contact: string;
  client_country: string;
  client_email: string;
  client_address: string;
  product: string;
  style: string;
  qty: number;
  repeat: YesNo;
  len: number;
  wid: number;
  hgt: number;
  flap: number;
  flat_w: number;
  flat_h: number;
  board: string;
  gsm: number;
  psw: number;
  psh: number;
  trim_w: number;
  trim_h: number;
  col_f: number;
  col_b: number;
  lam: string;
  uv: YesNo;
  foil: YesNo;
  foil_area: number;
  emb: YesNo;
  emb_area: number;
  other_pkr: number;
  extras: string[];
  die_cost: number;
  local_tr: number;
  pack_pct: number;
  cbm: number;
  cbm_override: number | "";
  mode: string;
  incoterm: "DAP" | "DDP";
  duty_pct: number;
  vat_pct: number;
  qty2: number;
  unit2: number;
  unit2_auto: YesNo;
  validity: string;
  lead_time: string;
  transit: string;
  hs_code: string;
  cartons: number;
  notes: string;
  overrides: Record<string, number>;
  vendors: Record<string, string>;
  /* computed, stored so old quotes keep their prices when rates change */
  ups?: number;
  gross?: number;
  cost_total?: number;
  cost_pc?: number;
  exw?: number;
  freight?: number;
  ddp?: number;
  ddp_pc?: number;
  profit?: number;
  fx_used?: number;
  margin_used?: number;
};

export const LINE_KEYS = [
  "board",
  "plates",
  "print",
  "proof",
  "lam",
  "uv",
  "foil",
  "emb",
  "die",
  "dc",
  "paste",
  "pack",
  "other",
  "tr",
] as const;
export type LineKey = (typeof LINE_KEYS)[number];

export const LINE_LABELS: Record<LineKey, string> = {
  board: "Board / paper",
  plates: "Plates",
  print: "Printing",
  proof: "Proof",
  lam: "Lamination",
  uv: "Spot UV / drip-off",
  foil: "Hot foil",
  emb: "Emboss",
  die: "Cutting die",
  dc: "Die cutting",
  paste: "Pasting",
  pack: "Packing",
  other: "Other",
  tr: "Local transport",
};

export type Cost = {
  ups: number;
  gross: number;
  parts: Partial<Record<LineKey, number>>;
  direct: number;
  total: number;
  perPc: number;
  exw: number;
  exwPc: number;
  freight: number;
  bankFee: number;
  cbmAuto: number;
  dap: number;
  duty: number;
  vat: number;
  ddp: number;
  ddpPc: number;
  profit: number;
  kgTotal: number;
  boxKg: number;
};

export function n_(v: unknown): number {
  const x = parseFloat(String(v));
  return Number.isFinite(x) ? x : 0;
}
export function rateOf(ctx: Ctx, k: string, fb: number): number {
  const v = ctx.rates[k];
  return v === undefined || v === "" || v === null ? n_(fb) : n_(v);
}
export function boardRate(ctx: Ctx, name: string): number {
  for (const b of ctx.boards) if (b.name === name) return n_(b.pkr_per_kg);
  return 0;
}
export function filmRate(ctx: Ctx, name: string): number {
  for (const f of ctx.films) if (f.name === name) return n_(f.pkr_per_sqin);
  return 0;
}

export function imposition(job: Pick<Job, "psw" | "psh" | "trim_w" | "trim_h" | "flat_w" | "flat_h">) {
  const ew = n_(job.psw) - n_(job.trim_w);
  const eh = n_(job.psh) - n_(job.trim_h);
  const fw = n_(job.flat_w);
  const fh = n_(job.flat_h);
  if (fw <= 0 || fh <= 0 || ew <= 0 || eh <= 0) return { ew, eh, ups: 0 };
  const a = Math.floor(ew / fw) * Math.floor(eh / fh);
  const b = Math.floor(ew / fh) * Math.floor(eh / fw);
  return { ew, eh, ups: Math.max(a, b) };
}

const EMPTY: Cost = {
  ups: 0,
  gross: 0,
  parts: {},
  direct: 0,
  total: 0,
  perPc: 0,
  exw: 0,
  exwPc: 0,
  freight: 0,
  bankFee: 0,
  cbmAuto: 0,
  dap: 0,
  duty: 0,
  vat: 0,
  ddp: 0,
  ddpPc: 0,
  profit: 0,
  kgTotal: 0,
  boxKg: 0,
};

/** Full recost at any quantity. */
export function costForQty(job: Job, ctx: Ctx, qty: number): Cost {
  const imp = imposition(job);
  const ups = imp.ups;
  if (ups <= 0 || qty <= 0) return { ...EMPTY, parts: {} };

  const net = Math.ceil(qty / ups);
  const gross = Math.ceil(net * (1 + rateOf(ctx, "waste", 0.07))) + rateOf(ctx, "setup_sheets", 200);
  const kgSheet = ((n_(job.psw) * n_(job.psh)) / 1e6) * (n_(job.gsm) / 1000);
  const area = (n_(job.psw) / 25.4) * (n_(job.psh) / 25.4);
  const plates = n_(job.col_f) + n_(job.col_b);

  /* Repeat orders reuse existing tooling: plates, die, blocks, setups and the
     proof are already made and must not be charged again. Running charges stay. */
  const rep = job.repeat === "Yes";
  const c: Record<LineKey, number> = {
    board: gross * kgSheet * boardRate(ctx, job.board),
    plates: rep ? 0 : plates * rateOf(ctx, "plate", 1200),
    print: (gross / 1000) * rateOf(ctx, "print", 900) * plates,
    proof: rep ? 0 : rateOf(ctx, "proof", 3500),
    lam: gross * area * filmRate(ctx, job.lam),
    uv: job.uv === "Yes" ? (rep ? 0 : rateOf(ctx, "uv_setup", 3000)) + gross * rateOf(ctx, "uv_run", 3.5) : 0,
    foil:
      job.foil === "Yes"
        ? (rep ? 0 : n_(job.foil_area) * rateOf(ctx, "foil_block", 45)) + gross * rateOf(ctx, "foil_run", 2.5)
        : 0,
    emb:
      job.emb === "Yes"
        ? (rep ? 0 : n_(job.emb_area) * rateOf(ctx, "emb_block", 60)) + gross * rateOf(ctx, "emb_run", 2)
        : 0,
    die: rep ? 0 : n_(job.die_cost),
    dc: (gross / 1000) * rateOf(ctx, "dc_run", 1800),
    paste: qty * rateOf(ctx, "paste", 2.5),
    pack: qty * rateOf(ctx, "pack", 1.5),
    other: n_(job.other_pkr),
    tr: n_(job.local_tr),
  };
  /* Per-job overrides: a typed PKR amount replaces the auto-computed line.
     Zero is a legitimate override (e.g. client supplies the board). */
  const ov = job.overrides || {};
  for (const k of LINE_KEYS) {
    const o = ov[k] as unknown;
    if (o !== undefined && o !== null && o !== "") c[k] = n_(o);
  }
  let direct = 0;
  for (const k of LINE_KEYS) direct += c[k];
  /* No factory overhead: the broker's compensation is the margin, nothing hidden. */
  const total = direct;

  const margin = rateOf(ctx, "margin", 0.4);
  const fx = rateOf(ctx, "fx", 285);
  const exw = margin >= 1 || fx <= 0 ? 0 : total / (1 - margin) / fx;

  const boxKg = ((n_(job.flat_w) * n_(job.flat_h)) / 1e6) * (n_(job.gsm) / 1000);
  const grossKg = boxKg * qty * (1 + n_(job.pack_pct));
  /* Flat-pack sea volume from the cargo itself: flat area x board thickness
     (~ gsm/800000 m; 350gsm ~ 0.44mm), scaled by the same packing allowance
     as weight. A typed override wins for odd cargo. */
  const cbmAuto =
    (n_(job.flat_w) / 1000) * (n_(job.flat_h) / 1000) * (n_(job.gsm) / 800000) * qty * (1 + n_(job.pack_pct));
  const cbmUsed =
    job.cbm_override !== undefined && job.cbm_override !== null && (job.cbm_override as unknown) !== ""
      ? n_(job.cbm_override)
      : cbmAuto;
  const freight =
    job.mode === "Sea LCL"
      ? cbmUsed * rateOf(ctx, "fr_sea", 180)
      : job.mode === "DHL Express"
        ? grossKg * rateOf(ctx, "fr_dhl", 9)
        : grossKg * rateOf(ctx, "fr_air", 5.5);
  const docs = rateOf(ctx, "docs", 120);
  /* The bank charges on the whole invoice, not just the goods. */
  const bankFee = (exw + freight + docs) * rateOf(ctx, "bank_pct", 0.02);

  /* DAP: delivered, duties unpaid. DDP: destination duty (on CIF) and VAT
     (on CIF + duty) are priced in, so "no further charges on arrival" holds. */
  const dap = exw + freight + docs + bankFee;
  let duty = 0;
  let vat = 0;
  if (job.incoterm === "DDP") {
    duty = n_(job.duty_pct) * (exw + freight);
    vat = n_(job.vat_pct) * (exw + freight + duty);
  }
  const landed = dap + duty + vat;

  return {
    ups,
    gross,
    parts: c,
    direct,
    total,
    perPc: total / qty,
    exw,
    exwPc: exw / qty,
    freight,
    bankFee,
    cbmAuto,
    dap,
    duty,
    vat,
    ddp: landed,
    ddpPc: landed / qty,
    profit: fx > 0 ? exw - total / fx : 0,
    kgTotal: grossKg,
    boxKg,
  };
}

export function computeCost(job: Job, ctx: Ctx): Cost {
  return costForQty(job, ctx, n_(job.qty));
}

export type Calc = Cost & { unit2: number; unit2Auto: number; total2: number; marginPct: number };

/** Main quantity plus Option B, as the panel and documents need it. */
export function calc(job: Job, ctx: Ctx): Calc {
  const m = computeCost(job, ctx);
  const b = costForQty(job, ctx, n_(job.qty2));
  const unit2 = job.unit2_auto === "Yes" ? b.ddpPc : n_(job.unit2);
  return {
    ...m,
    unit2,
    unit2Auto: b.ddpPc,
    total2: n_(job.qty2) * unit2,
    marginPct: m.ddp > 0 ? m.profit / m.ddp : 0,
  };
}

export function finishList(job: Job): string[] {
  const out: string[] = [];
  if (job.foil === "Yes") out.push("Hot foil");
  if (job.uv === "Yes") out.push("Drip-off / spot UV");
  if (job.emb === "Yes") out.push("Emboss / deboss");
  if (job.lam && job.lam !== "None") out.push(job.lam);
  (job.extras || []).forEach((e) => out.push(e));
  return out;
}
