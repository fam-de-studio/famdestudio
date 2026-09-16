import type { StaticImageData } from "next/image";
import velvet from "@/images/gal-velvet-rigid-box.jpg";
import aeterna from "@/images/gal-aeterna-rigid-insert.jpg";
import urbanBreeze from "@/images/gal-urban-breeze-carrier.jpg";
import terraHarvest from "@/images/gal-terra-harvest-mailer.jpg";
import verdantLeaf from "@/images/gal-verdant-leaf-spice-box.jpg";
import kraftCore from "@/images/gal-kraft-core-mailers.jpg";
import ecoParcel from "@/images/gal-eco-parcel-mailer.jpg";
import aetherealHarvest from "@/images/gal-aethereal-harvest-kraft.jpg";
import veridian from "@/images/gal-veridian-mailer.jpg";
import valiantArcher from "@/images/gal-valiant-archer-carry-box.jpg";
import kraftShippers from "@/images/gal-kraft-shipper-boxes.jpg";
import aethelred from "@/images/gal-aethelred-belt-box.jpg";
import aureliaPerfume from "@/images/gal-aurelia-perfume-box.jpg";
import solaia from "@/images/gal-solaia-skincare-set.jpg";
import auravie from "@/images/gal-auravie-botanical-set.jpg";
import atherton from "@/images/gal-atherton-wallet-set.jpg";
import aura from "@/images/gal-aura-magnetic-box.jpg";
import aurelianShirt from "@/images/gal-aurelian-shirt-box.jpg";
import aethelTee from "@/images/gal-aethel-tee-box.jpg";
import poloShirt from "@/images/gal-polo-shirt-box.jpg";
import alhara from "@/images/gal-alhara-scarf-box.jpg";
import auralis from "@/images/gal-auralis-skincare-box.jpg";
import elara from "@/images/gal-elara-saffron-box.jpg";
import loracle from "@/images/gal-loracle-ampoule-set.jpg";
import aureliaFloral from "@/images/gal-aurelia-floral-lid-box.jpg";

/**
 * Studio gallery: photographs shown without a case study. Add an image to
 * src/images, import it here, and give it a category and a caption; the
 * optimize script builds the WebP variants on the next dev/build.
 */
export type GalleryCategory = "rigid" | "sets" | "kraft";

export const galleryCategories: { key: GalleryCategory; label: string }[] = [
  { key: "rigid", label: "Rigid & Magnetic Boxes" },
  { key: "sets", label: "Gift Sets & Apparel" },
  { key: "kraft", label: "E-commerce & Kraft" },
];

export type GalleryItem = {
  id: string;
  src: StaticImageData;
  alt: string;
  /** Short fragments shown as "Rigid box · Velvet wrap · Brass clasp". */
  caption: string[];
  category: GalleryCategory;
  /** Shown in the home-page teaser. */
  home?: boolean;
};

