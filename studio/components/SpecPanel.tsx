'use client'

import type { BoxSpec, BoardKey } from '@/lib/geometry'

const NUMBERS: Array<[keyof BoxSpec, string]> = [
  ['l', 'Length L (mm)'],
  ['w', 'Width W (mm)'],
  ['h', 'Height H (mm)'],
]

export function SpecPanel({
  spec, setSpec, problems,
}: {
  spec: BoxSpec
  setSpec: (s: BoxSpec) => void
  problems: string[]
}) {
  return (
    <aside className="w-72 shrink-0 space-y-4 overflow-y-auto border-r border-neutral-800 p-4">
      <label className="block text-sm">
        <span className="text-neutral-400">Style</span>
        <select
          className="mt-1 w-full rounded bg-neutral-900 p-2"
          value={spec.style}
          onChange={(e) => setSpec({ ...spec, style: e.target.value as BoxSpec['style'] })}
        >
          <option value="STE">Straight Tuck End</option>
          <option value="RTE">Reverse Tuck End</option>
        </select>
      </label>

      {NUMBERS.map(([k, label]) => (
        <label key={k} className="block text-sm">
          <span className="text-neutral-400">{label}</span>
          <input
            type="number"
            className="mt-1 w-full rounded bg-neutral-900 p-2"
            value={spec[k] as number}
            onChange={(e) => setSpec({ ...spec, [k]: Number(e.target.value) })}
          />
        </label>
      ))}

      <label className="block text-sm">
        <span className="text-neutral-400">Board</span>
        <select
          className="mt-1 w-full rounded bg-neutral-900 p-2"
          value={spec.board}
          onChange={(e) => setSpec({ ...spec, board: e.target.value as BoardKey })}
        >
          <option value="sbs">SBS / Ivory</option>
          <option value="artC1S">Art Card C1S</option>
          <option value="kraft">Kraft</option>
        </select>
      </label>

      <label className="block text-sm">
        <span className="text-neutral-400">GSM</span>
        <select
          className="mt-1 w-full rounded bg-neutral-900 p-2"
          value={spec.gsm}
          onChange={(e) => setSpec({ ...spec, gsm: Number(e.target.value) })}
        >
          {[300, 350, 400].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </label>

      {problems.length > 0 && (
        <ul className="space-y-2 rounded border border-red-900 bg-red-950/40 p-3 text-xs text-red-300">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
    </aside>
  )
}
