'use client'

import { useEffect } from 'react'

const SPARKS: Array<[number, number, number, number]> = [
  [7, 12, 0.3, 4.2], [18, 64, 2.1, 5.6], [26, 31, 1.2, 3.9], [33, 82, 3.4, 6.1],
  [41, 18, 0.8, 4.8], [47, 55, 2.7, 5.2], [54, 9, 1.6, 4.4], [61, 73, 0.5, 5.9],
  [68, 38, 3.1, 4.1], [74, 88, 1.9, 5.4], [81, 22, 2.4, 4.6], [88, 59, 0.9, 6.3],
  [93, 35, 3.7, 4.9], [12, 44, 1.4, 5.1], [58, 92, 2.9, 4.3], [37, 5, 0.6, 5.7],
  [84, 78, 2.2, 4.5], [22, 96, 1.1, 5.3],
]

/** Sparkles are static markup + CSS; the reveal animation arms itself only
    once JS is confirmed running, so a blocked script never blanks the page. */
export function Effects() {
  useEffect(() => {
    document.body.classList.add('js')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px' }
    )
    document.querySelectorAll('.rise').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="sparks" aria-hidden="true">
      {SPARKS.map(([l, t, d, dur], i) => (
        <i
          key={i}
          className="spark"
          style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${d}s`, animationDuration: `${dur}s` }}
        />
      ))}
    </div>
  )
}
