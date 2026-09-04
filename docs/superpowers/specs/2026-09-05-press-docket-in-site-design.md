# Press Docket inside the website — design

Date: 2026-09-05. Decision: option 2 from the discussion (rebuild in the site, keep the Google Sheet as storage, Google sign-in).

## Goal

Move the Apps Script quoting tool (`App.html` + `Code.js`) into the Next.js site at `/admin/docket` so the studio has one login and one design system, without losing the existing sheet, quotes, rates or clients.

## Architecture

```
src/app/(site)/…             public site (nav, footer, cursor, guards)
src/app/admin/layout.tsx     bare chrome, docket fonts, noindex
src/app/admin/login          Google sign-in (Auth.js v5), allowlist by ADMIN_EMAILS
src/app/admin/docket         the tool (server gate -> DocketApp)
src/app/api/auth/[...nextauth]
src/app/api/docket/[action]  bootstrap | quote | delete-quote | pi-number | settings | counters | rates | client
src/lib/auth.ts              NextAuth config, currentAdmin(), dev bypass
src/lib/docket/engine.ts     costing engine (pure), ported verbatim
src/lib/docket/defaults.ts   FIELDS (sheet columns), defaults, blankJob, jobFromRecord
src/lib/docket/store.ts      DocketStore interface + selector
src/lib/docket/sheets.ts     Google Sheets backend (service account, REST v4)
src/lib/docket/file-store.ts local JSON backend for development
src/components/docket/       DocketApp (panel, stage, readout, modals), documents.ts (HTML), format.ts
scripts/test-docket-engine.mjs parity test (same fixture as tools/test-engine.mjs)
```

## Storage contract

Same six tabs (`Settings`, `Rates`, `Boards`, `Films`, `Clients`, `Quotes`) and the same `FIELDS` column order as `Code.js`, including the header migration that appends missing columns. Quote numbers and PI numbers are minted server-side from the Settings counters. Apps Script's `LockService` has no equivalent here; the tool is single-user, and the risk is limited to two tabs saving a brand-new quote in the same second.

## Auth

Auth.js v5 with the Google provider. `signIn` callback rejects any email not in `ADMIN_EMAILS`. API routes and the page both call `currentAdmin()`. `ADMIN_DEV_BYPASS=1` is honoured only when `NODE_ENV !== "production"`.

## Not changed

Costing maths, document wording and layout, the print stylesheet (dark PDF / black-and-white paper), the Gmail compose handoff, the readout figures.

## Verification

- Engine parity: ups 12, gross 647, direct 152,538.33 PKR, EXW $892.04 for the reference job; overrides, repeat orders, DDP duty/VAT, sea CBM, no-fit cases.
- Browser flow against the file store: boot, live recalculation, client save, quote save and reopen, PI numbering, rates save changes the price, settings save shows on the document, print media hides chrome.
