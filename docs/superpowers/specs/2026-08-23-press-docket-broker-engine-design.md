# Press Docket v2 — Broker Engine Design

**Date:** 2026-08-23
**Status:** Approved
**Sub-project:** #3 of 5 in the brokerage programme
**Files:** `E:\QUOT\Code.js`, `E:\QUOT\App.html` (Apps Script project, pushed via clasp)

---

## 1. Why

Press Docket currently models an **in-house factory** (overhead 8%, factory framing), but
the owner is a **broker**: work is split across vendors (printing one place, foil another,
die cutting a third), and costs come from negotiated job-work rates plus the owner's own
board purchase. Three verified money-losing bugs compound this:

1. Quote promises DDP "duty included, no charges on arrival" but the engine adds no duty
   or destination VAT (default UK job: $385 profit vs ~$310 UK VAT alone).
2. Sea LCL freight uses a manual CBM field, so price per piece is wrong at every quantity
   except the one the CBM was typed for.
3. Die/plate/proof are charged on every order despite the PI promising one-time tooling.

Owner's decisions (locked): split-vendor cost lines · standing rate card **with per-job
override** · DAP/DDP selectable per quote.

## 2. Cost-line model

A quote's cost is a fixed set of **cost lines**. Each line auto-computes from the rate
card and the job spec; each line has an optional **per-job override (PKR amount)** and an
optional **vendor name** (free text, stored with the job).

| Line key | Rate card unit | Auto formula |
|---|---|---|
| `board` | PKR/kg (per board type) | grossSheets × kgPerSheet × rate |
| `plates` | PKR/plate | (col_f + col_b) × rate |
| `print` | PKR/1000 impressions | grossSheets/1000 × rate × (col_f + col_b) |
| `lam` | PKR/sq.in (per film) | grossSheets × sheetArea × rate |
| `foil_block` | PKR/sq.in | foil_area × rate (if foil) |
| `foil_run` | PKR/sheet | grossSheets × rate (if foil) |
| `emb_block` | PKR/sq.in | emb_area × rate (if emboss) |
| `emb_run` | PKR/sheet | grossSheets × rate (if emboss) |
| `proof` | PKR/job | rate |
| `uv_setup` / `uv_run` | PKR/job + PKR/sheet | as now (if UV) |
| `die` | PKR/job | job field (die_cost) |
| `dc` | PKR/1000 sheets | grossSheets/1000 × rate |
| `paste` | PKR/pc | qty × rate |
| `pack` | PKR/pc | qty × rate |
| `tr` | PKR/job | job field (local_tr) |
| `other` | PKR/job | job field (other_pkr) |

- `grossSheets` keeps the existing physics: `ceil(net × (1 + waste)) + setup_sheets`.
  Waste and setup sheets stay — presses genuinely consume make-ready sheets.
- **Removed: `overhead` (8% factory overhead).** Total cost = sum of lines, nothing
  multiplied on top. The owner's compensation is the margin, not a fake overhead.
- Overrides are stored per job as `{lineKey: PKR}` — a job with overrides keeps them
  forever; the rate card only drives lines without an override.
- Vendor names stored per job as `{lineKey: name}`; purely informational in v2.

## 3. Repeat order toggle

New job field `repeat` (Yes/No, default No). When Yes, these lines are forced to 0:
`plates`, `die`, `foil_block`, `emb_block`, `proof`, `uv_setup`. The quote document shows
"Repeat order — tooling retained from your previous run" in the spec block.

## 4. DAP / DDP per quote

New job fields: `incoterm` ('DAP' | 'DDP', default DAP), `duty_pct`, `vat_pct`
(fractions, used only when DDP).

- EXW (USD) = totalCost / (1 − margin) / fx  (unchanged)
- freight: DHL/air per kg from computed weight (unchanged); **Sea LCL CBM is now
  computed**: `cbm = cartonVolumeM3 × cartons` derived from flat size, qty and the pack
  allowance — with a manual override field kept for odd cargo.
- bank fee = bank_pct × **(EXW + freight + docs)** — the full invoice value, fixing the
  undercharge.
- **DAP** total = EXW + freight + docs + bank.
- **DDP** total = DAP total + duty + VAT, where duty = duty_pct × (EXW + freight) and
  VAT = vat_pct × (EXW + freight + duty) — the standard destination formula (VAT on
  CIF + duty).
- Document terms text switches with the incoterm:
  - DAP: "Delivered to your address. Import duty and VAT, if any, are the buyer's —
    your courier collects them if they apply."
  - DDP: "Delivered duty paid. Freight, duty and VAT are inside the unit price. No
    further charges on arrival." (Now true, because the engine prices them.)
- Option B (second quantity) recosts with the same incoterm and percentages.

## 5. Reliability fixes

- `saveQuote` and `nextPiNumber` wrap counter read-increment-write in
  `LockService.getScriptLock()` — no duplicate numbers from two open tabs.
- The Settings modal no longer writes `quote_next` / `pi_next` from stale form values:
  counters are read fresh at save, or excluded from the form entirely (excluded — with a
  separate "set counters" mini-form that reads current values on open).
- `setupStorage()` extends the existing Quotes sheet header in place when new columns
  (`repeat`, `incoterm`, `duty_pct`, `vat_pct`, `overrides`, `vendors`, `cbm_auto`) are
  missing — appended at the end so existing rows stay aligned. Old quotes load with
  defaults (repeat No, DAP).
- `overrides` and `vendors` stored as JSON strings in their columns.

## 6. UI changes (App.html)

- New panel section **"Cost lines"** replacing the scattered tooling inputs: each line
  shows auto amount, an override input (blank = auto), and a vendor field. Collapsed by
  default; the readout stays live.
- **Repeat order** toggle in the Job section.
- **Freight section**: incoterm select (DAP/DDP); when DDP, duty% and VAT% fields appear;
  CBM shows the computed value with an override box.
- Readout adds a cost-breakdown popover (the engine already computes `parts`; now shown).
- Document renderers switch terms text by incoterm and show the repeat-order line.
- Demo mode (localStorage) keeps working — same engine runs client-side.

Not changing: visual design, document layout, Sheet-as-storage, Gmail compose flow.

## 7. Testing

Apps Script has no test harness here; the engine is client-side JS in App.html. Approach:
- Extract the costing into a pure function `computeCost(job, rates, boards, films)` inside
  App.html (no DOM access) so it can be pasted/run in Node for verification during
  development — same technique used in the original review.
- A Node scratch script (scratchpad) asserts: DAP vs DDP totals, repeat-order zeroing,
  sea CBM scaling with qty, bank fee on full invoice, old-job defaults.
- Manual: push via clasp, run through the live sheet — new quote, repeat quote, DDP UK
  job, sea job at two quantities, two-tab numbering race.

## 8. Migration & rollout

1. Implement + verify engine in Node scratch.
2. `clasp push` to the live script.
3. Owner runs "Set up / repair storage" once (adds columns).
4. Existing saved quotes remain loadable; they show DAP defaults and their stored prices.

## 9. Out of scope

- Vendor database with per-vendor rate cards (v3 candidate; `vendors` field seeds it)
- Multi-currency, client portal, PDF generation server-side
- Any change to the public website or the dieline studio
