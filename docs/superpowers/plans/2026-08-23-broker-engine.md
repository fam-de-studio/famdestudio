# Press Docket v2 — Broker Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework Press Docket's costing into a broker engine — per-line vendor costs with overrides, repeat-order tooling skip, DAP/DDP with real duty/VAT, corrected freight and bank fees — without changing the app's look or storage model.

**Architecture:** The costing engine becomes one pure function `computeCost(job, ctx)` inside `App.html`, fenced by `/* ENGINE-START */ … /* ENGINE-END */` markers. A Node harness (`tools/test-engine.mjs`) extracts the fenced text and runs assertions, so every engine change is verified headlessly before `clasp push`. `Code.js` gains column migration and locking; the UI gains cost lines, a repeat toggle, and incoterm fields.

**Tech Stack:** Google Apps Script (V8) · vanilla JS in `App.html` · Node ≥ 18 for the test harness (no npm packages) · clasp for deployment.

## Global Constraints

- Only `App.html`, `Code.js`, `appsscript.json` may be pushed by clasp. After adding `tools/`, run `clasp status` from `E:\QUOT` and confirm it still tracks exactly those three files.
- The engine function must not touch the DOM or `google.script` — pure input → output.
- Existing saved quotes must remain loadable; new Quotes columns are appended at the END of the header row only.
- No change to visual design, document layout, or the Sheet-as-storage model.
- Rates keys added in this plan: `docs`, `bank_pct`, `fr_dhl`, `fr_air`, `fr_sea` already exist; **no rate key is renamed or removed except `overhead`, which is removed.**
- Run the harness with `node tools/test-engine.mjs` from `E:\QUOT`. It exits 0 on pass, 1 with a message on fail.
- Commit after every task. Push to the live script (`clasp push`) only in the final task.

---

### Task 1: Extract the engine and build the Node harness (behavior-preserving)

**Files:**
- Modify: `App.html` (the `costFor`/`imposition`/`rate`/`boardRate`/`filmRate` cluster, currently ~lines 512–597)
- Create: `tools/test-engine.mjs`

**Interfaces:**
- Produces: inside App.html, fenced by markers:
  - `function computeCost(job, ctx)` → the old `costFor(qty)` result for `qty = job.qty`, plus everything later tasks add. `ctx = { rates: {}, boards: [], films: [] }`.
  - `function costForQty(job, ctx, qty)` → same but for an arbitrary quantity (Option B).
  - Internal helpers `imposition(job)`, `rateOf(ctx, key, fallback)`, `boardRate(ctx, name)`, `filmRate(ctx, name)` — all take explicit arguments, no globals.
- The existing `calc()`/UI keep working by calling `computeCost(job, {rates: DB.rates, boards: DB.boards, films: DB.films})`.

- [ ] **Step 1: Write the harness with parity assertions (they fail until the markers exist)**

Create `tools/test-engine.mjs`:

```js
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

// ── Parity with the verified pre-refactor engine (overhead still present in Task 1) ──
const m1 = computeCost(JOB, CTX)
eq('ups', m1.ups, 12, 0)
eq('gross sheets', m1.gross, 647, 0)
eq('direct PKR', m1.direct, 152538.33, 0.5)
eq('total PKR (with 8% overhead, Task 1 only)', m1.total, 164741.39, 0.5)
eq('exw USD', m1.exw, 963.40, 0.05)
ok('costForQty(10000) cheaper per pc', costForQty(JOB, CTX, 10000).perPc < m1.perPc)

if (failures) { console.error(`\n${failures} failure(s)`); process.exit(1) }
console.log('engine tests: all passed')
```

- [ ] **Step 2: Run to verify it fails**

Run from `E:\QUOT`: `node tools/test-engine.mjs`
Expected: `FAIL: ENGINE-START/ENGINE-END markers not found`.

- [ ] **Step 3: Refactor App.html**

Inside the `<script>`, replace the current `rate`, `boardRate`, `filmRate`, `imposition`, `costFor` functions with a fenced block. The block must contain ONLY pure code (no `DB`, no `job` global, no DOM):

