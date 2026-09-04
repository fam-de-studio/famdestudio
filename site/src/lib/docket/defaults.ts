import type { Board, Film, Job, Rates } from "./engine";

/** Column order of the Quotes tab. Must match the Apps Script FIELDS list. */
export const FIELDS = [
  "quote_no", "date", "status", "pi_no", "po_ref",
  "client_name", "client_contact", "client_country", "client_email", "client_address",
  "product", "style", "qty",
  "len", "wid", "hgt", "flap", "flat_w", "flat_h",
  "board", "gsm", "psw", "psh", "trim_w", "trim_h",
  "col_f", "col_b",
  "lam", "uv", "foil", "foil_area", "emb", "emb_area", "other_pkr", "extras",
  "die_cost", "local_tr",
  "pack_pct", "cbm", "mode",
  "qty2", "unit2", "unit2_auto",
  "validity", "lead_time", "transit", "hs_code", "cartons", "notes",
  "ups", "gross", "cost_total", "cost_pc", "exw", "freight", "ddp", "ddp_pc", "profit",
  "fx_used", "margin_used",
  "repeat", "incoterm", "duty_pct", "vat_pct", "overrides", "vendors", "cbm_override",
] as const;

export const TAB = {
  SET: "Settings",
  RATES: "Rates",
  BOARDS: "Boards",
  FILMS: "Films",
  CLIENTS: "Clients",
  QUOTES: "Quotes",
} as const;

export type Settings = Record<string, string | number>;
export type Client = { name: string; contact: string; country: string; email: string; address: string };
export type QuoteSummary = {
  quote_no: string;
  date: string;
  status: string;
  client_name: string;
  product: string;
  qty: number;
  ddp: number;
};
export type Bootstrap = {
  settings: Settings;
  rates: Rates;
  boards: Board[];
  films: Film[];
  clients: Client[];
  quotes: QuoteSummary[];
};

export const DEFAULT_RATES: Rates = {
  plate: 1200, print: 900, proof: 3500, uv_setup: 3000, uv_run: 3.5,
  foil_block: 45, foil_run: 2.5, emb_block: 60, emb_run: 2,
  dc_run: 1800, paste: 2.5, pack: 1.5,
  waste: 0.07, setup_sheets: 200,
  fx: 285, margin: 0.4, fr_dhl: 9, fr_air: 5.5, fr_sea: 180, docs: 120, bank_pct: 0.02,
};

export const RATE_META: [string, string, string][] = [
  ["plate", "Plate cost, per plate", "PKR each"],
  ["print", "Printing, per 1,000 impressions per colour", "PKR"],
  ["proof", "Digital proof / dummy sample", "PKR per job"],
  ["uv_setup", "Spot UV / drip-off screen or plate", "PKR per job"],
  ["uv_run", "Spot UV / drip-off running rate", "PKR per sheet"],
  ["foil_block", "Hot foil block making", "PKR per sq.in"],
  ["foil_run", "Hot foil running rate incl. foil", "PKR per sheet"],
  ["emb_block", "Emboss / deboss block making", "PKR per sq.in"],
  ["emb_run", "Emboss / deboss running rate", "PKR per sheet"],
  ["dc_run", "Die cutting running rate", "PKR per 1,000 sheets"],
  ["paste", "Pasting / gluing", "PKR per piece"],
  ["pack", "Packing, labour & inspection", "PKR per piece"],
  ["waste", "Wastage allowance", "fraction, e.g. 0.07 = 7%"],
  ["setup_sheets", "Make-ready / setup sheets", "sheets per job"],
  ["fx", "USD / PKR rate", "update before every quote"],
  ["margin", "Target gross margin", "fraction, e.g. 0.4 = 40%"],
  ["fr_dhl", "DHL / FedEx express", "USD per kg"],
  ["fr_air", "Air freight, consolidated", "USD per kg"],
  ["fr_sea", "Sea freight LCL", "USD per CBM"],
  ["docs", "Export docs, clearance & handling", "USD per shipment"],
  ["bank_pct", "Bank / payment charges", "fraction of invoice value"],
];

export const DEFAULT_BOARDS: Board[] = [
  { name: "Art Card (C1S)", pkr_per_kg: 420, note: "General cartons, cosmetics, food sleeves" },
  { name: "SBS / Ivory Board", pkr_per_kg: 520, note: "Premium white-back — cosmetics, chocolate" },
  { name: "Kraft (Natural Brown)", pkr_per_kg: 320, note: "Organic positioning — candles, soap" },
  { name: "Duplex Grey Back", pkr_per_kg: 300, note: "Budget cartons, inner packs" },
  { name: "Textured / Specialty", pkr_per_kg: 900, note: "Rigid box wraps, luxury sleeves" },
  { name: "Metalized Board", pkr_per_kg: 780, note: "Silver / gold base for metallic printing" },
  { name: "Greyboard (rigid base)", pkr_per_kg: 260, note: "Rigid box chipboard core" },
];

