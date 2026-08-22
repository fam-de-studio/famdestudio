'use client'

import { useSpec } from '@/lib/store'
import { SpecPanel } from '@/components/SpecPanel'
import { FlatView } from '@/components/FlatView'
import { ExportBar } from '@/components/ExportBar'

export default function Page() {
  const { spec, setSpec, dieline, problems } = useSpec()
  return (
    <main className="flex h-screen bg-neutral-950 text-neutral-100">
      <SpecPanel spec={spec} setSpec={setSpec} problems={problems} />
      <section className="flex min-w-0 flex-1 flex-col">
        <ExportBar dieline={dieline} />
        <FlatView dieline={dieline} />
      </section>
    </main>
  )
}