```js
/* ENGINE-START */
'use strict';
function n_(v){ var x = parseFloat(v); return isFinite(x) ? x : 0; }
function rateOf(ctx, k, fb){ var v = ctx.rates[k]; return (v === undefined || v === '' || v === null) ? n_(fb) : n_(v); }
function boardRate(ctx, name){ for(var i=0;i<ctx.boards.length;i++) if(ctx.boards[i].name === name) return n_(ctx.boards[i].pkr_per_kg); return 0; }
function filmRate(ctx, name){ for(var i=0;i<ctx.films.length;i++) if(ctx.films[i].name === name) return n_(ctx.films[i].pkr_per_sqin); return 0; }

function imposition(job){
  var ew = n_(job.psw) - n_(job.trim_w), eh = n_(job.psh) - n_(job.trim_h);
  var fw = n_(job.flat_w), fh = n_(job.flat_h);
  if(fw <= 0 || fh <= 0 || ew <= 0 || eh <= 0) return {ew:ew, eh:eh, ups:0};
  var a = Math.floor(ew/fw) * Math.floor(eh/fh);
  var b = Math.floor(ew/fh) * Math.floor(eh/fw);
  return {ew:ew, eh:eh, ups:Math.max(a,b)};
}

function costForQty(job, ctx, qty){
  var imp = imposition(job), ups = imp.ups;
  if(ups <= 0 || qty <= 0){
    return {ups:0, gross:0, parts:{}, direct:0, total:0, perPc:0, exw:0, exwPc:0,
            freight:0, bankFee:0, ddp:0, ddpPc:0, profit:0, kgTotal:0, boxKg:0};
  }
  var net = Math.ceil(qty/ups);
  var gross = Math.ceil(net * (1 + rateOf(ctx,'waste',0.07))) + rateOf(ctx,'setup_sheets',200);
  var kgSheet = (n_(job.psw)*n_(job.psh)/1e6) * n_(job.gsm) / 1000;
  var area = (n_(job.psw)/25.4) * (n_(job.psh)/25.4);
  var plates = n_(job.col_f) + n_(job.col_b);

  var c = {
    board: gross * kgSheet * boardRate(ctx, job.board),
    plates: plates * rateOf(ctx,'plate',1200),
    print: gross/1000 * rateOf(ctx,'print',900) * plates,
    proof: rateOf(ctx,'proof',3500),
    lam:   gross * area * filmRate(ctx, job.lam),
    uv:    job.uv === 'Yes' ? rateOf(ctx,'uv_setup',3000) + gross * rateOf(ctx,'uv_run',3.5) : 0,
    foil:  job.foil === 'Yes' ? n_(job.foil_area) * rateOf(ctx,'foil_block',45) + gross * rateOf(ctx,'foil_run',2.5) : 0,
    emb:   job.emb === 'Yes' ? n_(job.emb_area) * rateOf(ctx,'emb_block',60) + gross * rateOf(ctx,'emb_run',2) : 0,
    die:   n_(job.die_cost),
    dc:    gross/1000 * rateOf(ctx,'dc_run',1800),
    paste: qty * rateOf(ctx,'paste',2.5),
    pack:  qty * rateOf(ctx,'pack',1.5),
    other: n_(job.other_pkr),
    tr:    n_(job.local_tr)
  };
  var direct = 0; for(var k in c) direct += c[k];
  var total = direct * 1.08; /* Task 2 removes this factor */

  var margin = rateOf(ctx,'margin',0.4), fx = rateOf(ctx,'fx',285);
  var exw = (margin >= 1 || fx <= 0) ? 0 : total / (1 - margin) / fx;

  var boxKg = (n_(job.flat_w) * n_(job.flat_h) / 1e6) * n_(job.gsm) / 1000;
  var grossKg = boxKg * qty * (1 + n_(job.pack_pct));
  var freight = job.mode === 'Sea LCL' ? n_(job.cbm) * rateOf(ctx,'fr_sea',180)
              : job.mode === 'DHL Express' ? grossKg * rateOf(ctx,'fr_dhl',9)
              : grossKg * rateOf(ctx,'fr_air',5.5);
  var bankFee = exw * rateOf(ctx,'bank_pct',0.02);
  var ddp = exw + freight + rateOf(ctx,'docs',120) + bankFee;

  return {ups:ups, gross:gross, parts:c, direct:direct, total:total, perPc:total/qty,
          exw:exw, exwPc:exw/qty, freight:freight, bankFee:bankFee,
          ddp:ddp, ddpPc:ddp/qty, profit: fx > 0 ? exw - total/fx : 0,
          kgTotal:grossKg, boxKg:boxKg};
}

function computeCost(job, ctx){ return costForQty(job, ctx, n_(job.qty)); }
/* ENGINE-END */
```

