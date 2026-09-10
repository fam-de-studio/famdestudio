# Daily accent colour

**Goal:** the site's accent (currently the fixed yellow `#f5c518`) changes once per day, site-wide, with no flash and no hosting dependency.

## Palette

`site/src/lib/accent.ts` exports `ACCENTS`, an ordered list of seven vivid hex colours:

| # | Hex | Note |
|---|---|---|
| 0 | `#f5c518` | current yellow |
| 1 | `#02fa44` | green |
| 2 | `#028bfa` | blue |
| 3 | `#b84dff` | purple, lightened from `#a302fa` so dark text on it passes AA |
| 4 | `#fa029f` | pink |
| 5 | `#fa0202` | red |
| 6 | `#03fcb6` | teal |

Adding or removing a colour only touches this file.

## Daily pick

`index = floor(localDaysSinceEpoch) mod ACCENTS.length`, computed from the visitor's local date. One colour per calendar day, identical for every visitor in the same timezone, unchanged on refresh, next colour the next day.

`?accent=N` on the URL forces index `N` (for previewing all colours).

## Apply

An inline `<script>` in the root layout `<head>` runs before first paint and:

1. sets `--color-yellow` on `<html>` (inline style beats the Tailwind `@theme` `:root` definition), and
2. updates `<meta name="theme-color">` to match.

Every existing consumer (`bg-yellow`, `text-yellow`, `bg-yellow/60`, `.btn-yellow`, `.ribbon-yellow`, `.t-outline-yellow`, preloader bar) reads the token, so nothing else changes.

## Cleanup

The four hard-coded `rgba(245, 197, 24, α)` values in `globals.css` and `v2.css` become `color-mix(in srgb, var(--color-yellow) α%, transparent)` so borders and the hover glow follow the day's colour too.

## Out of scope

The OG image stays yellow. The gold/champagne hairline tokens are untouched.