export const DEFAULT_FILMS: Film[] = [
  { name: "None", pkr_per_sqin: 0, note: "No lamination" },
  { name: "Gloss BOPP", pkr_per_sqin: 0.012, note: "Cheapest, high shine" },
  { name: "Matte BOPP", pkr_per_sqin: 0.015, note: "Premium base — required under drip-off" },
  { name: "Soft Touch / Velvet", pkr_per_sqin: 0.045, note: "Luxury feel — best upsell" },
  { name: "Metalized / MetPET", pkr_per_sqin: 0.055, note: "Mirror metallic base" },
  { name: "Holographic", pkr_per_sqin: 0.065, note: "Rainbow effect — vape, confectionery" },
  { name: "Anti-Scuff Matte", pkr_per_sqin: 0.022, note: "Matte that resists finger marks" },
];

export const DEFAULT_SETTINGS: Settings = {
  company: "FAM De Studio",
  tagline: "Luxury Packaging Design & Production · Lahore",
  address: "Lahore, Pakistan",
  email: "famdestudio@gmail.com",
  phone: "+92 324 1691194",
  whatsapp: "+92 324 1691194",
  ntn: "",
  rep_name: "",
  rep_role: "Director — Production",
  bank_benef: "FAM De Studio",
  bank_name: "",
  bank_branch: "",
  bank_iban: "",
  bank_swift: "",
  bank_payoneer: "USD / GBP / EUR receiving account — on request",
  quote_prefix: "QT-2026-",
  quote_next: 1,
  pi_prefix: "PI-2026-",
  pi_next: 1,
};

export const EXTRA_FINISHES = ["Window patch", "Ribbon pull", "Magnetic closure", "Edge painting", "Braille panel"];

export const BOX_STYLES = [
  "Straight Tuck End (STE)", "Reverse Tuck End (RTE)", "Auto-Lock Bottom", "Seal End", "Sleeve",
  "Pillow Box", "Gable Box", "Window Carton", "Rigid Two-Piece", "Rigid Magnetic",
  "Drawer / Matchbox", "Rigid Tube", "Mailer / Roll-End", "Display Box (PDQ)",
];

export const STATUSES = [
  "Draft", "Quote sent", "Follow-up 1", "Follow-up 2", "Sample approved", "PO received",
  "Advance received", "In production", "Balance received", "Dispatched", "Delivered", "Lost",
];

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function blankJob(): Job {
  return {
    quote_no: "", date: todayISO(), status: "Draft", pi_no: "", po_ref: "",
    client_name: "", client_contact: "", client_country: "", client_email: "", client_address: "",
    product: "", style: "Straight Tuck End (STE)", qty: 5000, repeat: "No",
    len: 45, wid: 45, hgt: 120, flap: 15, flat_w: 195, flat_h: 210,
    board: "SBS / Ivory Board", gsm: 350, psw: 635, psh: 965, trim_w: 10, trim_h: 17,
    col_f: 5, col_b: 0,
    lam: "Soft Touch / Velvet", uv: "Yes", foil: "Yes", foil_area: 6, emb: "No", emb_area: 4,
    other_pkr: 0, extras: [],
    die_cost: 8000, local_tr: 4000,
    pack_pct: 0.08, cbm: 1.8, cbm_override: "", mode: "Air Freight",
    incoterm: "DAP", duty_pct: 0, vat_pct: 0,
    qty2: 10000, unit2: 0, unit2_auto: "Yes",
    validity: "15 days", lead_time: "12–15", transit: "6–9",
    hs_code: "4819.2000", cartons: 6, notes: "",
    overrides: {}, vendors: {},
  };
}

/** Normalise a stored row (strings from the sheet) into a Job. */
export function jobFromRecord(o: Record<string, unknown>): Job {
  const base = blankJob() as unknown as Record<string, unknown>;
  for (const k of Object.keys(base)) {
    if (o[k] !== undefined && o[k] !== "") base[k] = o[k];
  }
  let extras = base.extras;
  if (typeof extras === "string") extras = extras ? extras.split("|") : [];
  if (!Array.isArray(extras)) extras = [];
  base.extras = extras;
  for (const k of ["overrides", "vendors"]) {
    let v = base[k];
    if (typeof v === "string" && v) {
      try {
        v = JSON.parse(v);
      } catch {
        v = {};
      }
    }
    if (!v || typeof v !== "object" || Array.isArray(v)) v = {};
    base[k] = v;
  }
  // computed columns (ups, ddp, profit, fx_used...) ride along so saved quotes keep their prices
  for (const k of FIELDS) {
    if (!(k in base) && o[k] !== undefined && o[k] !== "") {
      const f = parseFloat(String(o[k]));
      base[k] = Number.isFinite(f) ? f : o[k];
    }
  }
  base.quote_no = o.quote_no || "";
  base.pi_no = o.pi_no || "";
  base.po_ref = o.po_ref || "";
  base.notes = o.notes || "";
  // numeric fields arrive as strings from the sheet
  const numKeys: (keyof Job)[] = [
    "qty", "len", "wid", "hgt", "flap", "flat_w", "flat_h", "gsm", "psw", "psh", "trim_w", "trim_h",
    "col_f", "col_b", "foil_area", "emb_area", "other_pkr", "die_cost", "local_tr", "pack_pct", "cbm",
    "duty_pct", "vat_pct", "qty2", "unit2", "cartons",
  ];
  for (const k of numKeys) {
    const v = base[k];
    if (typeof v === "string") base[k] = Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0;
  }
  if (base.cbm_override !== "" && typeof base.cbm_override === "string") {
    const f = parseFloat(base.cbm_override as string);
    base.cbm_override = Number.isFinite(f) ? f : "";
  }
  return base as unknown as Job;
}