Then update the app code around it: `calc()` becomes

```js
function ctx_(){ return {rates: DB.rates, boards: DB.boards, films: DB.films}; }
function calc(){
  var m = computeCost(job, ctx_());
  var b = costForQty(job, ctx_(), n(job.qty2));
  m.unit2 = job.unit2_auto === 'Yes' ? b.ddpPc : n(job.unit2);
  m.unit2Auto = b.ddpPc;
  m.total2 = n(job.qty2) * m.unit2;
  m.marginPct = m.ddp > 0 ? m.profit / m.ddp : 0;
  return m;
}
```

Delete the old `rate()`, `boardRate(name)`, `filmRate(name)`, `imposition()`, `costFor(qty)` and fix their remaining callers: `renderInfo` uses `imposition(job)`; the save handler and `renderInfo`'s uses of `rate('fx')`/`rate('margin')` become `rateOf(ctx_(),'fx',285)` / `rateOf(ctx_(),'margin',0.4)`. Note the parts key renames: `paper`→`board`, `plate`→`plates`.

- [ ] **Step 4: Run to verify parity**

Run: `node tools/test-engine.mjs`
Expected: `engine tests: all passed` — the same verified numbers as the original review.

- [ ] **Step 5: Verify clasp still tracks only three files**

Run from `E:\QUOT`: `clasp status`
Expected: `App.html`, `appsscript.json`, `Code.js` only (tools/ excluded by `.claspignore`).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "refactor: extract pure costing engine with Node parity harness"
```

---

### Task 2: Cost lines — overrides, vendors, overhead removed

**Files:**
- Modify: `App.html` (engine block + `blankJob`)
- Modify: `tools/test-engine.mjs`

**Interfaces:**
- Consumes: `costForQty(job, ctx, qty)` from Task 1.
- Produces: `job.overrides` (`{lineKey: PKR}`) and `job.vendors` (`{lineKey: string}`) honored by the engine; `m.parts` reflects overrides; `m.total === m.direct` (no overhead). Line keys: `board, plates, print, proof, lam, uv, foil, emb, die, dc, paste, pack, other, tr`.

- [ ] **Step 1: Add failing tests**

Append to `tools/test-engine.mjs` before the final summary lines:

```js
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
```

Also change the Task 1 parity line — overhead is now gone:

```js
eq('total PKR (no overhead)', m1.total, 152538.33, 0.5)
```

(delete the old `total PKR (with 8% overhead…)` assertion and the `exw USD` value changes: `exw = 152538.33/0.6/285 = 892.04`)

```js
eq('exw USD', m1.exw, 892.04, 0.05)
```

- [ ] **Step 2: Run to verify failure**

Run: `node tools/test-engine.mjs`
Expected: FAIL on `no overhead` (total still ×1.08) and `board override wins`.

- [ ] **Step 3: Implement in the engine block**

Replace `var direct = 0; for(var k in c) direct += c[k]; var total = direct * 1.08;` with:

```js
  var ov = job.overrides || {};
  for(var k in c){
    if(ov[k] !== undefined && ov[k] !== null && ov[k] !== ''){ c[k] = n_(ov[k]); }
  }
  var direct = 0; for(var k2 in c) direct += c[k2];
  var total = direct;
```

In `blankJob()` (outside the engine), add `overrides:{}, vendors:{},`.

- [ ] **Step 4: Run to verify pass**

Run: `node tools/test-engine.mjs` — expected all pass.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: cost-line overrides and vendors; remove factory overhead"
```

---

### Task 3: Repeat-order toggle

**Files:**
- Modify: `App.html` (engine block + `blankJob`)
- Modify: `tools/test-engine.mjs`

**Interfaces:**
- Produces: `job.repeat` ('Yes'|'No'); when 'Yes' the engine zeroes `plates, die, foil` block portion, `emb` block portion, `proof, uv` setup portion. Simplification per spec: the whole `foil_block`/`emb_block`/`uv_setup` components are inside combined lines, so the engine computes them separately and zeroes the block/setup halves on repeat.

