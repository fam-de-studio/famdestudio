/**
 * A job-ticket style specification row: small uppercase label on the left,
 * value on the right, hairline beneath. The print-shop vernacular that runs
 * through the site.
 */
export function SpecList({
  rows,
  className = "",
}: {
  rows: { label: string; value: React.ReactNode }[];
  className?: string;
}) {
  return (
    <dl className={`divide-y divide-line border-y border-line ${className}`}>
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[7rem_1fr] gap-6 py-3.5 sm:grid-cols-[9rem_1fr]">
          <dt className="t-eyebrow pt-0.5 text-muted">{r.label}</dt>
          <dd className="t-small sm:text-[0.9375rem]">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Dots({ items }: { items: readonly string[] }) {
  return (
    <span>
      {items.map((f, i) => (
        <span key={f}>
          {i > 0 && <span className="mx-2 text-champagne">·</span>}
          {f}
        </span>
      ))}
    </span>
  );
}