export const gallery: GalleryItem[] = [
  // Rigid & magnetic
  {
    id: "velvet-rigid-box",
    src: velvet,
    alt: "Charcoal velvet-wrapped rigid box with a debossed crest and a brass clasp, on a pale stone surface",
    caption: ["Rigid box", "Velvet wrap", "Brass clasp", "Deboss"],
    category: "rigid",
    home: true,
  },
  {
    id: "aurelia-perfume-box",
    src: aureliaPerfume,
    alt: "Charcoal rigid perfume box with copper foil moon emblem, lid off to show a faceted glass bottle in a black fitment",
    caption: ["Rigid box", "Perfume", "Copper foil", "Cut fitment"],
    category: "rigid",
    home: true,
  },
  {
    id: "aura-magnetic-box",
    src: aura,
    alt: "Black magnetic box with a copper foil botanical line drawing, open to reveal a blue-lined interior with a foam-cut insert",
    caption: ["Magnetic box", "Copper foil", "Foam insert"],
    category: "rigid",
  },
  {
    id: "auralis-skincare-box",
    src: auralis,
    alt: "Navy rigid cube box with a gold foil gem emblem and a copper band, beside a frosted glass jar with a copper lid",
    caption: ["Rigid box", "Skincare", "Gold foil", "Contrast band"],
    category: "rigid",
    home: true,
  },
  {
    id: "elara-saffron-box",
    src: elara,
    alt: "Black hinged rigid box with a gold foil lotus, open to show a crystal jar of saffron on a burgundy lining",
    caption: ["Hinged rigid box", "Gold foil", "Burgundy lining"],
    category: "rigid",
  },
  {
    id: "aeterna-rigid-insert",
    src: aeterna,
    alt: "Kraft-toned rigid boxes with a white lid and a black foam insert holding a tool, on a workshop bench",
    caption: ["Rigid box", "Kraft wrap", "Foam insert"],
    category: "rigid",
  },
  {
    id: "aurelia-floral-lid-box",
    src: aureliaFloral,
    alt: "White lid-and-base rigid box printed with dark red florals and ferns around a framed wordmark, on a blue-grey table with thread and buttons",
    caption: ["Lid and base box", "Printed wrap", "Apparel"],
    category: "rigid",
  },
  {
    id: "valiant-archer-carry-box",
    src: valiantArcher,
    alt: "Forest green carry box with a die-cut handle and a tone-on-tone monogram, stacked flat blanks behind it",
    caption: ["Carry box", "Die-cut handle", "Blind deboss"],
    category: "rigid",
  },

  // Gift sets & apparel
  {
    id: "solaia-skincare-set",
    src: solaia,
    alt: "Hands opening a deep green magnetic box with gold foil wordmark, revealing a mint interior with three skincare products",
    caption: ["Magnetic box", "Skincare set", "Gold foil", "Printed interior"],
    category: "sets",
    home: true,
  },
  {
    id: "auravie-botanical-set",
    src: auravie,
    alt: "Charcoal and ivory gift box tied with a sage ribbon, open to a fitted tray of five botanical skincare bottles",
    caption: ["Gift box", "Fitted tray", "Ribbon", "Skincare"],
    category: "sets",
  },
  {
    id: "loracle-ampoule-set",
    src: loracle,
    alt: "Sage green magnetic box with a printed inside lid and a tan tray holding four coloured ampoule bottles, on marble",
    caption: ["Magnetic box", "Ampoule tray", "Printed lid"],
    category: "sets",
  },
  {
    id: "atherton-wallet-set",
    src: atherton,
    alt: "Navy rigid box with gold foil crest holding a leather wallet and belt in a tan tray, with a matching paper bag behind",
    caption: ["Gift set", "Rigid box", "Gold foil", "Paper bag"],
    category: "sets",
    home: true,
  },
  {
    id: "aethelred-belt-box",
    src: aethelred,
    alt: "Burgundy rigid box with copper foil oak leaf, lid resting beside the base which holds a coiled leather belt",
    caption: ["Rigid box", "Leather goods", "Copper foil"],
    category: "sets",
  },
  {
    id: "aurelian-shirt-box",
    src: aurelianShirt,
    alt: "Forest green shirt box with gold foil wordmark, open to a folded cream shirt tied with a gold satin ribbon",
    caption: ["Shirt box", "Apparel", "Gold foil", "Ribbon"],
    category: "sets",
    home: true,
  },
  {
    id: "aethel-tee-box",
    src: aethelTee,
    alt: "Cream rigid box with gold foil wordmark holding a teal t-shirt with a swing tag, beside a matching paper bag and twine",
    caption: ["Apparel box", "Gold foil", "Swing tag", "Paper bag"],
    category: "sets",
  },
  {
    id: "polo-shirt-box",
    src: poloShirt,
    alt: "Green lid-and-base box with a cream lining, open to a folded burgundy polo shirt with a tag, in a tailoring workshop",
    caption: ["Lid and base box", "Apparel", "Lined interior"],
    category: "sets",
  },
  {
    id: "alhara-scarf-box",
    src: alhara,
    alt: "Textured brown rigid box with a black and copper label, holding folded scarves in rust and camel, smaller boxes beside it",
    caption: ["Rigid box", "Textured wrap", "Textiles"],
    category: "sets",
  },

  // E-commerce & kraft
  {
    id: "kraft-core-mailers",
    src: kraftCore,
    alt: "Kraft corrugated mailer boxes printed in green with a bold wordmark and fern pattern, one open to show inner cartons",
    caption: ["Mailer box", "Kraft corrugated", "One-colour print"],
    category: "kraft",
    home: true,
  },
  {
    id: "eco-parcel-mailer",
    src: ecoParcel,
    alt: "White corrugated mailer box with a one-colour leaf emblem on a desk, kraft blanks stacked beside it",
    caption: ["Mailer box", "White corrugated", "Flat blanks"],
    category: "kraft",
  },
  {
    id: "terra-harvest-mailer",
    src: terraHarvest,
    alt: "Kraft mailer box wrapped in a printed sleeve with olive and orange botanical artwork",
    caption: ["Mailer box", "Printed sleeve", "Kraft"],
    category: "kraft",
  },
  {
    id: "aethereal-harvest-kraft",
    src: aetherealHarvest,
    alt: "Stack of kraft boxes printed with a green tree emblem, with flat die-cut blanks laid out in front",
    caption: ["Kraft carton", "Die-cut blanks", "One-colour print"],
    category: "kraft",
  },
  {
    id: "verdant-leaf-spice-box",
    src: verdantLeaf,
    alt: "Kraft box with a divided insert holding spice jars, beside a white and black carton printed with a botanical illustration",
    caption: ["Kraft box", "Divider insert", "Printed carton"],
    category: "kraft",
  },
  {
    id: "urban-breeze-carrier",
    src: urbanBreeze,
    alt: "Kraft board carrier with a die-cut handle holding two takeaway coffee cups, a second carrier behind",
    caption: ["Cup carrier", "Die-cut", "Kraft board"],
    category: "kraft",
  },
  {
    id: "veridian-mailer",
    src: veridian,
    alt: "Navy mailer box open to a green printed interior with a foil wordmark, notecards and a small box alongside",
    caption: ["Mailer box", "Printed interior", "Foil wordmark"],
    category: "kraft",
    home: true,
  },
  {
    id: "kraft-shipper-boxes",
    src: kraftShippers,
    alt: "Plain kraft shipping cartons with a small blind-printed logo, lids open, on a pale surface",
    caption: ["Shipping carton", "Kraft", "Minimal print"],
    category: "kraft",
  },
];

export const homeGallery = gallery.filter((g) => g.home);
