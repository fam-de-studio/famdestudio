import { Reveal } from "@/components/ui/Reveal";
import { Count } from "@/components/ui/Count";

const stats = [
  { value: 1998, label: "Working in print since", note: "Design, prepress, offset, flexo, packaging." },
  { value: 25, suffix: "+", label: "Years of experience", note: "From the first press sheet to luxury finishing." },
  { value: 10, label: "Years in Dubai", note: "International brands, international standards." },
  { value: 50, label: "Minimum order", note: "Pieces, not pallets. Small runs, no shortcuts." },
];

/** The numbers, counted up as they enter. A real sequence of facts, not decoration. */
export function Stats() {
  return (
    <section className="border-t border-line bg-ink py-20 lg:py-28" aria-label="Studio in numbers">
      <div className="container-x grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} index={i} className="stat">
            <b>
              <Count to={s.value} />
              {s.suffix && <small>{s.suffix}</small>}
            </b>
            <p className="t-eyebrow mt-5 text-yellow">{s.label}</p>
            <p className="t-small mt-2 max-w-[18rem] text-muted">{s.note}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
