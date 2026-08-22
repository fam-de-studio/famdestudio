# Dieline & 3D Visual Studio

Generates production-ready folding-carton dielines and, from Plan B onward, 3D mockups
with realistic decorative finishes — foil, drip-off, soft-touch, metalized.

## Run

    npm install
    npm run dev      # http://localhost:3000
    npm test         # geometry unit tests, Node environment
    npm run build    # production build

## Layout

    lib/geometry/    pure TypeScript core — no React, no Three, tests in Node
    lib/export/      Dieline → SVG / PDF
    components/      studio UI
    app/             Next.js App Router

`lib/geometry/constants.ts` holds every trade allowance. Change dieline behaviour there,
never inline.

> **The trade constants are unconfirmed defaults.** Glue flap width, tuck and dust
> clearances, chamfers, and the caliper table all need verification by the shop before
> any dieline is sent to a die maker.

## What works today

- Straight Tuck End and Reverse Tuck End geometry, with the tuck hosts genuinely reversed
- Live validation with actionable messages (bad dimensions disable export)
- Layered SVG export — separate `cut`, `crease`, `bleed` groups plus a grain marker,
  in the trade colour convention (cut magenta, crease dashed blue, bleed cyan)
- Vector PDF export at true millimetre scale
- A fold-closure test proving each dieline folds into the box that was requested

## Deployment

Vercel builds from the `studio` directory of this repository.

Three settings must hold or the deploy fails silently:

- **Settings → General → Root Directory** = `studio`. The repository root has no
  `package.json`; without this the build reports "No Next.js version detected".
- **Production branch** = `main`. Pushes to any other branch produce preview
  deployments only, and the production domain stays empty.
- **Commit author** must be a contributor on the Vercel project. The Hobby plan
  blocks deployments otherwise, so this repository carries a local git identity
  (`git config user.email`) rather than relying on the machine-wide one.