- [ ] **Step 1: Add failing tests**

```js
// ── Task 3: repeat order ──
const jRep = { ...JOB, repeat: 'Yes' }
const mRep = computeCost(jRep, CTX)
eq('repeat: plates zero', mRep.parts.plates, 0, 0.001)
eq('repeat: die zero', mRep.parts.die, 0, 0.001)
eq('repeat: proof zero', mRep.parts.proof, 0, 0.001)
// foil keeps the running charge but loses the block: 647 * 2.5 = 1617.5
eq('repeat: foil is run-only', mRep.parts.foil, mRep.gross * 2.5, 0.01)
// uv keeps run, loses setup: gross * 3.5
eq('repeat: uv is run-only', mRep.parts.uv, mRep.gross * 3.5, 0.01)
ok('repeat is cheaper', mRep.direct < computeCost(JOB, CTX).direct)
```

- [ ] **Step 2: Run to verify failure** — `node tools/test-engine.mjs`, FAILs on repeat assertions.

- [ ] **Step 3: Implement**

In the engine, before building `c`, add `var rep = job.repeat === 'Yes';` and change the affected lines:

```js
    plates: rep ? 0 : plates * rateOf(ctx,'plate',1200),
    proof: rep ? 0 : rateOf(ctx,'proof',3500),
    uv:    job.uv === 'Yes' ? (rep ? 0 : rateOf(ctx,'uv_setup',3000)) + gross * rateOf(ctx,'uv_run',3.5) : 0,
    foil:  job.foil === 'Yes' ? (rep ? 0 : n_(job.foil_area) * rateOf(ctx,'foil_block',45)) + gross * rateOf(ctx,'foil_run',2.5) : 0,
    emb:   job.emb === 'Yes' ? (rep ? 0 : n_(job.emb_area) * rateOf(ctx,'emb_block',60)) + gross * rateOf(ctx,'emb_run',2) : 0,
    die:   rep ? 0 : n_(job.die_cost),
```

Add `repeat:'No',` to `blankJob()`.

- [ ] **Step 4: Run to verify pass**, then **Step 5: Commit**

```bash
git add -A && git commit -m "feat: repeat-order toggle zeroes one-time tooling"
```

---

### Task 4: Freight fixes — auto sea CBM, bank fee on full invoice

**Files:**
- Modify: `App.html` (engine block + `blankJob`)
- Modify: `tools/test-engine.mjs`

**Interfaces:**
- Produces: `m.cbmAuto` (computed m³); sea freight uses `job.cbm_override` if set, else `cbmAuto`; `bankFee = bank_pct × (exw + freight + docs)`. `job.cbm` is retired (kept in storage for old quotes, ignored by the engine).

- [ ] **Step 1: Add failing tests**

```js
// ── Task 4: sea CBM scales with qty; bank fee on full invoice ──
const jSea = { ...JOB, mode: 'Sea LCL' }
const sea5 = computeCost(jSea, CTX)
const sea50 = costForQty(jSea, CTX, 50000)
ok('sea freight grows with qty', sea50.freight > sea5.freight * 5)
// cbmAuto: flat area × thickness(gsm/800000 m) × qty × (1+pack_pct)
const vol1 = (195/1000) * (210/1000) * (350/800000)
eq('cbmAuto at 5000', sea5.cbmAuto, vol1 * 5000 * 1.08, 0.001)
const jSeaOv = { ...jSea, cbm_override: 2.5 }
eq('cbm override wins', computeCost(jSeaOv, CTX).freight, 2.5 * 180, 0.01)

const m4 = computeCost(JOB, CTX)
eq('bank fee on full invoice', m4.bankFee, 0.02 * (m4.exw + m4.freight + 120), 0.01)
```

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement**

In the engine, replace the freight/bank section:

