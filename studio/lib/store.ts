'use client'

import { useEffect, useMemo, useState } from 'react'
import { buildDieline, validateSpec, type BoxSpec, type Dieline } from '@/lib/geometry'

const KEY = 'dieline-studio-spec-v1'

export const DEFAULT_SPEC: BoxSpec = {
  style: 'STE', l: 45, w: 45, h: 120, board: 'sbs', gsm: 350,
}

export function useSpec() {
  const [spec, setSpec] = useState<BoxSpec>(DEFAULT_SPEC)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setSpec({ ...DEFAULT_SPEC, ...JSON.parse(raw) })
    } catch {
      /* ignore unreadable storage */
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(spec))
    } catch {
      /* ignore full or blocked storage */
    }
  }, [spec])

  const problems = useMemo(() => validateSpec(spec), [spec])

  const dieline = useMemo<Dieline | null>(() => {
    if (problems.length) return null
    try {
      return buildDieline(spec)
    } catch {
      return null
    }
  }, [spec, problems])

  return { spec, setSpec, dieline, problems }
}
