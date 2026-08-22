'use client'

import { dielineToSvg } from '@/lib/export/svg'
import type { Dieline } from '@/lib/geometry'

export function FlatView({ dieline }: { dieline: Dieline | null }) {
  if (!dieline) {
    return (
      <div className="grid flex-1 place-items-center text-sm text-neutral-500">
        Fix the problems on the left to see the dieline.
      </div>
    )
  }
  return (
    <div
      className="flex-1 overflow-auto bg-white p-8"
      /* dielineToSvg output is generated from validated numbers, not user text */
      dangerouslySetInnerHTML={{ __html: dielineToSvg(dieline) }}
    />
  )
}