```js
  var boxKg = (n_(job.flat_w) * n_(job.flat_h) / 1e6) * n_(job.gsm) / 1000;
  var grossKg = boxKg * qty * (1 + n_(job.pack_pct));
  /* Flat-pack volume: flat area × board thickness (≈ gsm/800000 m, e.g. 350gsm ≈ 0.44mm),
     scaled by the same packing allowance as weight. */
  var cbmAuto = (n_(job.flat_w)/1000) * (n_(job.flat_h)/1000) * (n_(job.gsm)/800000) * qty * (1 + n_(job.pack_pct));
  var cbmUsed = (job.cbm_override !== undefined && job.cbm_override !== null && job.cbm_override !== '')
    ? n_(job.cbm_override) : cbmAuto;
  var freight = job.mode === 'Sea LCL' ? cbmUsed * rateOf(ctx,'fr_sea',180)
              : job.mode === 'DHL Express' ? grossKg * rateOf(ctx,'fr_dhl',9)
              : grossKg * rateOf(ctx,'fr_air',5.5);
  var docs = rateOf(ctx,'docs',120);
  var bankFee = (exw + freight + docs) * rateOf(ctx,'bank_pct',0.02);
  var ddp = exw + freight + docs + bankFee;
```

Return `cbmAuto: cbmAuto` in both result objects (add `cbmAuto:0` to the zero-ups early return). Add `cbm_override:'',` to `blankJob()`.

- [ ] **Step 4: Run to verify pass**, **Step 5: Commit**

```bash
git add -A && git commit -m "fix: sea CBM computed from cargo, bank fee on full invoice"
```

---

### Task 5: DAP / DDP with duty and VAT

**Files:**
- Modify: `App.html` (engine block + `blankJob`)
- Modify: `tools/test-engine.mjs`

**Interfaces:**
- Produces: `job.incoterm` ('DAP'|'DDP', default DAP), `job.duty_pct`, `job.vat_pct` (fractions). Result fields: `m.dap` (landed without duty), `m.duty`, `m.vat`, and `m.ddp` now means THE QUOTED TOTAL for the chosen incoterm (`dap` when DAP, `dap+duty+vat` when DDP) so every existing consumer of `m.ddp`/`m.ddpPc` shows the right selling figure. `m.profit` is unchanged (margin lives in EXW).

- [ ] **Step 1: Add failing tests**

```js
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
```

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement**

After the `bankFee` line in the engine:

```js
  var dap = exw + freight + docs + bankFee;
  var duty = 0, vat = 0;
  if(job.incoterm === 'DDP'){
    duty = n_(job.duty_pct) * (exw + freight);
    vat  = n_(job.vat_pct) * (exw + freight + duty);
  }
  var landed = dap + duty + vat;
```

Return `dap:dap, duty:duty, vat:vat, ddp:landed, ddpPc:landed/qty` (and zeros in the early return). Add `incoterm:'DAP', duty_pct:0, vat_pct:0,` to `blankJob()`.

- [ ] **Step 4: Run to verify pass**, **Step 5: Commit**

```bash
git add -A && git commit -m "feat: per-quote DAP/DDP with priced duty and VAT"
```

---

### Task 6: Backend — storage migration, locking, counter safety

**Files:**
- Modify: `Code.js`

**Interfaces:**
- Produces: `FIELDS` extended with `repeat, incoterm, duty_pct, vat_pct, overrides, vendors, cbm_override` (appended before the computed block is fine — but they MUST be appended at the very END of the array so existing sheet columns stay aligned); `migrateQuotesHeader_()` appends missing columns to the Quotes sheet; `saveQuote`/`nextPiNumber` use `LockService`; `saveSettings` ignores `quote_next`/`pi_next` keys unless explicitly passed via a new `saveCounters(obj)`.

- [ ] **Step 1: Extend FIELDS (append at END, after `margin_used`)**

```js
var FIELDS = [
  /* …existing entries unchanged, ending with… */ 'fx_used', 'margin_used',
  /* v2 broker columns — appended at the end so old rows stay aligned */
  'repeat', 'incoterm', 'duty_pct', 'vat_pct', 'overrides', 'vendors', 'cbm_override'
];
```

- [ ] **Step 2: Add header migration and call it**

```js
function migrateQuotesHeader_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB.QUOTES);
  if (!sh || sh.getLastRow() < 1) return;
  var width = sh.getLastColumn();
  var head = sh.getRange(1, 1, 1, width).getValues()[0].map(function (h) { return String(h).trim(); });
  var missing = FIELDS.filter(function (f) { return head.indexOf(f) === -1; });
  if (!missing.length) return;
  sh.getRange(1, head.length + 1, 1, missing.length).setValues([missing]);
  header_(sh, head.length + missing.length);
}
```

