/**
 * Splits text into masked words so a parent `.reveal.is-in` can slide each
 * word up in sequence. The space lives OUTSIDE each mask span, otherwise the
 * inline-block mask swallows it. Motion is in v2.css (.w).
 */
export function Words({ text, className = "", start = 0 }: { text: string; className?: string; start?: number }) {
  const parts = text.split(" ");
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          <span className={`w ${className}`.trim()} style={{ ["--w" as string]: start + i }}>
            <i>{p}</i>
          </span>
          {i < parts.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}
