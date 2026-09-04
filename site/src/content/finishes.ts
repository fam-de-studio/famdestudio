import type { StaticImageData } from "next/image";
import hotFoil from "@/images/hot-foil-close-up.jpg";
import emboss from "@/images/emboss-close-up.jpg";
import deboss from "@/images/deboss-close-up.jpg";
import spotUv from "@/images/spot-uv-close-up.jpg";
import texturedUv from "@/images/textured-uv.jpg";
import dripOff from "@/images/drip-off-uv.jpg";
import metalized from "@/images/metalized-printing.jpg";
import softTouch from "@/images/fam-de-studio-02.jpg";
import rigidConstruction from "@/images/rigid-box-corner-detail.jpg";

export type Finish = {
  slug: string;
  name: string;
  image: StaticImageData;
  alt: string;
  /** What the hand feels / the eye sees — one line. */
  physical: string;
  description: string;
  /** Grid sizing hint for the tactile showcase. */
  size: "large" | "standard";
};

export const finishes: Finish[] = [
  {
    slug: "hot-foiling",
    name: "Hot Foiling",
    image: hotFoil,
    alt: "Macro of a geometric hot foil pattern in champagne gold pressed into black uncoated board, catching a single light source",
    physical: "Metallic. Pressed just below the surface. Catches light as it moves.",
    description:
      "A heated die presses metallic foil into the board. On uncoated stock the foil sits slightly beneath the surface, so a line reads as both colour and impression. Gold, copper, silver, pigment and holographic foils; registered to print within a fraction of a millimetre.",
    size: "large",
  },
  {
    slug: "embossing",
    name: "Embossing",
    image: emboss,
    alt: "Macro of a multi-level embossed emblem rising from natural ivory textured paper",
    physical: "Raised. Casts its own shadow. The fibres stretch over the form.",
    description:
      "A male and female die raise the artwork above the sheet. Single-level, multi-level or sculpted, blind or registered to foil. Best on long-fibre, uncoated stock where the paper can hold the form.",
    size: "standard",
  },
  {
    slug: "debossing",
    name: "Debossing",
    image: deboss,
    alt: "Macro of a tessellated pattern debossed into deep navy fibrous board, with light raking across the recesses",
    physical: "Recessed. The board is compressed, so the mark feels denser than its surroundings.",
    description:
      "The mirror of embossing. The die presses the artwork into the board, leaving a crisp recess with a subtly polished floor. Quiet, architectural, and particularly good for wordmarks on dark rigid boxes.",
    size: "standard",
  },
  {
    slug: "spot-uv",
    name: "Spot UV",
    image: spotUv,
    alt: "Macro of a glossy triangulated spot UV pattern contrasting against matte black board",
    physical: "Glass-smooth gloss against dead-matte. Invisible until the box tilts.",
    description:
      "A clear UV-cured varnish applied only where the artwork asks for it. Against a matte or soft-touch lamination the contrast is dramatic in the hand and almost invisible face-on: a finish designed to be discovered.",
    size: "standard",
  },
  {
    slug: "textured-uv",
    name: "Textured UV",
    image: texturedUv,
    alt: "Macro of a raised, textured UV pattern with a wet gloss surface on burgundy uncoated paper",
    physical: "Raised gloss with grain. Feels like enamel or glazed ceramic.",
    description:
      "A thicker, sculpted UV layer that can be built up with sand, glitter or a leather grain. It adds relief without a die, so intricate patterns that would be impossible to emboss become possible.",
    size: "standard",
  },
  {
    slug: "drip-off-uv",
    name: "Drip-Off UV",
    image: dripOff,
    alt: "Black rigid box with a drip-off UV diamond motif: high-gloss shapes against a fine matte-textured field, edged in gold foil",
    physical: "Two textures from one pass: a fine matte grain everywhere except the gloss.",
    description:
      "A matte varnish and a gloss UV varnish applied in one pass. Where they meet, the matte pulls back from the gloss and forms a fine, uniform texture. Ideal for full-coverage patterns on dark cartons.",
    size: "standard",
  },
  {
    slug: "metalized-printing",
    name: "Metalized Printing",
    image: metalized,
    alt: "Folding carton printed on silver metalized board with burgundy and navy inks, the unprinted areas reflecting the room",
    physical: "The board itself is the metal. Colour printed over it glows.",
    description:
      "Printing on metalized (silver) board or film. Transparent inks over the silver read as metallic colour; white ink knocks back areas to paper. A full-bleed metallic effect that foil alone cannot achieve.",
    size: "large",
  },
  {
    slug: "soft-touch",
    name: "Soft Touch",
    image: softTouch,
    alt: "Square soft-touch matte black rigid box with a blind-debossed wordmark and a thin champagne foil rule, lid ajar showing an ivory interior",
    physical: "Velvet to the touch. Absorbs light. Shows fingerprints, which is part of its intimacy.",
    description:
      "A soft-touch lamination or coating gives the board a suede-like hand. It is the finish that makes people hold a box longer than they meant to, and it pairs naturally with deboss and foil.",
    size: "standard",
  },
  {
    slug: "rigid-box-construction",
    name: "Rigid Box Construction",
    image: rigidConstruction,
    alt: "Corner of a navy rigid box with a debossed frame and gold foil wordmark, showing the wrapped board edge and a tight, clean corner",
    physical: "Weight. Tight corners. A lid that sighs when it closes.",
    description:
      "Greyboard cut and wrapped by hand or machine in printed paper, cloth or specialty stock. The details that separate a good box from a great one: corner folds, wrap tension, lid fit and the interior fitment.",
    size: "large",
  },
];
