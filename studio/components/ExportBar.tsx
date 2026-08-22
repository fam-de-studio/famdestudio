'use client'

import { dielineToSvg } from '@/lib/export/svg'
import type { Dieline } from '@/lib/geometry'

function download(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export function ExportBar({ dieline }: { dieline: Dieline | null }) {
  const disabled = !dieline
  const base = dieline ? `${dieline.style}-${dieline.dims.l}x${dieline.dims.w}x${dieline.dims.h}` : ''

  async function savePdf() {
    if (!dieline) return
    const { jsPDF } = await import('jspdf')
    await import('svg2pdf.js')
    const host = document.createElement('div')
    host.innerHTML = dielineToSvg(dieline)
    const el = host.querySelector('svg')!
    const w = dieline.flat.width + 2 * dieline.bleed
    const h = dieline.flat.height + 2 * dieline.bleed
    const doc = new jsPDF({ unit: 'mm', format: [w, h], orientation: w > h ? 'landscape' : 'portrait' })
    await doc.svg(el, { width: w, height: h })
    doc.save(`${base}-dieline.pdf`)
  }

  return (
    <div className="flex gap-2 border-b border-neutral-800 p-3">
      <button
        disabled={disabled}
        className="rounded bg-neutral-800 px-3 py-1.5 text-sm disabled:opacity-40"
        onClick={() =>
          dieline &&
          download(`${base}-dieline.svg`, new Blob([dielineToSvg(dieline)], { type: 'image/svg+xml' }))
        }
      >
        Download SVG
      </button>
      <button
        disabled={disabled}
        className="rounded bg-amber-700 px-3 py-1.5 text-sm disabled:opacity-40"
        onClick={savePdf}
      >
        Download PDF
      </button>
      {dieline && (
        <span className="ml-auto self-center text-xs text-neutral-500">
          flat {Math.round(dieline.flat.width)} × {Math.round(dieline.flat.height)} mm ·
          caliper {dieline.dims.caliper} mm
        </span>
      )}
    </div>
  )
}
