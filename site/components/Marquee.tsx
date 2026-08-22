/** A Kurosawa-style scrolling strip: ITEM // ITEM // …
    The track holds two copies of the list; the animation slides -50%, so the
    loop is seamless. Pure CSS — no JS. */
export function Marquee({ items }: { items: readonly string[] }) {
  const strip = (
    <>
      {items.map((it, i) => (
        <span key={i}>
          <span className="marquee-item">{it}</span>
          <span className="marquee-sep">{'//'}</span>
        </span>
      ))}
    </>
  )
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {strip}
        {strip}
      </div>
    </div>
  )
}
