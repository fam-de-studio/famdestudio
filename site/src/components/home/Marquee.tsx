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
        <li key={t} className="t-eyebrow flex items-center gap-8 whitespace-nowrap pr-8 font-bold tracking-[0.3em]">
          <span>{t}</span>
          <span aria-hidden className="h-px w-6 bg-[#111]/50" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee ribbon-yellow py-[15px]" aria-label="Finishing and formats">
      <div className="marquee-track flex">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