Call `migrateQuotesHeader_()` at the top of `setupStorage()` (after `var ss = …`) and at the top of `saveQuote()` so pushing the new code migrates on first save even if the owner forgets to run repair.

- [ ] **Step 3: Serialize objects in saveQuote and parse in loadQuote**

In `saveQuote`, the row-building map becomes:

```js
  var row = FIELDS.map(function (k) {
    var v = job[k];
    if (k === 'overrides' || k === 'vendors') return v ? JSON.stringify(v) : '';
    if (Array.isArray(v)) return v.join('|');
    return (v === undefined || v === null) ? '' : v;
  });
```

In `loadQuote`, after the extras handling:

```js
      ['overrides', 'vendors'].forEach(function (k) {
        if (typeof o[k] === 'string' && o[k]) { try { o[k] = JSON.parse(o[k]); } catch (e) { o[k] = {}; } }
        else if (!o[k]) o[k] = {};
      });
```

- [ ] **Step 4: LockService on both counters**

Wrap the counter logic of `saveQuote` and all of `nextPiNumber`:

```js
function saveQuote(job) {
  migrateQuotesHeader_();
  var sh = sh_(TAB.QUOTES);
  if (!job.quote_no) {
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var set = kvRead_(TAB.SET);
      var n = Number(set.quote_next || 1);
      job.quote_no = String(set.quote_prefix || 'QT-') + ('000' + n).slice(-3);
      set.quote_next = n + 1;
      kvWrite_(TAB.SET, set);
    } finally { lock.releaseLock(); }
  }
  /* …rest unchanged… */
}

function nextPiNumber() {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var set = kvRead_(TAB.SET);
    var n = Number(set.pi_next || 1);
    var no = String(set.pi_prefix || 'PI-') + ('000' + n).slice(-3);
    set.pi_next = n + 1;
    kvWrite_(TAB.SET, set);
    return no;
  } finally { lock.releaseLock(); }
}
```

- [ ] **Step 5: Counter safety in saveSettings**

```js
function saveSettings(obj) {
  var cur = kvRead_(TAB.SET);
  Object.keys(obj).forEach(function (k) {
    if (k === 'quote_next' || k === 'pi_next') return; // counters move only via saveCounters
    cur[k] = obj[k];
  });
  kvWrite_(TAB.SET, cur);
  return cur;
}

function saveCounters(obj) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var cur = kvRead_(TAB.SET);
    if (obj.quote_next !== undefined) cur.quote_next = Number(obj.quote_next) || 1;
    if (obj.pi_next !== undefined) cur.pi_next = Number(obj.pi_next) || 1;
    kvWrite_(TAB.SET, cur);
    return { quote_next: cur.quote_next, pi_next: cur.pi_next };
  } finally { lock.releaseLock(); }
}
```

- [ ] **Step 6: Remove `overhead` from the RATES defaults in `setupStorage()`** (delete the `['overhead', 0.08]` entry; leave existing sheets untouched — the engine simply no longer reads the key).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: quotes migration, script locks, counter-safe settings"
```

---

### Task 7: UI — cost lines, repeat toggle, incoterm, breakdown

**Files:**
- Modify: `App.html` (PANEL config, render functions, settings modal, save handler, document renderers)

**Interfaces:**
- Consumes: everything Tasks 2–5 added to the engine and `blankJob`.
- Produces: the user-facing controls; documents whose terms switch by incoterm.

- [ ] **Step 1: Panel — Job section gains the repeat toggle**

In `PANEL`, Job section `f` array, after the qty field:

```js
    {toggles:['repeat'], l:['Repeat order — tooling already made']},
```

(The existing toggle renderer and click handler already handle any `data-tg` key.)

- [ ] **Step 2: Panel — Freight section gains incoterm + DDP fields + CBM display**

Replace the Freight section entry with:

```js
  {t:'Freight & terms', open:true, f:[
    {k:'mode', l:'Freight mode', type:'select', opts:['DHL Express','Air Freight','Sea LCL']},
    {k:'incoterm', l:'Delivery term', type:'select', opts:['DAP','DDP']},
    {g:['duty_pct','vat_pct'], l:['Duty (0.03 = 3%)','VAT (0.20 = 20%)'], type:'num'},
    {g:['pack_pct','cbm_override'], l:['Carton allowance (0.08 = 8%)','CBM override (sea)'], type:'num'},
    {info:'weight'}
  ]},
