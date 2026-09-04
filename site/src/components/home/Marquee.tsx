const items = [
  "Hot Foiling",
  "Embossing",
  "Debossing",
  "Spot UV",
  "Textured UV",
  "Drip-Off UV",
  "Metalized Printing",
  "Soft Touch",
  "Rigid Boxes",
  "Magnetic Boxes",
  "Premium Cartons",
  "Dielines",
  "3D Visualization",
];

/** Slow foil ribbon under the hero. Pure CSS; pauses under reduced motion. */
export function Marquee() {
  const row = (ariaHidden: boolean) => (
    <ul className="marquee-row flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {items.map((t) => (
        <li key={t} className="t-eyebrow flex items-center gap-8 whitespace-nowrap pr-8 text-champagne">
          <span className="foil">{t}</span>
          <span aria-hidden className="h-px w-6 bg-champagne/40" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee border-y border-line bg-ink-2 py-4" aria-label="Finishing and formats">
      <div className="marquee-track flex">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
