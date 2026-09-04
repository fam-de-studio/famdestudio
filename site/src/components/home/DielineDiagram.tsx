/**
 * Schematic dieline of a straight tuck-end carton, drawn with the
 * conventions of a real die drawing: solid = cut, dashed = crease.
 * Pure SVG, inherits currentColor; the champagne stroke marks the creases.
 */
export function DielineDiagram({ className = "" }: { className?: string }) {
  // Panel widths: glue 14, side 40, front 60, side 40, back 60 ; height 110 ; tucks
  return (
    <svg
      viewBox="0 0 260 190"
      className={className}
      role="img"
      aria-label="Dieline drawing of a tuck-end folding carton showing cut lines and crease lines"
      fill="none"
      strokeWidth="0.8"
      strokeLinejoin="round"
    >
      <defs>
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0H0V10" stroke="currentColor" strokeOpacity="0.08" />
        </pattern>
      </defs>
      <rect width="260" height="190" fill="url(#grid)" />

      {/* Registration marks */}
      <g stroke="currentColor" strokeOpacity="0.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 6v12M6 12h12" />
        <circle cx="248" cy="178" r="3" />
        <path d="M248 172v12M242 178h12" />
      </g>

      {/* Body: cut outline */}
      <g stroke="currentColor">
        {/* Glue flap */}
        <path d="M26 46 L38 44 L38 152 L26 150 Z" />
        {/* Main body outline */}
        <path d="M38 44 H238 V152 H38" />
        {/* Top tuck on front panel (x 78..138) */}
        <path d="M78 44 V30 Q80 22 88 22 H128 Q136 22 138 30 V44" />
        {/* Bottom tuck on front panel */}
        <path d="M78 152 V166 Q80 174 88 174 H128 Q136 174 138 166 V152" />
        {/* Dust flaps on side panels top */}
        <path d="M40 44 V34 L50 30 H70 L76 34 V44" />
        <path d="M140 44 V34 L150 30 H170 L176 34 V44" />
        {/* Dust flaps bottom */}
        <path d="M40 152 V162 L50 166 H70 L76 162 V152" />
        <path d="M140 152 V162 L150 166 H170 L176 162 V152" />
        {/* Back panel top/bottom tuck (x 178..238) */}
        <path d="M178 44 V32 Q180 26 186 26 H230 Q236 26 238 32 V44" />
        <path d="M178 152 V164 Q180 170 186 170 H230 Q236 170 238 164 V152" />
        {/* Thumb notch on back top tuck */}
        <path d="M202 26 Q208 34 214 26" />
      </g>

      {/* Creases: dashed, champagne */}
      <g stroke="#c9b48a" strokeDasharray="3 2.5">
        <path d="M38 44 V152" />
        <path d="M78 44 V152" />
        <path d="M138 44 V152" />
        <path d="M178 44 V152" />
        <path d="M38 44 H238" />
        <path d="M38 152 H238" />
        <path d="M78 30 H138" />
        <path d="M78 166 H138" />
        <path d="M178 32 H238" />
        <path d="M178 164 H238" />
      </g>

      {/* Panel labels */}
      <g fill="currentColor" fillOpacity="0.55" fontSize="5" fontFamily="var(--font-manrope)" letterSpacing="0.6">
        <text x="28" y="100" transform="rotate(-90 28 100)" textAnchor="middle">
          GLUE
        </text>
        <text x="58" y="100" textAnchor="middle">
          SIDE
        </text>
        <text x="108" y="100" textAnchor="middle">
          FRONT
        </text>
        <text x="158" y="100" textAnchor="middle">
          SIDE
        </text>
        <text x="208" y="100" textAnchor="middle">
          BACK
        </text>
      </g>

      {/* Dimension line */}
      <g stroke="currentColor" strokeOpacity="0.5">
        <path d="M38 182 H238" />
        <path d="M38 179 V185M238 179V185" />
      </g>
      <text x="138" y="188" textAnchor="middle" fontSize="5" fill="currentColor" fillOpacity="0.55" fontFamily="var(--font-manrope)" letterSpacing="0.6">
        200 mm
      </text>

      {/* Legend */}
      <g fontSize="5" fill="currentColor" fillOpacity="0.55" fontFamily="var(--font-manrope)" letterSpacing="0.6">
        <path d="M188 12 H200" stroke="currentColor" />
        <text x="204" y="14">CUT</text>
        <path d="M222 12 H234" stroke="#c9b48a" strokeDasharray="3 2.5" />
        <text x="238" y="14">CREASE</text>
      </g>
    </svg>
  );
}