```

Update the `weight` info line in `renderInfo` to include CBM:

```js
    weight: 'Each box <b>' + n(m.boxKg*1000).toFixed(1) + ' g</b> · shipment <b>'
        + n(m.kgTotal).toFixed(1) + ' kg</b> · sea volume <b>' + n(m.cbmAuto).toFixed(2)
        + ' CBM</b> · freight <b>' + usd(m.freight, 0) + '</b>',
```

- [ ] **Step 3: Panel — new Cost lines section**

Add a new section after "Tooling" in `PANEL`:

```js
  {t:'Cost lines — vendor & override', f:[ {costlines:true} ]},
```

In `renderPanel`'s row loop add a branch:

```js
      } else if(row.costlines){
        h += costLinesHtml();
      }
```

And add the builder + a labels map near `renderPanel`:

```js
var LINE_LABELS = {
  board:'Board / paper', plates:'Plates', print:'Printing', proof:'Proof',
  lam:'Lamination', uv:'Spot UV / drip-off', foil:'Hot foil', emb:'Emboss',
  die:'Cutting die', dc:'Die cutting', paste:'Pasting', pack:'Packing',
  other:'Other', tr:'Local transport'
};
function costLinesHtml(){
  var m = computeCost(job, ctx_());
  var h = '<table class="rtab"><tr><th>Line</th><th style="width:90px">Auto PKR</th>'
        + '<th style="width:90px">Override</th><th>Vendor</th></tr>';
  Object.keys(LINE_LABELS).forEach(function(k){
    var ov = (job.overrides || {})[k];
    h += '<tr><td style="font-size:12px">' + esc(LINE_LABELS[k]) + '</td>'
      + '<td style="font-size:12px;color:var(--app-dim)">' + pkr(m.parts[k] || 0) + '</td>'
      + '<td><input class="n" data-ov="' + k + '" type="number" step="any" value="'
      + esc(ov === undefined ? '' : ov) + '" placeholder="auto"></td>'
      + '<td><input data-vd="' + k + '" value="' + esc((job.vendors || {})[k] || '')
      + '" placeholder="—"></td></tr>';
  });
  return h + '</table>';
}
```

Wire the inputs in the panel `input` listener (before the `data-k` branch):

```js
  var ovk = e.target.getAttribute('data-ov');
  if(ovk){
    job.overrides = job.overrides || {};
    if(e.target.value === '') delete job.overrides[ovk];
    else job.overrides[ovk] = n(e.target.value);
    renderAll(); return;
  }
  var vdk = e.target.getAttribute('data-vd');
  if(vdk){
    job.vendors = job.vendors || {};
    if(e.target.value === '') delete job.vendors[vdk]; else job.vendors[vdk] = e.target.value;
    return; // vendor names don't change money — no re-render needed
  }
```

Note: `costLinesHtml` renders static auto values; they refresh whenever `renderPanel()` runs (open/new/load). Live-per-keystroke refresh of the auto column is intentionally NOT done (the readout already updates live; re-rendering the table would steal focus from the override input being typed in).

- [ ] **Step 4: applyLoaded + save handler carry the new fields**

In `applyLoaded`, after the extras normalization:

```js
  ['overrides','vendors'].forEach(function(k){
    if(typeof base[k] === 'string' && base[k]){ try{ base[k] = JSON.parse(base[k]); }catch(e){ base[k] = {}; } }
    if(!base[k] || typeof base[k] !== 'object' || Array.isArray(base[k])) base[k] = {};
  });
```

In the `b-save` handler, the computed snapshot adds nothing new (engine outputs land in the same fields), but confirm `job.ddp = Number(m.ddp.toFixed(2))` still runs AFTER the engine change so the stored ddp is the incoterm-correct landed total.

- [ ] **Step 5: Settings modal — counters get their own mini-form**

In the settings modal `groups`, delete `['quote_next','Next quotation number']` and `['pi_next','Next PI number']` from the Numbering group and render them in a separate group wired to `saveCounters`:

```js
  h += '<div class="grp"><h4>Counters — change deliberately</h4><div style="display:grid;gap:11px">'
    + '<div class="f"><label>Next quotation number</label><input id="c-q" type="number" value="' + esc(DB.settings.quote_next || 1) + '"></div>'
    + '<div class="f"><label>Next PI number</label><input id="c-p" type="number" value="' + esc(DB.settings.pi_next || 1) + '"></div>'
    + '<button class="btn" id="c-save" style="justify-self:start">Save counters only</button>'
    + '</div></div>';
```

Handler after `openModal`:

```js
  document.getElementById('c-save').addEventListener('click', function(){
    var payload = { quote_next: n(document.getElementById('c-q').value), pi_next: n(document.getElementById('c-p').value) };
    DB.settings.quote_next = payload.quote_next; DB.settings.pi_next = payload.pi_next;
    call('saveCounters', payload, function(){});
    persistDemo(); toast('Counters saved');
  });
```

- [ ] **Step 6: Documents switch by incoterm**

In `renderQuote`:
- The commercial eyebrow becomes `'Commercial — ' + (job.incoterm === 'DDP' ? 'delivered duty paid' : 'delivered to your address')`.
- The Incoterm term becomes:

```js
    + term('Incoterm', job.incoterm === 'DDP'
        ? 'DDP — delivered duty paid. Freight, duty and VAT are inside the unit price. No further charges on arrival.'
        : 'DAP — delivered to your address, freight included. Import duty and VAT, if any, are the buyer\'s; your courier collects them if they apply.')
```

- In the spec block, after the Packing line, add when repeat:

```js
    + (job.repeat === 'Yes' ? spec('Order type', 'Repeat order — tooling retained from your previous run') : '')
```

In `renderPi`: the goods table's tooling row renders only when `job.repeat !== 'Yes'` as the existing $0.00 line; when repeat, replace with a row reading `Tooling — retained from previous order` (same $0.00 amounts). The Incoterm line in the Shipment block becomes `'Incoterm: ' + esc(job.incoterm) + ' ' + esc(job.client_country)`.

- [ ] **Step 7: Verify in demo mode with the harness + browser**

Run: `node tools/test-engine.mjs` — all pass (UI edits must not touch the fenced block).
Open `App.html` in the Browser pane (demo mode, `LIVE` false): create a quote, toggle Repeat (readout drops), switch DDP (duty/VAT fields affect landed), type a board override (readout moves), reload — demo persistence keeps the overrides.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: cost-line UI, repeat toggle, incoterm terms and counter-safe settings"
```

---

### Task 8: Deploy and live verification

**Files:** none new (clasp push of `App.html`, `Code.js`)

- [ ] **Step 1: Confirm clasp scope**

Run from `E:\QUOT`: `clasp status` — exactly `App.html`, `appsscript.json`, `Code.js`.

- [ ] **Step 2: Push**

```bash
clasp push
```

- [ ] **Step 3: Live checks (owner or agent with browser access to the sheet's web app)**

1. Open the web app → status shows "saving to your sheet".
2. Save a new quote → open the Quotes tab → new columns exist at the end; row aligned.
3. Load an OLD quote → loads clean, incoterm shows DAP, prices unchanged.
4. Toggle Repeat on a copy → tooling lines zero on the readout; PI shows "retained".
5. DDP with duty 3% / VAT 20% → landed total rises accordingly; quote terms show the DDP sentence.
6. Sea LCL at qty 5,000 vs 20,000 → freight scales.
7. Two browser tabs, save a new quote in each quickly → different quote numbers.

- [ ] **Step 4: Commit any push artifacts and push git**

```bash
git add -A && git commit -m "chore: deploy broker engine v2 to Apps Script" && git push origin main
```

---

## Done when

- `node tools/test-engine.mjs` passes every assertion (parity, overrides, repeat, freight, DAP/DDP)
- Old saved quotes load unchanged; new quotes carry the v2 fields
- The live web app demonstrates: repeat zeroing, DDP pricing duty+VAT, sea freight scaling, no duplicate numbers from two tabs
- `clasp status` still tracks exactly three files
